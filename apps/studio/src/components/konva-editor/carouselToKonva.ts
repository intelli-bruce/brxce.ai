/**
 * Convert carousel slide data → Konva elements
 * Maps templateId + content → text/rect elements on a 1080×1350 canvas
 */

import type { CanvasElement, SlideState } from './types'
import { BRAND } from './types'

function id() {
  return `el-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

interface CarouselSlide {
  id: string
  templateId: string
  label: string
  category: string
  content: Record<string, any>
  overrides?: Record<string, any>
}

interface Carousel {
  id: string
  title: string
  slides: CarouselSlide[]
}

/**
 * Convert a single carousel slide to Konva elements based on template type
 */
function slideToElements(slide: CarouselSlide, slideIndex: number, totalSlides: number): CanvasElement[] {
  const elements: CanvasElement[] = []
  const c = { ...slide.content, ...slide.overrides }

  // Base background gradient overlay (subtle)
  elements.push({
    id: id(),
    type: 'rect',
    x: 0, y: 0,
    width: 1080, height: 1350,
    rotation: 0, opacity: 0.6, locked: true,
    name: 'bg-overlay',
    fill: 'rgba(0,0,0,0.3)',
    stroke: '', strokeWidth: 0, cornerRadius: 0,
  })

  switch (slide.templateId) {
    case 'cover-bold':
    case 'cover-centered':
    case 'cover-minimal':
    case 'cover-gradient':
    case 'cover-split': {
      // Tag / overline
      if (c.tag || c.kicker) {
        elements.push({
          id: id(), type: 'text',
          x: 64, y: 380,
          width: 952, height: 60,
          rotation: 0, opacity: 1, locked: false,
          name: '태그',
          text: c.tag || c.kicker || '',
          fontSize: 38, fontFamily: 'Pretendard, sans-serif',
          fontWeight: 600, fill: BRAND.accent,
          lineHeight: 1.2, letterSpacing: 1, align: 'left',
        })
      }

      // Title
      if (c.title) {
        const plainTitle = c.title.replace(/\*\*/g, '')
        elements.push({
          id: id(), type: 'text',
          x: 64, y: 460,
          width: 952, height: 280,
          rotation: 0, opacity: 1, locked: false,
          name: '제목',
          text: plainTitle,
          fontSize: 94, fontFamily: 'Pretendard, sans-serif',
          fontWeight: 900, fill: '#f5f5f5',
          lineHeight: 1.02, letterSpacing: 0, align: 'left',
        })
      }

      // Accent bar
      elements.push({
        id: id(), type: 'rect',
        x: 64, y: 770,
        width: 176, height: 4,
        rotation: 0, opacity: 0.8, locked: false,
        name: '악센트 바',
        fill: BRAND.accent,
        stroke: '', strokeWidth: 0, cornerRadius: 9999,
      })

      // Subtitle
      if (c.subtitle) {
        elements.push({
          id: id(), type: 'text',
          x: 64, y: 810,
          width: 952, height: 100,
          rotation: 0, opacity: 0.98, locked: false,
          name: '부제목',
          text: c.subtitle,
          fontSize: 56, fontFamily: 'Pretendard, sans-serif',
          fontWeight: 500, fill: '#f5f5f5',
          lineHeight: 1.3, letterSpacing: 0, align: 'left',
        })
      }
      break
    }

    case 'hook-stat': {
      // Overline badge
      elements.push({
        id: id(), type: 'text',
        x: 340, y: 200,
        width: 400, height: 50,
        rotation: 0, opacity: 0.7, locked: false,
        name: '배지',
        text: c.overlineText || 'impact metric',
        fontSize: 30, fontFamily: 'Pretendard, sans-serif',
        fontWeight: 600, fill: '#a3a3a3',
        lineHeight: 1.2, letterSpacing: 4, align: 'center',
      })

      // Stat value
      if (c.statValue) {
        elements.push({
          id: id(), type: 'text',
          x: 64, y: 420,
          width: 952, height: 250,
          rotation: 0, opacity: 1, locked: false,
          name: '통계 수치',
          text: c.statValue,
          fontSize: 220, fontFamily: 'Pretendard, sans-serif',
          fontWeight: 900, fill: BRAND.accent,
          lineHeight: 1, letterSpacing: 0, align: 'center',
        })
      }

      // Stat label
      if (c.statLabel) {
        elements.push({
          id: id(), type: 'text',
          x: 64, y: 680,
          width: 952, height: 80,
          rotation: 0, opacity: 1, locked: false,
          name: '통계 라벨',
          text: c.statLabel,
          fontSize: 64, fontFamily: 'Pretendard, sans-serif',
          fontWeight: 600, fill: '#f5f5f5',
          lineHeight: 1.25, letterSpacing: 0, align: 'center',
        })
      }

      // Accent bar
      elements.push({
        id: id(), type: 'rect',
        x: 460, y: 800,
        width: 160, height: 3,
        rotation: 0, opacity: 0.7, locked: false,
        name: '악센트 바',
        fill: BRAND.accent,
        stroke: '', strokeWidth: 0, cornerRadius: 9999,
      })

      // Detail
      if (c.detail) {
        elements.push({
          id: id(), type: 'text',
          x: 90, y: 840,
          width: 900, height: 100,
          rotation: 0, opacity: 1, locked: false,
          name: '설명',
          text: c.detail,
          fontSize: 44, fontFamily: 'Pretendard, sans-serif',
          fontWeight: 400, fill: '#a3a3a3',
          lineHeight: 1.625, letterSpacing: 0, align: 'center',
        })
      }
      break
    }

    case 'body-text': {
      // Heading
      if (c.heading || c.title) {
        elements.push({
          id: id(), type: 'text',
          x: 64, y: 80,
          width: 952, height: 100,
          rotation: 0, opacity: 1, locked: false,
          name: '제목',
          text: c.heading || c.title || '',
          fontSize: 62, fontFamily: 'Pretendard, sans-serif',
          fontWeight: 700, fill: '#f5f5f5',
          lineHeight: 1.25, letterSpacing: 0, align: 'left',
        })
      }

      // Accent bar
      elements.push({
        id: id(), type: 'rect',
        x: 64, y: 200,
        width: 112, height: 4,
        rotation: 0, opacity: 0.8, locked: false,
        name: '악센트 바',
        fill: BRAND.accent,
        stroke: '', strokeWidth: 0, cornerRadius: 9999,
      })

      // Body
      if (c.body || c.content) {
        elements.push({
          id: id(), type: 'text',
          x: 64, y: 260,
          width: 952, height: 800,
          rotation: 0, opacity: 1, locked: false,
          name: '본문',
          text: c.body || c.content || '',
          fontSize: 38, fontFamily: 'Pretendard, sans-serif',
          fontWeight: 400, fill: '#f5f5f5',
          lineHeight: 1.7, letterSpacing: 0, align: 'left',
        })
      }
      break
    }

    case 'cta-question': {
      // Question
      if (c.question || c.title) {
        elements.push({
          id: id(), type: 'text',
          x: 80, y: 350,
          width: 920, height: 300,
          rotation: 0, opacity: 1, locked: false,
          name: '질문',
          text: c.question || c.title || '',
          fontSize: 74, fontFamily: 'Pretendard, sans-serif',
          fontWeight: 700, fill: '#f5f5f5',
          lineHeight: 1.25, letterSpacing: 0, align: 'center',
        })
      }

      // Guide
      if (c.guide || c.subtitle) {
        elements.push({
          id: id(), type: 'text',
          x: 80, y: 700,
          width: 920, height: 120,
          rotation: 0, opacity: 0.8, locked: false,
          name: '안내문',
          text: c.guide || c.subtitle || '',
          fontSize: 36, fontFamily: 'Pretendard, sans-serif',
          fontWeight: 400, fill: '#f5f5f5',
          lineHeight: 1.5, letterSpacing: 0, align: 'center',
        })
      }
      break
    }

    default: {
      // Generic fallback: show all content fields as text
      let yPos = 200
      for (const [key, value] of Object.entries(c)) {
        if (typeof value === 'string') {
          elements.push({
            id: id(), type: 'text',
            x: 64, y: yPos,
            width: 952, height: 100,
            rotation: 0, opacity: 1, locked: false,
            name: key,
            text: value,
            fontSize: key === 'title' || key === 'heading' ? 62 : 38,
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: key === 'title' || key === 'heading' ? 700 : 400,
            fill: '#f5f5f5',
            lineHeight: 1.3, letterSpacing: 0, align: 'left',
          })
          yPos += 120
        }
      }
    }
  }

  // Footer: @brxce.ai handle
  elements.push({
    id: id(), type: 'text',
    x: 120, y: 1270,
    width: 300, height: 40,
    rotation: 0, opacity: 0.7, locked: true,
    name: '핸들',
    text: '@brxce.ai',
    fontSize: 26, fontFamily: 'Pretendard, sans-serif',
    fontWeight: 600, fill: '#f5f5f5',
    lineHeight: 1.2, letterSpacing: 2, align: 'left',
  })

  // Slide number
  elements.push({
    id: id(), type: 'text',
    x: 900, y: 1270,
    width: 120, height: 40,
    rotation: 0, opacity: 0.4, locked: true,
    name: '슬라이드 번호',
    text: `${slideIndex + 1}/${totalSlides}`,
    fontSize: 28, fontFamily: 'Pretendard, sans-serif',
    fontWeight: 400, fill: '#f5f5f5',
    lineHeight: 1.2, letterSpacing: 3, align: 'right',
  })

  return elements
}

/**
 * Convert entire carousel to SlideState array for the Konva editor
 */
export function carouselToSlides(carousel: Carousel): SlideState[] {
  return carousel.slides.map((slide, idx) => ({
    id: slide.id,
    name: `${idx + 1}. ${slide.label} (${slide.templateId})`,
    width: 1080,
    height: 1350,
    backgroundColor: '#0a0a0a',
    elements: slideToElements(slide, idx, carousel.slides.length),
  }))
}
