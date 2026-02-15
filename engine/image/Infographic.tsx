import { AbsoluteFill } from 'remotion'
import { z } from 'zod'
import { BRXCE_BRAND } from '../shared/BrxceBrand'

// ==========================================
// 스키마 정의
// ==========================================

export const infoSectionSchema = z.object({
  icon: z.string().optional().describe('이모지 아이콘'),
  heading: z.string().describe('섹션 제목'),
  body: z.string().describe('섹션 본문'),
})

export const infographicSchema = z.object({
  title: z.string().describe('인포그래픽 제목'),
  subtitle: z.string().optional().describe('부제목'),
  sections: z.array(infoSectionSchema).min(1).max(6).describe('콘텐츠 섹션들'),
  ctaText: z.string().optional().describe('하단 CTA 문구'),
  accentColor: z.string().default(BRXCE_BRAND.colors.primary),
})

export type InfoSection = z.infer<typeof infoSectionSchema>
export type InfographicProps = z.infer<typeof infographicSchema>

// ==========================================
// 컴포넌트
// ==========================================

export const Infographic: React.FC<InfographicProps> = ({
  title,
  subtitle,
  sections,
  ctaText,
  accentColor = BRXCE_BRAND.colors.primary,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRXCE_BRAND.colors.background,
        padding: '80px 72px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 배경 장식: 상단 그라데이션 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 320,
          background: `linear-gradient(180deg, ${accentColor}10 0%, transparent 100%)`,
        }}
      />

      {/* 헤더 영역 */}
      <div style={{ marginBottom: 56, position: 'relative' }}>
        {/* 장식 라인 */}
        <div
          style={{
            width: 48,
            height: 4,
            backgroundColor: accentColor,
            borderRadius: 2,
            marginBottom: 32,
          }}
        />

        <h1
          style={{
            fontSize: title.length > 20 ? 48 : 56,
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

        {subtitle && (
          <p
            style={{
              fontSize: 24,
              fontFamily: BRXCE_BRAND.fonts.body,
              fontWeight: 400,
              color: BRXCE_BRAND.colors.textMuted,
              lineHeight: 1.5,
              margin: 0,
              marginTop: 16,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* 구분선 */}
      <div
        style={{
          width: '100%',
          height: 1,
          backgroundColor: BRXCE_BRAND.colors.surface,
          marginBottom: 48,
        }}
      />

      {/* 섹션들 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
          flex: 1,
        }}
      >
        {sections.map((section, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 24,
              alignItems: 'flex-start',
            }}
          >
            {/* 번호 또는 아이콘 */}
            <div
              style={{
                minWidth: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: i === 0 ? accentColor : BRXCE_BRAND.colors.surface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {section.icon ? (
                <span style={{ fontSize: 28 }}>{section.icon}</span>
              ) : (
                <span
                  style={{
                    fontSize: 22,
                    fontFamily: BRXCE_BRAND.fonts.headline,
                    fontWeight: 800,
                    color: i === 0 ? '#FFFFFF' : BRXCE_BRAND.colors.textMuted,
                  }}
                >
                  {i + 1}
                </span>
              )}
            </div>

            {/* 텍스트 */}
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: 26,
                  fontFamily: BRXCE_BRAND.fonts.headline,
                  fontWeight: 700,
                  color: BRXCE_BRAND.colors.text,
                  lineHeight: 1.3,
                  margin: 0,
                  marginBottom: 8,
                }}
              >
                {section.heading}
              </h3>
              <p
                style={{
                  fontSize: 20,
                  fontFamily: BRXCE_BRAND.fonts.body,
                  fontWeight: 400,
                  color: BRXCE_BRAND.colors.textMuted,
                  lineHeight: 1.6,
                  margin: 0,
                  whiteSpace: 'pre-line',
                }}
              >
                {section.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      {ctaText && (
        <div
          style={{
            marginTop: 48,
            padding: '20px 32px',
            borderRadius: 16,
            backgroundColor: BRXCE_BRAND.colors.surface,
            border: `1px solid ${accentColor}30`,
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontFamily: BRXCE_BRAND.fonts.body,
              fontWeight: 600,
              color: BRXCE_BRAND.colors.text,
            }}
          >
            {ctaText}
          </span>
        </div>
      )}

      {/* 워터마크 */}
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
