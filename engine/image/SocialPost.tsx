import { AbsoluteFill } from 'remotion'
import { z } from 'zod'
import { BRXCE_BRAND } from '../shared/BrxceBrand'

// ==========================================
// 스키마 정의
// ==========================================

export const socialPostSchema = z.object({
  title: z.string().describe('메인 타이틀'),
  message: z.string().describe('핵심 메시지'),
  icon: z.string().optional().describe('이모지 아이콘'),
  accentColor: z.string().default(BRXCE_BRAND.colors.primary),
  layout: z.enum(['centered', 'left-aligned']).default('centered'),
})

export type SocialPostProps = z.infer<typeof socialPostSchema>

// ==========================================
// 컴포넌트
// ==========================================

export const SocialPost: React.FC<SocialPostProps> = ({
  title,
  message,
  icon,
  accentColor = BRXCE_BRAND.colors.primary,
  layout = 'centered',
}) => {
  const isCentered = layout === 'centered'

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRXCE_BRAND.colors.background,
        padding: 80,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: isCentered ? 'center' : 'flex-start',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 배경 패턴: 대각선 그라데이션 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${accentColor}08 0%, transparent 50%, ${BRXCE_BRAND.colors.accent}06 100%)`,
        }}
      />

      {/* 코너 장식 */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          right: 40,
          width: 80,
          height: 80,
          borderTop: `3px solid ${accentColor}30`,
          borderRight: `3px solid ${accentColor}30`,
          borderRadius: '0 16px 0 0',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 40,
          width: 80,
          height: 80,
          borderBottom: `3px solid ${accentColor}30`,
          borderLeft: `3px solid ${accentColor}30`,
          borderRadius: '0 0 0 16px',
        }}
      />

      {/* 아이콘 */}
      {icon && (
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            backgroundColor: `${accentColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 48,
          }}
        >
          <span style={{ fontSize: 48 }}>{icon}</span>
        </div>
      )}

      {/* 제목 */}
      <h1
        style={{
          fontSize: title.length > 20 ? 52 : 64,
          fontFamily: BRXCE_BRAND.fonts.headline,
          fontWeight: 800,
          color: BRXCE_BRAND.colors.text,
          lineHeight: 1.15,
          letterSpacing: -2,
          margin: 0,
          textAlign: isCentered ? 'center' : 'left',
          maxWidth: 900,
        }}
      >
        {title}
      </h1>

      {/* 구분선 */}
      <div
        style={{
          width: 56,
          height: 4,
          backgroundColor: accentColor,
          borderRadius: 2,
          marginTop: 36,
          marginBottom: 36,
        }}
      />

      {/* 메시지 */}
      <p
        style={{
          fontSize: 28,
          fontFamily: BRXCE_BRAND.fonts.body,
          fontWeight: 400,
          color: BRXCE_BRAND.colors.textMuted,
          lineHeight: 1.7,
          margin: 0,
          textAlign: isCentered ? 'center' : 'left',
          maxWidth: 800,
          whiteSpace: 'pre-line',
        }}
      >
        {message}
      </p>

      {/* 워터마크 */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          right: 48,
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
