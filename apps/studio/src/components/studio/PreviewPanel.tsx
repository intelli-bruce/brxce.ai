"use client";

import type { ProjectType } from "@/lib/studio/types";
import type { CarouselSlide, ImageLayer, StyleConfig } from "@engine/shared/types";

interface Props {
  type: ProjectType;
  template: string;
  width: number;
  height: number;
  scenes: unknown[];
  selectedIndex: number;
  styleConfig: StyleConfig;
  onSlideNav?: (dir: -1 | 1) => void;
}

export default function PreviewPanel({ type, template, width, height, scenes, selectedIndex, styleConfig, onSlideNav }: Props) {
  const bg = styleConfig.backgroundColor || "#0A0A0A";
  const primary = styleConfig.primaryColor || "#FF6B35";
  const accent = styleConfig.accentColor || "#4ECDC4";
  const font = styleConfig.fontFamily || "Inter, sans-serif";

  // Video templates: scenes[0] = full Remotion props object
  const videoProps = (type === "video" && scenes[0] ? scenes[0] : {}) as Record<string, unknown>;

  function renderContent() {
    if (type === "video") {
      switch (template) {
        case "DayInTheLife": return <DayInTheLifePreview props={videoProps} bg={bg} primary={primary} font={font} />;
        case "Demo60s": return <Demo60sPreview props={videoProps} bg={bg} primary={primary} font={font} />;
        case "ShortFormVideo": return <ShortFormPreview props={videoProps} bg={bg} primary={primary} font={font} />;
        case "TextOverVideo": return <TextOverVideoPreview props={videoProps} bg={bg} primary={primary} font={font} />;
        case "VSReel": return <VSReelPreview props={videoProps} bg={bg} primary={primary} accent={accent} font={font} />;
        case "NewsBreaking": return <NewsBreakingPreview props={videoProps} bg={bg} primary={primary} font={font} />;
        default: return <EmptyState label={template} />;
      }
    }
    if (type === "carousel") {
      const slide = scenes[selectedIndex] as CarouselSlide | undefined;
      if (!slide) return <EmptyState label="슬라이드를 추가하세요" />;
      return (
        <div className="w-full h-full flex flex-col p-6" style={{ backgroundColor: bg, fontFamily: font }}>
          <div className="flex gap-1 mb-4">{scenes.map((_, i) => (<div key={i} className="h-0.5 flex-1 rounded-full" style={{ backgroundColor: i === selectedIndex ? primary : "rgba(255,255,255,0.15)" }} />))}</div>
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-white text-base font-bold mb-2">{slide.title || "제목"}</h2>
            <p className="text-[#aaa] text-xs leading-relaxed">{slide.body || "본문"}</p>
          </div>
          <div className="text-center text-[10px] mt-auto pt-3" style={{ color: primary }}>BRXCE</div>
        </div>
      );
    }
    // image
    return <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: bg }}><EmptyState label="이미지 레이어" /></div>;
  }

  const isVideo = type === "video";

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#888]">프리뷰</h3>
      <div className={`w-full rounded-xl overflow-hidden border border-[#222] bg-[#111] ${isVideo ? "max-h-[480px]" : ""}`}
        style={{ aspectRatio: isVideo ? "9/16" : `${width / height}` }}>
        {renderContent()}
      </div>
      {type === "carousel" && scenes.length > 0 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => onSlideNav?.(-1)} disabled={selectedIndex <= 0} className="text-sm px-3 py-1 rounded bg-[#222] text-[#ccc] hover:bg-[#333] border-none cursor-pointer disabled:opacity-30">◀</button>
          <span className="text-xs text-[#666]">{selectedIndex + 1} / {scenes.length}</span>
          <button onClick={() => onSlideNav?.(1)} disabled={selectedIndex >= scenes.length - 1} className="text-sm px-3 py-1 rounded bg-[#222] text-[#ccc] hover:bg-[#333] border-none cursor-pointer disabled:opacity-30">▶</button>
        </div>
      )}
    </div>
  );
}

