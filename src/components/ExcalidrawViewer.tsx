"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

const STORAGE_BASE =
  "https://euhxmmiqfyptvsvvbbvp.supabase.co/storage/v1/object/public/content-media/";

interface Props {
  src: string;
}

export default function ExcalidrawViewer({ src }: Props) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // scrollToContent on mount
  const handleExcalidrawAPI = useCallback((api: any) => {
    if (api) {
      // Wait for render, then scroll to fit all elements
      setTimeout(() => {
        try {
          api.scrollToContent(api.getSceneElements(), {
            fitToContent: true,
            animate: false,
            duration: 0,
          });
        } catch {
          // fallback: do nothing
        }
      }, 300);
    }
  }, []);

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
      <div className="h-[450px] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full text-[#555] text-sm">
            로딩 중…
          </div>
        ) : (
          data && (
            <Excalidraw
              initialData={{
                elements: data.elements as never[],
                appState: {
                  viewBackgroundColor: "#0a0a0a",
                  theme: "dark",
                  viewModeEnabled: true,
                  zenModeEnabled: true,
                  gridModeEnabled: false,
                },
                files: data.files as never,
                scrollToContent: true,
              }}
              excalidrawAPI={handleExcalidrawAPI}
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
