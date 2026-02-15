import { AbsoluteFill } from 'remotion'
import { z } from 'zod'
import { BRXCE_BRAND } from '../shared/BrxceBrand'

// ==========================================
// 스키마 정의
// ==========================================

export const quoteImageSchema = z.object({
  text: z.string().describe('인용문'),
  author: z.string().describe('저자'),
  authorRole: z.string().optional().describe('저자 직함/소속'),
  accentColor: z.string().default(BRXCE_BRAND.colors.accent),
})

export type QuoteImageProps = z.infer<typeof quoteImageSchema>

// ==========================================
// 컴포넌트
// ==========================================

export const Quote: React.FC<QuoteImageProps> = ({
  text,
  author,
  authorRole,
  accentColor = BRXCE_BRAND.colors.accent,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRXCE_BRAND.colors.background,
        padding: 80,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 배경: 미묘한 비네트 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 40%, ${BRXCE_BRAND.colors.background} 100%)`,
        }}
      />

      {/* 대형 장식 따옴표 (좌상) */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 48,
          fontSize: 240,
          fontFamily: 'Georgia, serif',
          fontWeight: 700,
          color: accentColor,
          opacity: 0.08,
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        &ldquo;
      </div>

      {/* 인용문 */}
      <p
        style={{
          fontSize: text.length > 120 ? 32 : text.length > 60 ? 40 : 48,
          fontFamily: BRXCE_BRAND.fonts.headline,
          fontWeight: 600,
          color: BRXCE_BRAND.colors.text,
          lineHeight: 1.6,
          margin: 0,
          marginBottom: 56,
          textAlign: 'center',
          whiteSpace: 'pre-line',
          position: 'relative',
        }}
      >
        {text}
      </p>

      {/* 구분선 */}
      <div
        style={{
          width: 48,
          height: 3,
          backgroundColor: accentColor,
          borderRadius: 2,
          alignSelf: 'center',
          marginBottom: 32,
        }}
      />

      {/* 저자 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
            fontSize: 24,
            fontFamily: BRXCE_BRAND.fonts.headline,
            fontWeight: 700,
            color: BRXCE_BRAND.colors.text,
          }}
        >
          {author}
        </span>
        {authorRole && (
          <span
            style={{
              fontSize: 18,
              fontFamily: BRXCE_BRAND.fonts.body,
              fontWeight: 400,
              color: BRXCE_BRAND.colors.textMuted,
            }}
          >
            {authorRole}
          </span>
        )}
      </div>

      {/* 닫는 따옴표 장식 (우하) */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          right: 48,
          fontSize: 240,
          fontFamily: 'Georgia, serif',
          fontWeight: 700,
          color: accentColor,
          opacity: 0.08,
          lineHeight: 1,
          transform: 'rotate(180deg)',
          userSelect: 'none',
        }}
      >
        &ldquo;
      </div>

      {/* 워터마크 */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          opacity: 0.4,
        }}
      >
        <span style={{ fontSize: 16, fontFamily: BRXCE_BRAND.fonts.body }}>
          {BRXCE_BRAND.logo.emoji}
        </span>
        <span
          style={{
            fontSize: 14,
            fontFamily: BRXCE_BRAND.fonts.body,
            fontWeight: 500,
            color: BRXCE_BRAND.colors.textMuted,
            letterSpacing: 0.5,
          }}
        >
          {BRXCE_BRAND.watermark}
        </span>
      </div>
    </AbsoluteFill>
  )
}
