'use client'

import type { CanvasElement, TextElement, RectElement, CircleElement } from './types'
import { BRAND } from './types'

interface PropertyPanelProps {
  element: CanvasElement | null
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-xs text-neutral-400">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded border border-neutral-700 bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 rounded bg-neutral-800 px-2 py-1 text-xs text-white"
        />
      </div>
    </label>
  )
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-xs text-neutral-400">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-24 rounded bg-neutral-800 px-2 py-1 text-right text-xs text-white"
      />
    </label>
  )
}

function TextProperties({ el, onUpdate }: { el: TextElement; onUpdate: (updates: Partial<TextElement>) => void }) {
  return (
    <>
      <div className="space-y-2">
        <span className="text-xs font-medium text-neutral-300">텍스트</span>
        <textarea
          value={el.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="w-full rounded bg-neutral-800 px-3 py-2 text-sm text-white"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <NumberInput label="폰트 크기" value={el.fontSize} onChange={(v) => onUpdate({ fontSize: v })} min={8} max={400} />
        <NumberInput label="폰트 두께" value={el.fontWeight} onChange={(v) => onUpdate({ fontWeight: v })} min={100} max={900} step={100} />
        <NumberInput label="줄간격" value={el.lineHeight} onChange={(v) => onUpdate({ lineHeight: v })} min={0.5} max={3} step={0.05} />
        <NumberInput label="자간" value={el.letterSpacing} onChange={(v) => onUpdate({ letterSpacing: v })} min={-5} max={20} step={0.5} />
        <ColorInput label="색상" value={el.fill} onChange={(v) => onUpdate({ fill: v })} />
        <label className="flex items-center justify-between">
          <span className="text-xs text-neutral-400">정렬</span>
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as const).map((a) => (
              <button
                key={a}
                onClick={() => onUpdate({ align: a })}
                className={`rounded px-2 py-1 text-xs ${el.align === a ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}
              >
                {a === 'left' ? '←' : a === 'center' ? '↔' : '→'}
              </button>
            ))}
          </div>
        </label>
      </div>
    </>
  )
}

function RectProperties({ el, onUpdate }: { el: RectElement; onUpdate: (updates: Partial<RectElement>) => void }) {
  return (
    <div className="space-y-2">
      <ColorInput label="채우기" value={el.fill} onChange={(v) => onUpdate({ fill: v })} />
      <ColorInput label="테두리" value={el.stroke || '#000000'} onChange={(v) => onUpdate({ stroke: v })} />
      <NumberInput label="테두리 두께" value={el.strokeWidth} onChange={(v) => onUpdate({ strokeWidth: v })} min={0} max={20} />
      <NumberInput label="모서리 둥글기" value={el.cornerRadius} onChange={(v) => onUpdate({ cornerRadius: v })} min={0} max={200} />
    </div>
  )
}

function CircleProperties({ el, onUpdate }: { el: CircleElement; onUpdate: (updates: Partial<CircleElement>) => void }) {
  return (
    <div className="space-y-2">
      <ColorInput label="채우기" value={el.fill} onChange={(v) => onUpdate({ fill: v })} />
      <ColorInput label="테두리" value={el.stroke || '#000000'} onChange={(v) => onUpdate({ stroke: v })} />
      <NumberInput label="테두리 두께" value={el.strokeWidth} onChange={(v) => onUpdate({ strokeWidth: v })} min={0} max={20} />
    </div>
  )
}

export function PropertyPanel({ element, onUpdate, onDelete, onDuplicate }: PropertyPanelProps) {
  if (!element) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="text-4xl">🎨</div>
        <p className="mt-3 text-sm text-neutral-400">요소를 선택하면<br />속성을 편집할 수 있어요</p>
      </div>
    )
  }

  const handleUpdate = (updates: Partial<CanvasElement>) => {
    onUpdate(element.id, updates)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">
          {element.type === 'text' ? '📝 텍스트' : element.type === 'rect' ? '⬜ 사각형' : '⭕ 원'}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onDuplicate(element.id)}
            className="rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-700"
            title="복제"
          >
            📋
          </button>
          <button
            onClick={() => onDelete(element.id)}
            className="rounded bg-red-900/50 px-2 py-1 text-xs text-red-300 hover:bg-red-900"
            title="삭제"
          >
            🗑
          </button>
        </div>
      </div>

      {/* Common position/size */}
      <div className="mb-4 space-y-2 border-b border-neutral-800 pb-4">
        <span className="text-xs font-medium text-neutral-300">위치 & 크기</span>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput label="X" value={element.x} onChange={(v) => handleUpdate({ x: v })} />
          <NumberInput label="Y" value={element.y} onChange={(v) => handleUpdate({ y: v })} />
          <NumberInput label="W" value={element.width} onChange={(v) => handleUpdate({ width: v })} min={1} />
          <NumberInput label="H" value={element.height} onChange={(v) => handleUpdate({ height: v })} min={1} />
        </div>
        <NumberInput label="회전" value={element.rotation} onChange={(v) => handleUpdate({ rotation: v })} min={0} max={360} />
        <NumberInput label="불투명도" value={element.opacity} onChange={(v) => handleUpdate({ opacity: v })} min={0} max={1} step={0.05} />
      </div>

      {/* Type-specific properties */}
      <div className="space-y-3">
        {element.type === 'text' && (
          <TextProperties el={element} onUpdate={handleUpdate} />
        )}
        {element.type === 'rect' && (
          <RectProperties el={element} onUpdate={handleUpdate} />
        )}
        {element.type === 'circle' && (
          <CircleProperties el={element} onUpdate={handleUpdate} />
        )}
      </div>
    </div>
  )
}
