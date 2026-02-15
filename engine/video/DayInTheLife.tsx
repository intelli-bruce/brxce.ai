import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { z } from "zod";

// Props 스키마 정의 (Studio UI에서 편집 가능)
export const clipSchema = z.object({
  file: z.string(),
  time: z.string(),
  label: z.string(),
  emoji: z.string(),
});

export const dayInTheLifeSchema = z.object({
  clips: z.array(clipSchema),
  clipDuration: z.number().min(30).max(300),
  transitionDuration: z.number().min(0).max(60),
  showOutro: z.boolean(),
  outroDuration: z.number().min(0).max(120),
  outroText: z.string(),
  outroEmoji: z.string(),
  subtitle: z.string(),
  videoScale: z.number().min(0.5).max(2),
});

export type DayInTheLifeProps = z.infer<typeof dayInTheLifeSchema>;

// 기본 클립 데이터 (VideoProject: Claude Code로 개발 생산성 10배 높이기)
export const DEFAULT_CLIPS = [
  { file: "IMG_0019.MOV", time: "", label: "하루 8시간 코딩하던", emoji: "💻" },
  { file: "IMG_0007.MOV", time: "", label: "개발자가 2시간만에", emoji: "⚡" },
  { file: "IMG_0013.MOV", time: "", label: "퇴근하는 비결?", emoji: "🚀" },
];

// 기본 Props (60fps 기준)
export const defaultProps: DayInTheLifeProps = {
  clips: DEFAULT_CLIPS,
  clipDuration: 180,        // 3초 (60fps × 3)
  transitionDuration: 30,   // 0.5초 전환
  showOutro: true,          // 아웃트로 있음
  outroDuration: 120,       // 2초
  outroText: "Claude Code",
  outroEmoji: "🤖",
  subtitle: "",
  videoScale: 1.15,
};

// 개별 클립 컴포넌트 (레퍼런스 스타일: 원본비율 확대 + 상단 텍스트)
const TimelapseClip: React.FC<{
  src: string;
  time: string;
  label: string;
  emoji: string;
  clipDuration: number;
  transitionDuration: number;
  subtitle: string;
  videoScale: number;
}> = ({ src, label, clipDuration, transitionDuration, videoScale }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // 텍스트 페이드인 (60fps 기준 40프레임 = 0.67초)
  const textOpacity = interpolate(frame, [0, 40], [0, 1], {
    extrapolateRight: "clamp",
  });

  // 텍스트 슬라이드
  const textY = interpolate(frame, [0, 40], [20, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // 페이드아웃 (전환이 있을 때만)
  const fadeOut = transitionDuration > 0
    ? interpolate(
        frame,
        [clipDuration - transitionDuration, clipDuration],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 1;

  // 비디오 영역 계산 (원본 16:9 비율 유지, 살짝 확대)
  const videoHeight = (width / 16) * 9 * videoScale;
  const videoTop = (height - videoHeight) / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", opacity: fadeOut }}>
      {/* 비디오 영역 (가운데, 원본 비율 확대) */}
      <div
        style={{
          position: "absolute",
          top: videoTop,
          left: 0,
          right: 0,
          height: videoHeight,
          overflow: "hidden",
        }}
      >
        <OffthreadVideo
          src={staticFile(`media/${src}`)}
          startFrom={840}  // 14초부터 시작 (영상 중간)
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* 상단 검은 배경 + 텍스트 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: videoTop,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          paddingBottom: 40,
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontFamily: "SF Pro Display, system-ui, sans-serif",
            fontWeight: 700,
            color: "white",
            letterSpacing: -1,
            whiteSpace: "pre",
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 아웃트로 컴포넌트
const Outro: React.FC<{ text: string; emoji: string }> = ({ text, emoji }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame,
    config: { damping: 200 },
  });

  const textOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 80,
            marginBottom: 24,
            transform: `scale(${scale})`,
          }}
        >
          {emoji}
        </div>
        <p
          style={{
            fontSize: 24,
            fontFamily: "SF Pro Display, system-ui, sans-serif",
            fontWeight: 500,
            color: "#666",
            opacity: textOpacity,
          }}
        >
          {text}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// 메인 컴포지션
export const DayInTheLife: React.FC<DayInTheLifeProps> = ({
  clips,
  clipDuration,
  transitionDuration,
  showOutro,
  outroDuration,
  outroText,
  outroEmoji,
  subtitle,
  videoScale,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* 타임랩스 클립들 */}
      {clips.map((clip, index) => (
        <Sequence
          key={clip.file}
          name={`${clip.time} - ${clip.label}`}
          from={index * (clipDuration - transitionDuration)}
          durationInFrames={clipDuration}
        >
          <TimelapseClip
            src={clip.file}
            time={clip.time}
            label={clip.label}
            emoji={clip.emoji}
            clipDuration={clipDuration}
            transitionDuration={transitionDuration}
            subtitle={subtitle}
            videoScale={videoScale}
          />
        </Sequence>
      ))}

      {/* 아웃트로 */}
      {showOutro && (
        <Sequence
          name="Outro"
          from={clips.length * (clipDuration - transitionDuration) - transitionDuration}
          durationInFrames={outroDuration}
        >
          <Outro text={outroText} emoji={outroEmoji} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

// 총 duration 계산 헬퍼
export const calculateDuration = (props: DayInTheLifeProps): number => {
  const clipsDuration =
    props.clips.length * (props.clipDuration - props.transitionDuration);
  const outroDuration = props.showOutro ? props.outroDuration : 0;
  return clipsDuration + outroDuration;
};
