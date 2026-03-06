"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import type { StudioProject } from "@/lib/studio/types";
import type {
  VideoScene,
  CarouselSlide,
  ImageLayer,
  StyleConfig,
} from "@engine/shared/types";
import VideoSceneEditor from "./VideoSceneEditor";
import CarouselSlideEditor from "./CarouselSlideEditor";
import ImageLayerEditor from "./ImageLayerEditor";
import PreviewPanel from "./PreviewPanel";
import StylePanel from "./StylePanel";
import MediaPickerModal from "./MediaPickerModal";

interface Props {
  initialProject: StudioProject;
}

const TYPE_ICONS: Record<string, string> = {
  video: "🎬",
  carousel: "📱",
  image: "🖼️",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "text-yellow-500",
  editing: "text-blue-400",
  ready: "text-green-400",
  rendering: "text-orange-400",
  rendered: "text-emerald-400",
  failed: "text-red-400",
};

export default function StudioEditor({ initialProject }: Props) {
  const [project, setProject] = useState<StudioProject>(initialProject);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [renderToast, setRenderToast] = useState(false);
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(project.title);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenes = (project.scenes || []) as unknown[];
  const styleConfig = (project.style_config || {}) as StyleConfig;

  // Debounced save
  const save = useCallback(
    (patch: Partial<StudioProject>) => {
      const updated = { ...project, ...patch };
      setProject(updated);

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        const sb = createSupabaseBrowser();
        const { scenes: sc, style_config: st, title, status } = updated;
        await sb
          .from("studio_projects")
          .update({
            scenes: sc,
            style_config: st,
            title,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", project.id);
        setSaving(false);
        setLastSaved(new Date());
      }, 800);
    },
    [project]
  );

  function updateScenes(newScenes: unknown[]) {
    save({ scenes: newScenes as StudioProject["scenes"], status: "editing" });
  }

  function updateStyleConfig(config: StyleConfig) {
    save({ style_config: config as StudioProject["style_config"] });
  }

  function handleTitleSave() {
    setTitleEditing(false);
    if (titleValue !== project.title) {
      save({ title: titleValue });
    }
  }

  async function handleRender() {
    setSaving(true);
    setProject((p) => ({ ...p, status: "rendering" }));
    setRenderToast(true);

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: project.id }),
      });
      const data = await res.json();

      if (res.ok && data.output_urls) {
        setProject((p) => ({
          ...p,
          status: "rendered",
          output_urls: data.output_urls,
        }));
      } else {
        setProject((p) => ({ ...p, status: "failed" }));
        console.error("Render failed:", data.error, data.detail);
      }
    } catch (err) {
      setProject((p) => ({ ...p, status: "failed" }));
      console.error("Render request failed:", err);
    } finally {
      setSaving(false);
      setTimeout(() => setRenderToast(false), 3000);
    }
  }

  function handleSlideNav(dir: -1 | 1) {
    const next = selectedIndex + dir;
    if (next >= 0 && next < scenes.length) setSelectedIndex(next);
  }

  function handleMediaSelect(url: string) {
    if (project.type === "carousel") {
      const slides = [...(scenes as CarouselSlide[])];
      slides[selectedIndex] = {
        ...slides[selectedIndex],
        imageUrl: url,
        layout: "text-image",
      };
      updateScenes(slides);
    } else if (project.type === "image") {
      const layers = [...(scenes as ImageLayer[])];
      layers[selectedIndex] = {
        ...layers[selectedIndex],
        content: url,
        type: "image",
      };
      updateScenes(layers);
    }
  }

  // Ensure at least one scene/slide/layer on mount
  useEffect(() => {
    if (scenes.length === 0) {
      if (project.type === "video") {
        updateScenes([
          { id: crypto.randomUUID(), text: "", durationFrames: 180 },
        ]);
      } else if (project.type === "carousel") {
        updateScenes([
          {
            id: crypto.randomUUID(),
            layout: "text-only",
            title: "",
            body: "",
          },
        ]);
      } else {
        updateScenes([
          {
            id: crypto.randomUUID(),
            type: "text",
            content: "",
            x: 0,
            y: 0,
            width: project.width / 2,
            height: 100,
          },
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <a
          href="/studio"
          className="text-[#666] hover:text-[#fafafa] no-underline transition-colors text-lg"
        >
          &larr;
        </a>
        {titleEditing ? (
          <input
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
            autoFocus
            className="text-2xl font-bold text-[#fafafa] bg-transparent border-b border-[#555] outline-none px-0"
          />
        ) : (
          <h1
            onClick={() => setTitleEditing(true)}
            className="text-2xl font-bold text-[#fafafa] cursor-pointer hover:opacity-80"
          >
            {project.title}
          </h1>
        )}
        <span className="text-xs px-2 py-0.5 rounded bg-[#222] text-[#888]">
          {TYPE_ICONS[project.type]} {project.template}
        </span>
        <span className={`text-xs font-medium ${STATUS_COLORS[project.status] || "text-[#888]"}`}>
          {project.status}
        </span>

        {/* Save indicator */}
        <div className="ml-auto flex items-center gap-2">
          {saving && (
            <span className="text-[10px] text-[#666]">저장 중...</span>
          )}
          {!saving && lastSaved && (
            <span className="text-[10px] text-[#555]">
              저장됨 {lastSaved.toLocaleTimeString("ko-KR")}
            </span>
          )}
        </div>
      </div>

      {/* Main layout — Video: stacked / Others: side-by-side */}
      {project.type === "video" ? (
        /* ====== VIDEO LAYOUT: Preview + Editor stacked ====== */
        <div className="space-y-6">
          {/* Top: Preview (phone mockup) + Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex justify-center">
              <div className="w-full max-w-[280px]">
                <div className="p-3 bg-[#1a1a1a] rounded-xl border border-[#222]">
                  <PreviewPanel
                    type={project.type}
                    template={project.template}
                    width={project.width}
                    height={project.height}
                    scenes={scenes}
                    selectedIndex={selectedIndex}
                    styleConfig={styleConfig}
                    onSlideNav={handleSlideNav}
                  />
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              {/* Style */}
              <StylePanel config={styleConfig} onChange={updateStyleConfig} />
              {/* Actions */}
              <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#222] space-y-3">
                <h3 className="text-sm font-semibold text-[#888]">액션</h3>
                <button onClick={handleRender}
                  disabled={project.status === "rendering" || scenes.length === 0}
                  className="w-full px-4 py-2.5 bg-[#FF6B35] text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-[#e55a2b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {project.status === "rendering" ? "렌더링 중..." : "🎬 렌더링 시작"}
                </button>
              </div>
              {/* Render results */}
              {project.output_urls.length > 0 && (
                <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#222]">
                  <h3 className="text-sm font-semibold text-[#888] mb-2">렌더 결과</h3>
                  {project.output_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="block text-sm text-[#4ECDC4] hover:underline truncate">결과 #{i + 1}</a>
                  ))}
                </div>
              )}
              {/* Meta */}
              <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#222]">
                <h3 className="text-sm font-semibold text-[#888] mb-2">메타</h3>
                <div className="space-y-1 text-xs text-[#555]">
                  <p>해상도: {project.width}x{project.height}{project.fps ? ` · ${project.fps}fps` : ""}</p>
                  <p>생성: {new Date(project.created_at).toLocaleString("ko-KR")}</p>
                  <p>수정: {new Date(project.updated_at).toLocaleString("ko-KR")}</p>
                  <p className="truncate" title={project.id}>ID: {project.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Scene Editor */}
          <div className="p-5 bg-[#1a1a1a] rounded-xl border border-[#222]">
            <VideoSceneEditor
              scenes={scenes as VideoScene[]}
              onChange={updateScenes}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
              template={project.template}
            />
          </div>
        </div>
      ) : (
        /* ====== CAROUSEL/IMAGE LAYOUT: side-by-side ====== */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Editor (3/5) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-5 bg-[#1a1a1a] rounded-xl border border-[#222]">
              {project.type === "carousel" && (
                <CarouselSlideEditor
                  slides={scenes as CarouselSlide[]}
                  onChange={updateScenes}
                  selectedIndex={selectedIndex}
                  onSelect={setSelectedIndex}
                />
              )}
              {project.type === "image" && (
                <ImageLayerEditor
                  layers={scenes as ImageLayer[]}
                  onChange={updateScenes}
                  selectedIndex={selectedIndex}
                  onSelect={setSelectedIndex}
                  template={project.template}
                />
              )}
            </div>

            {/* Media button */}
            <button onClick={() => setShowMediaPicker(true)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#222] hover:border-[#333] text-sm text-[#888] hover:text-[#fafafa] cursor-pointer transition-colors">
              🖼️ 미디어 라이브러리에서 선택
            </button>
          </div>

          {/* Right: Preview + Style + Actions (2/5) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#222]">
              <PreviewPanel
                type={project.type}
                template={project.template}
                width={project.width}
                height={project.height}
                scenes={scenes}
                selectedIndex={selectedIndex}
                styleConfig={styleConfig}
                onSlideNav={handleSlideNav}
              />
            </div>
            <StylePanel config={styleConfig} onChange={updateStyleConfig} />
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#222] space-y-3">
              <h3 className="text-sm font-semibold text-[#888]">액션</h3>
              <button onClick={handleRender}
                disabled={project.status === "rendering" || scenes.length === 0}
                className="w-full px-4 py-2.5 bg-[#FF6B35] text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-[#e55a2b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {project.status === "rendering" ? "렌더링 중..." : "렌더링 시작"}
              </button>
            </div>
            {project.output_urls.length > 0 && (
              <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#222]">
                <h3 className="text-sm font-semibold text-[#888] mb-2">렌더 결과</h3>
                {project.output_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="block text-sm text-[#4ECDC4] hover:underline truncate">결과 #{i + 1}</a>
                ))}
              </div>
            )}
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#222]">
              <h3 className="text-sm font-semibold text-[#888] mb-2">메타</h3>
              <div className="space-y-1 text-xs text-[#555]">
                <p>해상도: {project.width}x{project.height}{project.fps ? ` · ${project.fps}fps` : ""}</p>
                <p>생성: {new Date(project.created_at).toLocaleString("ko-KR")}</p>
                <p>수정: {new Date(project.updated_at).toLocaleString("ko-KR")}</p>
                <p className="truncate" title={project.id}>ID: {project.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        accept={project.type === "image" ? "image" : "all"}
      />

      {/* Render Toast */}
      {renderToast && (
        <div className="fixed bottom-6 right-6 px-5 py-3 bg-[#FF6B35] text-white rounded-xl text-sm font-medium shadow-lg z-50 animate-[fadeIn_0.3s_ease]">
          렌더링이 시작되었습니다. 완료까지 잠시 기다려주세요.
        </div>
      )}
    </div>
  );
}
