"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { AlertCircle, CheckCircle2, LoaderCircle, ServerCrash } from "lucide-react"

const EDITOR_ORIGIN = "http://localhost:8090"
const EDITOR_URL = `${EDITOR_ORIGIN}/editor.html?v=${Date.now()}`
const STATUS_URL = `${EDITOR_ORIGIN}/api/render/status`
const PRESET_STORAGE_KEY = "brxce-video-preset"

type ConnectionState = "checking" | "connected" | "disconnected"

export default function VideoEditPage() {
  const [connectionState, setConnectionState] = useState<ConnectionState>("checking")
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null)
  const [presetLoaded, setPresetLoaded] = useState(false)
  const [presetName, setPresetName] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Check connection
  useEffect(() => {
    let disposed = false
    const checkConnection = async () => {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 2500)
      try {
        const response = await fetch(STATUS_URL, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        })
        if (!disposed) {
          setConnectionState(response.ok ? "connected" : "disconnected")
          setLastCheckedAt(new Date().toLocaleTimeString("ko-KR", { hour12: false }))
        }
      } catch {
        if (!disposed) {
          setConnectionState("disconnected")
          setLastCheckedAt(new Date().toLocaleTimeString("ko-KR", { hour12: false }))
        }
      } finally {
        window.clearTimeout(timeout)
      }
    }
    checkConnection()
    const interval = window.setInterval(checkConnection, 5000)
    return () => { disposed = true; window.clearInterval(interval) }
  }, [])

  // Listen for preset-loaded confirmation from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "brxce-preset-loaded") {
        setPresetLoaded(true)
        // Clean up localStorage
        localStorage.removeItem(PRESET_STORAGE_KEY)
        // Auto-hide toast after 3s
        setTimeout(() => setPresetLoaded(false), 3000)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  // Send preset to iframe after it loads
  const handleIframeLoad = useCallback(() => {
    const raw = localStorage.getItem(PRESET_STORAGE_KEY)
    if (!raw) return
    try {
      const project = JSON.parse(raw)
      setPresetName(project.name || null)
      // Small delay to ensure editor JS is initialized
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage(
          { type: "brxce-load-preset", project },
          EDITOR_ORIGIN
        )
      }, 500)
    } catch {
      // Invalid preset data
      localStorage.removeItem(PRESET_STORAGE_KEY)
    }
  }, [])

  const statusMeta = useMemo(() => {
    switch (connectionState) {
      case "connected":
        return {
          label: "서버 연결됨",
          icon: CheckCircle2,
          className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        }
      case "disconnected":
        return {
          label: "서버 연결 안됨",
          icon: ServerCrash,
          className: "border-rose-500/30 bg-rose-500/10 text-rose-300",
        }
      default:
        return {
          label: "연결 확인 중",
          icon: LoaderCircle,
          className: "border-zinc-700 bg-zinc-900 text-zinc-300",
        }
    }
  }, [connectionState])

  const StatusIcon = statusMeta.icon

  return (
    <div className="-mx-6 -my-6 flex h-[calc(100svh-3rem)] min-h-[calc(100svh-3rem)] flex-col overflow-hidden bg-[#0a0a0a] text-[#fafafa]">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#0d0d0d]/95 px-6 py-3">
        <div>
          <h1 className="text-lg font-semibold text-[#fafafa]">영상 편집</h1>
          <p className="mt-1 text-sm text-[#7a7a7a]">타임라인 기반 편집기를 studio 내부에서 바로 엽니다.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Preset loaded toast */}
          {presetLoaded && (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 animate-pulse">
              <CheckCircle2 className="size-3.5" />
              <span>프리셋 적용됨{presetName ? ` — ${presetName}` : ""}</span>
            </div>
          )}
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${statusMeta.className}`}>
            <StatusIcon className={`size-3.5 ${connectionState === "checking" ? "animate-spin" : ""}`} />
            <span>{statusMeta.label}</span>
          </div>
        </div>
      </div>

      {connectionState === "disconnected" ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-2xl border border-rose-500/20 bg-[#111]/90 p-8 shadow-2xl shadow-black/30">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
              <AlertCircle className="size-6" />
            </div>
            <h2 className="text-xl font-semibold text-[#fafafa]">편집기 서버에 연결할 수 없습니다</h2>
            <p className="mt-3 text-sm leading-6 text-[#9a9a9a]">
              로컬 편집기 서버가 꺼져 있으면 iframe을 열 수 없습니다. 아래 명령으로 서버를 실행하세요.
            </p>
            <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-sm text-[#d8d8d8]">
              python3 server.py
            </div>
            <p className="mt-3 text-xs text-[#6f6f6f]">
              포트: <span className="font-mono text-[#cfcfcf]">8090</span>
            </p>
            {lastCheckedAt ? (
              <p className="mt-1 text-xs text-[#5f5f5f]">마지막 확인: {lastCheckedAt}</p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-black">
          <iframe
            ref={iframeRef}
            key={connectionState}
            src={EDITOR_URL}
            title="Brxce Studio Video Editor"
            className="h-full w-full border-0 bg-black"
            allow="clipboard-read; clipboard-write; fullscreen"
            onLoad={handleIframeLoad}
          />
        </div>
      )}
    </div>
  )
}
