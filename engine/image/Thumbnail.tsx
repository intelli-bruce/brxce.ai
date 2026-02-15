import { AbsoluteFill } from 'remotion'
import { z } from 'zod'
import { BRXCE_BRAND } from '../shared/BrxceBrand'

// ==========================================
// 스키마 정의
// ==========================================

export const thumbnailSchema = z.object({
  title: z.string().describe('큰 메인 텍스트'),
  badge: z.string().optional().describe('상단 뱃지 (예: NEW, EP.1)'),
  bottomText: z.string().optional().describe('하단 보조 텍스트'),
  accentColor: z.string().default(BRXCE_BRAND.colors.primary),
  theme: z.enum(['dark', 'light']).default('dark'),
})

export type ThumbnailProps = z.infer<typeof thumbnailSchema>

// ==========================================
// 컴포넌트
// ==========================================

export const Thumbnail: React.FC<ThumbnailProps> = ({
  title,
  badge,
  bottomText,
  accentColor = BRXCE_BRAND.colors.primary,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark'
  const bg = isDark ? '#0C0C0C' : '#F5F5F5'
  const textColor = isDark ? '#FFFFFF' : '#111111'
  const mutedColor = isDark ? BRXCE_BRAND.colors.textMuted : '#555555'

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 배경: 대각선 그라데이션 스트라이프 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${accentColor}12 0%, transparent 40%, transparent 60%, ${accentColor}08 100%)`,
        }}
      />

      {/* 좌측 강조 바 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '20%',
          width: 8,
          height: '60%',
          backgroundColor: accentColor,
          borderRadius: '0 4px 4px 0',
        }}
      />

      {/* 뱃지 */}
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: 36,
            left: 48,
            padding: '8px 20px',
            borderRadius: 8,
            backgroundColor: accentColor,
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontFamily: BRXCE_BRAND.fonts.headline,
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}
          >
            {badge}
          </span>
        </div>
      )}

      {/* 메인 텍스트 */}
      <h1
        style={{
          fontSize: title.length > 20 ? 64 : title.length > 10 ? 80 : 96,
          fontFamily: BRXCE_BRAND.fonts.headline,
          fontWeight: 900,
          color: textColor,
          lineHeight: 1.05,
          letterSpacing: -3,
          margin: 0,
          textAlign: 'center',
          padding: '0 80px',
          maxWidth: 1100,
        }}
      >
        {title}
      </h1>

      {/* 강조 밑줄 */}
      <div
        style={{
          width: Math.min(title.length * 16, 400),
          height: 6,
          backgroundColor: accentColor,
          borderRadius: 3,
          marginTop: 24,
        }}
      />

      {/* 하단 보조 텍스트 */}
      {bottomText && (
        <p
          style={{
            fontSize: 24,
            fontFamily: BRXCE_BRAND.fonts.body,
            fontWeight: 500,
            color: mutedColor,
            margin: 0,
            marginTop: 20,
            letterSpacing: 0.5,
          }}
        >
          {bottomText}
        </p>
      )}

      {/* 워터마크 (우하) */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          right: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          opacity: 0.5,
        }}
      >
        <span style={{ fontSize: 18, fontFamily: BRXCE_BRAND.fonts.body }}>
          {BRXCE_BRAND.logo.emoji}
        </span>
        <span
          style={{
            fontSize: 16,
            fontFamily: BRXCE_BRAND.fonts.body,
            fontWeight: 500,
            color: mutedColor,
            letterSpacing: 0.5,
          }}
        >
          {BRXCE_BRAND.watermark}
        </span>
      </div>
    </AbsoluteFill>
  )
}
