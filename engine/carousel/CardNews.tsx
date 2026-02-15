import { AbsoluteFill } from 'remotion'
import { z } from 'zod'
import { BRXCE_BRAND } from '../shared/BrxceBrand'

// ==========================================
// 스키마 정의
// ==========================================

export const cardNewsSlideSchema = z.object({
  title: z.string(),
  body: z.string().optional(),
  imageUrl: z.string().optional(),
})

export const cardNewsSchema = z.object({
  slideIndex: z.number().min(0),
  slides: z.array(cardNewsSlideSchema).min(1),
  coverTitle: z.string().describe('커버 슬라이드 제목'),
  coverSubtitle: z.string().optional().describe('커버 부제목'),
  ctaHandle: z.string().default('@brxce.ai'),
  accentColor: z.string().default(BRXCE_BRAND.colors.primary),
})

export type CardNewsSlide = z.infer<typeof cardNewsSlideSchema>
export type CardNewsProps = z.infer<typeof cardNewsSchema>

// ==========================================
// 워터마크
// ==========================================

const Watermark: React.FC<{ handle: string }> = ({ handle }) => (
  <div
    style={{
      position: 'absolute',
      bottom: 32,
      right: 40,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      opacity: 0.5,
    }}
  >
    <span style={{ fontSize: 18, fontFamily: BRXCE_BRAND.fonts.body }}>{BRXCE_BRAND.logo.emoji}</span>
    <span
      style={{
        fontSize: 16,
        fontFamily: BRXCE_BRAND.fonts.body,
        fontWeight: 500,
        color: BRXCE_BRAND.colors.textMuted,
        letterSpacing: 0.5,
      }}
    >
      {handle}
    </span>
  </div>
)

// ==========================================
// 커버 슬라이드
// ==========================================

