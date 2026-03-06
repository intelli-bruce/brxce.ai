/**
 * Studio project scenes → Remotion composition props 변환
 *
 * Studio 에디터는 단순한 VideoScene/CarouselSlide/ImageLayer를 저장하지만
 * Remotion 컴포넌트는 각자 다른 props 구조를 가짐.
 * 이 모듈이 그 차이를 메꿈.
 */

import type { StudioProject } from './types'

interface VideoScene {
  id: string
  text: string
  durationFrames: number
  captionConfig?: Record<string, unknown>
  audioFile?: string
  audioDurationMs?: number
  wordTimings?: { text: string; startMs: number; endMs: number }[]
}

interface CarouselSlide {
  id: string
  layout: string
  title?: string
  body?: string
  imageUrl?: string
  quoteText?: string
  quoteAuthor?: string
}

interface ImageLayer {
  id: string
  type: string
  content: string
  x: number
  y: number
  width: number
  height: number
  style?: Record<string, string | number>
}

interface MappedResult {
  compositionId: string
  props: Record<string, unknown>
  durationInFrames?: number
  type: 'video' | 'still'
  /** carousel인 경우 슬라이드 수 */
  slideCount?: number
}

// ── Video mappers ──

function mapShortFormVideo(scenes: VideoScene[], style: Record<string, unknown>): MappedResult {
  let frameOffset = 0
  const mappedScenes = scenes.map(s => {
    const scene = {
      id: s.id,
      text: s.text,
      durationFrames: s.durationFrames,
      captionConfig: s.captionConfig,
      audioFile: s.audioFile,
      audioDurationMs: s.audioDurationMs,
      wordTimings: s.wordTimings,
    }
    frameOffset += s.durationFrames
    return scene
  })

  return {
    compositionId: 'ShortFormVideo',
    type: 'video',
    durationInFrames: frameOffset,
    props: {
      scenes: mappedScenes,
      backgrounds: [],
      videoScale: 1.15,
      defaultCaptionConfig: {
        style: 'karaoke',
        position: 'bottom',
        fontSize: 52,
        fontColor: '#FFFFFF',
        highlightColor: style.primaryColor || '#FFD700',
      },
      showOutro: false,
      outroDuration: 0,
      outroText: '',
      outroEmoji: '',
      enableTts: false,
      ttsVolume: 1,
      bgmVolume: 0.3,
      sceneTransition: 'fade',
      transitionDuration: 15,
      audioFadeDuration: 15,
    },
  }
}

function mapTextOverVideo(scenes: VideoScene[], style: Record<string, unknown>): MappedResult {
  let frameOffset = 0
  const texts = scenes.map(s => {
    const item = { text: s.text, startFrame: frameOffset, durationFrames: s.durationFrames }
    frameOffset += s.durationFrames
    return item
  })

  return {
    compositionId: 'TextOverVideo',
    type: 'video',
    durationInFrames: frameOffset,
    props: {
      backgrounds: [],
      backgroundCrossfade: 0,
      texts,
      fontSize: 52,
      fontWeight: 700,
      textPosition: 'top',
      videoScale: 1.15,
      showOutro: false,
      outroDuration: 0,
      outroText: '',
      outroEmoji: '',
      bgmVolume: 0.3,
    },
  }
}

function mapVSReel(scenes: VideoScene[], style: Record<string, unknown>): MappedResult {
  let frameOffset = 0
  const texts = scenes.map(s => {
    const item = { text: s.text, startFrame: frameOffset, durationFrames: s.durationFrames }
    frameOffset += s.durationFrames
    return item
  })

  return {
    compositionId: 'VSReel',
    type: 'video',
    durationInFrames: frameOffset,
    props: {
      logoLeft: { type: 'image', file: 'placeholder.png' },
      logoRight: { type: 'image', file: 'placeholder.png' },
      logoStartFrame: 0,
      logoDurationFrames: 0,
      showVS: true,
      texts,
      backgrounds: [],
      backgroundCrossfade: 0,
      fontSize: 44,
      fontWeight: 700,
      logoSize: 120,
      videoScale: 1.15,
      showOutro: false,
      outroDuration: 0,
      outroText: '',
      outroEmoji: '',
      bgmVolume: 0.3,
    },
  }
}

