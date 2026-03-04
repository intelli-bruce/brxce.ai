/**
 * Convert a carousel slide (templateId + content + overrides) into Konva elements.
 * This maps the React template's semantic structure into positioned Konva shapes.
 */

import type { CanvasElement } from './types'
import { BRAND } from './types'
import { fontSize, fontWeight, spacing, gap } from '@/lib/studio/slide-tokens'

interface SlideData {
  templateId: string
  content: Record<string, any>
  overrides?: Record<string, any>
}

/**
 * Generate Konva elements from slide data based on templateId.
 * Each template maps to a predictable set of text/rect elements.
 */
export function slideToKonvaElements(slide: SlideData): CanvasElement[] {
  const merged = { ...slide.content, ...(slide.overrides || {}) }
  const elements: CanvasElement[] = []
  let nextId = 1
  const id = () => `k-${nextId++}`

  const px = merged.paddingX ?? spacing.containerMd // 64

  switch (slide.templateId) {
    case 'cover-bold': {
      // Tag
      if (merged.tag) {
        elements.push({
          id: id(), type: 'text', name: '태그',
          x: px, y: 380, width: 952, height: 60,
          text: merged.tag, fontSize: merged.tagFontSize ?? fontSize.bodyLg,
          fontFamily: 'Pretendard, sans-serif', fontWeight: fontWeight.semibold,
          fill: BRAND.accent, lineHeight: 1.2, letterSpacing: 0.5, align: 'left',
          rotation: 0, opacity: 1, locked: false,
        })
      }
      // Title
      elements.push({
        id: id(), type: 'text', name: '제목',
        x: px, y: 460, width: 952, height: 280,
        text: (merged.title || '').replace(/\*\*/g, ''),
        fontSize: merged.titleFontSize ?? fontSize.coverMd,
        fontFamily: 'Pretendard, sans-serif', fontWeight: fontWeight.black,
        fill: BRAND.text, lineHeight: 1.02, letterSpacing: 0, align: 'left',
        rotation: 0, opacity: 1, locked: false,
      })
      // Accent bar
      if (merged.showAccentBar !== false) {
        elements.push({
          id: id(), type: 'rect', name: '악센트 바',
          x: px, y: 770, width: merged.barWidth ?? 176, height: 4,
          fill: BRAND.accent, stroke: '', strokeWidth: 0, cornerRadius: 9999,
          rotation: 0, opacity: 1, locked: false,
        })
      }
      // Subtitle
      if (merged.subtitle) {
        elements.push({
          id: id(), type: 'text', name: '부제목',
          x: px, y: 810, width: 952, height: 120,
          text: merged.subtitle, fontSize: merged.subtitleFontSize ?? fontSize.subtitleLg,
          fontFamily: 'Pretendard, sans-serif', fontWeight: fontWeight.medium,
          fill: 'rgba(255, 255, 255, 0.98)', lineHeight: 1.3, letterSpacing: 0, align: 'left',
          rotation: 0, opacity: 1, locked: false,
        })
      }
      break
    }

    case 'hook-stat': {
      // Overline badge
      if (merged.showOverline !== false) {
        elements.push({
          id: id(), type: 'text', name: '오버라인',
          x: 340, y: 200, width: 400, height: 50,
          text: merged.overlineText ?? 'impact metric',
          fontSize: 30, fontFamily: 'Pretendard, sans-serif', fontWeight: fontWeight.normal,
          fill: 'rgba(255, 255, 255, 0.70)', lineHeight: 1.2, letterSpacing: 2, align: 'center',
          rotation: 0, opacity: 1, locked: false,
        })
      }
      // Stat value
      elements.push({
        id: id(), type: 'text', name: '숫자',
        x: 0, y: 400, width: 1080, height: 260,
        text: merged.statValue || '73%',
        fontSize: merged.statFontSize ?? fontSize.displayXl,
        fontFamily: 'Pretendard, sans-serif', fontWeight: fontWeight.black,
        fill: BRAND.accent, lineHeight: 1, letterSpacing: 0, align: 'center',
        rotation: 0, opacity: 1, locked: false,
      })
      // Stat label
      elements.push({
        id: id(), type: 'text', name: '라벨',
        x: 0, y: 680, width: 1080, height: 80,
        text: merged.statLabel || '',
        fontSize: merged.labelFontSize ?? fontSize.headingSm,
        fontFamily: 'Pretendard, sans-serif', fontWeight: fontWeight.semibold,
        fill: BRAND.text, lineHeight: 1.2, letterSpacing: 0, align: 'center',
        rotation: 0, opacity: 1, locked: false,
      })
      // Accent bar
      if (merged.showAccentBar !== false) {
        elements.push({
          id: id(), type: 'rect', name: '악센트 바',
          x: 460, y: 820, width: merged.barWidth ?? 160, height: 3,
          fill: BRAND.accent + 'b3', stroke: '', strokeWidth: 0, cornerRadius: 9999,
          rotation: 0, opacity: 1, locked: false,
        })
      }
      // Detail
      if (merged.detail) {
        elements.push({
          id: id(), type: 'text', name: '설명',
          x: 90, y: 860, width: 900, height: 100,
          text: merged.detail, fontSize: merged.detailFontSize ?? fontSize.subHeading,
          fontFamily: 'Pretendard, sans-serif', fontWeight: fontWeight.normal,
          fill: 'rgba(255, 255, 255, 0.60)', lineHeight: 1.625, letterSpacing: 0, align: 'center',
          rotation: 0, opacity: 1, locked: false,
        })
      }
      break
    }

    case 'body-text': {
      // Heading
      elements.push({
        id: id(), type: 'text', name: '제목',
        x: px, y: 120, width: 952, height: 120,
        text: merged.heading || merged.title || '',
        fontSize: merged.headingFontSize ?? fontSize.heading,
        fontFamily: 'Pretendard, sans-serif', fontWeight: fontWeight.bold,
        fill: BRAND.text, lineHeight: 1.25, letterSpacing: 0, align: 'left',
        rotation: 0, opacity: 1, locked: false,
      })
      // Accent bar
      if (merged.showAccentBar !== false) {
        elements.push({
          id: id(), type: 'rect', name: '악센트 바',
          x: px, y: 260, width: 112, height: 4,
          fill: BRAND.accent, stroke: '', strokeWidth: 0, cornerRadius: 9999,
          rotation: 0, opacity: 1, locked: false,
        })
      }
      // Body
      elements.push({
        id: id(), type: 'text', name: '본문',
        x: px, y: 320, width: 952, height: 800,
        text: merged.body || merged.content || '',
        fontSize: merged.bodyFontSize ?? fontSize.bodyLg,
        fontFamily: 'Pretendard, sans-serif', fontWeight: fontWeight.normal,
        fill: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.7, letterSpacing: 0, align: 'left',
        rotation: 0, opacity: 1, locked: false,
      })
      break
    }

    case 'cta-question': {
      // Question
      elements.push({
        id: id(), type: 'text', name: '질문',
        x: 80, y: 400, width: 920, height: 300,
        text: merged.question || '',
        fontSize: merged.questionFontSize ?? 74,
        fontFamily: 'Pretendard, sans-serif', fontWeight: fontWeight.bold,
        fill: BRAND.text, lineHeight: 1.25, letterSpacing: 0, align: 'center',
        rotation: 0, opacity: 1, locked: false,
      })
      // Guide
      if (merged.guide) {
        elements.push({
          id: id(), type: 'text', name: '안내',
          x: 80, y: 740, width: 920, height: 80,
          text: merged.guide, fontSize: merged.guideFontSize ?? 30,
          fontFamily: 'Pretendard, sans-serif', fontWeight: fontWeight.normal,
          fill: 'rgba(255, 255, 255, 0.80)', lineHeight: 1.5, letterSpacing: 0, align: 'center',
          rotation: 0, opacity: 1, locked: false,
        })
      }
      // Prompt
      if (merged.prompt) {
        elements.push({
          id: id(), type: 'text', name: '프롬프트',
          x: 80, y: 860, width: 920, height: 60,
          text: merged.prompt, fontSize: merged.promptFontSize ?? 36,
          fontFamily: 'Pretendard, sans-serif', fontWeight: fontWeight.semibold,
          fill: BRAND.accent, lineHeight: 1.3, letterSpacing: 0, align: 'center',
          rotation: 0, opacity: 1, locked: false,
        })
      }
      break
    }

    default: {
      // Generic fallback: put title and subtitle
      if (merged.title || merged.heading || merged.question) {
        elements.push({
          id: id(), type: 'text', name: '제목',
          x: px, y: 400, width: 952, height: 200,
          text: (merged.title || merged.heading || merged.question || '').replace(/\*\*/g, ''),
          fontSize: 80, fontFamily: 'Pretendard, sans-serif', fontWeight: fontWeight.bold,
          fill: BRAND.text, lineHeight: 1.2, letterSpacing: 0, align: 'left',
          rotation: 0, opacity: 1, locked: false,
        })
      }
      if (merged.subtitle || merged.detail || merged.body) {
        elements.push({
          id: id(), type: 'text', name: '부제목/본문',
          x: px, y: 640, width: 952, height: 200,
          text: merged.subtitle || merged.detail || merged.body || '',
          fontSize: 44, fontFamily: 'Pretendard, sans-serif', fontWeight: fontWeight.normal,
          fill: 'rgba(255, 255, 255, 0.80)', lineHeight: 1.5, letterSpacing: 0, align: 'left',
          rotation: 0, opacity: 1, locked: false,
        })
      }
      break
    }
  }

  return elements
}