const CoverSlide: React.FC<{
  title: string
  subtitle?: string
  accentColor: string
  handle: string
}> = ({ title, subtitle, accentColor, handle }) => (
  <AbsoluteFill
    style={{
      backgroundColor: BRXCE_BRAND.colors.background,
      padding: 80,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}
  >
    {/* 상단 장식 라인 */}
    <div
      style={{
        width: 64,
        height: 4,
        backgroundColor: accentColor,
        borderRadius: 2,
        marginBottom: 48,
      }}
    />

    {/* 제목 */}
    <h1
      style={{
        fontSize: 64,
        fontFamily: BRXCE_BRAND.fonts.headline,
        fontWeight: 800,
        color: BRXCE_BRAND.colors.text,
        lineHeight: 1.2,
        letterSpacing: -1.5,
        margin: 0,
      }}
    >
      {title}
    </h1>

    {/* 부제목 */}
    {subtitle && (
      <p
        style={{
          fontSize: 28,
          fontFamily: BRXCE_BRAND.fonts.body,
          fontWeight: 400,
          color: BRXCE_BRAND.colors.textMuted,
          lineHeight: 1.6,
          margin: 0,
          marginTop: 24,
        }}
      >
        {subtitle}
      </p>
    )}

    {/* 하단 슬라이드 안내 */}
    <div
      style={{
        position: 'absolute',
        bottom: 100,
        left: 80,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span
        style={{
          fontSize: 18,
          fontFamily: BRXCE_BRAND.fonts.body,
          fontWeight: 500,
          color: BRXCE_BRAND.colors.textMuted,
          letterSpacing: 1,
        }}
      >
        SWIPE &rarr;
      </span>
    </div>

    <Watermark handle={handle} />
  </AbsoluteFill>
)

// ==========================================
// 본문 슬라이드
// ==========================================

const ContentSlide: React.FC<{
  slide: CardNewsSlide
  slideNumber: number
  totalSlides: number
  accentColor: string
  handle: string
}> = ({ slide, slideNumber, totalSlides, accentColor, handle }) => (
  <AbsoluteFill
    style={{
      backgroundColor: BRXCE_BRAND.colors.background,
      padding: 80,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {/* 슬라이드 번호 */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          backgroundColor: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontFamily: BRXCE_BRAND.fonts.headline,
            fontWeight: 800,
            color: '#FFFFFF',
          }}
        >
          {slideNumber}
        </span>
      </div>
      <div
        style={{
          fontSize: 16,
          fontFamily: BRXCE_BRAND.fonts.body,
          fontWeight: 500,
          color: BRXCE_BRAND.colors.textMuted,
          letterSpacing: 1,
        }}
      >
        {slideNumber} / {totalSlides}
      </div>
    </div>

    {/* 제목 */}
    <h2
      style={{
        fontSize: 44,
        fontFamily: BRXCE_BRAND.fonts.headline,
        fontWeight: 700,
        color: BRXCE_BRAND.colors.text,
        lineHeight: 1.3,
        letterSpacing: -0.5,
        margin: 0,
        marginBottom: 32,
      }}
    >
      {slide.title}
    </h2>

    {/* 구분선 */}
    <div
      style={{
        width: '100%',
        height: 1,
        backgroundColor: BRXCE_BRAND.colors.surface,
        marginBottom: 32,
      }}
    />

    {/* 본문 */}
    {slide.body && (
      <p
        style={{
          fontSize: 26,
          fontFamily: BRXCE_BRAND.fonts.body,
          fontWeight: 400,
          color: BRXCE_BRAND.colors.textMuted,
          lineHeight: 1.8,
          margin: 0,
          whiteSpace: 'pre-line',
        }}
      >
        {slide.body}
      </p>
    )}

    <Watermark handle={handle} />
  </AbsoluteFill>
)

// ==========================================
// CTA 슬라이드
// ==========================================

const CtaSlide: React.FC<{
  handle: string
  accentColor: string
}> = ({ handle, accentColor }) => (
  <AbsoluteFill
    style={{
      backgroundColor: BRXCE_BRAND.colors.background,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 32,
    }}
  >
    {/* 로고 이모지 */}
    <span style={{ fontSize: 72 }}>{BRXCE_BRAND.logo.emoji}</span>

    {/* 팔로우 메시지 */}
    <div style={{ textAlign: 'center' }}>
      <p
        style={{
          fontSize: 32,
          fontFamily: BRXCE_BRAND.fonts.body,
          fontWeight: 600,
          color: BRXCE_BRAND.colors.text,
          margin: 0,
          marginBottom: 12,
        }}
      >
        더 많은 인사이트가 궁금하다면
      </p>
      <p
        style={{
          fontSize: 36,
          fontFamily: BRXCE_BRAND.fonts.headline,
          fontWeight: 800,
          color: accentColor,
          margin: 0,
        }}
      >
        {handle}
      </p>
    </div>

    {/* 저장 & 공유 안내 */}
    <div
      style={{
        marginTop: 24,
        padding: '16px 32px',
        borderRadius: 12,
        backgroundColor: BRXCE_BRAND.colors.surface,
      }}
    >
      <span
        style={{
          fontSize: 20,
          fontFamily: BRXCE_BRAND.fonts.body,
          fontWeight: 500,
          color: BRXCE_BRAND.colors.textMuted,
        }}
      >
        저장하고 나중에 다시 보기
      </span>
    </div>
  </AbsoluteFill>
)

// ==========================================
// 메인 컴포지션
// ==========================================

export const CardNews: React.FC<CardNewsProps> = ({
  slideIndex,
  slides,
  coverTitle,
  coverSubtitle,
  ctaHandle = '@brxce.ai',
  accentColor = BRXCE_BRAND.colors.primary,
}) => {
  const totalContentSlides = slides.length
  const totalSlides = totalContentSlides + 2 // cover + content + cta

  // 커버 (index 0)
  if (slideIndex === 0) {
    return (
      <CoverSlide
        title={coverTitle}
        subtitle={coverSubtitle}
        accentColor={accentColor}
        handle={ctaHandle}
      />
    )
  }

  // CTA (마지막 슬라이드)
  if (slideIndex === totalSlides - 1) {
    return <CtaSlide handle={ctaHandle} accentColor={accentColor} />
  }

  // 본문 슬라이드
  const contentIndex = slideIndex - 1
  const slide = slides[contentIndex]
  if (!slide) return null

  return (
    <ContentSlide
      slide={slide}
      slideNumber={contentIndex + 1}
      totalSlides={totalContentSlides}
      accentColor={accentColor}
      handle={ctaHandle}
    />
  )
}
