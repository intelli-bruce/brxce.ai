import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { z } from "zod";

// ==========================================
// 스키마 정의
// ==========================================

export const textItemSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  durationFrames: z.number(),
});

export const backgroundVideoSchema = z.object({
  file: z.string(),
  startFrom: z.number().optional(),  // 영상 내 시작 지점 (프레임)
  startFrame: z.number().optional(),  // 컴포지션에서 시작 프레임
  durationFrames: z.number().optional(),  // 재생 시간 (프레임)
});

export const textOverVideoSchema = z.object({
  // 배경 영상 (1-2개, 교차 가능)
  backgrounds: z.array(backgroundVideoSchema),
  backgroundCrossfade: z.number().default(0), // 배경 전환 프레임

  // 텍스트 시퀀스
  texts: z.array(textItemSchema),

  // 스타일 설정
  fontSize: z.number().default(52),
  fontWeight: z.number().default(700),
  textPosition: z.enum(["top", "center", "bottom"]).default("top"),
  videoScale: z.number().default(1.15),

  // 아웃트로
  showOutro: z.boolean().default(false),
  outroDuration: z.number().default(0),
  outroText: z.string().default(""),
  outroEmoji: z.string().default(""),

  // 배경음악
  bgmFile: z.string().optional(),
  bgmVolume: z.number().min(0).max(1).default(0.3),
});

export type TextItem = z.infer<typeof textItemSchema>;
export type BackgroundVideo = z.infer<typeof backgroundVideoSchema>;
export type TextOverVideoProps = z.infer<typeof textOverVideoSchema>;

// ==========================================
// 텍스트 애니메이션 컴포넌트
// ==========================================

const AnimatedText: React.FC<{
  text: string;
  fontSize: number;
  fontWeight: number;
  durationFrames: number;
}> = ({ text, fontSize, fontWeight, durationFrames }) => {
  const frame = useCurrentFrame();

  // 애니메이션 시간 계산 (최소 duration 보장)
  const animDuration = Math.min(20, Math.floor(durationFrames / 4));
  const fadeInEnd = animDuration;
  const fadeOutStart = Math.max(fadeInEnd + 1, durationFrames - animDuration);

  // opacity 계산
  let opacity = 1;
  if (frame < fadeInEnd) {
    opacity = frame / fadeInEnd;
  } else if (frame > fadeOutStart) {
    opacity = Math.max(0, 1 - (frame - fadeOutStart) / (durationFrames - fadeOutStart));
  }

  // 슬라이드 업
  const translateY = interpolate(
    frame,
    [0, fadeInEnd],
    [15, 0],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  return (
    <div
      style={{
        fontSize,
        fontFamily: "SF Pro Display, system-ui, sans-serif",
        fontWeight,
        color: "white",
        letterSpacing: -1,
        textAlign: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
        textShadow: "0 2px 10px rgba(0,0,0,0.5)",
        padding: "0 40px",
        lineHeight: 1.3,
      }}
    >
      {text}
    </div>
  );
};

// ==========================================
// 배경 영상 컴포넌트
// ==========================================

// 단일 배경 클립 컴포넌트
const BackgroundClip: React.FC<{
  file: string;
  startFrom: number;
  videoScale: number;
}> = ({ file, startFrom, videoScale }) => {
  const { width, height } = useVideoConfig();
  const videoHeight = (width / 16) * 9 * videoScale;
  const videoTop = (height - videoHeight) / 2;

  return (
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
        src={staticFile(`media/${file}`)}
        startFrom={startFrom}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
};

const BackgroundLayer: React.FC<{
  backgrounds: BackgroundVideo[];
  videoScale: number;
  crossfadeDuration: number;
  totalDuration: number;
}> = ({ backgrounds, videoScale, crossfadeDuration, totalDuration }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // 비디오 영역 계산 (원본 16:9 비율 유지, 확대)
  const videoHeight = (width / 16) * 9 * videoScale;
  const videoTop = (height - videoHeight) / 2;

  // 새로운 방식: 각 배경에 startFrame, durationFrames가 있으면 Sequence 사용
  const hasSequenceInfo = backgrounds.some(bg => bg.startFrame !== undefined && bg.durationFrames !== undefined);

  if (hasSequenceInfo) {
    // Sequence 기반 배경 렌더링
    return (
      <>
        {backgrounds.map((bg, index) => {
          if (bg.startFrame === undefined || bg.durationFrames === undefined) return null;
          return (
            <Sequence
              key={index}
              name={`BG: ${bg.file}`}
              from={bg.startFrame}
              durationInFrames={bg.durationFrames}
            >
              <BackgroundClip
                file={bg.file}
                startFrom={bg.startFrom || 0}
                videoScale={videoScale}
              />
            </Sequence>
          );
        })}
      </>
    );
  }

  // 기존 방식: 단일 배경 또는 크로스페이드
  if (backgrounds.length === 1) {
    return (
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
          src={staticFile(`media/${backgrounds[0].file}`)}
          startFrom={backgrounds[0].startFrom || 0}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }

  // 2개 배경 교차 (레거시 - startFrame/durationFrames 없는 경우)
  const switchFrame = Math.floor(totalDuration / 2);
  const opacity1 = interpolate(
    frame,
    [switchFrame - crossfadeDuration, switchFrame],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity2 = interpolate(
    frame,
    [switchFrame - crossfadeDuration, switchFrame],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: videoTop,
          left: 0,
          right: 0,
          height: videoHeight,
          overflow: "hidden",
          opacity: opacity1,
        }}
      >
        <OffthreadVideo
          src={staticFile(`media/${backgrounds[0].file}`)}
          startFrom={backgrounds[0].startFrom || 0}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: videoTop,
          left: 0,
          right: 0,
          height: videoHeight,
          overflow: "hidden",
          opacity: opacity2,
        }}
      >
        <OffthreadVideo
          src={staticFile(`media/${backgrounds[1].file}`)}
          startFrom={backgrounds[1].startFrom || 0}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </>
  );
};

