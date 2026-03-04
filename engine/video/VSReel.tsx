import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  Img,
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

export const vsTextItemSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  durationFrames: z.number(),
});

export const vsLogoSchema = z.object({
  /** 로고 타입: image(기본) 또는 ascii */
  type: z.enum(["image", "ascii"]).default("image"),
  /** 로고 이미지 파일 (media/ 기준) — type=image일 때 사용 */
  file: z.string(),
  /** ASCII 아트 텍스트 — type=ascii일 때 사용 */
  asciiText: z.string().optional(),
  /** ASCII 폰트 크기 */
  asciiFontSize: z.number().optional(),
  /** 로고 라벨 */
  label: z.string().optional(),
});

export const vsBackgroundSchema = z.object({
  file: z.string(),
  startFrom: z.number().default(0),
  startFrame: z.number().optional(),
  durationFrames: z.number().optional(),
});

export const vsReelSchema = z.object({
  /** 상단 50% 전체를 덮는 헤더 이미지 (설정 시 로고 배지 대신 사용) */
  headerImage: z.string().optional(),
  /** 왼쪽 로고 (예: ClaudeCode) */
  logoLeft: vsLogoSchema,
  /** 오른쪽 로고 (예: OpenClaw) */
  logoRight: vsLogoSchema,
  /** 로고 표시 시작 프레임 */
  logoStartFrame: z.number().default(0),
  /** 로고 표시 지속 프레임 (0 = 전체) */
  logoDurationFrames: z.number().default(0),
  /** VS 텍스트 표시 여부 */
  showVS: z.boolean().default(true),

  /** 텍스트 시퀀스 */
  texts: z.array(vsTextItemSchema),

  /** 배경 영상 (하단 50%) */
  backgrounds: z.array(vsBackgroundSchema),
  backgroundCrossfade: z.number().default(0),

  /** 스타일 */
  fontSize: z.number().default(48),
  fontWeight: z.number().default(700),
  logoSize: z.number().default(120),
  videoScale: z.number().default(1.15),

  /** 아웃트로 */
  showOutro: z.boolean().default(false),
  outroDuration: z.number().default(0),
  outroText: z.string().default(""),
  outroEmoji: z.string().default(""),

  /** 배경음악 */
  bgmFile: z.string().optional(),
  bgmVolume: z.number().min(0).max(1).default(0.3),
});

export type VSTextItem = z.infer<typeof vsTextItemSchema>;
export type VSLogo = z.infer<typeof vsLogoSchema>;
export type VSBackground = z.infer<typeof vsBackgroundSchema>;
export type VSReelProps = z.infer<typeof vsReelSchema>;

// ==========================================
// 로고 + VS 배지 컴포넌트
// ==========================================

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"];
const isImageFile = (filename: string): boolean => {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  return IMAGE_EXTENSIONS.includes(ext);
};

