"use client";

import type { PropSchema } from "@/lib/studio/slide-templates";

export function PropControl({
  propKey,
  schema,
  value,
  onChange,
}: {
  propKey: string;
  schema: PropSchema;
  value: any;
  onChange: (v: any) => void;
}) {
  const label = (
    <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">
      {schema.label}
      {schema.required && <span className="text-[#ff6b35] ml-1">*</span>}
    </label>
  );

  if (schema.type === "boolean") {
    const checked = value ?? schema.default ?? false;
    return (
      <div className="flex items-center justify-between py-1">
        <span className="text-[10px] text-[#555] uppercase tracking-wider">{schema.label}</span>
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-[#ff6b35]" : "bg-[#333]"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : ""}`}
          />
        </button>
      </div>
    );
  }

  if (schema.type === "number") {
    const numValue = value ?? schema.default ?? 0;
    return (
      <div>
        {label}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={schema.min ?? 0}
            max={schema.max ?? 300}
            step={schema.step ?? 1}
            value={numValue}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 h-1.5 rounded-full appearance-none bg-[#222] accent-[#ff6b35] cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ff6b35] [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_#0f0f0f]"
          />
          <input
            type="number"
            min={schema.min}
            max={schema.max}
            step={schema.step}
            value={numValue}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-16 bg-[#0a0a0a] border border-[#222] rounded-md px-2 py-1 text-xs text-[#ccc] text-center font-mono
              focus:border-[#ff6b35] focus:outline-none"
          />
        </div>
      </div>
    );
  }

  if (schema.type === "color") {
    return (
      <div>
        {label}
        <div className="flex gap-2">
          <input
            type="color"
            value={value || "#ff6b35"}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-8 rounded border border-[#222] cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-[#ccc] font-mono focus:border-[#ff6b35] focus:outline-none"
          />
        </div>
      </div>
    );
  }

  if (schema.type === "image") {
    return (
      <div>
        {label}
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="이미지 URL"
          className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-[#ccc] focus:border-[#ff6b35] focus:outline-none transition-colors"
        />
      </div>
    );
  }

  // string (default)
  if (schema.type === "string") {
    const strValue = typeof value === "string" ? value : String(value ?? "");
    const isLong = strValue.length > 60 || strValue.includes("\n");
    return (
      <div>
        {label}
        {isLong ? (
          <textarea
            value={strValue}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-[#ccc] resize-y focus:border-[#ff6b35] focus:outline-none transition-colors"
          />
        ) : (
          <input
            type="text"
            value={strValue}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-[#ccc] focus:border-[#ff6b35] focus:outline-none transition-colors"
          />
        )}
      </div>
    );
  }

  return null;
}
