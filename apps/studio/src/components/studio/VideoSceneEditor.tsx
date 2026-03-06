"use client";

import { useState } from "react";
import type { VideoScene, CaptionConfig } from "@engine/shared/types";

interface Props {
  scenes: VideoScene[];
  onChange: (scenes: VideoScene[]) => void;
  selectedIndex: number;
  onSelect: (index: number) => void;
  template: string;
}

function newScene(template: string): VideoScene {
  return {
    id: crypto.randomUUID(),
    text: "",
    durationFrames: 180,
  };
}

export default function VideoSceneEditor({
  scenes,
  onChange,
  selectedIndex,
  onSelect,
  template,
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function addScene() {
    const updated = [...scenes, newScene(template)];
    onChange(updated);
    onSelect(updated.length - 1);
  }

  function removeScene(i: number) {
    if (scenes.length <= 1) return;
    const updated = scenes.filter((_, idx) => idx !== i);
    onChange(updated);
    if (selectedIndex >= updated.length) onSelect(updated.length - 1);
    else if (selectedIndex === i) onSelect(Math.max(0, i - 1));
  }

  function moveScene(from: number, to: number) {
    if (to < 0 || to >= scenes.length) return;
    const updated = [...scenes];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    onChange(updated);
    onSelect(to);
  }

  function updateScene(i: number, patch: Partial<VideoScene>) {
    const updated = scenes.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    onChange(updated);
  }

  const selected = scenes[selectedIndex];
  const sceneLabel = getSceneLabel(template, selectedIndex, scenes.length);

  return (
    <div className="space-y-4">
      {/* Scene list */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#888]">
          {getListTitle(template)} ({scenes.length})
        </h3>
        <button onClick={addScene}
          className="text-xs px-2.5 py-1 rounded bg-[#222] text-[#ccc] hover:bg-[#333] border-none cursor-pointer">
          + 추가
        </button>
      </div>

      <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
        {scenes.map((scene, i) => (
          <div key={scene.id} draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragIndex !== null && dragIndex !== i) moveScene(dragIndex, i); setDragIndex(null); }}
            onClick={() => onSelect(i)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
              selectedIndex === i
                ? "bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#fafafa]"
                : "bg-[#111] border border-transparent text-[#888] hover:bg-[#1a1a1a]"
            }`}>
            <span className="text-[10px] text-[#555] select-none cursor-grab">⠿</span>
            <span className="text-[10px] font-bold text-[#555] w-5">{getSceneTag(template, i)}</span>
            <span className="flex-1 truncate">{scene.text || getSceneLabel(template, i, scenes.length)}</span>
            <span className="text-[10px] text-[#555]">{Math.round(scene.durationFrames / 60 * 10) / 10}s</span>
            {scenes.length > 1 && (
              <button onClick={(e) => { e.stopPropagation(); removeScene(i); }}
                className="text-[10px] text-[#555] hover:text-red-400 bg-transparent border-none cursor-pointer p-0">✕</button>
            )}
          </div>
        ))}
      </div>

      {/* Selected scene editor — template-specific */}
      {selected && (
        <div className="p-4 bg-[#111] rounded-lg border border-[#222] space-y-3">
          <h4 className="text-xs font-semibold text-[#666]">
            {sceneLabel} 편집
          </h4>
          
          {template === "ShortFormVideo" && (
            <ShortFormFields scene={selected} index={selectedIndex} onUpdate={(p) => updateScene(selectedIndex, p)} />
          )}
          {template === "VSReel" && (
            <VSReelFields scene={selected} index={selectedIndex} onUpdate={(p) => updateScene(selectedIndex, p)} />
          )}
          {template === "DayInTheLife" && (
            <DayInTheLifeFields scene={selected} index={selectedIndex} onUpdate={(p) => updateScene(selectedIndex, p)} />
          )}
          {template === "NewsBreaking" && (
            <NewsBreakingFields scene={selected} index={selectedIndex} totalScenes={scenes.length} onUpdate={(p) => updateScene(selectedIndex, p)} />
          )}
          {template === "Demo60s" && (
            <Demo60sFields scene={selected} index={selectedIndex} totalScenes={scenes.length} onUpdate={(p) => updateScene(selectedIndex, p)} />
          )}
          {template === "TextOverVideo" && (
            <TextOverVideoFields scene={selected} index={selectedIndex} onUpdate={(p) => updateScene(selectedIndex, p)} />
          )}
          {!["ShortFormVideo", "VSReel", "DayInTheLife", "NewsBreaking", "Demo60s", "TextOverVideo"].includes(template) && (
            <GenericFields scene={selected} index={selectedIndex} onUpdate={(p) => updateScene(selectedIndex, p)} />
          )}
        </div>
      )}

      {/* Total duration */}
      <div className="flex justify-between text-[10px] text-[#555] px-1">
        <span>총 길이</span>
        <span>{(scenes.reduce((sum, s) => sum + s.durationFrames, 0) / 60).toFixed(1)}초 ({scenes.reduce((sum, s) => sum + s.durationFrames, 0)} frames)</span>
      </div>
    </div>
  );
}

/* ====== Helpers ====== */

function getListTitle(template: string): string {
  switch (template) {
    case "DayInTheLife": return "클립";
    case "NewsBreaking": return "뉴스 항목";
    case "Demo60s": return "섹션";
    default: return "씬";
  }
}

function getSceneTag(template: string, index: number): string {
  switch (template) {
    case "NewsBreaking": return index === 0 ? "📰" : `${index}`;
    case "Demo60s": return index === 0 ? "🎣" : "📹";
    case "DayInTheLife": return "📹";
    default: return `${index + 1}`;
  }
}

function getSceneLabel(template: string, index: number, total: number): string {
  switch (template) {
    case "NewsBreaking": return index === 0 ? "헤드라인" : `포인트 ${index}`;
    case "Demo60s": return index === 0 ? "Hook 텍스트" : index === total - 1 ? "CTA" : `데모 ${index}`;
    case "DayInTheLife": return `클립 ${index + 1}`;
    case "VSReel": return `비교 항목 ${index + 1}`;
    default: return `씬 ${index + 1}`;
  }
}

/* ====== Template-specific Form Components ====== */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs text-[#666] mb-1">{children}</label>;
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full p-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none focus:border-[#555]" />
  );
}

function TextArea({ value, onChange, rows, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows || 3} placeholder={placeholder}
      className="w-full p-2.5 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none focus:border-[#555] resize-none" />
  );
}

function NumberField({ label, value, onChange, min, suffix }: { label: string; value: number; onChange: (v: number) => void; min?: number; suffix?: string }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <input type="number" value={value} onChange={(e) => onChange(Math.max(min ?? 0, Number(e.target.value)))} min={min ?? 0}
          className="flex-1 p-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none focus:border-[#555]" />
        {suffix && <span className="text-[10px] text-[#555]">{suffix}</span>}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none cursor-pointer">
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

function DurationField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <FieldLabel>길이</FieldLabel>
      <div className="flex items-center gap-2">
        <input type="range" min={30} max={600} step={30} value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-[#FF6B35]" />
        <span className="text-xs text-[#888] font-mono w-12 text-right">{(value / 60).toFixed(1)}s</span>
      </div>
    </div>
  );
}

/* ====== ShortFormVideo ====== */
function ShortFormFields({ scene, index, onUpdate }: { scene: VideoScene; index: number; onUpdate: (p: Partial<VideoScene>) => void }) {
  const caption: CaptionConfig = (scene.captionConfig || { position: "bottom" }) as CaptionConfig;

  function updateCaption(patch: Partial<CaptionConfig>) {
    onUpdate({ captionConfig: { ...caption, ...patch, position: patch.position ?? caption.position ?? "bottom" } });
  }

  return (
    <>
      <div>
        <FieldLabel>자막 텍스트</FieldLabel>
        <TextArea value={scene.text} onChange={(v) => onUpdate({ text: v })} placeholder="화면에 표시될 텍스트" />
      </div>
      <DurationField value={scene.durationFrames} onChange={(v) => onUpdate({ durationFrames: v })} />
      
      <div className="pt-2 border-t border-[#222]">
        <span className="text-[10px] text-[#555] font-bold uppercase tracking-wider">자막 설정</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="스타일" value={caption.style || "karaoke"} onChange={(v) => updateCaption({ style: v as CaptionConfig["style"] })}
          options={[{ value: "karaoke", label: "🎤 카라오케" }, { value: "boxed", label: "📦 박스" }, { value: "typewriter", label: "⌨️ 타자기" }]} />
        <SelectField label="위치" value={caption.position || "bottom"} onChange={(v) => updateCaption({ position: v as CaptionConfig["position"] })}
          options={[{ value: "top", label: "↑ 상단" }, { value: "center", label: "↕ 중앙" }, { value: "bottom", label: "↓ 하단" }]} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="폰트 크기" value={caption.fontSize || 52} onChange={(v) => updateCaption({ fontSize: v })} min={20} suffix="px" />
        <div>
          <FieldLabel>하이라이트 색상</FieldLabel>
          <div className="flex items-center gap-2">
            <input type="color" value={caption.highlightColor || "#FFD700"} onChange={(e) => updateCaption({ highlightColor: e.target.value })}
              className="w-8 h-8 rounded border border-[#333] cursor-pointer bg-transparent" />
            <span className="text-xs text-[#888] font-mono">{caption.highlightColor || "#FFD700"}</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ====== VSReel ====== */
function VSReelFields({ scene, index, onUpdate }: { scene: VideoScene; index: number; onUpdate: (p: Partial<VideoScene>) => void }) {
  // Use text field for main comparison text, we store extra in captionConfig as a workaround
  return (
    <>
      <div>
        <FieldLabel>비교 텍스트</FieldLabel>
        <TextArea value={scene.text} onChange={(v) => onUpdate({ text: v })} rows={2} placeholder="예: IDE 코딩 vs 터미널 코딩" />
      </div>
      <DurationField value={scene.durationFrames} onChange={(v) => onUpdate({ durationFrames: v })} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>왼쪽 (A)</FieldLabel>
          <TextInput value={scene.captionConfig?.backgroundColor || ""} onChange={(v) => onUpdate({ captionConfig: { position: "bottom" as const, ...scene.captionConfig, backgroundColor: v } })} placeholder="Option A" />
        </div>
        <div>
          <FieldLabel>오른쪽 (B)</FieldLabel>
          <TextInput value={scene.captionConfig?.fontColor || ""} onChange={(v) => onUpdate({ captionConfig: { position: "bottom" as const, ...scene.captionConfig, fontColor: v } })} placeholder="Option B" />
        </div>
      </div>
    </>
  );
}

/* ====== DayInTheLife ====== */
function DayInTheLifeFields({ scene, index, onUpdate }: { scene: VideoScene; index: number; onUpdate: (p: Partial<VideoScene>) => void }) {
  return (
    <>
      <div>
        <FieldLabel>클립 설명</FieldLabel>
        <TextArea value={scene.text} onChange={(v) => onUpdate({ text: v })} rows={2} placeholder="이 클립에서 무엇을 하는지" />
      </div>
      <DurationField value={scene.durationFrames} onChange={(v) => onUpdate({ durationFrames: v })} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>시간</FieldLabel>
          <TextInput value={scene.captionConfig?.backgroundColor || ""} onChange={(v) => onUpdate({ captionConfig: { position: "bottom" as const, ...scene.captionConfig, backgroundColor: v } })} placeholder="08:00" />
        </div>
        <div>
          <FieldLabel>이모지</FieldLabel>
          <TextInput value={scene.captionConfig?.fontColor || ""} onChange={(v) => onUpdate({ captionConfig: { position: "bottom" as const, ...scene.captionConfig, fontColor: v } })} placeholder="💻" />
        </div>
      </div>
    </>
  );
}

/* ====== NewsBreaking ====== */
function NewsBreakingFields({ scene, index, totalScenes, onUpdate }: { scene: VideoScene; index: number; totalScenes: number; onUpdate: (p: Partial<VideoScene>) => void }) {
  const isHeadline = index === 0;

  return (
    <>
      <div>
        <FieldLabel>{isHeadline ? "🔴 헤드라인" : `📌 포인트 ${index}`}</FieldLabel>
        <TextArea value={scene.text} onChange={(v) => onUpdate({ text: v })} rows={isHeadline ? 3 : 2}
          placeholder={isHeadline ? "속보 헤드라인을 입력하세요" : "핵심 포인트"} />
      </div>
      <DurationField value={scene.durationFrames} onChange={(v) => onUpdate({ durationFrames: v })} />
      {isHeadline && (
        <div>
          <FieldLabel>출처</FieldLabel>
          <TextInput value={scene.captionConfig?.backgroundColor || ""} onChange={(v) => onUpdate({ captionConfig: { position: "bottom" as const, ...scene.captionConfig, backgroundColor: v } })} placeholder="출처 (예: TechCrunch)" />
        </div>
      )}
    </>
  );
}

/* ====== Demo60s ====== */
function Demo60sFields({ scene, index, totalScenes, onUpdate }: { scene: VideoScene; index: number; totalScenes: number; onUpdate: (p: Partial<VideoScene>) => void }) {
  const isHook = index === 0;
  const isCta = index === totalScenes - 1 && totalScenes > 1;

  return (
    <>
      <div>
        <FieldLabel>{isHook ? "🎣 Hook 텍스트" : isCta ? "📢 CTA 문구" : "📹 데모 설명"}</FieldLabel>
        <TextArea value={scene.text} onChange={(v) => onUpdate({ text: v })} rows={2}
          placeholder={isHook ? "60초 만에 만든다" : isCta ? "댓글 달면 공유해드림" : "데모 설명"} />
      </div>
      <DurationField value={scene.durationFrames} onChange={(v) => onUpdate({ durationFrames: v })} />
      {isCta && (
        <div>
          <FieldLabel>CTA 키워드</FieldLabel>
          <TextInput value={scene.captionConfig?.highlightColor || ""} onChange={(v) => onUpdate({ captionConfig: { position: "bottom" as const, ...scene.captionConfig, highlightColor: v } })} placeholder="템플릿" />
        </div>
      )}
    </>
  );
}

/* ====== TextOverVideo ====== */
function TextOverVideoFields({ scene, index, onUpdate }: { scene: VideoScene; index: number; onUpdate: (p: Partial<VideoScene>) => void }) {
  return (
    <>
      <div>
        <FieldLabel>오버레이 텍스트</FieldLabel>
        <TextArea value={scene.text} onChange={(v) => onUpdate({ text: v })} rows={3} placeholder="배경 위에 표시할 텍스트" />
      </div>
      <DurationField value={scene.durationFrames} onChange={(v) => onUpdate({ durationFrames: v })} />
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="텍스트 위치" value={scene.captionConfig?.position || "center"} onChange={(v) => onUpdate({ captionConfig: { ...scene.captionConfig, position: v as CaptionConfig["position"] } })}
          options={[{ value: "top", label: "↑ 상단" }, { value: "center", label: "↕ 중앙" }, { value: "bottom", label: "↓ 하단" }]} />
        <NumberField label="폰트 크기" value={scene.captionConfig?.fontSize || 48} onChange={(v) => onUpdate({ captionConfig: { position: scene.captionConfig?.position ?? "bottom", ...scene.captionConfig, fontSize: v } })} min={20} suffix="px" />
      </div>
    </>
  );
}

/* ====== Generic ====== */
function GenericFields({ scene, index, onUpdate }: { scene: VideoScene; index: number; onUpdate: (p: Partial<VideoScene>) => void }) {
  return (
    <>
      <div>
        <FieldLabel>텍스트</FieldLabel>
        <TextArea value={scene.text} onChange={(v) => onUpdate({ text: v })} />
      </div>
      <DurationField value={scene.durationFrames} onChange={(v) => onUpdate({ durationFrames: v })} />
    </>
  );
}
