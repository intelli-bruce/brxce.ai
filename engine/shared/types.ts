import { z } from 'zod'

// ==========================================
// Caption 관련 타입 (from @bruce-studio/shared)
// ==========================================

export const captionStyleSchema = z.enum([
  'boxed',
  'karaoke',
  'typewriter',
]).describe('자막 스타일')

export type CaptionStyle = z.infer<typeof captionStyleSchema>

export const captionPositionSchema = z.enum([
  'top',
  'center',
  'bottom',
]).describe('자막 위치')

export type CaptionPosition = z.infer<typeof captionPositionSchema>

export const captionConfigSchema = z.object({
  style: captionStyleSchema.optional().describe('자막 스타일'),
  position: captionPositionSchema.optional().default('bottom').describe('자막 위치'),
  fontSize: z.number().optional().describe('폰트 크기 (px)'),
  fontColor: z.string().optional().describe('폰트 색상 (hex)'),
  backgroundColor: z.string().optional().describe('배경색 (boxed 스타일용, hex)'),
  highlightColor: z.string().optional().describe('하이라이트 색상 (karaoke 스타일용, hex)'),
  highlightWords: z.array(z.string()).optional().describe('강조할 단어 목록'),
  typewriterSpeed: z.number().optional().describe('타자 속도 (ms/글자, typewriter 스타일용)'),
}).describe('자막 설정')

export type CaptionConfig = z.infer<typeof captionConfigSchema>

export const wordTimingSchema = z.object({
  text: z.string().describe('단어 텍스트'),
  startMs: z.number().min(0).describe('시작 시간 (밀리초)'),
  endMs: z.number().min(0).describe('종료 시간 (밀리초)'),
})

export type WordTiming = z.infer<typeof wordTimingSchema>

// ==========================================
// Studio Project 타입 (DESIGN.md 섹션 4.2)
// ==========================================

export interface VideoScene {
  id: string
  text: string
  durationFrames: number
  captionConfig?: CaptionConfig
  audioFile?: string
  audioDurationMs?: number
  wordTimings?: WordTiming[]
}

export interface CarouselSlide {
  id: string
  layout: 'text-only' | 'text-image' | 'quote'
  title?: string
  body?: string
  imageUrl?: string
  quoteText?: string
  quoteAuthor?: string
}

export interface ImageLayer {
  id: string
  type: 'text' | 'image' | 'shape'
  content: string
  x: number
  y: number
  width: number
  height: number
  style?: Record<string, string | number>
}

export interface StyleConfig {
  fontFamily?: string
  primaryColor?: string
  backgroundColor?: string
  accentColor?: string
  borderRadius?: number
}

// ==========================================
// 유틸리티
// ==========================================

export function frameToMs(frame: number, fps: number): number {
  return (frame / fps) * 1000
}

export function msToFrame(ms: number, fps: number): number {
  return Math.round((ms / 1000) * fps)
}