/**
 * Extract style overrides from Konva elements back to template props.
 * Used for saving back to the template defaults or slide overrides.
 */
export function konvaToStyleOverrides(
  templateId: string,
  elements: CanvasElement[],
): Record<string, any> {
  const overrides: Record<string, any> = {}

  const findByName = (name: string) =>
    elements.find((e) => e.name === name) as any | undefined

  switch (templateId) {
    case 'cover-bold': {
      const title = findByName('제목')
      const subtitle = findByName('부제목')
      const tag = findByName('태그')
      const bar = findByName('악센트 바')
      if (title) {
        overrides.titleFontSize = title.fontSize
        overrides.paddingX = title.x
      }
      if (subtitle) overrides.subtitleFontSize = subtitle.fontSize
      if (tag) overrides.tagFontSize = tag.fontSize
      if (bar) {
        overrides.barWidth = bar.width
        overrides.showAccentBar = true
      } else {
        overrides.showAccentBar = false
      }
      break
    }
    case 'hook-stat': {
      const stat = findByName('숫자')
      const label = findByName('라벨')
      const detail = findByName('설명')
      const bar = findByName('악센트 바')
      const overline = findByName('오버라인')
      if (stat) overrides.statFontSize = stat.fontSize
      if (label) overrides.labelFontSize = label.fontSize
      if (detail) overrides.detailFontSize = detail.fontSize
      if (bar) {
        overrides.barWidth = bar.width
        overrides.showAccentBar = true
      } else {
        overrides.showAccentBar = false
      }
      if (overline) {
        overrides.overlineText = overline.text
        overrides.showOverline = true
      } else {
        overrides.showOverline = false
      }
      break
    }
    case 'body-text': {
      const heading = findByName('제목')
      const body = findByName('본문')
      const bar = findByName('악센트 바')
      if (heading) {
        overrides.headingFontSize = heading.fontSize
        overrides.paddingX = heading.x
      }
      if (body) overrides.bodyFontSize = body.fontSize
      if (bar) overrides.showAccentBar = true
      else overrides.showAccentBar = false
      break
    }
    case 'cta-question': {
      const q = findByName('질문')
      const guide = findByName('안내')
      const prompt = findByName('프롬프트')
      if (q) overrides.questionFontSize = q.fontSize
      if (guide) overrides.guideFontSize = guide.fontSize
      if (prompt) overrides.promptFontSize = prompt.fontSize
      break
    }
  }

  return overrides
}
