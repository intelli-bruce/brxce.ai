'use client'

import type { SlideState } from './types'

interface SlideListProps {
  slides: SlideState[]
  activeIndex: number
  onSelect: (index: number) => void
  onAdd: () => void
}

export function SlideList({ slides, activeIndex, onSelect, onAdd }: SlideListProps) {
  return (
    <div className="flex h-full w-[120px] flex-col border-r border-neutral-800 bg-neutral-950">
      <div className="p-2 text-center text-xs font-medium text-neutral-500">슬라이드</div>
      <div className="flex-1 space-y-2 overflow-y-auto px-2">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => onSelect(idx)}
            className={`w-full rounded border-2 p-1 transition ${
              idx === activeIndex
                ? 'border-orange-500 bg-neutral-800'
                : 'border-transparent bg-neutral-900 hover:border-neutral-700'
            }`}
          >
            <div
              className="aspect-[1080/1350] w-full rounded"
              style={{ backgroundColor: slide.backgroundColor }}
            >
              <div className="flex h-full items-center justify-center text-[8px] text-neutral-500">
                {slide.elements.length} items
              </div>
            </div>
            <div className="mt-1 truncate text-[9px] text-neutral-400">{slide.name}</div>
          </button>
        ))}
      </div>
      <button
        onClick={onAdd}
        className="m-2 rounded border border-dashed border-neutral-700 py-2 text-xs text-neutral-500 hover:border-neutral-500 hover:text-neutral-300"
      >
        + 추가
      </button>
    </div>
  )
}
