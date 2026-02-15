"use client";

import { useState } from "react";
import type { CarouselSlide } from "@engine/shared/types";

interface Props {
  slides: CarouselSlide[];
  onChange: (slides: CarouselSlide[]) => void;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const LAYOUTS: { value: CarouselSlide["layout"]; label: string }[] = [
  { value: "text-only", label: "텍스트" },
  { value: "text-image", label: "텍스트+이미지" },
  { value: "quote", label: "인용구" },
];

function newSlide(): CarouselSlide {
  return {
    id: crypto.randomUUID(),
    layout: "text-only",
    title: "",
    body: "",
  };
}

export default function CarouselSlideEditor({
  slides,
  onChange,
  selectedIndex,
  onSelect,
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function addSlide() {
    const updated = [...slides, newSlide()];
    onChange(updated);
    onSelect(updated.length - 1);
  }

  function removeSlide(i: number) {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, idx) => idx !== i);
    onChange(updated);
    if (selectedIndex >= updated.length) onSelect(updated.length - 1);
    else if (selectedIndex === i) onSelect(Math.max(0, i - 1));
  }

  function moveSlide(from: number, to: number) {
    if (to < 0 || to >= slides.length) return;
    const updated = [...slides];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    onChange(updated);
    onSelect(to);
  }

  function updateSlide(i: number, patch: Partial<CarouselSlide>) {
    const updated = slides.map((s, idx) =>
      idx === i ? { ...s, ...patch } : s
    );
    onChange(updated);
  }

  const selected = slides[selectedIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#888]">
          슬라이드 ({slides.length})
        </h3>
        <button
          onClick={addSlide}
          className="text-xs px-2.5 py-1 rounded bg-[#222] text-[#ccc] hover:bg-[#333] border-none cursor-pointer"
        >
          + 추가
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== i) moveSlide(dragIndex, i);
              setDragIndex(null);
            }}
            onClick={() => onSelect(i)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
              selectedIndex === i
                ? "bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#fafafa]"
                : "bg-[#111] border border-transparent text-[#888] hover:bg-[#1a1a1a]"
            }`}
          >
            <span className="text-[10px] text-[#555] select-none cursor-grab">
              ⠿
            </span>
            <span className="flex-1 truncate">
              {slide.title || `슬라이드 ${i + 1}`}
            </span>
            <span className="text-[10px] text-[#555]">{slide.layout}</span>
            {slides.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSlide(i);
                }}
                className="text-[10px] text-[#555] hover:text-red-400 bg-transparent border-none cursor-pointer p-0"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <div className="p-4 bg-[#111] rounded-lg border border-[#222] space-y-3">
          <h4 className="text-xs font-semibold text-[#666]">
            슬라이드 {selectedIndex + 1} 편집
          </h4>

          <div>
            <label className="block text-xs text-[#666] mb-1">레이아웃</label>
            <div className="flex gap-1">
              {LAYOUTS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => updateSlide(selectedIndex, { layout: l.value })}
                  className={`text-xs px-2.5 py-1 rounded border-none cursor-pointer transition-colors ${
                    selected.layout === l.value
                      ? "bg-[#FF6B35] text-white"
                      : "bg-[#222] text-[#888] hover:bg-[#333]"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {selected.layout !== "quote" && (
            <>
              <div>
                <label className="block text-xs text-[#666] mb-1">제목</label>
                <input
                  value={selected.title || ""}
                  onChange={(e) =>
                    updateSlide(selectedIndex, { title: e.target.value })
                  }
                  className="w-full p-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none focus:border-[#555]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#666] mb-1">본문</label>
                <textarea
                  value={selected.body || ""}
                  onChange={(e) =>
                    updateSlide(selectedIndex, { body: e.target.value })
                  }
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none focus:border-[#555] resize-none"
                />
              </div>
            </>
          )}

          {selected.layout === "text-image" && (
            <div>
              <label className="block text-xs text-[#666] mb-1">
                이미지 URL
              </label>
              <input
                value={selected.imageUrl || ""}
                onChange={(e) =>
                  updateSlide(selectedIndex, { imageUrl: e.target.value })
                }
                placeholder="https://..."
                className="w-full p-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none focus:border-[#555]"
              />
            </div>
          )}

          {selected.layout === "quote" && (
            <>
              <div>
                <label className="block text-xs text-[#666] mb-1">인용문</label>
                <textarea
                  value={selected.quoteText || ""}
                  onChange={(e) =>
                    updateSlide(selectedIndex, { quoteText: e.target.value })
                  }
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none focus:border-[#555] resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[#666] mb-1">
                  출처 / 저자
                </label>
                <input
                  value={selected.quoteAuthor || ""}
                  onChange={(e) =>
                    updateSlide(selectedIndex, { quoteAuthor: e.target.value })
                  }
                  className="w-full p-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none focus:border-[#555]"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
