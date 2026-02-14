"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

const STORAGE_BASE =
  "https://euhxmmiqfyptvsvvbbvp.supabase.co/storage/v1/object/public/content-media/";

const CONTAINER_HEIGHT = 450;

interface Props {
  src: string;
}

export default function ExcalidrawViewer({ src }: Props) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(700);

  const url = src.startsWith("http") ? src : `${STORAGE_BASE}${src}`;

  useEffect(() => {
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [url]);

  // Calculate scroll & zoom to fit all elements
  const fittedAppState = useMemo(() => {
    if (!data?.elements?.length) return null;

    const elements = data.elements.filter((e: any) => !e.isDeleted);
    if (!elements.length) return null;

    const PADDING = 40;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const el of elements) {
      const x = el.x ?? 0;
      const y = el.y ?? 0;
      const w = el.width ?? 0;
      const h = el.height ?? 0;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + w > maxX) maxX = x + w;
      if (y + h > maxY) maxY = y + h;
    }

    const contentW = maxX - minX + PADDING * 2;
    const contentH = maxY - minY + PADDING * 2;

    const zoomX = containerWidth / contentW;
    const zoomY = CONTAINER_HEIGHT / contentH;
    const zoom = Math.min(zoomX, zoomY, 1); // don't zoom in past 100%

    const scrollX = -minX + PADDING + (containerWidth / zoom - contentW) / 2;
    const scrollY = -minY + PADDING + (CONTAINER_HEIGHT / zoom - contentH) / 2;

    return {
      scrollX,
      scrollY,
      zoom: { value: zoom },
      viewBackgroundColor: "#0a0a0a",
      theme: "dark" as const,
      viewModeEnabled: true,
      zenModeEnabled: true,
      gridModeEnabled: false,
    };
  }, [data, containerWidth]);

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
      <div
        className="w-full relative"
        style={{ height: CONTAINER_HEIGHT, overflow: "hidden" }}
        ref={(el) => {
          if (el && el.offsetWidth !== containerWidth) {
            setContainerWidth(el.offsetWidth);
          }
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full text-[#555] text-sm">
            로딩 중…
          </div>
        ) : (
          data && fittedAppState && (
            <Excalidraw
              key={`${containerWidth}-${src}`}
              initialData={{
                elements: data.elements,
                appState: fittedAppState,
                files: data.files || undefined,
              }}
              viewModeEnabled={true}
              zenModeEnabled={true}
              theme="dark"
              UIOptions={{
                canvasActions: {
                  changeViewBackgroundColor: false,
                  clearCanvas: false,
                  export: false,
                  loadScene: false,
                  saveToActiveFile: false,
                  toggleTheme: false,
                  saveAsImage: false,
                },
                tools: { image: false },
              }}
            />
          )
        )}
      </div>
    </div>
  );
}
