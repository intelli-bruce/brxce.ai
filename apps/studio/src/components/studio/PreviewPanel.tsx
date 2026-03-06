"use client";

import type { ProjectType } from "@/lib/studio/types";
import type {
  VideoScene,
  CarouselSlide,
  ImageLayer,
  StyleConfig,
} from "@engine/shared/types";

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

export default function PreviewPanel({
  type,
  template,
  width,
  height,
  scenes,
  selectedIndex,
  styleConfig,
  onSlideNav,
}: Props) {
  const bg = styleConfig.backgroundColor || "#0A0A0A";
  const primary = styleConfig.primaryColor || "#FF6B35";
  const accent = styleConfig.accentColor || "#4ECDC4";
  const font = styleConfig.fontFamily || "Inter, sans-serif";

  function renderVideoPreview() {
    const scene = scenes[selectedIndex] as VideoScene | undefined;

    switch (template) {
      case "ShortFormVideo":
        return <ShortFormPreview scene={scene} bg={bg} primary={primary} font={font} />;
      case "VSReel":
        return <VSReelPreview scene={scene} bg={bg} primary={primary} accent={accent} font={font} />;
      case "DayInTheLife":
        return <DayInTheLifePreview scene={scene} bg={bg} primary={primary} font={font} selectedIndex={selectedIndex} totalScenes={scenes.length} />;
      case "NewsBreaking":
        return <NewsBreakingPreview scene={scene} scenes={scenes as VideoScene[]} bg={bg} primary={primary} font={font} selectedIndex={selectedIndex} />;
      case "Demo60s":
        return <Demo60sPreview scene={scene} scenes={scenes as VideoScene[]} bg={bg} primary={primary} accent={accent} font={font} selectedIndex={selectedIndex} />;
      case "TextOverVideo":
        return <TextOverVideoPreview scene={scene} bg={bg} primary={primary} font={font} />;
      default:
        return <GenericVideoPreview scene={scene} bg={bg} primary={primary} template={template} font={font} />;
    }
  }

  function renderCarouselPreview() {
    const slide = scenes[selectedIndex] as CarouselSlide | undefined;
    if (!slide) return <EmptyState label="슬라이드를 추가하세요" />;
    return (
      <div className="w-full h-full flex flex-col p-6" style={{ backgroundColor: bg, fontFamily: font }}>
        <div className="flex gap-1 mb-4">
          {scenes.map((_, i) => (
            <div key={i} className="h-0.5 flex-1 rounded-full" style={{ backgroundColor: i === selectedIndex ? primary : "rgba(255,255,255,0.15)" }} />
          ))}
        </div>
        {slide.layout === "quote" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="text-3xl mb-3" style={{ color: primary }}>&ldquo;</div>
            <p className="text-white text-sm leading-relaxed italic">{slide.quoteText || "인용문"}</p>
            {slide.quoteAuthor && <p className="mt-3 text-xs" style={{ color: accent }}>&mdash; {slide.quoteAuthor}</p>}
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-white text-base font-bold mb-2">{slide.title || "제목"}</h2>
            <p className="text-[#aaa] text-xs leading-relaxed">{slide.body || "본문"}</p>
          </div>
        )}
        <div className="text-center text-[10px] mt-auto pt-3" style={{ color: primary }}>BRXCE</div>
      </div>
    );
  }

  function renderImagePreview() {
    const layers = scenes as ImageLayer[];
    return (
      <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: bg, fontFamily: font }}>
        {layers.length === 0 ? <EmptyState label="레이어를 추가하세요" /> : layers.map((layer, i) => {
          const isSelected = i === selectedIndex;
          const fontSize = (layer.style?.fontSize as number) || 32;
          const color = (layer.style?.color as string) || "#FFFFFF";
          if (layer.type === "text") {
            return (
              <div key={layer.id} className="absolute flex items-center justify-center text-center p-2"
                style={{ left: `${(layer.x / width) * 100}%`, top: `${(layer.y / height) * 100}%`, width: `${(layer.width / width) * 100}%`, height: `${(layer.height / height) * 100}%`, fontSize: `${fontSize * 0.4}px`, color, outline: isSelected ? `2px solid ${primary}` : "none" }}>
                {layer.content || "텍스트"}
              </div>
            );
          }
          if (layer.type === "image") {
            return (
              <div key={layer.id} className="absolute overflow-hidden rounded"
                style={{ left: `${(layer.x / width) * 100}%`, top: `${(layer.y / height) * 100}%`, width: `${(layer.width / width) * 100}%`, height: `${(layer.height / height) * 100}%`, outline: isSelected ? `2px solid ${primary}` : "none" }}>
                {layer.content ? <img src={layer.content} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#222] flex items-center justify-center text-[#555] text-xs">이미지</div>}
              </div>
            );
          }
          return (
            <div key={layer.id} className="absolute rounded"
              style={{ left: `${(layer.x / width) * 100}%`, top: `${(layer.y / height) * 100}%`, width: `${(layer.width / width) * 100}%`, height: `${(layer.height / height) * 100}%`, backgroundColor: layer.content || primary, outline: isSelected ? `2px solid ${accent}` : "none" }} />
          );
        })}
      </div>
    );
  }

  const isVideo = type === "video";

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#888]">프리뷰</h3>
      <div className={`w-full rounded-xl overflow-hidden border border-[#222] bg-[#111] ${isVideo ? "max-h-[480px]" : ""}`}
        style={{ aspectRatio: isVideo ? "9/16" : `${width / height}` }}>
        {type === "video" && renderVideoPreview()}
        {type === "carousel" && renderCarouselPreview()}
        {type === "image" && renderImagePreview()}
      </div>

      {/* Video scene nav */}
      {type === "video" && scenes.length > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => onSlideNav?.(-1)} disabled={selectedIndex <= 0}
            className="text-sm px-3 py-1 rounded bg-[#222] text-[#ccc] hover:bg-[#333] border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">◀</button>
          <span className="text-xs text-[#666]">{selectedIndex + 1} / {scenes.length}</span>
          <button onClick={() => onSlideNav?.(1)} disabled={selectedIndex >= scenes.length - 1}
            className="text-sm px-3 py-1 rounded bg-[#222] text-[#ccc] hover:bg-[#333] border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">▶</button>
        </div>
      )}

      {/* Carousel navigation */}
      {type === "carousel" && scenes.length > 0 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => onSlideNav?.(-1)} disabled={selectedIndex <= 0}
            className="text-sm px-3 py-1 rounded bg-[#222] text-[#ccc] hover:bg-[#333] border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">◀</button>
          <span className="text-xs text-[#666]">{selectedIndex + 1} / {scenes.length}</span>
          <button onClick={() => onSlideNav?.(1)} disabled={selectedIndex >= scenes.length - 1}
            className="text-sm px-3 py-1 rounded bg-[#222] text-[#ccc] hover:bg-[#333] border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">▶</button>
        </div>
      )}
    </div>
  );
}

