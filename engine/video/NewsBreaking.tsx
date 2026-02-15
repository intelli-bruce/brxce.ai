import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
} from "remotion";
import { z } from "zod";

// ==========================================
// 스키마 정의
// ==========================================

export const newsBreakingSchema = z.object({
  /** 🚨 헤드라인 */
  headline: z.string(),
  /** 소스/출처 (선택) */
  source: z.string().optional(),
  /** 요약 포인트들 */
  points: z.array(z.string()).default([]),
  /** 내 의견/해석 */
  opinion: z.string().optional(),
  
  /** 배경 이미지 (뉴스 관련) */
  backgroundImage: z.string().optional(),
  
  /** 타이밍 (프레임, 60fps 기준) */
  alertDuration: z.number().default(120), // 2초 - 🚨 알림
  headlineDuration: z.number().default(180), // 3초 - 헤드라인
  pointsDuration: z.number().default(300), // 5초 - 포인트들
  opinionDuration: z.number().default(180), // 3초 - 의견
  
  /** 스타일 */
  headlineFontSize: z.number().default(56),
  pointsFontSize: z.number().default(40),
  alertColor: z.string().default("#FF3B30"), // 빨강
  accentColor: z.string().default("#FFD700"), // 골드
});

export type NewsBreakingProps = z.infer<typeof newsBreakingSchema>;

// ==========================================
// 컴포넌트
// ==========================================

const AlertSection: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  
  const flash = interpolate(
    frame % 20,
    [0, 10, 20],
    [1, 0.7, 1]
  );
  
  const scale = spring({
    frame,
    fps: 60,
    config: { damping: 8, stiffness: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity: flash,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 20 }}>🚨</div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: color,
            fontFamily: "Pretendard, Inter, sans-serif",
            letterSpacing: 8,
          }}
        >
          BREAKING
        </div>
      </div>
    </AbsoluteFill>
  );
};

const HeadlineSection: React.FC<{
  headline: string;
  source?: string;
  fontSize: number;
  backgroundImage?: string;
}> = ({ headline, source, fontSize, backgroundImage }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const slideUp = interpolate(frame, [0, 20], [50, 0], {
    extrapolateRight: "clamp",
  });
  
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* 배경 이미지 (있으면) */}
      {backgroundImage && (
        <>
          <Img
            src={backgroundImage}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.3,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.95))",
            }}
          />
        </>
      )}
      
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
        }}
      >
        <div
          style={{
            transform: `translateY(${slideUp}px)`,
            opacity,
            textAlign: "center",
            maxWidth: "90%",
          }}
        >
          {/* 상단 라벨 */}
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#FF3B30",
              marginBottom: 20,
              letterSpacing: 4,
            }}
          >
            🚨 속보
          </div>
          
          {/* 헤드라인 */}
          <div
            style={{
              fontSize,
              fontWeight: 800,
              color: "#fff",
              fontFamily: "Pretendard, Inter, sans-serif",
              lineHeight: 1.4,
            }}
          >
            {headline}
          </div>
          
          {/* 출처 */}
          {source && (
            <div
              style={{
                fontSize: 20,
                color: "#888",
                marginTop: 30,
              }}
            >
              출처: {source}
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const PointsSection: React.FC<{
  points: string[];
  fontSize: number;
  accentColor: string;
}> = ({ points, fontSize, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const framesPerPoint = 60; // 1초씩

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        justifyContent: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: accentColor,
          marginBottom: 30,
        }}
      >
        왜 중요한가
      </div>
      
      {points.map((point, index) => {
        const pointStart = index * framesPerPoint;
        const opacity = interpolate(
          frame,
          [pointStart, pointStart + 15],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const slideX = interpolate(
          frame,
          [pointStart, pointStart + 15],
          [-30, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        
        return (
          <div
            key={index}
            style={{
              fontSize,
              fontWeight: 600,
              color: "#fff",
              fontFamily: "Pretendard, Inter, sans-serif",
              marginBottom: 25,
              opacity,
              transform: `translateX(${slideX}px)`,
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <span style={{ color: accentColor, marginRight: 15 }}>·</span>
            {point}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const OpinionSection: React.FC<{
  opinion: string;
  fontSize: number;
}> = ({ opinion, fontSize }) => {
  const frame = useCurrentFrame();
  
  const scale = spring({
    frame,
    fps: 60,
    config: { damping: 12, stiffness: 180 },
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
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#888",
            marginBottom: 20,
          }}
        >
          내 생각
        </div>
        <div style={{ fontSize: 60, marginBottom: 20 }}>🦞</div>
        <div
          style={{
            fontSize,
            fontWeight: 700,
            color: "#fff",
            fontFamily: "Pretendard, Inter, sans-serif",
            lineHeight: 1.5,
            maxWidth: 800,
          }}
        >
          {opinion}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// 메인 컴포지션
// ==========================================

export const NewsBreaking: React.FC<NewsBreakingProps> = ({
  headline,
  source,
  points,
  opinion,
  backgroundImage,
  alertDuration,
  headlineDuration,
  pointsDuration,
  opinionDuration,
  headlineFontSize,
  pointsFontSize,
  alertColor,
  accentColor,
}) => {
  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Alert (2초) */}
      <Sequence from={currentFrame} durationInFrames={alertDuration}>
        <AlertSection color={alertColor} />
      </Sequence>
      {(currentFrame += alertDuration)}

      {/* Headline (3초) */}
      <Sequence from={currentFrame} durationInFrames={headlineDuration}>
        <HeadlineSection
          headline={headline}
          source={source}
          fontSize={headlineFontSize}
          backgroundImage={backgroundImage}
        />
      </Sequence>
      {(currentFrame += headlineDuration)}

      {/* Points (5초) - 포인트가 있을 때만 */}
      {points.length > 0 && (
        <>
          <Sequence from={currentFrame} durationInFrames={pointsDuration}>
            <PointsSection
              points={points}
              fontSize={pointsFontSize}
              accentColor={accentColor}
            />
          </Sequence>
          {(currentFrame += pointsDuration)}
        </>
      )}

      {/* Opinion (3초) - 의견이 있을 때만 */}
      {opinion && (
        <Sequence from={currentFrame} durationInFrames={opinionDuration}>
          <OpinionSection opinion={opinion} fontSize={pointsFontSize} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

export default NewsBreaking;
