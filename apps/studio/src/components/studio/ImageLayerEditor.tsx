"use client";

import type { ImageLayer } from "@engine/shared/types";

interface Props {
  layers: ImageLayer[];
  onChange: (layers: ImageLayer[]) => void;
  selectedIndex: number;
  onSelect: (index: number) => void;
  template: string;
}

const LAYER_TYPES: { value: ImageLayer["type"]; label: string }[] = [
  { value: "text", label: "텍스트" },
  { value: "image", label: "이미지" },
  { value: "shape", label: "도형" },
];

function newLayer(): ImageLayer {
  return {
    id: crypto.randomUUID(),
    type: "text",
    content: "",
    x: 0,
    y: 0,
    width: 400,
    height: 100,
  };
}

export default function ImageLayerEditor({
  layers,
  onChange,
  selectedIndex,
  onSelect,
  template,
}: Props) {
  function addLayer() {
    const updated = [...layers, newLayer()];
    onChange(updated);
    onSelect(updated.length - 1);
  }

  function removeLayer(i: number) {
    if (layers.length <= 1) return;
    const updated = layers.filter((_, idx) => idx !== i);
    onChange(updated);
    if (selectedIndex >= updated.length) onSelect(updated.length - 1);
    else if (selectedIndex === i) onSelect(Math.max(0, i - 1));
  }

  function updateLayer(i: number, patch: Partial<ImageLayer>) {
    const updated = layers.map((l, idx) =>
      idx === i ? { ...l, ...patch } : l
    );
    onChange(updated);
  }

  function updateStyle(i: number, key: string, value: string | number) {
    const layer = layers[i];
    const style = { ...layer.style, [key]: value };
    updateLayer(i, { style });
  }

  const selected = layers[selectedIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#888]">
          레이어 ({layers.length})
        </h3>
        <button
          onClick={addLayer}
          className="text-xs px-2.5 py-1 rounded bg-[#222] text-[#ccc] hover:bg-[#333] border-none cursor-pointer"
        >
          + 추가
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {layers.map((layer, i) => (
          <div
            key={layer.id}
            onClick={() => onSelect(i)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
              selectedIndex === i
                ? "bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#fafafa]"
                : "bg-[#111] border border-transparent text-[#888] hover:bg-[#1a1a1a]"
            }`}
          >
            <span className="text-[10px] text-[#555]">
              {layer.type === "text" ? "T" : layer.type === "image" ? "I" : "S"}
            </span>
            <span className="flex-1 truncate">
              {layer.content || `레이어 ${i + 1}`}
            </span>
            {layers.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeLayer(i);
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
            레이어 {selectedIndex + 1} 편집 — {template}
          </h4>

          <div>
            <label className="block text-xs text-[#666] mb-1">타입</label>
            <div className="flex gap-1">
              {LAYER_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() =>
                    updateLayer(selectedIndex, { type: t.value })
                  }
                  className={`text-xs px-2.5 py-1 rounded border-none cursor-pointer transition-colors ${
                    selected.type === t.value
                      ? "bg-[#FF6B35] text-white"
                      : "bg-[#222] text-[#888] hover:bg-[#333]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#666] mb-1">
              {selected.type === "text" ? "텍스트" : selected.type === "image" ? "이미지 URL" : "색상"}
            </label>
            {selected.type === "text" ? (
              <textarea
                value={selected.content}
                onChange={(e) =>
                  updateLayer(selectedIndex, { content: e.target.value })
                }
                rows={2}
                className="w-full p-2.5 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none focus:border-[#555] resize-none"
              />
            ) : (
              <input
                value={selected.content}
                onChange={(e) =>
                  updateLayer(selectedIndex, { content: e.target.value })
                }
                placeholder={selected.type === "image" ? "https://..." : "#FF6B35"}
                className="w-full p-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none focus:border-[#555]"
              />
            )}
          </div>

          {selected.type === "text" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-[#666] mb-1">
                  글꼴 크기
                </label>
                <input
                  type="number"
                  value={(selected.style?.fontSize as number) || 32}
                  onChange={(e) =>
                    updateStyle(selectedIndex, "fontSize", Number(e.target.value))
                  }
                  className="w-full p-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none focus:border-[#555]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#666] mb-1">
                  글자색
                </label>
                <input
                  type="color"
                  value={(selected.style?.color as string) || "#FFFFFF"}
                  onChange={(e) =>
                    updateStyle(selectedIndex, "color", e.target.value)
                  }
                  className="w-full h-9 rounded-lg bg-[#0a0a0a] border border-[#333] cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