/* ====== Shared: Media background ====== */
function MediaBg({ src, children }: { src: string; children: React.ReactNode }) {
  const isImage = /\.(jpg|jpeg|png|gif|webp|avif|svg)/i.test(src);
  const isVideo = /\.(mp4|mov|webm|avi)/i.test(src);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {isImage && <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      {isVideo && <video src={src} muted autoPlay loop playsInline className="absolute inset-0 w-full h-full object-cover" />}
      {!isImage && !isVideo && src && <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}

/* ====== DayInTheLife ====== */
function DayInTheLifePreview({ props, bg, primary, font }: { props: Record<string, unknown>; bg: string; primary: string; font: string }) {
  type Clip = { file: string; time: string; label: string; emoji: string };
  const clips = (props.clips || []) as Clip[];
  const clipDuration = (props.clipDuration as number) || 180;
  const firstClip = clips[0];

  if (clips.length === 0) return <EmptyState label="클립을 추가하세요" />;

  const content = (
    <div className="w-full h-full flex flex-col" style={{ fontFamily: font }}>
      {/* Top info */}
      <div className="flex items-start justify-between p-3">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{firstClip?.emoji || "💻"}</span>
          <div className="px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm">
            <span className="text-white font-mono font-bold text-xs">{firstClip?.time || "08:00"}</span>
          </div>
        </div>
        <div className="px-1.5 py-0.5 rounded bg-red-500/80 text-white text-[7px] font-bold flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-white" />REC
        </div>
      </div>

      <div className="flex-1" />

      {/* Clip label */}
      <div className="px-4 pb-2">
        <p className="text-white text-xs font-semibold drop-shadow-lg">{firstClip?.label || "클립 설명"}</p>
      </div>

      {/* Progress */}
      <div className="px-3 pb-2">
        <div className="flex gap-1">
          {clips.map((_, i) => (
            <div key={i} className="flex-1 rounded-sm overflow-hidden" style={{ height: 3 }}>
              <div className="w-full h-full" style={{ backgroundColor: i === 0 ? primary : "rgba(255,255,255,0.2)" }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[7px] text-white/30">{clips.length}개 클립</span>
          <span className="text-[7px] text-white/30">{((clips.length * clipDuration) / 60).toFixed(0)}s</span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-1 px-3 pb-2 overflow-hidden">
        {clips.slice(0, 5).map((clip, i) => (
          <div key={i} className="flex-shrink-0 w-10 h-10 rounded overflow-hidden border border-white/10">
            {clip.file ? (
              <img src={clip.file} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-black/40 flex flex-col items-center justify-center">
                <span className="text-[8px]">{clip.emoji}</span>
              </div>
            )}
          </div>
        ))}
        {clips.length > 5 && <div className="flex-shrink-0 w-10 h-10 rounded bg-black/20 flex items-center justify-center text-[8px] text-white/30">+{clips.length - 5}</div>}
      </div>
    </div>
  );

  // If first clip has a media file, use it as background
  if (firstClip?.file) {
    return <MediaBg src={firstClip.file}>{content}</MediaBg>;
  }

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: bg }}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b2a] via-[#1b263b] to-[#415a77] opacity-70" />
      <div className="relative z-10 w-full h-full">{content}</div>
    </div>
  );
}

/* ====== Demo60s ====== */
function Demo60sPreview({ props, bg, primary, font }: { props: Record<string, unknown>; bg: string; primary: string; font: string }) {
  const hookText = (props.hookText as string) || "60초 만에 만든다";
  const demoVideo = (props.demoVideo as string) || "";
  const ctaText = (props.ctaText as string) || "";
  const ctaKeyword = (props.ctaKeyword as string) || "";

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: bg, fontFamily: font }}>
      <div className="px-4 py-3 text-center">
        <p className="text-white font-black text-sm leading-tight">{hookText}</p>
        <div className="w-8 h-0.5 rounded-full mx-auto mt-1.5" style={{ backgroundColor: primary }} />
      </div>
      <div className="flex-1 mx-3 rounded-lg bg-[#111] border border-[#222] flex flex-col items-center justify-center relative overflow-hidden">
        {demoVideo ? (
          <>
            <img src={demoVideo} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div className="relative z-10 text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1.5 bg-black/40 backdrop-blur-sm" style={{ border: `1px solid ${primary}60` }}>
                <span className="text-base ml-0.5">▶</span>
              </div>
              <p className="text-[8px] text-[#4ECDC4] mt-1 truncate max-w-[160px] px-2">{decodeURIComponent(demoVideo.split("/").pop() || "")}</p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1.5" style={{ backgroundColor: `${primary}20`, border: `1px solid ${primary}40` }}>
              <span className="text-base ml-0.5">▶</span>
            </div>
            <span className="text-white/20 text-[8px]">스크린캐스트 선택</span>
          </div>
        )}
      </div>
      {ctaText && (
        <div className="mx-3 my-2 px-3 py-2 rounded-lg text-center" style={{ backgroundColor: `${primary}15` }}>
          <p className="text-white text-[9px] font-bold">{ctaText}</p>
          {ctaKeyword && <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[7px] font-bold" style={{ backgroundColor: primary, color: "#fff" }}>{ctaKeyword}</span>}
        </div>
      )}
      <div className="h-4 flex items-center justify-center"><span className="text-white/15 text-[7px]">🦞 BRXCE</span></div>
    </div>
  );
}

/* ====== ShortFormVideo ====== */
function ShortFormPreview({ props, bg, primary, font }: { props: Record<string, unknown>; bg: string; primary: string; font: string }) {
  type Scene = { text: string; durationFrames: number };
  type BG = { file: string };
  const scenes = (props.scenes || []) as Scene[];
  const backgrounds = (props.backgrounds || []) as BG[];
  const firstScene = scenes[0];
  const hasBg = backgrounds.some(b => b.file);

  const bgFile = backgrounds.find(b => b.file)?.file;

  const inner = (
    <div className="w-full h-full flex flex-col" style={{ fontFamily: font }}>
      {hasBg && (
        <div className="px-3 pt-2">
          <span className="text-[7px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">📹 배경 {backgrounds.filter(b => b.file).length}개</span>
        </div>
      )}
      <div className="flex-1" />
      <div className="px-4 pb-8 pt-3">
        {firstScene ? (
          <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2.5">
            <p className="text-white text-center text-xs font-bold leading-relaxed">{firstScene.text || "자막 텍스트"}</p>
            <div className="text-center mt-1">
              <span className="text-[7px] text-white/30">씬 {scenes.length}개 · {(scenes.reduce((s: number, sc: Scene) => s + sc.durationFrames, 0) / 60).toFixed(1)}s</span>
            </div>
          </div>
        ) : (
          <div className="text-center text-white/30 text-[9px]">씬을 추가하세요</div>
        )}
      </div>
      <div className="h-6 bg-black/30 flex items-center justify-between px-3">
        <span className="text-[7px] text-white/30">brxce.ai</span>
        <div className="flex gap-2"><span className="text-white/20 text-[8px]">❤️</span><span className="text-white/20 text-[8px]">💬</span></div>
      </div>
    </div>
  );

  if (bgFile) return <MediaBg src={bgFile}>{inner}</MediaBg>;

  return (
    <div className="w-full h-full relative" style={{ backgroundColor: bg }}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] opacity-60" />
      <div className="relative z-10 w-full h-full">{inner}</div>
    </div>
  );
}

