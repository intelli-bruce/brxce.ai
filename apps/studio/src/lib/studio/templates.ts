import type { ProjectType } from './types'

export interface TemplateInfo {
  id: string
  name: string
  type: ProjectType
  description: string
  width: number
  height: number
  fps?: number
}

export const TEMPLATES: TemplateInfo[] = [
  // Video (6)
  { id: 'VSReel', name: 'VS 비교', type: 'video', description: '비교형 릴스', width: 1080, height: 1920, fps: 60 },
  { id: 'ShortFormVideo', name: '숏폼 영상', type: 'video', description: 'TTS+자막 숏폼', width: 1080, height: 1920, fps: 60 },
  { id: 'DayInTheLife', name: '일상 타임랩스', type: 'video', description: '일상 클립 구성', width: 1080, height: 1920, fps: 60 },
  { id: 'NewsBreaking', name: '뉴스 속보', type: 'video', description: '속보 스타일', width: 1080, height: 1920, fps: 60 },
  { id: 'TextOverVideo', name: '텍스트 오버레이', type: 'video', description: '텍스트+영상', width: 1080, height: 1920, fps: 60 },
  { id: 'Demo60s', name: '60초 데모', type: 'video', description: '스크린캐스트 데모', width: 1080, height: 1920, fps: 60 },

  // Carousel (5) — Phase 3 (1080x1350, 4:5 인스타 권장)
  { id: 'CardNews', name: '카드뉴스', type: 'carousel', description: '카드뉴스 캐러셀', width: 1080, height: 1350 },
  { id: 'StepByStep', name: '단계별 가이드', type: 'carousel', description: '단계별 설명', width: 1080, height: 1350 },
  { id: 'BeforeAfter', name: 'Before/After', type: 'carousel', description: '전후 비교', width: 1080, height: 1350 },
  { id: 'ListCarousel', name: 'Top N 리스트', type: 'carousel', description: '리스트/팁', width: 1080, height: 1350 },
  { id: 'QuoteCarousel', name: '인사이트 카드', type: 'carousel', description: '인용구/인사이트', width: 1080, height: 1350 },

  // Image (5) — Phase 4
  { id: 'OgImage', name: 'OG 이미지', type: 'image', description: '블로그 OG', width: 1200, height: 630 },
  { id: 'SocialPost', name: 'SNS 이미지', type: 'image', description: 'SNS 포스트', width: 1080, height: 1080 },
  { id: 'Infographic', name: '인포그래픽', type: 'image', description: '인포그래픽', width: 1080, height: 1920 },
  { id: 'Quote', name: '인용구 카드', type: 'image', description: '인용구', width: 1080, height: 1080 },
  { id: 'Thumbnail', name: '영상 썸네일', type: 'image', description: '썸네일', width: 1280, height: 720 },
]

export function getTemplatesByType(type: ProjectType): TemplateInfo[] {
  return TEMPLATES.filter(t => t.type === type)
}

export function getTemplate(id: string): TemplateInfo | undefined {
  return TEMPLATES.find(t => t.id === id)
}
