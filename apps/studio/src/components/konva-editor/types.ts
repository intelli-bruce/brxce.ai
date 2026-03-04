/** Konva Editor — Element & State types */

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export type ElementType = 'text' | 'rect' | 'image' | 'circle' | 'line'

export interface BaseElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  locked: boolean
  name: string
}

export interface TextElement extends BaseElement {
  type: 'text'
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: number
  fill: string
  lineHeight: number
  letterSpacing: number
  align: 'left' | 'center' | 'right'
}

export interface RectElement extends BaseElement {
  type: 'rect'
  fill: string
  stroke: string
  strokeWidth: number
  cornerRadius: number
}

export interface ImageElement extends BaseElement {
  type: 'image'
  src: string
}

export interface CircleElement extends BaseElement {
  type: 'circle'
  fill: string
  stroke: string
  strokeWidth: number
}

export type CanvasElement = TextElement | RectElement | ImageElement | CircleElement

export interface SlideState {
  id: string
  name: string
  width: number
  height: number
  backgroundColor: string
  elements: CanvasElement[]
}

export interface EditorState {
  slides: SlideState[]
  activeSlideIndex: number
  selectedElementId: string | null
  zoom: number
}

// Default slide matching Instagram carousel
export const DEFAULT_SLIDE: Omit<SlideState, 'id'> = {
  name: 'Slide 1',
  width: 1080,
  height: 1350,
  backgroundColor: '#0a0a0a',
  elements: [],
}

// Brand colors
export const BRAND = {
  accent: '#ff6b35',
  bg: '#0a0a0a',
  text: '#f5f5f5',
  muted: '#a3a3a3',
} as const