/* ====== TextOverVideo ====== */
function TextOverVideoPreview({ props, bg, primary, font }: { props: Record<string, unknown>; bg: string; primary: string; font: string }) {
  type BG = { file: string };
  type TI = { text: string; startFrame: number; durationFrames: number };
  const backgrounds = (props.backgrounds || []) as BG[];
  const texts = (props.texts || []) as TI[];
  const hasBg = backgrounds.some(b => b.file);

  const bgFile = backgrounds.find(b => b.file)?.file;

  const inner = (
    <div className="w-full h-full flex flex-col" style={{ fontFamily: font }}>
      {hasBg && !bgFile && (
        <div className="px-3 pt-2">
          <span className="text-[7px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">📹 배경 영상 설정됨</span>
        </div>
      )}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          {texts.length > 0 ? (
            <>
              <p className="text-white font-bold text-xs leading-relaxed drop-shadow-lg" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>{texts[0].text || "텍스트"}</p>
              {texts.length > 1 && <p className="text-white/30 text-[8px] mt-2">+ {texts.length - 1}개 텍스트</p>}
            </>
          ) : (
            <p className="text-white/30 text-[9px]">텍스트를 추가하세요</p>
          )}
          <div className="w-10 h-0.5 rounded-full mx-auto mt-2 opacity-50" style={{ backgroundColor: primary }} />
        </div>
      </div>
      <div className="px-3 pb-2 flex justify-between">
        <span className="text-white/15 text-[7px]">TEXT OVER VIDEO</span>
        <span className="text-white/15 text-[7px]">{texts.length} texts</span>
      </div>
    </div>
  );

  if (bgFile) return <MediaBg src={bgFile}>{inner}</MediaBg>;

  return (
    <div className="w-full h-full relative" style={{ backgroundColor: bg }}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)" }} />
      <div className="relative z-10 w-full h-full">{inner}</div>
    </div>
  );
}