/* ====== Template-specific Preview Components ====== */

function ShortFormPreview({ scene, bg, primary, font }: { scene?: VideoScene; bg: string; primary: string; font: string }) {
  const text = scene?.text || "텍스트를 입력하세요";
  const words = text.split(/\s+/);
  const highlightIdx = Math.floor(words.length / 2);

  return (
    <div className="w-full h-full flex flex-col relative" style={{ backgroundColor: bg, fontFamily: font }}>
      {/* Fake video bg gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] opacity-60" />

      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent" />

      {/* Center content area */}
      <div className="flex-1" />

      {/* Caption area — bottom positioned */}
      <div className="relative z-10 px-6 pb-12 pt-4">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl px-5 py-4">
          <p className="text-white text-center text-sm font-bold leading-relaxed">
            {words.map((word, i) => (
              <span key={i} className={i === highlightIdx ? "px-1 py-0.5 rounded" : ""} style={i === highlightIdx ? { backgroundColor: primary, color: "#fff" } : {}}>
                {word}{" "}
              </span>
            ))}
          </p>
        </div>
        {scene && (
          <div className="flex justify-center mt-2 gap-1">
            <span className="text-[9px] text-white/30">⏱ {(scene.durationFrames / 60).toFixed(1)}s</span>
            {scene.captionConfig?.style && <span className="text-[9px] text-white/30 ml-2">🎬 {scene.captionConfig.style}</span>}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 h-8 bg-black/30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/20" />
          <span className="text-[9px] text-white/40">brxce.ai</span>
        </div>
        <div className="flex gap-3">
          <span className="text-white/30 text-[10px]">❤️</span>
          <span className="text-white/30 text-[10px]">💬</span>
          <span className="text-white/30 text-[10px]">↗️</span>
        </div>
      </div>
    </div>
  );
}

function VSReelPreview({ scene, bg, primary, accent, font }: { scene?: VideoScene; bg: string; primary: string; accent: string; font: string }) {
  const text = scene?.text || "A vs B";

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: bg, fontFamily: font }}>
      {/* VS Header */}
      <div className="flex items-center justify-center gap-4 py-6 bg-gradient-to-b from-[#1a1a1a] to-transparent">
        <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg" style={{ borderColor: primary, backgroundColor: `${primary}20` }}>
          A
        </div>
        <div className="flex flex-col items-center">
          <span className="text-white font-black text-lg">VS</span>
          <div className="w-8 h-0.5 rounded-full mt-1" style={{ backgroundColor: primary }} />
        </div>
        <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg" style={{ borderColor: accent, backgroundColor: `${accent}20` }}>
          B
        </div>
      </div>

      {/* Split comparison */}
      <div className="flex-1 flex">
        <div className="flex-1 border-r border-white/10 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-transparent to-[#111]">
          <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center mb-3">
            <span className="text-2xl">🅰️</span>
          </div>
          <span className="text-white/60 text-[10px]">Option A</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-bl from-transparent to-[#111]">
          <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center mb-3">
            <span className="text-2xl">🅱️</span>
          </div>
          <span className="text-white/60 text-[10px]">Option B</span>
        </div>
      </div>

      {/* Text overlay */}
      <div className="px-5 py-4 bg-black/50">
        <p className="text-white text-center text-sm font-bold">{text}</p>
      </div>

      <div className="h-6 bg-black/30 flex items-center justify-center">
        <span className="text-[8px] text-white/20">VS REEL · BRXCE</span>
      </div>
    </div>
  );
}