function mapNewsBreaking(scenes: VideoScene[]): MappedResult {
  const headline = scenes[0]?.text || 'Breaking News'
  const points = scenes.slice(1).map(s => s.text).filter(Boolean)
  const alertDuration = 120
  const headlineDuration = 180
  const pointsDuration = points.length > 0 ? 300 : 0
  const total = alertDuration + headlineDuration + pointsDuration

  return {
    compositionId: 'NewsBreaking',
    type: 'video',
    durationInFrames: total,
    props: {
      headline,
      points,
      alertDuration,
      headlineDuration,
      pointsDuration,
      opinionDuration: 0,
      headlineFontSize: 56,
      pointsFontSize: 40,
      alertColor: '#FF3B30',
      accentColor: '#FFD700',
    },
  }
}

function mapDemo60s(scenes: VideoScene[]): MappedResult {
  const hookText = scenes[0]?.text || '60초 만에 만든다'
  const hookDuration = scenes[0]?.durationFrames || 180
  const demoDuration = 3000
  const ctaDuration = 420

  return {
    compositionId: 'Demo60s',
    type: 'video',
    durationInFrames: hookDuration + demoDuration + ctaDuration,
    props: {
      hookText,
      resultText: '',
      demoVideo: '',
      demoStartFrom: 0,
      ctaText: "'템플릿' 댓글 달면 공유해드림",
      ctaKeyword: '템플릿',
      hookDuration,
      demoDuration,
      ctaDuration,
      hookFontSize: 72,
      ctaFontSize: 48,
      accentColor: '#FFD700',
      showLogo: true,
      logoEmoji: '🦞',
    },
  }
}

function mapDayInTheLife(scenes: VideoScene[]): MappedResult {
  const clips = scenes.map(s => ({
    file: 'placeholder.MOV',
    time: '',
    label: s.text,
    emoji: '📌',
  }))
  const clipDuration = scenes[0]?.durationFrames || 180
  const transitionDuration = 30
  const total = clips.length * (clipDuration - transitionDuration)

  return {
    compositionId: 'DayInTheLife',
    type: 'video',
    durationInFrames: total,
    props: {
      clips,
      clipDuration,
      transitionDuration,
      showOutro: false,
      outroDuration: 0,
      outroText: '',
      outroEmoji: '',
      subtitle: '',
      videoScale: 1.15,
    },
  }
}

// ── Carousel mappers ──

function mapCardNews(slides: CarouselSlide[], style: Record<string, unknown>): MappedResult {
  return {
    compositionId: 'CardNews',
    type: 'still',
    slideCount: slides.length,
    props: {
      slides: slides.map(s => ({
        title: s.title || '',
        body: s.body || '',
        imageUrl: s.imageUrl,
      })),
      slideIndex: 0,
      accentColor: (style.primaryColor as string) || '#FF6B35',
    },
  }
}

function mapStepByStep(slides: CarouselSlide[], style: Record<string, unknown>): MappedResult {
  return {
    compositionId: 'StepByStep',
    type: 'still',
    slideCount: slides.length,
    props: {
      title: slides[0]?.title || 'Guide',
      steps: slides.map((s, i) => ({
        number: i + 1,
        heading: s.title || `Step ${i + 1}`,
        body: s.body || '',
      })),
      slideIndex: 0,
      accentColor: (style.primaryColor as string) || '#FF6B35',
    },
  }
}

function mapBeforeAfter(slides: CarouselSlide[], style: Record<string, unknown>): MappedResult {
  return {
    compositionId: 'BeforeAfter',
    type: 'still',
    slideCount: slides.length,
    props: {
      items: slides.map(s => ({
        before: s.title || 'Before',
        after: s.body || 'After',
      })),
      slideIndex: 0,
      accentColor: (style.primaryColor as string) || '#FF6B35',
    },
  }
}