/* ====== VSReel ====== */
function VSReelPreview({ props, bg, primary, accent, font }: { props: Record<string, unknown>; bg: string; primary: string; accent: string; font: string }) {
  type Logo = { file: string; label?: string };
  type TI = { text: string };
  const logoLeft = (props.logoLeft || {}) as Logo;
  const logoRight = (props.logoRight || {}) as Logo;
  const texts = (props.texts || []) as TI[];
  const headerImage = props.headerImage as string;

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: bg, fontFamily: font }}>
      {/* VS Header */}
      {headerImage ? (
        <div className="h-[40%] bg-[#111] flex items-center justify-center overflow-hidden">
          <span className="text-[7px] text-[#4ECDC4]">📷 {headerImage.split("/").pop()}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3 py-4 bg-gradient-to-b from-[#1a1a1a] to-transparent">
          <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-[8px]" style={{ borderColor: primary, backgroundColor: `${primary}20` }}>
            {logoLeft.file ? "📷" : logoLeft.label?.[0] || "A"}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white font-black text-sm">VS</span>
            <div className="w-5 h-0.5 rounded-full mt-0.5" style={{ backgroundColor: primary }} />
          </div>
          <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-[8px]" style={{ borderColor: accent, backgroundColor: `${accent}20` }}>
            {logoRight.file ? "📷" : logoRight.label?.[0] || "B"}
          </div>
        </div>
      )}

      {/* Labels */}
      <div className="flex justify-center gap-6 py-1">
        <span className="text-[8px] text-white/50">{logoLeft.label || "A"}</span>
        <span className="text-[8px] text-white/50">{logoRight.label || "B"}</span>
      </div>

      <div className="flex-1" />

      {/* Texts */}
      {texts.length > 0 && (
        <div className="px-4 py-2 bg-black/50">
          <p className="text-white text-center text-[9px] font-bold">{texts[0].text}</p>
          {texts.length > 1 && <p className="text-white/30 text-center text-[7px] mt-0.5">+ {texts.length - 1}개</p>}
        </div>
      )}

      <div className="h-4 bg-black/30 flex items-center justify-center">
        <span className="text-[6px] text-white/15">VS REEL · BRXCE</span>
      </div>
    </div>
  );
}

/* ====== NewsBreaking ====== */
function NewsBreakingPreview({ props, bg, primary, font }: { props: Record<string, unknown>; bg: string; primary: string; font: string }) {
  const headline = (props.headline as string) || "";
  const source = (props.source as string) || "";
  const points = (props.points || []) as string[];
  const opinion = (props.opinion as string) || "";

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: "#0a0a0a", fontFamily: font }}>
      {/* Alert bar */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600">
        <span className="text-white text-[8px] font-black tracking-wider">🚨 BREAKING</span>
        <div className="flex-1 h-px bg-white/30" />
        <span className="text-white/60 text-[6px]">LIVE</span>
      </div>

      {/* Headline */}
      <div className="px-4 py-3">
        <h2 className="text-white font-black text-xs leading-tight">{headline || "헤드라인을 입력하세요"}</h2>
        {source && <span className="text-white/30 text-[7px] mt-0.5 block">via {source}</span>}
      </div>

      {/* Points */}
      <div className="flex-1 px-3 py-1 space-y-1 overflow-hidden">
        {points.filter(Boolean).map((pt, i) => (
          <div key={i} className="flex items-start gap-1.5 px-2 py-1 rounded bg-white/5">
            <span className="text-[8px] font-bold" style={{ color: primary }}>{i + 1}</span>
            <p className="text-white/70 text-[8px] leading-relaxed">{pt}</p>
          </div>
        ))}
        {points.length === 0 && <div className="text-white/15 text-[8px] text-center py-2">포인트를 추가하세요</div>}
      </div>

      {/* Opinion */}
      {opinion && (
        <div className="px-3 py-2 border-t border-white/10 bg-[#111]">
          <span className="text-[7px] font-bold" style={{ color: primary }}>💬 MY TAKE</span>
          <p className="text-white/40 text-[8px] mt-0.5">{opinion}</p>
        </div>
      )}

      {/* Ticker */}
      <div className="h-4 bg-red-600/80 flex items-center px-3">
        <span className="text-white text-[6px] font-bold">BRXCE NEWS</span>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="w-full h-full flex items-center justify-center text-[#555] text-xs">{label}</div>;
}