// ==========================================
// 아웃트로 컴포넌트
// ==========================================

const Outro: React.FC<{ text: string; emoji: string }> = ({ text, emoji }) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, 20], [0.8, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  const textOpacity = interpolate(frame, [20, 40], [0, 1], {
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
        <div style={{ fontSize: 80, marginBottom: 24, transform: `scale(${scale})` }}>
          {emoji}
        </div>
        <p
          style={{
            fontSize: 32,
            fontFamily: "SF Pro Display, system-ui, sans-serif",
            fontWeight: 600,
            color: "white",
            opacity: textOpacity,
          }}
        >
          {text}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// 메인 컴포지션
// ==========================================

export const TextOverVideo: React.FC<TextOverVideoProps> = ({
  backgrounds,
  backgroundCrossfade,
  texts,
  fontSize,
  fontWeight,
  textPosition,
  videoScale,
  showOutro,
  outroDuration,
  outroText,
  outroEmoji,
  bgmFile,
  bgmVolume = 0.3,
}) => {
  const { width, height } = useVideoConfig();

  // 텍스트 위치 계산
  const videoHeight = (width / 16) * 9 * videoScale;
  const videoTop = (height - videoHeight) / 2;

  const textContainerStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  if (textPosition === "top") {
    textContainerStyle.top = 0;
    textContainerStyle.height = videoTop;
    textContainerStyle.alignItems = "flex-end";
    textContainerStyle.paddingBottom = 40;
  } else if (textPosition === "bottom") {
    textContainerStyle.bottom = 0;
    textContainerStyle.height = videoTop;
    textContainerStyle.alignItems = "flex-start";
    textContainerStyle.paddingTop = 40;
  } else {
    textContainerStyle.top = 0;
    textContainerStyle.bottom = 0;
  }

  // 메인 콘텐츠 duration (아웃트로 제외)
  const lastText = texts[texts.length - 1];
  const mainDuration = lastText.startFrame + lastText.durationFrames;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* 배경 영상 */}
      <BackgroundLayer
        backgrounds={backgrounds}
        videoScale={videoScale}
        crossfadeDuration={backgroundCrossfade}
        totalDuration={mainDuration}
      />

      {/* 텍스트 시퀀스 */}
      {texts.map((item, index) => (
        <Sequence
          key={index}
          name={`Text: ${item.text.substring(0, 20)}`}
          from={item.startFrame}
          durationInFrames={item.durationFrames}
        >
          <div style={textContainerStyle}>
            <AnimatedText
              text={item.text}
              fontSize={fontSize}
              fontWeight={fontWeight}
              durationFrames={item.durationFrames}
            />
          </div>
        </Sequence>
      ))}

      {/* 배경음악 */}
      {bgmFile && (
        <Audio
          src={staticFile(`bgm/${bgmFile}`)}
          volume={bgmVolume}
        />
      )}

      {/* 아웃트로 */}
      {showOutro && (
        <Sequence
          name="Outro"
          from={mainDuration}
          durationInFrames={outroDuration}
        >
          <Outro text={outroText} emoji={outroEmoji} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

// ==========================================
// Duration 계산 헬퍼
// ==========================================

export const calculateTextOverVideoDuration = (props: TextOverVideoProps): number => {
  const lastText = props.texts[props.texts.length - 1];
  const mainDuration = lastText.startFrame + lastText.durationFrames;
  return mainDuration + (props.showOutro ? props.outroDuration : 0);
};

// ==========================================
// 기본 Props
// ==========================================

export const defaultTextOverVideoProps: TextOverVideoProps = {
  backgrounds: [
    { file: "IMG_0019.MOV", startFrom: 300 },
  ],
  backgroundCrossfade: 30,
  texts: [
    { text: "Your text here", startFrame: 0, durationFrames: 180 },
  ],
  fontSize: 52,
  fontWeight: 700,
  textPosition: "top",
  videoScale: 1.15,
  showOutro: false,
  outroDuration: 0,
  outroText: "",
  outroEmoji: "",
  bgmVolume: 0.3,
};
