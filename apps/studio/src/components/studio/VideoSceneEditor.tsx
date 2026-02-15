"use client";

import { useState } from "react";
import type { VideoScene } from "@engine/shared/types";

interface Props {
  scenes: VideoScene[];
  onChange: (scenes: VideoScene[]) => void;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function newScene(): VideoScene {
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
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function addScene() {
    const updated = [...scenes, newScene()];
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

  return (
    <div className="space-y-4">
      {/* Scene list */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#888]">
          씬 ({scenes.length})
        </h3>
        <button
          onClick={addScene}
          className="text-xs px-2.5 py-1 rounded bg-[#222] text-[#ccc] hover:bg-[#333] border-none cursor-pointer"
        >
          + 추가
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {scenes.map((scene, i) => (
          <div
            key={scene.id}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== i) moveScene(dragIndex, i);
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
              {scene.text || `씬 ${i + 1}`}
            </span>
            <span className="text-[10px] text-[#555]">
              {Math.round(scene.durationFrames / 60 * 10) / 10}s
            </span>
            {scenes.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeScene(i);
                }}
                className="text-[10px] text-[#555] hover:text-red-400 bg-transparent border-none cursor-pointer p-0"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Selected scene editor */}
      {selected && (
        <div className="p-4 bg-[#111] rounded-lg border border-[#222] space-y-3">
          <h4 className="text-xs font-semibold text-[#666]">
            씬 {selectedIndex + 1} 편집
          </h4>
          <div>
            <label className="block text-xs text-[#666] mb-1">텍스트</label>
            <textarea
              value={selected.text}
              onChange={(e) =>
                updateScene(selectedIndex, { text: e.target.value })
              }
              rows={3}
              className="w-full p-2.5 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none focus:border-[#555] resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#666] mb-1">
              길이 (프레임, 60fps = 1초)
            </label>
            <input
              type="number"
              value={selected.durationFrames}
              onChange={(e) =>
                updateScene(selectedIndex, {
                  durationFrames: Math.max(1, Number(e.target.value)),
                })
              }
              min={1}
              className="w-full p-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none focus:border-[#555]"
            />
            <span className="text-[10px] text-[#555] mt-1 block">
              {(selected.durationFrames / 60).toFixed(1)}초
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