function DayInTheLifePreview({ scene, bg, primary, font, selectedIndex, totalScenes }: { scene?: VideoScene; bg: string; primary: string; font: string; selectedIndex: number; totalScenes: number }) {
  const text = scene?.text || "클립 설명";
  // Extract time/emoji from text or use defaults
  const emoji = "💻";
  const time = `${String(8 + selectedIndex * 2).padStart(2, "0")}:00`;

  return (
    <div className="w-full h-full flex flex-col relative" style={{ backgroundColor: bg, fontFamily: font }}>
      {/* Fake timelapse bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b2a] via-[#1b263b] to-[#415a77] opacity-70" />
      
      {/* Scanline effect */}
      <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)" }} />

      {/* Top info */}
      <div className="relative z-10 flex items-start justify-between p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <div className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
            <span className="text-white font-mono font-bold text-sm">{time}</span>
          </div>
        </div>
        <div className="px-2 py-0.5 rounded bg-red-500/80 text-white text-[8px] font-bold flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          REC
        </div>
      </div>

      <div className="flex-1" />

      {/* Clip label */}
      <div className="relative z-10 px-5 pb-3">
        <p className="text-white text-sm font-semibold drop-shadow-lg">{text}</p>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 px-4 pb-4">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${((selectedIndex + 1) / Math.max(totalScenes, 1)) * 100}%`, backgroundColor: primary }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] text-white/30">{selectedIndex + 1}/{totalScenes} clips</span>
          <span className="text-[8px] text-white/30">{((scene?.durationFrames || 180) / 60).toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
}

function NewsBreakingPreview({ scene, scenes, bg, primary, font, selectedIndex }: { scene?: VideoScene; scenes: VideoScene[]; bg: string; primary: string; font: string; selectedIndex: number }) {
  const headline = scenes[0]?.text || "속보 헤드라인";
  const points = scenes.slice(1).map(s => s.text).filter(Boolean);
  const isHeadline = selectedIndex === 0;

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: "#0a0a0a", fontFamily: font }}>
      {/* Breaking alert bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-red-600">
        <span className="text-white text-xs font-black tracking-wider">🚨 BREAKING</span>
        <div className="flex-1 h-px bg-white/30" />
        <span className="text-white/60 text-[8px]">LIVE</span>
      </div>

      {/* Headline */}
      <div className={`px-5 py-5 ${isHeadline ? "bg-red-600/10 border-l-2 border-red-500" : ""}`}>
        <h2 className="text-white font-black text-base leading-tight">{headline}</h2>
        <span className="text-white/30 text-[9px] mt-1 block">Source: brxce.ai</span>
      </div>

      {/* Points */}
      <div className="flex-1 px-5 py-3 space-y-2 overflow-hidden">
        {points.length > 0 ? points.map((pt, i) => (
          <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-lg ${selectedIndex === i + 1 ? "bg-white/10 border border-white/20" : "bg-white/5"}`}>
            <span className="text-[10px] font-bold mt-0.5" style={{ color: primary }}>{i + 1}</span>
            <p className="text-white/80 text-xs leading-relaxed">{pt}</p>
          </div>
        )) : (
          <div className="text-white/20 text-xs text-center py-4">포인트를 추가하세요</div>
        )}
      </div>

      {/* MY TAKE section */}
      <div className="px-5 py-3 border-t border-white/10 bg-[#111]">
        <span className="text-[9px] font-bold tracking-wider" style={{ color: primary }}>💬 MY TAKE</span>
        <p className="text-white/50 text-[10px] mt-1">의견을 입력하세요</p>
      </div>

      {/* Bottom ticker */}
      <div className="h-6 bg-red-600/80 flex items-center px-4">
        <span className="text-white text-[8px] font-bold">BRXCE NEWS</span>
        <div className="flex-1 mx-3 h-px bg-white/20" />
        <span className="text-white/60 text-[8px]">JUST IN</span>
      </div>
    </div>
  );
}

function Demo60sPreview({ scene, scenes, bg, primary, accent, font, selectedIndex }: { scene?: VideoScene; scenes: VideoScene[]; bg: string; primary: string; accent: string; font: string; selectedIndex: number }) {
  const hookText = scenes[0]?.text || "60초 만에 만든다";
  const ctaText = scenes[scenes.length - 1]?.text || "댓글 달면 공유해드림";

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: bg, fontFamily: font }}>
      {/* Hook text */}
      <div className={`px-5 py-4 text-center ${selectedIndex === 0 ? "bg-white/5" : ""}`}>
        <p className="text-white font-black text-lg leading-tight">{hookText}</p>
        <div className="w-12 h-0.5 rounded-full mx-auto mt-2" style={{ backgroundColor: primary }} />
      </div>

      {/* Demo area */}
      <div className="flex-1 mx-4 rounded-xl bg-[#111] border border-[#222] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e] opacity-50" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${primary}20`, border: `2px solid ${primary}40` }}>
            <span className="text-2xl ml-1">▶</span>
          </div>
          <span className="text-white/30 text-xs">스크린캐스트 영역</span>
          <span className="text-white/15 text-[9px] mt-1">영상 파일을 추가하세요</span>
        </div>
        {/* Timer bar */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-black/40 flex items-center gap-2">
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: "60%", backgroundColor: primary }} />
          </div>
          <span className="text-white/40 text-[8px] font-mono">0:36 / 1:00</span>
        </div>
      </div>

      {/* CTA */}
      <div className={`mx-4 my-3 px-4 py-3 rounded-xl text-center ${selectedIndex === scenes.length - 1 ? "border border-white/20" : ""}`} style={{ backgroundColor: `${primary}15` }}>
        <p className="text-white text-xs font-bold">{ctaText}</p>
        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: primary, color: "#fff" }}>키워드</span>
      </div>

      {/* Logo */}
      <div className="h-6 flex items-center justify-center">
        <span className="text-white/20 text-[8px]">🦞 BRXCE</span>
      </div>
    </div>
  );
}

