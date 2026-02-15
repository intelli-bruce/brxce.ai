"use client";

import { useEffect, useState } from "react";
import React from "react";

const DEFAULT_STORAGE_BASE =
  "https://euhxmmiqfyptvsvvbbvp.supabase.co/storage/v1/object/public/content-media/";

interface Props {
  src: string;
  storageBase?: string;
}

export function ExcalidrawViewer({ src, storageBase = DEFAULT_STORAGE_BASE }: Props) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const url = src.startsWith("http") ? src : `${storageBase}${src}`;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(res.statusText);

        if (src.endsWith(".svg")) {
          const text = await res.text();
          if (!cancelled) setSvgContent(text);
          return;
        }

        const data = await res.json();
        const elements = (data.elements || []).filter((e: any) => !e.isDeleted);
        if (!elements.length) { if (!cancelled) setError(true); return; }

        const PADDING = 30;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const el of elements) {
          minX = Math.min(minX, el.x ?? 0);
          minY = Math.min(minY, el.y ?? 0);
          maxX = Math.max(maxX, (el.x ?? 0) + (el.width ?? 0));
          maxY = Math.max(maxY, (el.y ?? 0) + (el.height ?? 0));
        }

        const vw = maxX - minX + PADDING * 2;
        const vh = maxY - minY + PADDING * 2;
        const ox = -minX + PADDING;
        const oy = -minY + PADDING;

        const svgParts: string[] = [];
        svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}" width="100%" style="max-height:400px;background:#0a0a0a">`);
        svgParts.push(`<style>text{font-family:'Segoe UI',system-ui,sans-serif;}</style>`);

        for (const el of elements) {
          const x = (el.x ?? 0) + ox;
          const y = (el.y ?? 0) + oy;
          const w = el.width ?? 0;
          const h = el.height ?? 0;
          const stroke = (el.strokeColor === "#1e1e1e" || el.strokeColor === "#000000") ? "#e0e0e0" : (el.strokeColor || "#e0e0e0");
          const fill = el.backgroundColor === "transparent" ? "none" : (el.backgroundColor || "none");
          const sw = el.strokeWidth ?? 2;

          if (el.type === "rectangle") {
            svgParts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" rx="4"/>`);
          } else if (el.type === "ellipse") {
            svgParts.push(`<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`);
          } else if (el.type === "diamond") {
            const cx = x + w / 2, cy = y + h / 2;
            svgParts.push(`<polygon points="${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`);
          } else if (el.type === "text") {
            const textColor = (stroke === "none" || stroke === "#1e1e1e" || stroke === "#000000") ? "#e0e0e0" : stroke;
            const fontSize = el.fontSize ?? 16;
            const lines = (el.text ?? "").split("\\n");
            const textX = x + w / 2, textY = y + h / 2;
            svgParts.push(`<text x="${textX}" y="${textY}" fill="${textColor}" font-size="${fontSize}" text-anchor="middle" dominant-baseline="central">`);
            if (lines.length === 1) {
              svgParts.push(escapeHtml(lines[0]));
            } else {
              lines.forEach((line: string, i: number) => {
                svgParts.push(`<tspan x="${textX}" dy="${i === 0 ? `-${(lines.length - 1) * 0.5}em` : "1em"}">${escapeHtml(line)}</tspan>`);
              });
            }
            svgParts.push(`</text>`);
          } else if (el.type === "arrow" || el.type === "line") {
            const points = el.points || [];
            if (points.length >= 2) {
              const d = points.map((p: number[], i: number) => `${i === 0 ? "M" : "L"}${x + p[0]},${y + p[1]}`).join(" ");
              svgParts.push(`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}"${el.type === "arrow" ? ' marker-end="url(#arrowhead)"' : ""}/>`);
            }
          }
        }

        svgParts.push(`<defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#e0e0e0"/></marker></defs>`);
        svgParts.push("</svg>");
        if (!cancelled) setSvgContent(svgParts.join(""));
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [url, src]);

  if (error) {
    return (
      <div className="rounded-xl border border-[#222] bg-[#0a0a0a] p-6 text-[#666] text-sm text-center">
        다이어그램을 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="my-6 rounded-xl border border-[#222] bg-[#0a0a0a] overflow-hidden">
      <div className="px-4 pt-3 pb-1 text-xs text-[#666]">📐 다이어그램</div>
      <div className="w-full flex items-center justify-center p-4" style={{ minHeight: 200 }}>
        {loading ? (
          <div className="text-[#555] text-sm">로딩 중…</div>
        ) : svgContent ? (
          <div
            className="w-full [&_svg]:w-full [&_svg]:h-auto [&_svg]:max-h-[400px]"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : null}
      </div>
    </div>
  );
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
