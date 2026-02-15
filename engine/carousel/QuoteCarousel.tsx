import { AbsoluteFill } from 'remotion'
import { z } from 'zod'
import { BRXCE_BRAND } from '../shared/BrxceBrand'

// ==========================================
// 스키마 정의
// ==========================================

export const quoteItemSchema = z.object({
  text: z.string().describe('인용문'),
  author: z.string().describe('저자명'),
  role: z.string().optional().describe('저자 직함/소속'),
  emoji: z.string().optional(),
})

export const quoteCarouselSchema = z.object({
  slideIndex: z.number().min(0),
  quotes: z.array(quoteItemSchema).min(1),
  collectionTitle: z.string().describe('컬렉션 제목'),
  collectionSubtitle: z.string().optional(),
  accentColor: z.string().default(BRXCE_BRAND.colors.accent),
})

export type QuoteItem = z.infer<typeof quoteItemSchema>
export type QuoteCarouselProps = z.infer<typeof quoteCarouselSchema>

// ==========================================
// 워터마크
// ==========================================

const Watermark: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      bottom: 32,
      right: 40,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      opacity: 0.5,
      zIndex: 10,
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
      {BRXCE_BRAND.watermark}
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
}> = ({ title, subtitle, accentColor }) => (
  <AbsoluteFill
    style={{
      backgroundColor: BRXCE_BRAND.colors.background,
      padding: 80,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
    }}
  >
    {/* 대형 따옴표 장식 */}
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: 60,
        fontSize: 200,
        fontFamily: 'Georgia, serif',
        fontWeight: 700,
        color: accentColor,
        opacity: 0.15,
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      &ldquo;
    </div>

    {/* 카테고리 뱃지 */}
    <div
      style={{
        padding: '8px 20px',
        borderRadius: 8,
        backgroundColor: `${accentColor}22`,
        border: `1px solid ${accentColor}44`,
        display: 'inline-flex',
        alignSelf: 'flex-start',
        marginBottom: 40,
      }}
    >
      <span
        style={{
          fontSize: 16,
          fontFamily: BRXCE_BRAND.fonts.body,
          fontWeight: 700,
          color: accentColor,
          letterSpacing: 1,
        }}
      >
        INSIGHTS
      </span>
    </div>

    {/* 제목 */}
    <h1
      style={{
        fontSize: 56,
        fontFamily: BRXCE_BRAND.fonts.headline,
        fontWeight: 800,
        color: BRXCE_BRAND.colors.text,
        lineHeight: 1.25,
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
          fontSize: 26,
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

    <Watermark />
  </AbsoluteFill>
)

// ==========================================
// 인용구 슬라이드
// ==========================================

const QuoteSlide: React.FC<{
  quote: QuoteItem
  slideNumber: number
  totalQuotes: number
  accentColor: string
}> = ({ quote, slideNumber, totalQuotes, accentColor }) => (
  <AbsoluteFill
    style={{
      backgroundColor: BRXCE_BRAND.colors.background,
      padding: 80,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
    }}
  >
    {/* 슬라이드 번호 */}
    <div
      style={{
        position: 'absolute',
        top: 48,
        right: 64,
        fontSize: 16,
        fontFamily: BRXCE_BRAND.fonts.body,
        fontWeight: 500,
        color: BRXCE_BRAND.colors.textMuted,
      }}
    >
      {slideNumber}/{totalQuotes}
    </div>

    {/* 큰 따옴표 */}
    <div
      style={{
        fontSize: 120,
        fontFamily: 'Georgia, serif',
        fontWeight: 700,
        color: accentColor,
        lineHeight: 0.8,
        marginBottom: 24,
        userSelect: 'none',
      }}
    >
      &ldquo;
    </div>

    {/* 인용문 */}
    <p
      style={{
        fontSize: 38,
        fontFamily: BRXCE_BRAND.fonts.headline,
        fontWeight: 600,
        color: BRXCE_BRAND.colors.text,
        lineHeight: 1.6,
        margin: 0,
        marginBottom: 48,
        whiteSpace: 'pre-line',
      }}
    >
      {quote.text}
    </p>

    {/* 구분선 */}
    <div
      style={{
        width: 48,
        height: 3,
        backgroundColor: accentColor,
        borderRadius: 2,
        marginBottom: 32,
      }}
    />

    {/* 저자 정보 */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {quote.emoji && (
        <span style={{ fontSize: 36 }}>{quote.emoji}</span>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          style={{
            fontSize: 24,
            fontFamily: BRXCE_BRAND.fonts.headline,
            fontWeight: 700,
            color: BRXCE_BRAND.colors.text,
          }}
        >
          {quote.author}
        </span>
        {quote.role && (
          <span
            style={{
              fontSize: 18,
              fontFamily: BRXCE_BRAND.fonts.body,
              fontWeight: 400,
              color: BRXCE_BRAND.colors.textMuted,
            }}
          >
            {quote.role}
          </span>
        )}
      </div>
    </div>

    {/* 닫는 따옴표 */}
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        right: 80,
        fontSize: 120,
        fontFamily: 'Georgia, serif',
        fontWeight: 700,
        color: accentColor,
        opacity: 0.1,
        lineHeight: 0.8,
        transform: 'rotate(180deg)',
        userSelect: 'none',
      }}
    >
      &ldquo;
    </div>

    <Watermark />
  </AbsoluteFill>
)

// ==========================================
// 메인 컴포지션
// ==========================================

export const QuoteCarousel: React.FC<QuoteCarouselProps> = ({
  slideIndex,
  quotes,
  collectionTitle,
  collectionSubtitle,
  accentColor = BRXCE_BRAND.colors.accent,
}) => {
  // 커버 (index 0)
  if (slideIndex === 0) {
    return (
      <CoverSlide
        title={collectionTitle}
        subtitle={collectionSubtitle}
        accentColor={accentColor}
      />
    )
  }

  // 인용구 슬라이드
  const quoteIndex = slideIndex - 1
  const quote = quotes[quoteIndex]
  if (!quote) return null

  return (
    <QuoteSlide
      quote={quote}
      slideNumber={quoteIndex + 1}
      totalQuotes={quotes.length}
      accentColor={accentColor}
    />
  )
}
