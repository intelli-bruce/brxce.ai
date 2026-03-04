'use client'

import type { CanvasElement, TextElement, RectElement, CircleElement } from './types'
import { BRAND } from './types'

interface ToolbarProps {
  zoom: number
  onZoom: (zoom: number) => void
  onAddText: () => void
  onAddRect: () => void
  onAddCircle: () => void
  onAddAccentBar: () => void
  onExportJSON: () => void
  onImportJSON: () => void
  onExportPNG: () => void
}

export function Toolbar({
  zoom,
  onZoom,
  onAddText,
  onAddRect,
  onAddCircle,
  onAddAccentBar,
  onExportJSON,
  onImportJSON,
  onExportPNG,
}: ToolbarProps) {
  return (
    <div className="flex h-12 items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4">
      {/* Left: Add elements */}
      <div className="flex items-center gap-1">
        <span className="mr-2 text-xs font-medium text-neutral-500">추가</span>
        <button
          onClick={onAddText}
          className="rounded px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800"
          title="텍스트 추가"
        >
          T 텍스트
        </button>
        <button
          onClick={onAddRect}
          className="rounded px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800"
          title="사각형 추가"
        >
          ⬜ 사각형
        </button>
        <button
          onClick={onAddCircle}
          className="rounded px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800"
          title="원 추가"
        >
          ⭕ 원
        </button>
        <div className="mx-2 h-5 w-px bg-neutral-800" />
        <button
          onClick={onAddAccentBar}
          className="rounded px-3 py-1.5 text-xs font-medium text-orange-400 hover:bg-neutral-800"
          title="악센트 바 추가"
        >
          ━ 악센트바
        </button>
      </div>

      {/* Center: Zoom */}
      <div className="flex items-center gap-2">
        <button onClick={() => onZoom(zoom - 0.05)} className="rounded px-2 py-1 text-neutral-400 hover:bg-neutral-800">
          −
        </button>
        <span className="w-14 text-center text-xs text-neutral-300">{Math.round(zoom * 100)}%</span>
        <button onClick={() => onZoom(zoom + 0.05)} className="rounded px-2 py-1 text-neutral-400 hover:bg-neutral-800">
          +
        </button>
      </div>

      {/* Right: Export */}
      <div className="flex items-center gap-1">
        <button
          onClick={onImportJSON}
          className="rounded px-3 py-1.5 text-xs text-neutral-400 hover:bg-neutral-800"
        >
          📂 불러오기
        </button>
        <button
          onClick={onExportJSON}
          className="rounded px-3 py-1.5 text-xs text-neutral-400 hover:bg-neutral-800"
        >
          💾 JSON
        </button>
        <button
          onClick={onExportPNG}
          className="rounded bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-500"
        >
          📸 PNG 내보내기
        </button>
      </div>
    </div>
  )
}