function TextOverVideoPreview({ scene, bg, primary, font }: { scene?: VideoScene; bg: string; primary: string; font: string }) {
  const text = scene?.text || "텍스트를 입력하세요";

  return (
    <div className="w-full h-full flex flex-col relative" style={{ fontFamily: font }}>
      {/* Cinematic gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
      
      {/* Film grain */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 256 256\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noise)\"/%3E%3C/svg%3E')" }} />

      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)" }} />

      {/* Centered text */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div className="text-center">
          <p className="text-white font-bold text-base leading-relaxed drop-shadow-lg" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>{text}</p>
          <div className="w-16 h-0.5 rounded-full mx-auto mt-3 opacity-50" style={{ backgroundColor: primary }} />
        </div>
      </div>

      {/* Bottom info */}
      <div className="relative z-10 px-4 pb-3 flex justify-between items-center">
        <span className="text-white/20 text-[8px]">TEXT OVER VIDEO</span>
        {scene && <span className="text-white/20 text-[8px]">{(scene.durationFrames / 60).toFixed(1)}s</span>}
      </div>
    </div>
  );
}

function GenericVideoPreview({ scene, bg, primary, template, font }: { scene?: VideoScene; bg: string; primary: string; template: string; font: string }) {
  if (!scene) return <EmptyState label="씬을 추가하세요" />;
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6" style={{ backgroundColor: bg, fontFamily: font }}>
      <div className="text-xs font-bold px-3 py-1 rounded-full mb-4" style={{ backgroundColor: primary, color: "#fff" }}>{template}</div>
      <p className="text-white text-sm font-semibold leading-relaxed text-center max-w-[80%]">{scene.text || "텍스트를 입력하세요"}</p>
      <div className="mt-3 text-[#666] text-xs">{(scene.durationFrames / 60).toFixed(1)}s</div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-[#555] text-sm">{label}</div>
  );
}
