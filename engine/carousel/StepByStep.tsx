import { AbsoluteFill } from 'remotion'
import { z } from 'zod'
import { BRXCE_BRAND } from '../shared/BrxceBrand'

// ==========================================
// 스키마 정의
// ==========================================

export const stepSchema = z.object({
  title: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
})

export const stepByStepSchema = z.object({
  slideIndex: z.number().min(0),
  steps: z.array(stepSchema).min(1),
  guideTitle: z.string().describe('가이드 전체 제목'),
  guideSubtitle: z.string().optional(),
  accentColor: z.string().default(BRXCE_BRAND.colors.accent),
})

export type Step = z.infer<typeof stepSchema>
export type StepByStepProps = z.infer<typeof stepByStepSchema>

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
// 프로그레스 바
// ==========================================

const ProgressBar: React.FC<{
  current: number
  total: number
  accentColor: string
}> = ({ current, total, accentColor }) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 6,
      backgroundColor: BRXCE_BRAND.colors.surface,
    }}
  >
    <div
      style={{
        width: `${(current / total) * 100}%`,
        height: '100%',
        backgroundColor: accentColor,
        borderRadius: '0 3px 3px 0',
        transition: 'width 0.3s',
      }}
    />
  </div>
)

// ==========================================
// 커버 슬라이드
// ==========================================

const CoverSlide: React.FC<{
  title: string
  subtitle?: string
  totalSteps: number
  accentColor: string
}> = ({ title, subtitle, totalSteps, accentColor }) => (
  <AbsoluteFill
    style={{
      backgroundColor: BRXCE_BRAND.colors.background,
      padding: 80,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}
  >
    {/* 카테고리 뱃지 */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 40,
      }}
    >
      <div
        style={{
          padding: '8px 20px',
          borderRadius: 8,
          backgroundColor: accentColor,
          fontSize: 16,
          fontFamily: BRXCE_BRAND.fonts.body,
          fontWeight: 700,
          color: '#FFFFFF',
          letterSpacing: 1,
        }}
      >
        {totalSteps}단계 가이드
      </div>
    </div>

    {/* 제목 */}
    <h1
      style={{
        fontSize: 60,
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

    {/* 스텝 프리뷰 도트 */}
    <div
      style={{
        display: 'flex',
        gap: 12,
        marginTop: 64,
      }}
    >
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: BRXCE_BRAND.colors.surface,
          }}
        />
      ))}
    </div>

    <Watermark />
  </AbsoluteFill>
)

// ==========================================
// 스텝 슬라이드
// ==========================================

const StepSlide: React.FC<{
  step: Step
  stepNumber: number
  totalSteps: number
  accentColor: string
}> = ({ step, stepNumber, totalSteps, accentColor }) => (
  <AbsoluteFill
    style={{
      backgroundColor: BRXCE_BRAND.colors.background,
      padding: 80,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <ProgressBar current={stepNumber} total={totalSteps} accentColor={accentColor} />

    {/* 스텝 번호 원 */}
    <div
      style={{
        marginTop: 40,
        marginBottom: 48,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: 32,
            fontFamily: BRXCE_BRAND.fonts.headline,
            fontWeight: 800,
            color: '#FFFFFF',
          }}
        >
          {stepNumber}
        </span>
      </div>
      <span
        style={{
          fontSize: 18,
          fontFamily: BRXCE_BRAND.fonts.body,
          fontWeight: 500,
          color: BRXCE_BRAND.colors.textMuted,
          letterSpacing: 1,
        }}
      >
        STEP {stepNumber} of {totalSteps}
      </span>
    </div>

    {/* 이모지 */}
    {step.emoji && (
      <span style={{ fontSize: 48, marginBottom: 24 }}>{step.emoji}</span>
    )}

    {/* 제목 */}
    <h2
      style={{
        fontSize: 48,
        fontFamily: BRXCE_BRAND.fonts.headline,
        fontWeight: 700,
        color: BRXCE_BRAND.colors.text,
        lineHeight: 1.3,
        letterSpacing: -0.5,
        margin: 0,
        marginBottom: 32,
      }}
    >
      {step.title}
    </h2>

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

    {/* 설명 */}
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
      {step.description}
    </p>

    {/* 하단 스텝 인디케이터 */}
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: 80,
        display: 'flex',
        gap: 10,
      }}
    >
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === stepNumber - 1 ? 32 : 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: i === stepNumber - 1 ? accentColor : BRXCE_BRAND.colors.surface,
            transition: 'all 0.3s',
          }}
        />
      ))}
    </div>

    <Watermark />
  </AbsoluteFill>
)

// ==========================================
// 메인 컴포지션
// ==========================================

export const StepByStep: React.FC<StepByStepProps> = ({
  slideIndex,
  steps,
  guideTitle,
  guideSubtitle,
  accentColor = BRXCE_BRAND.colors.accent,
}) => {
  const totalSteps = steps.length

  // 커버 (index 0)
  if (slideIndex === 0) {
    return (
      <CoverSlide
        title={guideTitle}
        subtitle={guideSubtitle}
        totalSteps={totalSteps}
        accentColor={accentColor}
      />
    )
  }

  // 스텝 슬라이드
  const stepIndex = slideIndex - 1
  const step = steps[stepIndex]
  if (!step) return null

  return (
    <StepSlide
      step={step}
      stepNumber={stepIndex + 1}
      totalSteps={totalSteps}
      accentColor={accentColor}
    />
  )
}
