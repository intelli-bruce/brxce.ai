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
  const aspect = width / height;
  const bg = styleConfig.backgroundColor || "#0A0A0A";
  const primary = styleConfig.primaryColor || "#FF6B35";
  const accent = styleConfig.accentColor || "#4ECDC4";
  const font = styleConfig.fontFamily || "Inter, sans-serif";

  function renderVideoPreview() {
    const scene = scenes[selectedIndex] as VideoScene | undefined;
    if (!scene) return <EmptyState label="씬을 추가하세요" />;
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-8 text-center"
        style={{ backgroundColor: bg, fontFamily: font }}
      >
        <div
          className="text-xs font-bold px-3 py-1 rounded-full mb-4"
          style={{ backgroundColor: primary, color: "#fff" }}
        >
          {template}
        </div>
        <p className="text-white text-lg font-semibold leading-relaxed max-w-[80%]">
          {scene.text || "텍스트를 입력하세요"}
        </p>
        <div className="mt-4 text-[#666] text-xs">
          {(scene.durationFrames / 60).toFixed(1)}s
        </div>
      </div>
    );
  }

  function renderCarouselPreview() {
    const slide = scenes[selectedIndex] as CarouselSlide | undefined;
    if (!slide) return <EmptyState label="슬라이드를 추가하세요" />;
    return (
      <div
        className="w-full h-full flex flex-col p-8"
        style={{ backgroundColor: bg, fontFamily: font }}
      >
        {/* Slide indicator */}
        <div className="flex gap-1 mb-6">
          {scenes.map((_, i) => (
            <div
              key={i}
              className="h-0.5 flex-1 rounded-full"
              style={{
                backgroundColor:
                  i === selectedIndex ? primary : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>

        {slide.layout === "quote" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div
              className="text-4xl mb-4"
              style={{ color: primary }}
            >
              &ldquo;
            </div>
            <p className="text-white text-base leading-relaxed italic">
              {slide.quoteText || "인용문을 입력하세요"}
            </p>
            {slide.quoteAuthor && (
              <p className="mt-4 text-sm" style={{ color: accent }}>
                &mdash; {slide.quoteAuthor}
              </p>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-white text-xl font-bold mb-3">
              {slide.title || "제목"}
            </h2>
            <p className="text-[#aaa] text-sm leading-relaxed">
              {slide.body || "본문을 입력하세요"}
            </p>
            {slide.layout === "text-image" && slide.imageUrl && (
              <div className="mt-4 rounded-lg overflow-hidden bg-[#222] h-32 flex items-center justify-center">
                <img
                  src={slide.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* Brand footer */}
        <div className="text-center text-xs mt-auto pt-4" style={{ color: primary }}>
          BRXCE
        </div>
      </div>
    );
  }

  function renderImagePreview() {
    const layers = scenes as ImageLayer[];
    return (
      <div
        className="w-full h-full relative overflow-hidden"
        style={{ backgroundColor: bg, fontFamily: font }}
      >
        {layers.length === 0 ? (
          <EmptyState label="레이어를 추가하세요" />
        ) : (
          layers.map((layer, i) => {
            const isSelected = i === selectedIndex;
            const fontSize = (layer.style?.fontSize as number) || 32;
            const color = (layer.style?.color as string) || "#FFFFFF";

            if (layer.type === "text") {
              return (
                <div
                  key={layer.id}
                  className="absolute flex items-center justify-center text-center p-2"
                  style={{
                    left: `${(layer.x / width) * 100}%`,
                    top: `${(layer.y / height) * 100}%`,
                    width: `${(layer.width / width) * 100}%`,
                    height: `${(layer.height / height) * 100}%`,
                    fontSize: `${fontSize * 0.4}px`,
                    color,
                    outline: isSelected
                      ? `2px solid ${primary}`
                      : "none",
                  }}
                >
                  {layer.content || "텍스트"}
                </div>
              );
            }
            if (layer.type === "image") {
              return (
                <div
                  key={layer.id}
                  className="absolute overflow-hidden rounded"
                  style={{
                    left: `${(layer.x / width) * 100}%`,
                    top: `${(layer.y / height) * 100}%`,
                    width: `${(layer.width / width) * 100}%`,
                    height: `${(layer.height / height) * 100}%`,
                    outline: isSelected
                      ? `2px solid ${primary}`
                      : "none",
                  }}
                >
                  {layer.content ? (
                    <img
                      src={layer.content}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#222] flex items-center justify-center text-[#555] text-xs">
                      이미지
                    </div>
                  )}
                </div>
              );
            }
            // shape
            return (
              <div
                key={layer.id}
                className="absolute rounded"
                style={{
                  left: `${(layer.x / width) * 100}%`,
                  top: `${(layer.y / height) * 100}%`,
                  width: `${(layer.width / width) * 100}%`,
                  height: `${(layer.height / height) * 100}%`,
                  backgroundColor: layer.content || primary,
                  outline: isSelected
                    ? `2px solid ${accent}`
                    : "none",
                }}
              />
            );
          })
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#888]">프리뷰</h3>
      <div
        className="w-full rounded-lg overflow-hidden border border-[#222] bg-[#111]"
        style={{ aspectRatio: `${aspect}` }}
      >
        {type === "video" && renderVideoPreview()}
        {type === "carousel" && renderCarouselPreview()}
        {type === "image" && renderImagePreview()}
      </div>

      {/* Carousel navigation */}
      {type === "carousel" && scenes.length > 0 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onSlideNav?.(-1)}
            disabled={selectedIndex <= 0}
            className="text-sm px-3 py-1 rounded bg-[#222] text-[#ccc] hover:bg-[#333] border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ◀
          </button>
          <span className="text-xs text-[#666]">
            {selectedIndex + 1} / {scenes.length}
          </span>
          <button
            onClick={() => onSlideNav?.(1)}
            disabled={selectedIndex >= scenes.length - 1}
            className="text-sm px-3 py-1 rounded bg-[#222] text-[#ccc] hover:bg-[#333] border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-[#555] text-sm">
      {label}
    </div>
  );
}
