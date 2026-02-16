"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Comparison,
  OrgChart,
  BeforeAfter,
  RATIO_PRESETS,
  type RatioPreset,
  exportDiagram,
} from "@brxce/diagrams";
import { supabase } from "@/lib/supabase";



const ZOOM_STEPS = [25, 50, 75, 100, 125, 150, 200];

export default function DiagramEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState("comparison");
  const [ratio, setRatio] = useState<RatioPreset>("guide-3:2");
  const [sketch, setSketch] = useState(false);
  const [jsonData, setJsonData] = useState("{}");
  const [showEditor, setShowEditor] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Load
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("diagrams").select("*").eq("id", id).single();
      if (data) {
        setTitle(data.title);
        setTemplate(data.template);
        setRatio(data.ratio as RatioPreset);
        setSketch(data.sketch);
        setJsonData(JSON.stringify(data.data, null, 2));
      }
      setLoading(false);
    })();
  }, [id]);

  // Save
  const handleSave = useCallback(async () => {
    setSaving(true);
    let parsed = {};
    try { parsed = JSON.parse(jsonData); } catch { /* skip */ }
    await supabase.from("diagrams").update({
      title,
      template,
      ratio,
      sketch,
      data: parsed,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    setSaving(false);
    setDirty(false);
  }, [id, title, template, ratio, sketch, jsonData]);

  // Auto-save on Cmd+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  // Export
  const handleExport = useCallback(async () => {
    const el = document.getElementById("diagram-export");
    if (!el) return;
    setExporting(true);
    try {
      await exportDiagram({ element: el, ratio, format: "png", pixelRatio: 2, filename: `diagram-${template}` });
    } catch (e) { console.error("Export failed:", e); }
    finally { setExporting(false); }
  }, [ratio, template]);

  const zoomIn = () => setZoom((z) => ZOOM_STEPS.find((s) => s > z) ?? z);
  const zoomOut = () => setZoom((z) => [...ZOOM_STEPS].reverse().find((s) => s < z) ?? z);

  let parsed: Record<string, unknown> = {};
  try { parsed = JSON.parse(jsonData); } catch { /* invalid */ }

  if (loading) return <div className="text-[#888] p-4">로딩 중...</div>;

  return (
    <div className="flex flex-col h-full">
      {/* ─── Top Toolbar ─── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#222]">
        <button onClick={() => router.push("/diagrams")} className="text-sm text-[#888] hover:text-[#fafafa] transition-colors">
          ← 목록
        </button>
        <div className="w-px h-5 bg-[#333]" />

        {/* Title (editable) */}
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
          className="text-base font-bold text-[#fafafa] bg-transparent outline-none flex-1 min-w-0"
          placeholder="다이어그램 제목"
        />

        <div className="w-px h-5 bg-[#333]" />

        {/* Ratio */}
        <select
          value={ratio}
          onChange={(e) => { setRatio(e.target.value as RatioPreset); setDirty(true); }}
          className="px-3 py-1.5 rounded-lg border border-[#333] bg-[#111] text-sm text-[#fafafa] outline-none cursor-pointer"
        >
          {Object.entries(RATIO_PRESETS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>

        <div className="w-px h-5 bg-[#333]" />

        {/* Style toggle */}
        <div className="flex gap-1 p-1 bg-[#111] rounded-lg">
          <button
            onClick={() => { setSketch(false); setDirty(true); }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${!sketch ? "bg-[#1a1a1a] text-[#fafafa]" : "text-[#888] hover:text-[#ccc]"}`}
          >
            ✦ 클린
          </button>
          <button
            onClick={() => { setSketch(true); setDirty(true); }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${sketch ? "bg-[#1a1a1a] text-[#fafafa]" : "text-[#888] hover:text-[#ccc]"}`}
          >
            ✏️ 스케치
          </button>
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <button
          onClick={() => setShowEditor((v) => !v)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${showEditor ? "bg-[#1a1a1a] text-[#FF6B35] border border-[#FF6B35]/30" : "text-[#888] bg-[#111] border border-[#222]"}`}
        >
          {"{ }"} JSON
        </button>

        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${dirty ? "bg-[#FF6B35] text-white" : "text-[#888] bg-[#111] border border-[#222]"} disabled:opacity-50`}
        >
          {saving ? "저장 중..." : dirty ? "💾 저장" : "저장됨"}
        </button>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#888] hover:text-[#ccc] bg-[#111] border border-[#222] hover:border-[#444] transition-all disabled:opacity-50"
        >
          {exporting ? "⏳..." : "↓ PNG"}
        </button>
      </div>

      {/* ─── Main area ─── */}
      <div className="flex flex-1 min-h-0">
        {/* JSON Editor panel */}
        {showEditor && (
          <div className="w-[400px] shrink-0 border-r border-[#222] flex flex-col">
            <div className="px-3 py-2 border-b border-[#222] flex items-center justify-between">
              <span className="text-xs font-medium text-[#888]">데이터 편집</span>
              <button
                onClick={() => { try { setJsonData(JSON.stringify(JSON.parse(jsonData), null, 2)); } catch {} }}
                className="text-xs text-[#666] hover:text-[#FF6B35] transition-colors"
              >
                정렬
              </button>
            </div>
            <textarea
              value={jsonData}
              onChange={(e) => { setJsonData(e.target.value); setDirty(true); }}
              className="flex-1 p-3 bg-[#0a0a0a] text-xs text-[#ccc] font-mono outline-none resize-none"
              spellCheck={false}
            />
          </div>
        )}

        {/* Preview */}
        <div
          className="flex-1 min-h-0 overflow-auto relative"
          style={{
            backgroundImage: "radial-gradient(circle, #1a1a1a 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            backgroundColor: "#0d0d0d",
          }}
        >
          <div className="flex items-center justify-center p-8" style={{ minHeight: "100%" }}>
            <div style={{ width: `${zoom}%`, maxWidth: zoom > 100 ? `${zoom}%` : "100%" }}>
              {template === "comparison" && <Comparison ratio={ratio} sketch={sketch} {...(parsed as any)} />}
              {template === "orgchart" && <OrgChart ratio={ratio} sketch={sketch} {...(parsed as any)} />}
              {template === "beforeafter" && <BeforeAfter ratio={ratio} sketch={sketch} {...(parsed as any)} />}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Zoom Bar ─── */}
      <div className="flex items-center justify-center gap-3 px-4 py-2 border-t border-[#222] bg-[#0a0a0a]">
        <button onClick={zoomOut} disabled={zoom <= 25} className="w-7 h-7 flex items-center justify-center rounded-md text-sm text-[#888] hover:text-[#fafafa] hover:bg-[#1a1a1a] disabled:opacity-30 transition-all">−</button>
        <input
          type="range" min={25} max={200} step={1} value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-40 h-1 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, #FF6B35 ${((zoom - 25) / 175) * 100}%, #333 ${((zoom - 25) / 175) * 100}%)` }}
        />
        <button onClick={zoomIn} disabled={zoom >= 200} className="w-7 h-7 flex items-center justify-center rounded-md text-sm text-[#888] hover:text-[#fafafa] hover:bg-[#1a1a1a] disabled:opacity-30 transition-all">+</button>
        <button onClick={() => setZoom(100)} className="px-2 py-0.5 rounded text-xs font-mono text-[#888] hover:text-[#fafafa] min-w-[3rem] text-center">{zoom}%</button>
        <div className="w-px h-4 bg-[#333]" />
        <span className="text-[10px] text-[#555]">{RATIO_PRESETS[ratio].exportWidth} × {RATIO_PRESETS[ratio].exportHeight}</span>
      </div>
    </div>
  );
}
