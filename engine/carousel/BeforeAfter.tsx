import { AbsoluteFill } from 'remotion'
import { z } from 'zod'
import { BRXCE_BRAND } from '../shared/BrxceBrand'

// ==========================================
// 스키마 정의
// ==========================================

export const beforeAfterItemSchema = z.object({
  label: z.string(),
  before: z.string(),
  after: z.string(),
  emoji: z.string().optional(),
})

export const beforeAfterSchema = z.object({
  slideIndex: z.number().min(0),
  items: z.array(beforeAfterItemSchema).min(1),
  coverTitle: z.string().describe('커버 제목'),
  coverSubtitle: z.string().optional(),
  beforeLabel: z.string().default('BEFORE'),
  afterLabel: z.string().default('AFTER'),
  accentColor: z.string().default(BRXCE_BRAND.colors.primary),
})

export type BeforeAfterItem = z.infer<typeof beforeAfterItemSchema>
export type BeforeAfterProps = z.infer<typeof beforeAfterSchema>

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
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {/* 상단 Before 영역 (어두운 톤) */}
    <div
      style={{
        flex: 1,
        backgroundColor: '#0D0D0D',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 80px 40px',
      }}
    >
      <span
        style={{
          fontSize: 24,
          fontFamily: BRXCE_BRAND.fonts.body,
          fontWeight: 700,
          color: '#FF4444',
          letterSpacing: 3,
          opacity: 0.6,
        }}
      >
        BEFORE
      </span>
    </div>

    {/* 중앙 구분 — 제목 영역 */}
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        transform: 'translateY(-50%)',
        zIndex: 2,
        textAlign: 'center',
        padding: '0 60px',
      }}
    >
      {/* 배경 블러 박스 */}
      <div
        style={{
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          borderRadius: 24,
          padding: '48px 56px',
          border: `2px solid ${BRXCE_BRAND.colors.surface}`,
        }}
      >
        <h1
          style={{
            fontSize: 52,
            fontFamily: BRXCE_BRAND.fonts.headline,
            fontWeight: 800,
            color: BRXCE_BRAND.colors.text,
            lineHeight: 1.25,
            letterSpacing: -1,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: 24,
              fontFamily: BRXCE_BRAND.fonts.body,
              fontWeight: 400,
              color: BRXCE_BRAND.colors.textMuted,
              margin: 0,
              marginTop: 16,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>

    {/* 하단 After 영역 (밝은 톤) */}
    <div
      style={{
        flex: 1,
        backgroundColor: '#111111',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 80px 0',
      }}
    >
      <span
        style={{
          fontSize: 24,
          fontFamily: BRXCE_BRAND.fonts.body,
          fontWeight: 700,
          color: accentColor,
          letterSpacing: 3,
          opacity: 0.6,
        }}
      >
        AFTER
      </span>
    </div>

    <Watermark />
  </AbsoluteFill>
)

// ==========================================
// 비교 슬라이드
// ==========================================

const ComparisonSlide: React.FC<{
  item: BeforeAfterItem
  beforeLabel: string
  afterLabel: string
  accentColor: string
  slideNumber: number
  totalSlides: number
}> = ({ item, beforeLabel, afterLabel, accentColor, slideNumber, totalSlides }) => (
  <AbsoluteFill
    style={{
      backgroundColor: BRXCE_BRAND.colors.background,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {/* 상단 헤더 */}
    <div
      style={{
        padding: '48px 64px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {item.emoji && <span style={{ fontSize: 36 }}>{item.emoji}</span>}
      <h3
        style={{
          fontSize: 32,
          fontFamily: BRXCE_BRAND.fonts.headline,
          fontWeight: 700,
          color: BRXCE_BRAND.colors.text,
          margin: 0,
          flex: 1,
          marginLeft: item.emoji ? 16 : 0,
        }}
      >
        {item.label}
      </h3>
      <span
        style={{
          fontSize: 16,
          fontFamily: BRXCE_BRAND.fonts.body,
          fontWeight: 500,
          color: BRXCE_BRAND.colors.textMuted,
        }}
      >
        {slideNumber}/{totalSlides}
      </span>
    </div>

    {/* Before 영역 (상단) */}
    <div
      style={{
        flex: 1,
        margin: '0 64px',
        marginBottom: 12,
        borderRadius: 20,
        backgroundColor: '#1A0A0A',
        border: '1px solid rgba(255, 68, 68, 0.2)',
        padding: '40px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Before 라벨 */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 24,
          padding: '4px 14px',
          borderRadius: 6,
          backgroundColor: 'rgba(255, 68, 68, 0.15)',
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontFamily: BRXCE_BRAND.fonts.body,
            fontWeight: 700,
            color: '#FF4444',
            letterSpacing: 2,
          }}
        >
          {beforeLabel}
        </span>
      </div>

      <p
        style={{
          fontSize: 26,
          fontFamily: BRXCE_BRAND.fonts.body,
          fontWeight: 400,
          color: '#CC9999',
          lineHeight: 1.7,
          margin: 0,
          marginTop: 16,
          whiteSpace: 'pre-line',
        }}
      >
        {item.before}
      </p>
    </div>

    {/* 중앙 화살표 */}
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '4px 0',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: BRXCE_BRAND.colors.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 20, color: BRXCE_BRAND.colors.text }}>&#8595;</span>
      </div>
    </div>

    {/* After 영역 (하단) */}
    <div
      style={{
        flex: 1,
        margin: '12px 64px 0',
        marginBottom: 80,
        borderRadius: 20,
        backgroundColor: `${accentColor}08`,
        border: `1px solid ${accentColor}33`,
        padding: '40px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* After 라벨 */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 24,
          padding: '4px 14px',
          borderRadius: 6,
          backgroundColor: `${accentColor}22`,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontFamily: BRXCE_BRAND.fonts.body,
            fontWeight: 700,
            color: accentColor,
            letterSpacing: 2,
          }}
        >
          {afterLabel}
        </span>
      </div>

      <p
        style={{
          fontSize: 26,
          fontFamily: BRXCE_BRAND.fonts.body,
          fontWeight: 500,
          color: BRXCE_BRAND.colors.text,
          lineHeight: 1.7,
          margin: 0,
          marginTop: 16,
          whiteSpace: 'pre-line',
        }}
      >
        {item.after}
      </p>
    </div>

    <Watermark />
  </AbsoluteFill>
)

// ==========================================
// 메인 컴포지션
// ==========================================

export const BeforeAfter: React.FC<BeforeAfterProps> = ({
  slideIndex,
  items,
  coverTitle,
  coverSubtitle,
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
  accentColor = BRXCE_BRAND.colors.primary,
}) => {
  // 커버 (index 0)
  if (slideIndex === 0) {
    return (
      <CoverSlide
        title={coverTitle}
        subtitle={coverSubtitle}
        accentColor={accentColor}
      />
    )
  }

  // 비교 슬라이드
  const itemIndex = slideIndex - 1
  const item = items[itemIndex]
  if (!item) return null

  return (
    <ComparisonSlide
      item={item}
      beforeLabel={beforeLabel}
      afterLabel={afterLabel}
      accentColor={accentColor}
      slideNumber={itemIndex + 1}
      totalSlides={items.length}
    />
  )
}