function mapListCarousel(slides: CarouselSlide[], style: Record<string, unknown>): MappedResult {
  return {
    compositionId: 'ListCarousel',
    type: 'still',
    slideCount: slides.length,
    props: {
      slides: slides.map(s => ({
        heading: s.title || '',
        items: (s.body || '').split('\n').filter(Boolean).map(text => ({ text })),
      })),
      slideIndex: 0,
      accentColor: (style.primaryColor as string) || '#FF6B35',
    },
  }
}

function mapQuoteCarousel(slides: CarouselSlide[], style: Record<string, unknown>): MappedResult {
  return {
    compositionId: 'QuoteCarousel',
    type: 'still',
    slideCount: slides.length,
    props: {
      quotes: slides.map(s => ({
        text: s.quoteText || s.body || '',
        author: s.quoteAuthor || '',
      })),
      slideIndex: 0,
      accentColor: (style.accentColor as string) || '#4ECDC4',
    },
  }
}

// ── Image mappers ──

function mapImage(template: string, layers: ImageLayer[], style: Record<string, unknown>): MappedResult {
  const textLayers = layers.filter(l => l.type === 'text')
  const title = textLayers[0]?.content || 'Title'
  const subtitle = textLayers[1]?.content
  const accent = (style.primaryColor as string) || '#FF6B35'

  const sizeMap: Record<string, { w: number; h: number }> = {
    OgImage: { w: 1200, h: 630 },
    SocialPost: { w: 1080, h: 1080 },
    Infographic: { w: 1080, h: 1920 },
    Quote: { w: 1080, h: 1080 },
    Thumbnail: { w: 1280, h: 720 },
  }

  const propsMap: Record<string, Record<string, unknown>> = {
    OgImage: { title, subtitle, accentColor: accent, theme: 'dark' },
    SocialPost: { title, message: subtitle || '', accentColor: accent, layout: 'centered' },
    Infographic: {
      title,
      sections: textLayers.slice(1).map(l => ({
        icon: '📊',
        heading: l.content.split('\n')[0] || '',
        body: l.content.split('\n').slice(1).join('\n') || '',
      })),
      accentColor: accent,
    },
    Quote: {
      text: textLayers[0]?.content || '',
      author: textLayers[1]?.content || '',
      accentColor: (style.accentColor as string) || '#4ECDC4',
    },
    Thumbnail: { title, accentColor: accent, theme: 'dark' },
  }

  return {
    compositionId: template,
    type: 'still',
    props: propsMap[template] || propsMap.OgImage,
  }
}

// ── Main mapper ──

const VIDEO_MAPPERS: Record<string, (scenes: VideoScene[], style: Record<string, unknown>) => MappedResult> = {
  ShortFormVideo: mapShortFormVideo,
  TextOverVideo: mapTextOverVideo,
  VSReel: mapVSReel,
  NewsBreaking: (scenes) => mapNewsBreaking(scenes),
  Demo60s: (scenes) => mapDemo60s(scenes),
  DayInTheLife: (scenes) => mapDayInTheLife(scenes),
}

const CAROUSEL_MAPPERS: Record<string, (slides: CarouselSlide[], style: Record<string, unknown>) => MappedResult> = {
  CardNews: mapCardNews,
  StepByStep: mapStepByStep,
  BeforeAfter: mapBeforeAfter,
  ListCarousel: mapListCarousel,
  QuoteCarousel: mapQuoteCarousel,
}

export function mapProjectToRemotionProps(project: StudioProject): MappedResult {
  const style = (project.style_config || {}) as Record<string, unknown>

  if (project.type === 'video') {
    const scenes = (project.scenes || []) as unknown as VideoScene[]
    const mapper = VIDEO_MAPPERS[project.template]
    if (!mapper) throw new Error(`Unknown video template: ${project.template}`)
    return mapper(scenes, style)
  }

  if (project.type === 'carousel') {
    const slides = (project.scenes || []) as unknown as CarouselSlide[]
    const mapper = CAROUSEL_MAPPERS[project.template]
    if (!mapper) throw new Error(`Unknown carousel template: ${project.template}`)
    return mapper(slides, style)
  }

  // image
  const layers = (project.scenes || []) as unknown as ImageLayer[]
  return mapImage(project.template, layers, style)
}
