"use client";

import type { StyleConfig } from "@engine/shared/types";

interface Props {
  config: StyleConfig;
  onChange: (config: StyleConfig) => void;
}

const BRAND_PRESET: StyleConfig = {
  fontFamily: "Inter, sans-serif",
  primaryColor: "#FF6B35",
  backgroundColor: "#0A0A0A",
  accentColor: "#4ECDC4",
  borderRadius: 12,
};

const FONT_OPTIONS = [
  "Inter, sans-serif",
  "Pretendard, sans-serif",
  "Noto Sans KR, sans-serif",
  "Roboto, sans-serif",
  "Montserrat, sans-serif",
];

export default function StylePanel({ config, onChange }: Props) {
  function update(patch: Partial<StyleConfig>) {
    onChange({ ...config, ...patch });
  }

  return (
    <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#222] space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#888]">스타일</h3>
        <button
          onClick={() => onChange(BRAND_PRESET)}
          className="text-[10px] px-2 py-0.5 rounded bg-[#FF6B35]/15 text-[#FF6B35] hover:bg-[#FF6B35]/25 border-none cursor-pointer"
        >
          BRXCE 기본값
        </button>
      </div>

      <div>
        <label className="block text-xs text-[#666] mb-1">폰트</label>
        <select
          value={config.fontFamily || BRAND_PRESET.fontFamily}
          onChange={(e) => update({ fontFamily: e.target.value })}
          className="w-full p-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none cursor-pointer"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f.split(",")[0]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[#666] mb-1">
            Primary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.primaryColor || BRAND_PRESET.primaryColor}
              onChange={(e) => update({ primaryColor: e.target.value })}
              className="w-8 h-8 rounded border border-[#333] cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={config.primaryColor || BRAND_PRESET.primaryColor}
              onChange={(e) => update({ primaryColor: e.target.value })}
              className="flex-1 p-1.5 rounded bg-[#0a0a0a] border border-[#333] text-xs text-[#fafafa] outline-none font-mono"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#666] mb-1">
            Background
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.backgroundColor || BRAND_PRESET.backgroundColor}
              onChange={(e) => update({ backgroundColor: e.target.value })}
              className="w-8 h-8 rounded border border-[#333] cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={config.backgroundColor || BRAND_PRESET.backgroundColor}
              onChange={(e) => update({ backgroundColor: e.target.value })}
              className="flex-1 p-1.5 rounded bg-[#0a0a0a] border border-[#333] text-xs text-[#fafafa] outline-none font-mono"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[#666] mb-1">Accent</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.accentColor || BRAND_PRESET.accentColor}
              onChange={(e) => update({ accentColor: e.target.value })}
              className="w-8 h-8 rounded border border-[#333] cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={config.accentColor || BRAND_PRESET.accentColor}
              onChange={(e) => update({ accentColor: e.target.value })}
              className="flex-1 p-1.5 rounded bg-[#0a0a0a] border border-[#333] text-xs text-[#fafafa] outline-none font-mono"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#666] mb-1">
            Border Radius
          </label>
          <input
            type="number"
            value={config.borderRadius ?? BRAND_PRESET.borderRadius}
            onChange={(e) =>
              update({ borderRadius: Math.max(0, Number(e.target.value)) })
            }
            min={0}
            max={50}
            className="w-full p-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-[#fafafa] outline-none"
          />
        </div>
      </div>
    </div>
  );
}
