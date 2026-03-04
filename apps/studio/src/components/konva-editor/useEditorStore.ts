'use client'

import { useCallback, useState } from 'react'
import type { CanvasElement, EditorState, SlideState } from './types'

function generateId() {
  return `el-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function useEditorStore(initialSlides?: SlideState[]) {
  const [state, setState] = useState<EditorState>({
    slides: initialSlides ?? [
      {
        id: generateId(),
        name: 'Slide 1',
        width: 1080,
        height: 1350,
        backgroundColor: '#0a0a0a',
        elements: [],
      },
    ],
    activeSlideIndex: 0,
    selectedElementId: null,
    zoom: 0.45,
  })

  const activeSlide = state.slides[state.activeSlideIndex]

  const selectedElement = activeSlide?.elements.find(
    (el) => el.id === state.selectedElementId,
  ) ?? null

  const setZoom = useCallback((zoom: number) => {
    setState((s) => ({ ...s, zoom: Math.max(0.1, Math.min(2, zoom)) }))
  }, [])

  const selectElement = useCallback((id: string | null) => {
    setState((s) => ({ ...s, selectedElementId: id }))
  }, [])

  const addElement = useCallback((element: Record<string, unknown> & { type: string }) => {
    const id = generateId()
    setState((s) => {
      const slides = [...s.slides]
      const slide = { ...slides[s.activeSlideIndex] }
      slide.elements = [...slide.elements, { ...element, id } as CanvasElement]
      slides[s.activeSlideIndex] = slide
      return { ...s, slides, selectedElementId: id }
    })
    return id
  }, [])

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setState((s) => {
      const slides = [...s.slides]
      const slide = { ...slides[s.activeSlideIndex] }
      slide.elements = slide.elements.map((el) =>
        el.id === id ? ({ ...el, ...updates } as CanvasElement) : el,
      )
      slides[s.activeSlideIndex] = slide
      return { ...s, slides }
    })
  }, [])

  const deleteElement = useCallback((id: string) => {
    setState((s) => {
      const slides = [...s.slides]
      const slide = { ...slides[s.activeSlideIndex] }
      slide.elements = slide.elements.filter((el) => el.id !== id)
      slides[s.activeSlideIndex] = slide
      return {
        ...s,
        slides,
        selectedElementId: s.selectedElementId === id ? null : s.selectedElementId,
      }
    })
  }, [])

  const updateSlide = useCallback((updates: Partial<SlideState>) => {
    setState((s) => {
      const slides = [...s.slides]
      slides[s.activeSlideIndex] = { ...slides[s.activeSlideIndex], ...updates }
      return { ...s, slides }
    })
  }, [])

  const addSlide = useCallback(() => {
    setState((s) => {
      const newSlide: SlideState = {
        id: generateId(),
        name: `Slide ${s.slides.length + 1}`,
        width: 1080,
        height: 1350,
        backgroundColor: '#0a0a0a',
        elements: [],
      }
      return {
        ...s,
        slides: [...s.slides, newSlide],
        activeSlideIndex: s.slides.length,
        selectedElementId: null,
      }
    })
  }, [])

  const setActiveSlide = useCallback((index: number) => {
    setState((s) => ({
      ...s,
      activeSlideIndex: Math.max(0, Math.min(index, s.slides.length - 1)),
      selectedElementId: null,
    }))
  }, [])

  const duplicateElement = useCallback((id: string) => {
    setState((s) => {
      const slide = s.slides[s.activeSlideIndex]
      const el = slide.elements.find((e) => e.id === id)
      if (!el) return s
      const newId = generateId()
      const newEl = { ...el, id: newId, x: el.x + 20, y: el.y + 20, name: `${el.name} copy` }
      const slides = [...s.slides]
      slides[s.activeSlideIndex] = {
        ...slide,
        elements: [...slide.elements, newEl],
      }
      return { ...s, slides, selectedElementId: newId }
    })
  }, [])

  const moveElementOrder = useCallback((id: string, direction: 'up' | 'down') => {
    setState((s) => {
      const slide = s.slides[s.activeSlideIndex]
      const idx = slide.elements.findIndex((e) => e.id === id)
      if (idx === -1) return s
      const newIdx = direction === 'up' ? idx + 1 : idx - 1
      if (newIdx < 0 || newIdx >= slide.elements.length) return s
      const elements = [...slide.elements]
      ;[elements[idx], elements[newIdx]] = [elements[newIdx], elements[idx]]
      const slides = [...s.slides]
      slides[s.activeSlideIndex] = { ...slide, elements }
      return { ...s, slides }
    })
  }, [])

  const toJSON = useCallback(() => {
    return JSON.stringify(state.slides, null, 2)
  }, [state.slides])

  const loadJSON = useCallback((json: string) => {
    try {
      const slides = JSON.parse(json) as SlideState[]
      setState((s) => ({ ...s, slides, activeSlideIndex: 0, selectedElementId: null }))
    } catch (e) {
      console.error('Invalid JSON:', e)
    }
  }, [])

  return {
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
    moveElementOrder,
    toJSON,
    loadJSON,
  }
}