const LogoBadge: React.FC<{
  logoLeft: VSLogo;
  logoRight: VSLogo;
  logoSize: number;
  showVS: boolean;
}> = ({ logoLeft, logoRight, logoSize, showVS }) => {
  const frame = useCurrentFrame();

  // 왼쪽 로고: 왼쪽에서 슬라이드 인
  const leftX = interpolate(frame, [0, 20], [-100, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const leftOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // 오른쪽 로고: 오른쪽에서 슬라이드 인
  const rightX = interpolate(frame, [5, 25], [100, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const rightOpacity = interpolate(frame, [5, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // VS 텍스트: 스케일 인
  const vsScale = interpolate(frame, [15, 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });
  const vsOpacity = interpolate(frame, [15, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        marginBottom: 24,
      }}
    >
      {/* 왼쪽 로고 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          opacity: leftOpacity,
          transform: `translateX(${leftX}px)`,
        }}
      >
        {logoLeft.type === "ascii" && logoLeft.asciiText ? (
          <pre
            style={{
              margin: 0,
              padding: 12,
              fontSize: logoLeft.asciiFontSize || Math.round(logoSize * 0.14),
              fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
              fontWeight: 700,
              color: "#e8dcb4",
              backgroundColor: "rgba(30, 30, 30, 0.85)",
              borderRadius: 16,
              lineHeight: 1.15,
              letterSpacing: 0,
              whiteSpace: "pre",
              textAlign: "center",
              minWidth: logoSize,
              minHeight: logoSize,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {logoLeft.asciiText}
          </pre>
        ) : (
          <Img
            src={staticFile(`media/${logoLeft.file}`)}
            style={{
              width: logoSize,
              height: logoSize,
              objectFit: "contain",
              borderRadius: 16,
            }}
          />
        )}
        {logoLeft.label && (
          <span
            style={{
              fontSize: 18,
              fontFamily: "SF Pro Display, system-ui, sans-serif",
              fontWeight: 600,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            {logoLeft.label}
          </span>
        )}
      </div>

      {/* VS */}
      {showVS && (
        <div
          style={{
            fontSize: 28,
            fontFamily: "SF Pro Display, system-ui, sans-serif",
            fontWeight: 800,
            color: "rgba(255,255,255,0.5)",
            opacity: vsOpacity,
            transform: `scale(${vsScale})`,
          }}
        >
          vs
        </div>
      )}

      {/* 오른쪽 로고 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          opacity: rightOpacity,
          transform: `translateX(${rightX}px)`,
        }}
      >
        {logoRight.type === "ascii" && logoRight.asciiText ? (
          <pre
            style={{
              margin: 0,
              padding: 12,
              fontSize: logoRight.asciiFontSize || Math.round(logoSize * 0.14),
              fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
              fontWeight: 700,
              color: "#e8dcb4",
              backgroundColor: "rgba(30, 30, 30, 0.85)",
              borderRadius: 16,
              lineHeight: 1.15,
              letterSpacing: 0,
              whiteSpace: "pre",
              textAlign: "center",
              minWidth: logoSize,
              minHeight: logoSize,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {logoRight.asciiText}
          </pre>
        ) : (
          <Img
            src={staticFile(`media/${logoRight.file}`)}
            style={{
              width: logoSize,
              height: logoSize,
              objectFit: "contain",
              borderRadius: 16,
            }}
          />
        )}
        {logoRight.label && (
          <span
            style={{
              fontSize: 18,
              fontFamily: "SF Pro Display, system-ui, sans-serif",
              fontWeight: 600,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            {logoRight.label}
          </span>
        )}
      </div>
    </div>
  );
};

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

  const animDuration = Math.min(20, Math.floor(durationFrames / 4));
  const fadeInEnd = animDuration;
  const fadeOutStart = Math.max(fadeInEnd + 1, durationFrames - animDuration);

  // startFrame이 0이고 duration이 전체일 때는 애니메이션 없이 바로 표시
  const isStatic = fadeInEnd === 0 || durationFrames > 300;

  let opacity = 1;
  if (!isStatic) {
    if (frame < fadeInEnd) {
      opacity = frame / fadeInEnd;
    } else if (frame > fadeOutStart) {
      opacity = Math.max(0, 1 - (frame - fadeOutStart) / (durationFrames - fadeOutStart));
    }
  }

  const translateY = isStatic ? 0 : interpolate(
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
        whiteSpace: "pre-line",
      }}
    >
      {text}
    </div>
  );
};

// ==========================================
// 배경 영상 컴포넌트
// ==========================================

const BackgroundClip: React.FC<{
  file: string;
  startFrom: number;
  videoScale: number;
}> = ({ file, startFrom, videoScale }) => {
  const { width, height } = useVideoConfig();
  // 하단 50% 고정
  const videoHeight = height / 2;
  const isImage = isImageFile(file);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: videoHeight,
        overflow: "hidden",
      }}
    >
      {isImage ? (
        <Img
          src={staticFile(`media/${file}`)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <OffthreadVideo
          src={staticFile(`media/${file}`)}
          startFrom={startFrom}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
    </div>
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

export const VSReel: React.FC<VSReelProps> = ({
  headerImage,
  logoLeft,
  logoRight,
  logoStartFrame,
  logoDurationFrames,
  showVS,
  texts,
  backgrounds,
  backgroundCrossfade,
  fontSize,
  fontWeight,
  logoSize,
  videoScale,
  showOutro,
  outroDuration,
  outroText,
  outroEmoji,
  bgmFile,
  bgmVolume = 0.3,
}) => {
  const { width, height } = useVideoConfig();

  // 영역 계산: 상단 50% = 콘텐츠, 하단 50% = 영상
  const topAreaHeight = height / 2;

  // 메인 duration
  const lastText = texts[texts.length - 1];
  const mainDuration = lastText.startFrame + lastText.durationFrames;

  // 로고 duration (0이면 전체)
  const actualLogoDuration = logoDurationFrames > 0 ? logoDurationFrames : mainDuration;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* 배경 영상 (하단) */}
      {backgrounds.map((bg, index) => {
        const hasSequence = bg.startFrame !== undefined && bg.durationFrames !== undefined;
        if (hasSequence) {
          return (
            <Sequence
              key={index}
              name={`BG: ${bg.file}`}
              from={bg.startFrame!}
              durationInFrames={bg.durationFrames!}
            >
              <BackgroundClip
                file={bg.file}
                startFrom={bg.startFrom || 0}
                videoScale={videoScale}
              />
            </Sequence>
          );
        }
        return (
          <BackgroundClip
            key={index}
            file={bg.file}
            startFrom={bg.startFrom || 0}
            videoScale={videoScale}
          />
        );
      })}

      {/* 상단 50% 콘텐츠 영역 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: topAreaHeight,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: headerImage ? 20 : 40,
          overflow: "hidden",
        }}
      >
        {/* 헤더 이미지 배경 (설정 시) */}
        {headerImage && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Img
              src={staticFile(`media/${headerImage}`)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* 텍스트 가독성을 위한 하단 그라데이션 오버레이 */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.8) 100%)",
              }}
            />
          </div>
        )}

        {/* 로고 + VS 배지 (headerImage 없을 때만) */}
        {!headerImage && (
          <Sequence
            name="Logo Badge"
            from={logoStartFrame}
            durationInFrames={actualLogoDuration}
            layout="none"
          >
            <LogoBadge
              logoLeft={logoLeft}
              logoRight={logoRight}
              logoSize={logoSize}
              showVS={showVS}
            />
          </Sequence>
        )}

      </div>

      {/* 텍스트 — 상단/하단 경계에 위치 */}
      <div
        style={{
          position: "absolute",
          top: topAreaHeight - fontSize * 1.5,
          left: 0,
          right: 0,
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",

        }}
      >
        {texts.map((item, index) => (
          <Sequence
            key={index}
            name={`Text: ${item.text.substring(0, 20)}`}
            from={item.startFrame}
            durationInFrames={item.durationFrames}
            layout="none"
          >
            <AnimatedText
              text={item.text}
              fontSize={fontSize}
              fontWeight={fontWeight}
              durationFrames={item.durationFrames}
            />
          </Sequence>
        ))}
      </div>

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

export const calculateVSReelDuration = (props: VSReelProps): number => {
  const lastText = props.texts[props.texts.length - 1];
  const mainDuration = lastText.startFrame + lastText.durationFrames;
  return mainDuration + (props.showOutro ? props.outroDuration : 0);
};

// ==========================================
// 기본 Props
// ==========================================

const CLAUDE_CODE_ASCII = `╭──────────────────╮
│                  │
│   ╭──╮  ╭──╮    │
│   │  ╰──╯  │    │
│   ╰────────╯    │
│                  │
│  claude code     │
╰──────────────────╯`;

export const defaultVSReelProps: VSReelProps = {
  headerImage: "claude-vs-openclaw-v5.png",
  logoLeft: {
    type: "ascii",
    file: "claude-code-logo.png",
    asciiText: CLAUDE_CODE_ASCII,
    asciiFontSize: 11,
    label: "Claude Code",
  },
  logoRight: { type: "image", file: "openclaw-logo.png", label: "OpenClaw" },
  logoStartFrame: 0,
  logoDurationFrames: 0,
  showVS: true,
  texts: [
    { text: "🦞 OpenClaw를 활용한 요즘 개발 워크플로우\n(캡션 참고)", startFrame: 0, durationFrames: 420 },
  ],
  backgrounds: [
    { file: "DJI_20260116184854_0130_D.MP4", startFrom: 796, startFrame: 0, durationFrames: 420 },
  ],
  backgroundCrossfade: 0,
  fontSize: 44,
  fontWeight: 700,
  logoSize: 120,
  videoScale: 1.15,
  showOutro: false,
  outroDuration: 0,
  outroText: "",
  outroEmoji: "",
  bgmFile: undefined,
  bgmVolume: 0.3,
};
