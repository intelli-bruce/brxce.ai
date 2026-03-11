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
  // Video Presets — 영상 편집기 프리셋 (레퍼런스 기반)
  { id: 'DayInLife', name: '일상 브이로그', type: 'video', description: '여러 일상 클립을 자막과 함께 이어붙여 하루를 보여주는 숏폼', width: 1080, height: 1920, fps: 30 },
  { id: 'Aesthetic', name: '감성 릴스', type: 'video', description: '시네마틱 B-roll + 감성 자막 + BGM. 무드 중심 숏폼', width: 1080, height: 1920, fps: 30 },
  { id: 'BeforeAfter', name: '비포/애프터', type: 'video', description: '변화 과정을 보여주는 전후 비교 영상. 다이어트, 인테리어, 셋업 등', width: 1080, height: 1920, fps: 30 },
  { id: 'Montage', name: '몽타주 릴스', type: 'video', description: '빠른 컷 전환 + 비트 싱크 BGM. 여행, 운동, 작업 하이라이트', width: 1080, height: 1920, fps: 30 },
  { id: 'TalkingHead', name: '토킹 헤드', type: 'video', description: '카메라 정면 토크 + 자막 오버레이. 팁, 의견, 리뷰 콘텐츠', width: 1080, height: 1920, fps: 30 },
  { id: 'TextStory', name: '텍스트 스토리', type: 'video', description: '영상 위에 텍스트로 스토리텔링. 후킹 문장 → 전개 → CTA', width: 1080, height: 1920, fps: 30 },

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
