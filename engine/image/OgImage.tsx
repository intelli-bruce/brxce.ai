import { AbsoluteFill } from 'remotion'
import { z } from 'zod'
import { BRXCE_BRAND } from '../shared/BrxceBrand'

// ==========================================
// 스키마 정의
// ==========================================

export const ogImageSchema = z.object({
  title: z.string().describe('메인 제목'),
  subtitle: z.string().optional().describe('부제목'),
  tag: z.string().optional().describe('상단 태그 (예: BLOG, DEV)'),
  accentColor: z.string().default(BRXCE_BRAND.colors.primary),
  theme: z.enum(['dark', 'light']).default('dark'),
})

export type OgImageProps = z.infer<typeof ogImageSchema>

// ==========================================
// 컴포넌트
// ==========================================

export const OgImage: React.FC<OgImageProps> = ({
  title,
  subtitle,
  tag,
  accentColor = BRXCE_BRAND.colors.primary,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark'
  const bg = isDark ? BRXCE_BRAND.colors.background : '#FAFAFA'
  const textColor = isDark ? BRXCE_BRAND.colors.text : '#111111'
  const mutedColor = isDark ? BRXCE_BRAND.colors.textMuted : '#666666'

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        padding: '60px 80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 배경 그라데이션 오브 */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          right: -80,
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -160,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRXCE_BRAND.colors.accent}12 0%, transparent 70%)`,
        }}
      />

      {/* 좌측 액센트 바 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 6,
          height: '100%',
          background: `linear-gradient(180deg, ${accentColor} 0%, ${BRXCE_BRAND.colors.accent} 100%)`,
        }}
      />

      {/* 태그 */}
      {tag && (
        <div
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            backgroundColor: `${accentColor}20`,
            border: `1px solid ${accentColor}40`,
            display: 'inline-flex',
            alignSelf: 'flex-start',
            marginBottom: 28,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontFamily: BRXCE_BRAND.fonts.body,
              fontWeight: 700,
              color: accentColor,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {tag}
          </span>
        </div>
      )}

      {/* 제목 */}
      <h1
        style={{
          fontSize: title.length > 40 ? 40 : 52,
          fontFamily: BRXCE_BRAND.fonts.headline,
          fontWeight: 800,
          color: textColor,
          lineHeight: 1.2,
          letterSpacing: -1.5,
          margin: 0,
          maxWidth: 900,
        }}
      >
        {title}
      </h1>

      {/* 부제목 */}
      {subtitle && (
        <p
          style={{
            fontSize: 22,
            fontFamily: BRXCE_BRAND.fonts.body,
            fontWeight: 400,
            color: mutedColor,
            lineHeight: 1.5,
            margin: 0,
            marginTop: 16,
            maxWidth: 720,
          }}
        >
          {subtitle}
        </p>
      )}

      {/* 하단 브랜딩 */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 80,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 22 }}>{BRXCE_BRAND.logo.emoji}</span>
        <span
          style={{
            fontSize: 17,
            fontFamily: BRXCE_BRAND.fonts.body,
            fontWeight: 600,
            color: mutedColor,
            letterSpacing: 0.5,
          }}
        >
          {BRXCE_BRAND.watermark}
        </span>
      </div>

      {/* 우하단 장식 도트 */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          right: 80,
          display: 'flex',
          gap: 6,
        }}
      >
        {[accentColor, BRXCE_BRAND.colors.accent, mutedColor].map((c, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: c,
              opacity: 0.6,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  )
}
