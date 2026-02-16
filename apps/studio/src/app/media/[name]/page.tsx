"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const BUCKET = "content-media";

interface EditOperation {
  type: string;
  [key: string]: unknown;
}

interface HistoryEntry {
  id: number;
  label: string;
  operations: EditOperation[];
  timestamp: number;
  previewUrl?: string;
}

export default function ImageEditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileName = decodeURIComponent(params.name as string);
  const sb = createSupabaseBrowser();

  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;

  const [imageUrl, setImageUrl] = useState(baseUrl);
  const [originalUrl] = useState(baseUrl);
  const [operations, setOperations] = useState<EditOperation[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([
    { id: 0, label: "원본", operations: [], timestamp: Date.now() },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imgMeta, setImgMeta] = useState<{ w: number; h: number; size?: string } | null>(null);
  const [zoom, setZoom] = useState(100);
  const [exporting, setExporting] = useState(false);
  const [editLog, setEditLog] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(true);

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load image metadata
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImgMeta({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = imageUrl;
  }, [imageUrl]);

  // Apply operations via API
  const applyOperations = useCallback(
    async (ops: EditOperation[], label: string) => {
      if (ops.length === 0) {
        setImageUrl(originalUrl);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/media/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceUrl: originalUrl,
            operations: ops,
            outputFormat: "png",
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          addLog(`❌ 편집 실패: ${err.error}`);
          setLoading(false);
          return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);

        // Add to history
        const entry: HistoryEntry = {
          id: history.length,
          label,
          operations: [...ops],
          timestamp: Date.now(),
          previewUrl: url,
        };
        const newHistory = [...history.slice(0, historyIndex + 1), entry];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setOperations(ops);

        addLog(`✅ ${label} 적용 완료`);
      } catch (err) {
        addLog(`❌ 에러: ${err}`);
      }
      setLoading(false);
    },
    [originalUrl, history, historyIndex],
  );

  function addLog(msg: string) {
    setEditLog((prev) => [...prev, `[${new Date().toLocaleTimeString("ko-KR")}] ${msg}`]);
  }

  // Undo/Redo
  function undo() {
    if (historyIndex <= 0) return;
    const prevIdx = historyIndex - 1;
    const prevEntry = history[prevIdx];
    setHistoryIndex(prevIdx);
    setOperations(prevEntry.operations);
    if (prevEntry.previewUrl) {
      setImageUrl(prevEntry.previewUrl);
    } else {
      setImageUrl(originalUrl);
    }
    addLog(`↩️ 되돌리기: ${prevEntry.label}`);
  }

  function redo() {
    if (historyIndex >= history.length - 1) return;
    const nextIdx = historyIndex + 1;
    const nextEntry = history[nextIdx];
    setHistoryIndex(nextIdx);
    setOperations(nextEntry.operations);
    if (nextEntry.previewUrl) {
      setImageUrl(nextEntry.previewUrl);
    }
    addLog(`↪️ 다시 실행: ${nextEntry.label}`);
  }

  // Reset to original
  function resetToOriginal() {
    setImageUrl(originalUrl);
    setOperations([]);
    setHistoryIndex(0);
    setHistory([{ id: 0, label: "원본", operations: [], timestamp: Date.now() }]);
    addLog("🔄 원본으로 초기화");
  }

  // Export edited image
  async function handleExport(format: "png" | "jpeg" | "webp") {
    setExporting(true);
    try {
      let blob: Blob;
      if (operations.length === 0) {
        const res = await fetch(originalUrl);
        blob = await res.blob();
      } else {
        const res = await fetch("/api/media/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceUrl: originalUrl,
            operations,
            outputFormat: format,
            quality: format === "jpeg" ? 92 : format === "webp" ? 90 : undefined,
          }),
        });
        blob = await res.blob();
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${fileName.replace(/\.[^.]+$/, "")}-edited.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      addLog(`📥 ${format.toUpperCase()} 내보내기 완료`);
    } catch (err) {
      addLog(`❌ 내보내기 실패: ${err}`);
    }
    setExporting(false);
  }

  // Save back to storage as new file
  async function handleSaveToStorage() {
    setExporting(true);
    try {
      const res = await fetch("/api/media/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl: originalUrl, operations, outputFormat: "png" }),
      });
      const blob = await res.blob();
      const editedName = `edited-${Date.now()}-${fileName}`;
      const file = new File([blob], editedName, { type: "image/png" });
      const { error } = await sb.storage.from(BUCKET).upload(editedName, file, { cacheControl: "3600", upsert: false });
      if (error) {
        addLog(`❌ 스토리지 저장 실패: ${error.message}`);
      } else {
        addLog(`💾 스토리지에 저장: ${editedName}`);
      }
    } catch (err) {
      addLog(`❌ 저장 실패: ${err}`);
    }
    setExporting(false);
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 25, 400));
      if (e.key === "-") setZoom((z) => Math.max(z - 25, 25));
      if (e.key === "0") setZoom(100);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [historyIndex, history]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#222] bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/media")}
            className="px-2 py-1 text-xs rounded-lg text-[#888] hover:text-white hover:bg-[#222] transition"
          >
            ← 미디어
          </button>
          <div className="w-px h-5 bg-[#333]" />
          <h2 className="text-sm font-medium text-[#fafafa] truncate max-w-[300px]" title={fileName}>
            {fileName}
          </h2>
          {imgMeta && (
            <span className="text-xs text-[#666]">
              {imgMeta.w}×{imgMeta.h}
            </span>
          )}
          {loading && (
            <span className="text-xs text-[#FF6B35] animate-pulse">편집 적용 중...</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="px-2 py-1.5 text-xs rounded-lg bg-[#222] text-[#ccc] hover:bg-[#333] disabled:opacity-30 transition"
            title="되돌리기 (⌘Z)"
          >
            ↩
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="px-2 py-1.5 text-xs rounded-lg bg-[#222] text-[#ccc] hover:bg-[#333] disabled:opacity-30 transition"
            title="다시 실행 (⌘⇧Z)"
          >
            ↪
          </button>
          <button
            onClick={resetToOriginal}
            className="px-2 py-1.5 text-xs rounded-lg bg-[#222] text-[#ccc] hover:bg-[#333] transition"
            title="원본으로 초기화"
          >
            🔄 초기화
          </button>

          <div className="w-px h-5 bg-[#333]" />

          {/* Save to storage */}
          <button
            onClick={handleSaveToStorage}
            disabled={exporting || operations.length === 0}
            className="px-3 py-1.5 text-xs rounded-lg bg-[#222] text-[#ccc] hover:bg-[#333] disabled:opacity-30 transition"
          >
            💾 스토리지 저장
          </button>

          {/* Export */}
          <div className="relative group">
            <button
              disabled={exporting}
              className="px-3 py-1.5 text-xs rounded-lg bg-[#FF6B35] text-white font-medium hover:bg-[#e55a2b] disabled:opacity-50 transition"
            >
              {exporting ? "처리 중..." : "↓ 내보내기"}
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden shadow-xl z-10 min-w-[120px]">
              {(["png", "jpeg", "webp"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleExport(fmt)}
                  className="px-4 py-2 text-xs text-left text-[#ccc] hover:bg-[#222] hover:text-white transition"
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Image preview */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Canvas area */}
          <div
            ref={containerRef}
            className="flex-1 overflow-auto flex items-center justify-center bg-[#0e0e0e] relative"
            style={{
              backgroundImage: "radial-gradient(circle, #1a1a1a 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt={fileName}
              style={{ zoom: `${zoom}%` }}
              className="max-w-none rounded shadow-2xl select-none transition-opacity"
              draggable={false}
            />
          </div>

          {/* Bottom zoom bar */}
          <div className="flex items-center justify-center gap-3 px-4 py-2 border-t border-[#222] bg-[#0a0a0a] shrink-0">
            <button onClick={() => setZoom((z) => Math.max(z - 25, 25))} className="w-6 h-6 flex items-center justify-center rounded bg-[#222] text-[#ccc] hover:bg-[#333] text-xs">−</button>
            <input type="range" min={25} max={400} step={25} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-40 accent-[#FF6B35]" />
            <span className="text-[10px] text-[#888] w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(z + 25, 400))} className="w-6 h-6 flex items-center justify-center rounded bg-[#222] text-[#ccc] hover:bg-[#333] text-xs">+</button>
            <button onClick={() => setZoom(100)} className="px-2 py-0.5 text-[10px] rounded bg-[#222] text-[#888] hover:bg-[#333]">1:1</button>
            <button onClick={() => { if (containerRef.current && imgMeta) { const cw = containerRef.current.clientWidth; setZoom(Math.round((cw / imgMeta.w) * 100 * 0.9)); }}} className="px-2 py-0.5 text-[10px] rounded bg-[#222] text-[#888] hover:bg-[#333]">맞춤</button>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[320px] border-l border-[#222] bg-[#111] flex flex-col shrink-0">
          {/* Edit History */}
          <div className="p-3 border-b border-[#222]">
            <h3 className="text-xs font-semibold text-[#fafafa] mb-2">편집 히스토리</h3>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {history.map((entry, i) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    setHistoryIndex(i);
                    setOperations(entry.operations);
                    if (entry.previewUrl) setImageUrl(entry.previewUrl);
                    else setImageUrl(originalUrl);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition ${
                    i === historyIndex
                      ? "bg-[#FF6B35]/15 text-[#FF6B35] font-medium"
                      : i <= historyIndex
                        ? "text-[#ccc] hover:bg-[#222]"
                        : "text-[#555] hover:bg-[#1a1a1a]"
                  }`}
                >
                  <span className="mr-2">{i === 0 ? "🖼" : "✏️"}</span>
                  {entry.label}
                  <span className="text-[9px] text-[#666] ml-1">
                    {new Date(entry.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Operations JSON (for AI editing) */}
          <div className="p-3 border-b border-[#222]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-[#fafafa]">현재 편집 명령</h3>
              <span className="text-[9px] text-[#666]">{operations.length}개 적용</span>
            </div>
            <pre className="text-[10px] text-[#888] bg-[#0a0a0a] rounded-lg p-2 max-h-[150px] overflow-auto font-mono leading-relaxed">
              {operations.length === 0
                ? "// 편집 없음 (원본)"
                : JSON.stringify(operations, null, 2)}
            </pre>
          </div>

          {/* Edit Log */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-3 pt-3 pb-1">
              <h3 className="text-xs font-semibold text-[#fafafa]">편집 로그</h3>
              <button onClick={() => setShowLog(!showLog)} className="text-[9px] text-[#666] hover:text-[#ccc]">
                {showLog ? "접기" : "펼치기"}
              </button>
            </div>
            {showLog && (
              <div className="flex-1 overflow-y-auto px-3 pb-3">
                <div className="space-y-0.5">
                  {editLog.length === 0 ? (
                    <p className="text-[10px] text-[#555] italic">아직 편집 내역이 없습니다</p>
                  ) : (
                    editLog.map((log, i) => (
                      <p key={i} className="text-[10px] text-[#888] font-mono leading-relaxed">{log}</p>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Info footer */}
          <div className="p-3 border-t border-[#222] text-[10px] text-[#555] space-y-0.5">
            <p>🤖 AI 에이전트가 API를 통해 편집합니다</p>
            <p>POST /api/media/edit — operations 배열 전송</p>
            <p>편집 결과가 실시간으로 미리보기에 반영됩니다</p>
          </div>
        </div>
      </div>
    </div>
  );
}
