import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  spring,
} from "remotion";
import { z } from "zod";

// ==========================================
// 스키마 정의
// ==========================================

export const demo60sSchema = z.object({
  /** Hook 텍스트 (상단) */
  hookText: z.string().default("60초 만에 만든다"),
  /** 결과물 설명 */
  resultText: z.string().default(""),
  
  /** 데모 영상 (스크린캐스트/타임랩스) */
  demoVideo: z.string(),
  demoStartFrom: z.number().default(0),
  
  /** CTA 텍스트 */
  ctaText: z.string().default("'템플릿' 댓글 달면 공유해드림"),
  ctaKeyword: z.string().default("템플릿"),
  
  /** 타이밍 (프레임, 60fps 기준) */
  hookDuration: z.number().default(180), // 3초
  demoDuration: z.number().default(3000), // 50초
  ctaDuration: z.number().default(420), // 7초
  
  /** 스타일 */
  hookFontSize: z.number().default(72),
  ctaFontSize: z.number().default(48),
  accentColor: z.string().default("#FFD700"), // 골드
  
  /** 로고/브랜딩 */
  showLogo: z.boolean().default(true),
  logoEmoji: z.string().default("🦞"),
});

export type Demo60sProps = z.infer<typeof demo60sSchema>;

// ==========================================
// 컴포넌트
// ==========================================

const HookSection: React.FC<{
  text: string;
  fontSize: number;
  accentColor: string;
  logoEmoji: string;
}> = ({ text, fontSize, accentColor, logoEmoji }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200 },
  });
  
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: fontSize * 1.5, marginBottom: 20 }}>
          {logoEmoji}
        </div>
        <div
          style={{
            fontSize,
            fontWeight: 800,
            color: "#fff",
            fontFamily: "Pretendard, Inter, sans-serif",
            lineHeight: 1.3,
          }}
        >
          {text.split("\n").map((line, i) => (
            <div key={i}>
              {line.includes("60") ? (
                <>
                  {line.split("60")[0]}
                  <span style={{ color: accentColor }}>60초</span>
                  {line.split("60초")[1] || line.split("60")[1]?.replace("초", "")}
                </>
              ) : (
                line
              )}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const DemoSection: React.FC<{
  videoSrc: string;
  startFrom: number;
}> = ({ videoSrc, startFrom }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={videoSrc}
        startFrom={startFrom}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      {/* 상단 그라데이션 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 150,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
        }}
      />
      {/* 하단 그라데이션 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 150,
          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
        }}
      />
    </AbsoluteFill>
  );
};

const CTASection: React.FC<{
  text: string;
  keyword: string;
  fontSize: number;
  accentColor: string;
  logoEmoji: string;
}> = ({ text, keyword, fontSize, accentColor, logoEmoji }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const pulse = interpolate(
    frame % 30,
    [0, 15, 30],
    [1, 1.05, 1],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: fontSize * 1.8, marginBottom: 30 }}>
          {logoEmoji}
        </div>
        <div
          style={{
            fontSize,
            fontWeight: 700,
            color: "#fff",
            fontFamily: "Pretendard, Inter, sans-serif",
            lineHeight: 1.5,
            transform: `scale(${pulse})`,
          }}
        >
          '<span style={{ color: accentColor, fontWeight: 800 }}>{keyword}</span>'
          {" "}댓글 달면
          <br />
          공유해드림
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// 메인 컴포지션
// ==========================================

export const Demo60s: React.FC<Demo60sProps> = ({
  hookText,
  resultText,
  demoVideo,
  demoStartFrom,
  ctaText,
  ctaKeyword,
  hookDuration,
  demoDuration,
  ctaDuration,
  hookFontSize,
  ctaFontSize,
  accentColor,
  showLogo,
  logoEmoji,
}) => {
  const displayHook = resultText 
    ? `${resultText}\n60초 만에 만든다`
    : hookText;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Hook (3초) */}
      <Sequence from={0} durationInFrames={hookDuration}>
        <HookSection
          text={displayHook}
          fontSize={hookFontSize}
          accentColor={accentColor}
          logoEmoji={logoEmoji}
        />
      </Sequence>

      {/* Demo (50초) */}
      <Sequence from={hookDuration} durationInFrames={demoDuration}>
        <DemoSection
          videoSrc={demoVideo}
          startFrom={demoStartFrom}
        />
      </Sequence>

      {/* CTA (7초) */}
      <Sequence from={hookDuration + demoDuration} durationInFrames={ctaDuration}>
        <CTASection
          text={ctaText}
          keyword={ctaKeyword}
          fontSize={ctaFontSize}
          accentColor={accentColor}
          logoEmoji={logoEmoji}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export default Demo60s;
