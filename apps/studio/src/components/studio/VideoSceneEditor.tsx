"use client";

import { useState } from "react";

interface Props {
  scenes: unknown[];
  onChange: (scenes: unknown[]) => void;
  selectedIndex: number;
  onSelect: (index: number) => void;
  template: string;
  onOpenMediaPicker?: (callback: (url: string) => void) => void;
}

/** 
 * Template-specific video editor.
 * Instead of generic VideoScene, each template edits its OWN Remotion props structure.
 * The `scenes` array in studio_projects stores the template's native props as scenes[0].
 */
export default function VideoSceneEditor({
  scenes,
  onChange,
  selectedIndex,
  onSelect,
  template,
  onOpenMediaPicker,
}: Props) {
  // scenes[0] stores the full Remotion props for the template
  const props = (scenes[0] || {}) as Record<string, unknown>;

  function updateProps(patch: Record<string, unknown>) {
    const updated = { ...props, ...patch };
    onChange([updated]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-2 py-0.5 rounded bg-[#FF6B35]/15 text-[#FF6B35] font-bold">{template}</span>
        <h3 className="text-sm font-semibold text-[#888]">프로젝트 설정</h3>
      </div>

      {template === "DayInTheLife" && <DayInTheLifeEditor props={props} onChange={updateProps} onMediaPick={onOpenMediaPicker} />}
      {template === "Demo60s" && <Demo60sEditor props={props} onChange={updateProps} onMediaPick={onOpenMediaPicker} />}
      {template === "ShortFormVideo" && <ShortFormEditor props={props} onChange={updateProps} onMediaPick={onOpenMediaPicker} />}
      {template === "TextOverVideo" && <TextOverVideoEditor props={props} onChange={updateProps} onMediaPick={onOpenMediaPicker} />}
      {template === "VSReel" && <VSReelEditor props={props} onChange={updateProps} onMediaPick={onOpenMediaPicker} />}
      {template === "NewsBreaking" && <NewsBreakingEditor props={props} onChange={updateProps} />}
    </div>
  );
}

/* ====== Shared UI Components ====== */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 bg-[#111] rounded-lg border border-[#222] space-y-3">
      <h4 className="text-xs font-bold text-[#555] uppercase tracking-wider">{title}</h4>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs text-[#666] mb-1">{children}</label>;
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
    className="w-full p-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none focus:border-[#555]" />;
}

function TextArea({ value, onChange, rows, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows || 2} placeholder={placeholder}
    className="w-full p-2.5 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none focus:border-[#555] resize-none" />;
}

function NumberSlider({ label, value, onChange, min, max, step, suffix }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; suffix?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input type="range" min={min} max={max} step={step || 1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 accent-[#FF6B35]" />
        <span className="text-xs text-[#888] font-mono w-16 text-right">{value}{suffix || ""}</span>
      </div>
    </div>
  );
}

function MediaSlot({ label, file, onPick, onClear }: { label: string; file: string; onPick: () => void; onClear: () => void }) {
  return (
    <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#333]">
      <Label>{label}</Label>
      {file ? (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-[#4ECDC4] truncate flex-1">📹 {file}</span>
          <button onClick={onClear} className="text-[10px] text-[#555] hover:text-red-400 bg-transparent border-none cursor-pointer">✕</button>
        </div>
      ) : (
        <button onClick={onPick}
          className="w-full mt-1 px-3 py-2 rounded-lg border border-dashed border-[#444] text-xs text-[#666] hover:border-[#FF6B35] hover:text-[#FF6B35] bg-transparent cursor-pointer transition-colors">
          + 영상 파일 선택
        </button>
      )}
    </div>
  );
}

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#888]">{label}</span>
      <button onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-colors border-none cursor-pointer ${value ? "bg-[#FF6B35]" : "bg-[#333]"}`}>
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

/* ====== DayInTheLife: 클립 기반 타임랩스 ====== */
function DayInTheLifeEditor({ props, onChange, onMediaPick }: { props: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void; onMediaPick?: (cb: (url: string) => void) => void }) {
  type Clip = { file: string; time: string; label: string; emoji: string };
  const clips = (props.clips || []) as Clip[];
  const clipDuration = (props.clipDuration as number) || 180;
  const transitionDuration = (props.transitionDuration as number) || 30;

  function updateClip(i: number, patch: Partial<Clip>) {
    const updated = clips.map((c, idx) => idx === i ? { ...c, ...patch } : c);
    onChange({ ...props, clips: updated });
  }

  function addClip() {
    onChange({ ...props, clips: [...clips, { file: "", time: "", label: "", emoji: "💻" }] });
  }

  function removeClip(i: number) {
    onChange({ ...props, clips: clips.filter((_, idx) => idx !== i) });
  }

  const totalDuration = clips.length * clipDuration + (clips.length - 1) * transitionDuration;

  return (
    <>
      <Section title="📹 클립 목록">
        {clips.map((clip, i) => (
          <div key={i} className="p-3 rounded-lg bg-[#0a0a0a] border border-[#222] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#666]">클립 {i + 1}</span>
              <button onClick={() => removeClip(i)} className="text-[10px] text-[#555] hover:text-red-400 bg-transparent border-none cursor-pointer">삭제</button>
            </div>
            <MediaSlot label="영상 파일" file={clip.file}
              onPick={() => onMediaPick?.((url) => updateClip(i, { file: url }))}
              onClear={() => updateClip(i, { file: "" })} />
            <div className="grid grid-cols-3 gap-2">
              <div><Label>시간</Label><TextInput value={clip.time} onChange={(v) => updateClip(i, { time: v })} placeholder="08:00" /></div>
              <div><Label>라벨</Label><TextInput value={clip.label} onChange={(v) => updateClip(i, { label: v })} placeholder="코딩 중" /></div>
              <div><Label>이모지</Label><TextInput value={clip.emoji} onChange={(v) => updateClip(i, { emoji: v })} placeholder="💻" /></div>
            </div>
          </div>
        ))}
        <button onClick={addClip}
          className="w-full px-3 py-2 rounded-lg border border-dashed border-[#444] text-xs text-[#666] hover:border-[#FF6B35] hover:text-[#FF6B35] bg-transparent cursor-pointer transition-colors">
          + 클립 추가
        </button>
      </Section>

      <Section title="⚙️ 타이밍">
        <NumberSlider label="클립 길이" value={clipDuration} onChange={(v) => onChange({ ...props, clipDuration: v })} min={60} max={300} step={30} suffix={` (${(clipDuration/60).toFixed(1)}s)`} />
        <NumberSlider label="전환 시간" value={transitionDuration} onChange={(v) => onChange({ ...props, transitionDuration: v })} min={0} max={60} step={10} suffix={` (${(transitionDuration/60).toFixed(1)}s)`} />
        <div className="text-[10px] text-[#555]">총 길이: {(totalDuration / 60).toFixed(1)}초 ({clips.length}개 클립)</div>
      </Section>

      <Section title="🎬 아웃트로">
        <ToggleField label="아웃트로 표시" value={!!props.showOutro} onChange={(v) => onChange({ ...props, showOutro: v })} />
        {!!props.showOutro && (
          <div className="grid grid-cols-2 gap-2">
            <div><Label>텍스트</Label><TextInput value={(props.outroText as string) || ""} onChange={(v) => onChange({ ...props, outroText: v })} placeholder="Claude Code" /></div>
            <div><Label>이모지</Label><TextInput value={(props.outroEmoji as string) || ""} onChange={(v) => onChange({ ...props, outroEmoji: v })} placeholder="🤖" /></div>
          </div>
        )}
      </Section>
    </>
  );
}

/* ====== Demo60s: 스크린캐스트 데모 ====== */
function Demo60sEditor({ props, onChange, onMediaPick }: { props: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void; onMediaPick?: (cb: (url: string) => void) => void }) {
  return (
    <>
      <Section title="🎣 Hook">
        <div><Label>Hook 텍스트</Label><TextArea value={(props.hookText as string) || ""} onChange={(v) => onChange({ ...props, hookText: v })} placeholder="60초 만에 만든다" /></div>
        <NumberSlider label="Hook 길이" value={(props.hookDuration as number) || 180} onChange={(v) => onChange({ ...props, hookDuration: v })} min={60} max={300} step={30} suffix={` (${((props.hookDuration as number || 180)/60).toFixed(1)}s)`} />
      </Section>

      <Section title="📹 데모 영상">
        <MediaSlot label="스크린캐스트 / 녹화 영상" file={(props.demoVideo as string) || ""}
          onPick={() => onMediaPick?.((url) => onChange({ ...props, demoVideo: url }))}
          onClear={() => onChange({ ...props, demoVideo: "" })} />
        <NumberSlider label="영상 시작 지점 (프레임)" value={(props.demoStartFrom as number) || 0} onChange={(v) => onChange({ ...props, demoStartFrom: v })} min={0} max={3600} step={60} suffix=" frames" />
        <NumberSlider label="데모 길이" value={(props.demoDuration as number) || 3000} onChange={(v) => onChange({ ...props, demoDuration: v })} min={600} max={3600} step={60} suffix={` (${((props.demoDuration as number || 3000)/60).toFixed(1)}s)`} />
      </Section>

      <Section title="📢 CTA">
        <div><Label>CTA 문구</Label><TextArea value={(props.ctaText as string) || ""} onChange={(v) => onChange({ ...props, ctaText: v })} placeholder="'템플릿' 댓글 달면 공유해드림" /></div>
        <div><Label>CTA 키워드 (하이라이트)</Label><TextInput value={(props.ctaKeyword as string) || ""} onChange={(v) => onChange({ ...props, ctaKeyword: v })} placeholder="템플릿" /></div>
        <NumberSlider label="CTA 길이" value={(props.ctaDuration as number) || 420} onChange={(v) => onChange({ ...props, ctaDuration: v })} min={120} max={600} step={60} suffix={` (${((props.ctaDuration as number || 420)/60).toFixed(1)}s)`} />
      </Section>

      <Section title="🎨 스타일">
        <NumberSlider label="Hook 폰트 크기" value={(props.hookFontSize as number) || 72} onChange={(v) => onChange({ ...props, hookFontSize: v })} min={32} max={96} suffix="px" />
        <div className="flex items-center gap-2">
          <Label>액센트 색상</Label>
          <input type="color" value={(props.accentColor as string) || "#FFD700"} onChange={(e) => onChange({ ...props, accentColor: e.target.value })}
            className="w-8 h-8 rounded border border-[#333] cursor-pointer bg-transparent" />
        </div>
        <ToggleField label="로고 표시" value={props.showLogo !== false} onChange={(v) => onChange({ ...props, showLogo: v })} />
      </Section>
    </>
  );
}

/* ====== ShortFormVideo: TTS + 자막 + 배경영상 ====== */
function ShortFormEditor({ props, onChange, onMediaPick }: { props: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void; onMediaPick?: (cb: (url: string) => void) => void }) {
  type Scene = { id: string; text: string; durationFrames: number; audioFile?: string };
  type BG = { file: string; startFrom: number; startFrame: number; durationFrames: number };
  const scenes = (props.scenes || []) as Scene[];
  const backgrounds = (props.backgrounds || []) as BG[];

  function updateScene(i: number, patch: Partial<Scene>) {
    const updated = scenes.map((s, idx) => idx === i ? { ...s, ...patch } : s);
    onChange({ ...props, scenes: updated });
  }
  function addScene() {
    onChange({ ...props, scenes: [...scenes, { id: crypto.randomUUID(), text: "", durationFrames: 180 }] });
  }
  function removeScene(i: number) {
    if (scenes.length <= 1) return;
    onChange({ ...props, scenes: scenes.filter((_, idx) => idx !== i) });
  }
  function addBg() {
    const totalFrames = scenes.reduce((s, sc) => s + sc.durationFrames, 0);
    onChange({ ...props, backgrounds: [...backgrounds, { file: "", startFrom: 0, startFrame: 0, durationFrames: totalFrames }] });
  }
  function updateBg(i: number, patch: Partial<BG>) {
    const updated = backgrounds.map((b, idx) => idx === i ? { ...b, ...patch } : b);
    onChange({ ...props, backgrounds: updated });
  }
  function removeBg(i: number) {
    onChange({ ...props, backgrounds: backgrounds.filter((_, idx) => idx !== i) });
  }

  return (
    <>
      <Section title="📹 배경 영상">
        {backgrounds.map((bg, i) => (
          <div key={i} className="p-3 rounded-lg bg-[#0a0a0a] border border-[#222] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#666]">배경 {i + 1}</span>
              <button onClick={() => removeBg(i)} className="text-[10px] text-[#555] hover:text-red-400 bg-transparent border-none cursor-pointer">삭제</button>
            </div>
            <MediaSlot label="영상 파일" file={bg.file}
              onPick={() => onMediaPick?.((url) => updateBg(i, { file: url }))}
              onClear={() => updateBg(i, { file: "" })} />
            <div className="grid grid-cols-2 gap-2">
              <NumberSlider label="시작 지점" value={bg.startFrom} onChange={(v) => updateBg(i, { startFrom: v })} min={0} max={3600} step={30} suffix=" fr" />
              <NumberSlider label="길이" value={bg.durationFrames} onChange={(v) => updateBg(i, { durationFrames: v })} min={60} max={3600} step={60} suffix={` (${(bg.durationFrames/60).toFixed(1)}s)`} />
            </div>
          </div>
        ))}
        <button onClick={addBg}
          className="w-full px-3 py-2 rounded-lg border border-dashed border-[#444] text-xs text-[#666] hover:border-[#FF6B35] hover:text-[#FF6B35] bg-transparent cursor-pointer transition-colors">
          + 배경 영상 추가
        </button>
      </Section>

      <Section title="💬 씬 (자막 텍스트)">
        {scenes.map((scene, i) => (
          <div key={scene.id} className="p-3 rounded-lg bg-[#0a0a0a] border border-[#222] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#666]">씬 {i + 1}</span>
              {scenes.length > 1 && <button onClick={() => removeScene(i)} className="text-[10px] text-[#555] hover:text-red-400 bg-transparent border-none cursor-pointer">삭제</button>}
            </div>
            <TextArea value={scene.text} onChange={(v) => updateScene(i, { text: v })} placeholder="자막 텍스트" />
            <NumberSlider label="길이" value={scene.durationFrames} onChange={(v) => updateScene(i, { durationFrames: v })} min={30} max={600} step={30} suffix={` (${(scene.durationFrames/60).toFixed(1)}s)`} />
          </div>
        ))}
        <button onClick={addScene}
          className="w-full px-3 py-2 rounded-lg border border-dashed border-[#444] text-xs text-[#666] hover:border-[#FF6B35] hover:text-[#FF6B35] bg-transparent cursor-pointer transition-colors">
          + 씬 추가
        </button>
      </Section>

      <Section title="⚙️ 설정">
        <NumberSlider label="영상 스케일" value={(props.videoScale as number) || 1.15} onChange={(v) => onChange({ ...props, videoScale: v })} min={0.5} max={2} step={0.05} suffix="x" />
        <ToggleField label="아웃트로 표시" value={!!props.showOutro} onChange={(v) => onChange({ ...props, showOutro: v })} />
      </Section>
    </>
  );
}

/* ====== TextOverVideo: 배경영상 + 텍스트 오버레이 ====== */
function TextOverVideoEditor({ props, onChange, onMediaPick }: { props: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void; onMediaPick?: (cb: (url: string) => void) => void }) {
  type BG = { file: string; startFrom?: number };
  type TI = { text: string; startFrame: number; durationFrames: number };
  const backgrounds = (props.backgrounds || []) as BG[];
  const texts = (props.texts || []) as TI[];

  function updateBg(i: number, patch: Partial<BG>) {
    const updated = backgrounds.map((b, idx) => idx === i ? { ...b, ...patch } : b);
    onChange({ ...props, backgrounds: updated });
  }
  function addBg() { onChange({ ...props, backgrounds: [...backgrounds, { file: "" }] }); }
  function removeBg(i: number) { onChange({ ...props, backgrounds: backgrounds.filter((_, idx) => idx !== i) }); }

  function updateText(i: number, patch: Partial<TI>) {
    const updated = texts.map((t, idx) => idx === i ? { ...t, ...patch } : t);
    onChange({ ...props, texts: updated });
  }
  function addText() {
    const lastEnd = texts.length > 0 ? texts[texts.length - 1].startFrame + texts[texts.length - 1].durationFrames : 0;
    onChange({ ...props, texts: [...texts, { text: "", startFrame: lastEnd, durationFrames: 180 }] });
  }
  function removeText(i: number) { onChange({ ...props, texts: texts.filter((_, idx) => idx !== i) }); }

  return (
    <>
      <Section title="📹 배경 영상">
        {backgrounds.map((bg, i) => (
          <div key={i} className="space-y-2">
            <MediaSlot label={`배경 ${i + 1}`} file={bg.file}
              onPick={() => onMediaPick?.((url) => updateBg(i, { file: url }))}
              onClear={() => updateBg(i, { file: "" })} />
            {backgrounds.length > 1 && <button onClick={() => removeBg(i)} className="text-[10px] text-[#555] hover:text-red-400 bg-transparent border-none cursor-pointer">삭제</button>}
          </div>
        ))}
        <button onClick={addBg} className="w-full px-3 py-2 rounded-lg border border-dashed border-[#444] text-xs text-[#666] hover:border-[#FF6B35] hover:text-[#FF6B35] bg-transparent cursor-pointer transition-colors">+ 배경 추가</button>
      </Section>

      <Section title="✍️ 텍스트 시퀀스">
        {texts.map((ti, i) => (
          <div key={i} className="p-3 rounded-lg bg-[#0a0a0a] border border-[#222] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#666]">텍스트 {i + 1}</span>
              <button onClick={() => removeText(i)} className="text-[10px] text-[#555] hover:text-red-400 bg-transparent border-none cursor-pointer">삭제</button>
            </div>
            <TextArea value={ti.text} onChange={(v) => updateText(i, { text: v })} placeholder="오버레이할 텍스트" />
            <div className="grid grid-cols-2 gap-2">
              <NumberSlider label="시작" value={ti.startFrame} onChange={(v) => updateText(i, { startFrame: v })} min={0} max={3600} step={30} suffix={` (${(ti.startFrame/60).toFixed(1)}s)`} />
              <NumberSlider label="길이" value={ti.durationFrames} onChange={(v) => updateText(i, { durationFrames: v })} min={30} max={600} step={30} suffix={` (${(ti.durationFrames/60).toFixed(1)}s)`} />
            </div>
          </div>
        ))}
        <button onClick={addText} className="w-full px-3 py-2 rounded-lg border border-dashed border-[#444] text-xs text-[#666] hover:border-[#FF6B35] hover:text-[#FF6B35] bg-transparent cursor-pointer transition-colors">+ 텍스트 추가</button>
      </Section>

      <Section title="⚙️ 스타일">
        <NumberSlider label="폰트 크기" value={(props.fontSize as number) || 52} onChange={(v) => onChange({ ...props, fontSize: v })} min={24} max={96} suffix="px" />
        <NumberSlider label="영상 스케일" value={(props.videoScale as number) || 1.15} onChange={(v) => onChange({ ...props, videoScale: v })} min={0.5} max={2} step={0.05} suffix="x" />
      </Section>
    </>
  );
}

/* ====== VSReel: A vs B 비교 ====== */
function VSReelEditor({ props, onChange, onMediaPick }: { props: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void; onMediaPick?: (cb: (url: string) => void) => void }) {
  type Logo = { type: string; file: string; label?: string };
  type BG = { file: string; startFrom: number };
  type TI = { text: string; startFrame: number; durationFrames: number };
  const logoLeft = (props.logoLeft || { type: "image", file: "" }) as Logo;
  const logoRight = (props.logoRight || { type: "image", file: "" }) as Logo;
  const backgrounds = (props.backgrounds || []) as BG[];
  const texts = (props.texts || []) as TI[];

  function updateText(i: number, patch: Partial<TI>) {
    const updated = texts.map((t, idx) => idx === i ? { ...t, ...patch } : t);
    onChange({ ...props, texts: updated });
  }
  function addText() {
    const lastEnd = texts.length > 0 ? texts[texts.length - 1].startFrame + texts[texts.length - 1].durationFrames : 0;
    onChange({ ...props, texts: [...texts, { text: "", startFrame: lastEnd, durationFrames: 180 }] });
  }
  function removeText(i: number) { onChange({ ...props, texts: texts.filter((_, idx) => idx !== i) }); }

  return (
    <>
      <Section title="🆚 비교 대상">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>왼쪽 (A)</Label>
            <MediaSlot label="로고 이미지" file={logoLeft.file}
              onPick={() => onMediaPick?.((url) => onChange({ ...props, logoLeft: { ...logoLeft, file: url } }))}
              onClear={() => onChange({ ...props, logoLeft: { ...logoLeft, file: "" } })} />
            <TextInput value={logoLeft.label || ""} onChange={(v) => onChange({ ...props, logoLeft: { ...logoLeft, label: v } })} placeholder="라벨 (예: Claude)" />
          </div>
          <div className="space-y-2">
            <Label>오른쪽 (B)</Label>
            <MediaSlot label="로고 이미지" file={logoRight.file}
              onPick={() => onMediaPick?.((url) => onChange({ ...props, logoRight: { ...logoRight, file: url } }))}
              onClear={() => onChange({ ...props, logoRight: { ...logoRight, file: "" } })} />
            <TextInput value={logoRight.label || ""} onChange={(v) => onChange({ ...props, logoRight: { ...logoRight, label: v } })} placeholder="라벨 (예: OpenClaw)" />
          </div>
        </div>
        <MediaSlot label="헤더 이미지 (선택 — 로고 대신 전체 헤더)" file={(props.headerImage as string) || ""}
          onPick={() => onMediaPick?.((url) => onChange({ ...props, headerImage: url }))}
          onClear={() => onChange({ ...props, headerImage: "" })} />
      </Section>

      <Section title="📹 배경 영상 (하단)">
        {backgrounds.map((bg, i) => (
          <MediaSlot key={i} label={`배경 ${i + 1}`} file={bg.file}
            onPick={() => onMediaPick?.((url) => {
              const updated = backgrounds.map((b, idx) => idx === i ? { ...b, file: url } : b);
              onChange({ ...props, backgrounds: updated });
            })}
            onClear={() => {
              const updated = backgrounds.map((b, idx) => idx === i ? { ...b, file: "" } : b);
              onChange({ ...props, backgrounds: updated });
            }} />
        ))}
        <button onClick={() => onChange({ ...props, backgrounds: [...backgrounds, { file: "", startFrom: 0 }] })}
          className="w-full px-3 py-2 rounded-lg border border-dashed border-[#444] text-xs text-[#666] hover:border-[#FF6B35] hover:text-[#FF6B35] bg-transparent cursor-pointer transition-colors">
          + 배경 추가
        </button>
      </Section>

      <Section title="✍️ 텍스트 시퀀스">
        {texts.map((ti, i) => (
          <div key={i} className="p-3 rounded-lg bg-[#0a0a0a] border border-[#222] space-y-2">
            <TextArea value={ti.text} onChange={(v) => updateText(i, { text: v })} placeholder="비교 포인트 텍스트" />
            <div className="grid grid-cols-2 gap-2">
              <NumberSlider label="시작" value={ti.startFrame} onChange={(v) => updateText(i, { startFrame: v })} min={0} max={3600} step={30} suffix={` (${(ti.startFrame/60).toFixed(1)}s)`} />
              <NumberSlider label="길이" value={ti.durationFrames} onChange={(v) => updateText(i, { durationFrames: v })} min={30} max={600} step={30} suffix={` (${(ti.durationFrames/60).toFixed(1)}s)`} />
            </div>
            <button onClick={() => removeText(i)} className="text-[10px] text-[#555] hover:text-red-400 bg-transparent border-none cursor-pointer">삭제</button>
          </div>
        ))}
        <button onClick={addText} className="w-full px-3 py-2 rounded-lg border border-dashed border-[#444] text-xs text-[#666] hover:border-[#FF6B35] hover:text-[#FF6B35] bg-transparent cursor-pointer transition-colors">+ 텍스트 추가</button>
      </Section>
    </>
  );
}

/* ====== NewsBreaking: 뉴스 속보 ====== */
function NewsBreakingEditor({ props, onChange }: { props: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void }) {
  const points = (props.points || []) as string[];

  return (
    <>
      <Section title="📰 헤드라인">
        <TextArea value={(props.headline as string) || ""} onChange={(v) => onChange({ ...props, headline: v })} rows={3} placeholder="속보 헤드라인" />
        <div><Label>출처</Label><TextInput value={(props.source as string) || ""} onChange={(v) => onChange({ ...props, source: v })} placeholder="TechCrunch, The Verge..." /></div>
      </Section>

      <Section title="📌 요약 포인트">
        {points.map((pt, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-xs text-[#FF6B35] font-bold mt-2">{i + 1}</span>
            <TextInput value={pt} onChange={(v) => { const updated = [...points]; updated[i] = v; onChange({ ...props, points: updated }); }} placeholder={`포인트 ${i + 1}`} />
            <button onClick={() => onChange({ ...props, points: points.filter((_, idx) => idx !== i) })}
              className="text-[10px] text-[#555] hover:text-red-400 bg-transparent border-none cursor-pointer">✕</button>
          </div>
        ))}
        <button onClick={() => onChange({ ...props, points: [...points, ""] })}
          className="w-full px-3 py-2 rounded-lg border border-dashed border-[#444] text-xs text-[#666] hover:border-[#FF6B35] hover:text-[#FF6B35] bg-transparent cursor-pointer transition-colors">
          + 포인트 추가
        </button>
      </Section>

      <Section title="💬 MY TAKE">
        <TextArea value={(props.opinion as string) || ""} onChange={(v) => onChange({ ...props, opinion: v })} placeholder="이 뉴스에 대한 내 해석/의견" />
      </Section>

      <Section title="⏱️ 타이밍">
        <NumberSlider label="알림 길이" value={(props.alertDuration as number) || 120} onChange={(v) => onChange({ ...props, alertDuration: v })} min={30} max={300} step={30} suffix={` (${((props.alertDuration as number || 120)/60).toFixed(1)}s)`} />
        <NumberSlider label="헤드라인 길이" value={(props.headlineDuration as number) || 180} onChange={(v) => onChange({ ...props, headlineDuration: v })} min={60} max={600} step={30} suffix={` (${((props.headlineDuration as number || 180)/60).toFixed(1)}s)`} />
        <NumberSlider label="포인트 길이" value={(props.pointsDuration as number) || 300} onChange={(v) => onChange({ ...props, pointsDuration: v })} min={60} max={600} step={30} suffix={` (${((props.pointsDuration as number || 300)/60).toFixed(1)}s)`} />
        <NumberSlider label="의견 길이" value={(props.opinionDuration as number) || 180} onChange={(v) => onChange({ ...props, opinionDuration: v })} min={60} max={600} step={30} suffix={` (${((props.opinionDuration as number || 180)/60).toFixed(1)}s)`} />
      </Section>
    </>
  );
}
