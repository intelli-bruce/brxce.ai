'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PropertyPanel } from '@/components/konva-editor/PropertyPanel'
import { Toolbar } from '@/components/konva-editor/Toolbar'
import { SlideList } from '@/components/konva-editor/SlideList'
import { useEditorStore, BRAND } from '@/components/konva-editor'
import { slideToKonvaElements, konvaToStyleOverrides } from '@/components/konva-editor/slideToKonva'
import type { CanvasElement } from '@/components/konva-editor/types'

// Konva needs to be client-only (no SSR)
const KonvaCanvas = dynamic(
  () => import('@/components/konva-editor/KonvaCanvas').then((m) => m.KonvaCanvas),
  { ssr: false },
)

interface CarouselData {
  id: string
  title: string
  slides: Array<{
    id: string
    templateId: string
    label: string
    category: string
    content: Record<string, any>
    overrides?: Record<string, any>
  }>
}

export default function EditorPage() {
  const searchParams = useSearchParams()
  const carouselId = searchParams.get('carousel')
  const slideIndex = Number(searchParams.get('slide') ?? 0)

  const [carouselData, setCarouselData] = useState<CarouselData | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const {
    state,
    activeSlide,
    selectedElement,
    setZoom,
    selectElement,
    addElement,
    updateElement,
    deleteElement,
    updateSlide,
    addSlide,
    setActiveSlide,
    duplicateElement,
    toJSON,
    loadJSON,
  } = useEditorStore()

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load carousel data when carouselId is present
  useEffect(() => {
    if (!carouselId) return
    fetch(`/api/carousels/${carouselId}`)
      .then((r) => r.json())
      .then((data) => {
        const carousel = data.carousel as CarouselData
        if (!carousel) return
        setCarouselData(carousel)

        // Convert all slides to Konva elements
        const konvaSlides = carousel.slides.map((slide, idx) => ({
          id: `slide-${idx}`,
          name: `${idx + 1}. ${slide.label || slide.templateId}`,
          width: 1080,
          height: 1350,
          backgroundColor: '#0a0a0a',
          elements: slideToKonvaElements(slide),
        }))

        loadJSON(JSON.stringify(konvaSlides))

        // Navigate to the requested slide
        if (slideIndex > 0 && slideIndex < carousel.slides.length) {
          setActiveSlide(slideIndex)
        }
      })
      .catch(console.error)
  }, [carouselId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Save as template default (global)
  const handleSaveAsDefault = useCallback(async () => {
    if (!carouselData || !activeSlide) return
    const slideData = carouselData.slides[state.activeSlideIndex]
    if (!slideData) return

    const overrides = konvaToStyleOverrides(slideData.templateId, activeSlide.elements)
    setSaving(true)
    setSaveMessage('')

    try {
      // Update the template default props via API
      const res = await fetch(`/api/templates/${slideData.templateId}/defaults`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ styleOverrides: overrides }),
      })

      if (res.ok) {
        setSaveMessage('✅ 기본값으로 저장됨 (모든 캐러셀에 반영)')
      } else {
        setSaveMessage('❌ 저장 실패')
      }
    } catch {
      setSaveMessage('❌ 저장 실패')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }, [carouselData, activeSlide, state.activeSlideIndex])

  // Save as slide override (this carousel only)
  const handleSaveAsOverride = useCallback(async () => {
    if (!carouselData || !activeSlide) return
    const slideData = carouselData.slides[state.activeSlideIndex]
    if (!slideData) return

    const styleOverrides = konvaToStyleOverrides(slideData.templateId, activeSlide.elements)

    // Also extract text content changes
    const contentUpdates: Record<string, any> = {}
    for (const el of activeSlide.elements) {
      if (el.type !== 'text') continue
      const te = el as any
      // Map element names back to content keys
      switch (te.name) {
        case '제목': contentUpdates.title = te.text; break
        case '부제목': contentUpdates.subtitle = te.text; break
        case '본문': contentUpdates.body = te.text; break
        case '태그': contentUpdates.tag = te.text; break
        case '숫자': contentUpdates.statValue = te.text; break
        case '라벨': contentUpdates.statLabel = te.text; break
        case '설명': contentUpdates.detail = te.text; break
        case '질문': contentUpdates.question = te.text; break
        case '안내': contentUpdates.guide = te.text; break
        case '프롬프트': contentUpdates.prompt = te.text; break
        case '오버라인': contentUpdates.overlineText = te.text; break
      }
    }

    setSaving(true)
    setSaveMessage('')

    try {
      // Update this specific slide's overrides
      const updatedSlides = carouselData.slides.map((s, idx) => {
        if (idx !== state.activeSlideIndex) return s
        return {
          ...s,
          content: { ...s.content, ...contentUpdates },
          overrides: { ...(s.overrides || {}), ...styleOverrides },
        }
      })

      const res = await fetch(`/api/carousels/${carouselData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: updatedSlides }),
      })

      if (res.ok) {
        const data = await res.json()
        setCarouselData(data.carousel)
        setSaveMessage('✅ 이 슬라이드에만 적용됨')
      } else {
        setSaveMessage('❌ 저장 실패')
      }
    } catch {
      setSaveMessage('❌ 저장 실패')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }, [carouselData, activeSlide, state.activeSlideIndex])

  const handleAddText = useCallback(() => {
    addElement({
      type: 'text',
      x: 64, y: 400, width: 952, height: 200,
      rotation: 0, opacity: 1, locked: false, name: '텍스트',
      text: '텍스트를 입력하세요', fontSize: 80,
      fontFamily: 'Pretendard, sans-serif', fontWeight: 700,
      fill: '#f5f5f5', lineHeight: 1.2, letterSpacing: 0, align: 'left',
    })
  }, [addElement])

  const handleAddRect = useCallback(() => {
    addElement({
      type: 'rect',
      x: 200, y: 400, width: 680, height: 400,
      rotation: 0, opacity: 1, locked: false, name: '사각형',
      fill: 'rgba(255, 255, 255, 0.04)', stroke: 'rgba(255, 255, 255, 0.12)',
      strokeWidth: 1, cornerRadius: 24,
    })
  }, [addElement])

  const handleAddCircle = useCallback(() => {
    addElement({
      type: 'circle',
      x: 390, y: 525, width: 300, height: 300,
      rotation: 0, opacity: 1, locked: false, name: '원',
      fill: BRAND.accent, stroke: '', strokeWidth: 0,
    })
  }, [addElement])

  const handleAddAccentBar = useCallback(() => {
    addElement({
      type: 'rect',
      x: 64, y: 650, width: 176, height: 4,
      rotation: 0, opacity: 1, locked: false, name: '악센트 바',
      fill: BRAND.accent, stroke: '', strokeWidth: 0, cornerRadius: 9999,
    })
  }, [addElement])

  const handleExportJSON = useCallback(() => {
    const json = toJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `slide-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [toJSON])

  const handleImportJSON = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => loadJSON(reader.result as string)
      reader.readAsText(file)
      e.target.value = ''
    },
    [loadJSON],
  )

  const handleExportPNG = useCallback(() => {
    const stageEl = document.querySelector('.konvajs-content canvas') as HTMLCanvasElement | null
    if (!stageEl) return
    const link = document.createElement('a')
    link.download = `slide-${state.activeSlideIndex + 1}.png`
    link.href = stageEl.toDataURL('image/png')
    link.click()
  }, [state.activeSlideIndex])

  if (!activeSlide) return null

  return (
    <div className="flex h-screen flex-col bg-neutral-950 text-white">
      {/* Header with carousel info */}
      {carouselData && (
        <div className="flex items-center gap-3 border-b border-neutral-800 bg-neutral-950 px-4 py-2">
          <Link
            href={`/carousel/${carouselData.id}`}
            className="text-xs text-neutral-500 hover:text-neutral-300 no-underline"
          >
            ← 캐러셀로 돌아가기
          </Link>
          <span className="text-xs text-neutral-600">|</span>
          <span className="text-sm font-medium text-neutral-200">{carouselData.title}</span>
          <span className="text-xs text-neutral-600">
            슬라이드 {state.activeSlideIndex + 1}/{carouselData.slides.length}
          </span>
          {carouselData.slides[state.activeSlideIndex] && (
            <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] text-orange-400">
              {carouselData.slides[state.activeSlideIndex].templateId}
            </span>
          )}

          {/* Save buttons */}
          <div className="ml-auto flex items-center gap-2">
            {saveMessage && (
              <span className="text-xs text-neutral-400">{saveMessage}</span>
            )}
            <button
              onClick={handleSaveAsOverride}
              disabled={saving}
              className="rounded bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-700 disabled:opacity-50"
            >
              💾 이 슬라이드만 적용
            </button>
            <button
              onClick={handleSaveAsDefault}
              disabled={saving}
              className="rounded bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-500 disabled:opacity-50"
            >
              📐 기본값으로 저장
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <Toolbar
        zoom={state.zoom}
        onZoom={setZoom}
        onAddText={handleAddText}
        onAddRect={handleAddRect}
        onAddCircle={handleAddCircle}
        onAddAccentBar={handleAddAccentBar}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onExportPNG={handleExportPNG}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Slide list */}
        <SlideList
          slides={state.slides}
          activeIndex={state.activeSlideIndex}
          onSelect={setActiveSlide}
          onAdd={addSlide}
        />

        {/* Canvas area */}
        <div className="flex flex-1 items-center justify-center bg-neutral-900 p-8">
          <KonvaCanvas
            width={activeSlide.width}
            height={activeSlide.height}
            backgroundColor={activeSlide.backgroundColor}
            elements={activeSlide.elements}
            selectedElementId={state.selectedElementId}
            zoom={state.zoom}
            onSelect={selectElement}
            onUpdate={updateElement}
          />
        </div>

        {/* Property panel */}
        <div className="w-[280px] border-l border-neutral-800 bg-neutral-950">
          <PropertyPanel
            element={selectedElement}
            onUpdate={updateElement}
            onDelete={deleteElement}
            onDuplicate={duplicateElement}
          />
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
