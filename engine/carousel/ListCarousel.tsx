import { AbsoluteFill } from 'remotion'
import { z } from 'zod'
import { BRXCE_BRAND } from '../shared/BrxceBrand'

// ==========================================
// 스키마 정의
// ==========================================

export const listItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  emoji: z.string().optional(),
})

export const listSlideSchema = z.object({
  heading: z.string().optional().describe('슬라이드 소제목 (여러 슬라이드일 때)'),
  items: z.array(listItemSchema).min(1).max(5),
})

export const listCarouselSchema = z.object({
  slideIndex: z.number().min(0),
  slides: z.array(listSlideSchema).min(1),
  listTitle: z.string().describe('리스트 전체 제목 (예: Top 5 ...)'),
  listSubtitle: z.string().optional(),
  numbered: z.boolean().default(true).describe('번호 매기기 여부'),
  startNumber: z.number().default(1).describe('시작 번호 (역순이면 N부터)'),
  accentColor: z.string().default(BRXCE_BRAND.colors.primary),
})

export type ListItem = z.infer<typeof listItemSchema>
export type ListSlide = z.infer<typeof listSlideSchema>
export type ListCarouselProps = z.infer<typeof listCarouselSchema>

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
    }}
  >
    {/* 장식 — 숫자 배경 */}
    <div
      style={{
        position: 'absolute',
        top: -40,
        right: -20,
        fontSize: 320,
        fontFamily: BRXCE_BRAND.fonts.headline,
        fontWeight: 900,
        color: BRXCE_BRAND.colors.surface,
        opacity: 0.3,
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      #
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
        LIST
      </span>
    </div>

    {/* 제목 */}
    <h1
      style={{
        fontSize: 60,
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
// 리스트 슬라이드
// ==========================================

const ListSlideContent: React.FC<{
  slide: ListSlide
  numbered: boolean
  startNumber: number
  slideIndex: number
  totalSlides: number
  accentColor: string
  previousItemCount: number
}> = ({ slide, numbered, startNumber, slideIndex, totalSlides, accentColor, previousItemCount }) => (
  <AbsoluteFill
    style={{
      backgroundColor: BRXCE_BRAND.colors.background,
      padding: '64px 64px 96px',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {/* 슬라이드 헤더 */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 40,
      }}
    >
      {slide.heading && (
        <h3
          style={{
            fontSize: 28,
            fontFamily: BRXCE_BRAND.fonts.headline,
            fontWeight: 700,
            color: BRXCE_BRAND.colors.text,
            margin: 0,
          }}
        >
          {slide.heading}
        </h3>
      )}
      <span
        style={{
          fontSize: 16,
          fontFamily: BRXCE_BRAND.fonts.body,
          fontWeight: 500,
          color: BRXCE_BRAND.colors.textMuted,
          marginLeft: 'auto',
        }}
      >
        {slideIndex}/{totalSlides}
      </span>
    </div>

    {/* 리스트 아이템 */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
      {slide.items.map((item, i) => {
        const itemNumber = startNumber + previousItemCount + i
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 20,
              padding: '28px 32px',
              borderRadius: 16,
              backgroundColor: BRXCE_BRAND.colors.surface,
              border: `1px solid rgba(255,255,255,0.05)`,
            }}
          >
            {/* 번호 또는 이모지 */}
            <div
              style={{
                minWidth: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: numbered ? accentColor : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {item.emoji && !numbered ? (
                <span style={{ fontSize: 28 }}>{item.emoji}</span>
              ) : (
                <span
                  style={{
                    fontSize: 22,
                    fontFamily: BRXCE_BRAND.fonts.headline,
                    fontWeight: 800,
                    color: '#FFFFFF',
                  }}
                >
                  {itemNumber}
                </span>
              )}
            </div>

            {/* 텍스트 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span
                style={{
                  fontSize: 26,
                  fontFamily: BRXCE_BRAND.fonts.headline,
                  fontWeight: 600,
                  color: BRXCE_BRAND.colors.text,
                  lineHeight: 1.3,
                }}
              >
                {item.title}
              </span>
              {item.description && (
                <span
                  style={{
                    fontSize: 20,
                    fontFamily: BRXCE_BRAND.fonts.body,
                    fontWeight: 400,
                    color: BRXCE_BRAND.colors.textMuted,
                    lineHeight: 1.5,
                  }}
                >
                  {item.description}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>

    <Watermark />
  </AbsoluteFill>
)

// ==========================================
// 메인 컴포지션
// ==========================================

export const ListCarousel: React.FC<ListCarouselProps> = ({
  slideIndex,
  slides,
  listTitle,
  listSubtitle,
  numbered = true,
  startNumber = 1,
  accentColor = BRXCE_BRAND.colors.primary,
}) => {
  // 커버 (index 0)
  if (slideIndex === 0) {
    return (
      <CoverSlide
        title={listTitle}
        subtitle={listSubtitle}
        accentColor={accentColor}
      />
    )
  }

  // 리스트 슬라이드
  const listIndex = slideIndex - 1
  const slide = slides[listIndex]
  if (!slide) return null

  // 이전 슬라이드들의 아이템 수 합산
  const previousItemCount = slides
    .slice(0, listIndex)
    .reduce((acc, s) => acc + s.items.length, 0)

  return (
    <ListSlideContent
      slide={slide}
      numbered={numbered}
      startNumber={startNumber}
      slideIndex={slideIndex}
      totalSlides={slides.length}
      accentColor={accentColor}
      previousItemCount={previousItemCount}
    />
  )
}
