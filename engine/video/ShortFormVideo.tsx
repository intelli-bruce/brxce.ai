import React, { useCallback } from 'react'
import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  Img,
  Audio,
  staticFile,
  useVideoConfig,
  interpolate,
  Easing,
  useCurrentFrame,
} from 'remotion'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { slide } from '@remotion/transitions/slide'
import { z } from 'zod'
import {
  captionStyleSchema,
  captionPositionSchema,
  captionConfigSchema,
  type WordTiming,
} from '../shared/types'
import { CaptionRenderer, mergeCaptionConfig, defaultCaptionConfig } from '../shared/CaptionRenderer'

// ==========================================
// 스키마 정의
// ==========================================

export const shortFormSceneSchema = z.object({
  /** 씬 ID (VideoProject.scenes[].id 대응) */
  id: z.string(),
  /** 씬 텍스트 */
  text: z.string(),
  /** 씬 지속 시간 (프레임) */
  durationFrames: z.number(),
  /** 씬별 자막 설정 오버라이드 */
  captionConfig: captionConfigSchema.optional(),
  /** TTS 오디오 파일 경로 (tts/ 기준) */
  audioFile: z.string().optional(),
  /** TTS 오디오 길이 (밀리초) */
  audioDurationMs: z.number().optional(),
  /** Word-level 타이밍 (TTS 동기화용) */
  wordTimings: z.array(z.object({
    text: z.string(),
    startMs: z.number(),
    endMs: z.number(),
  })).optional(),
})

export const shortFormBackgroundSchema = z.object({
  /** 파일명 */
  file: z.string(),
  /** 영상 내 시작 지점 (프레임) */
  startFrom: z.number().default(0),
  /** 컴포지션 내 시작 프레임 */
  startFrame: z.number(),
  /** 재생 시간 (프레임) */
  durationFrames: z.number(),
})

export const transitionTypeSchema = z.enum(['none', 'fade', 'slide-left', 'slide-right', 'slide-up', 'slide-down'])

export const shortFormVideoSchema = z.object({
  /** 씬 목록 */
  scenes: z.array(shortFormSceneSchema),
  /** 배경 영상 목록 */
  backgrounds: z.array(shortFormBackgroundSchema),
  /** 영상 스케일 (9:16 내 16:9 영상 확대) */
  videoScale: z.number().default(1.15),
  /** 기본 자막 설정 */
  defaultCaptionConfig: captionConfigSchema.optional(),
  /** 아웃트로 표시 여부 */
  showOutro: z.boolean().default(false),
  /** 아웃트로 길이 (프레임) */
  outroDuration: z.number().default(0),
  /** 아웃트로 텍스트 */
  outroText: z.string().default(''),
  /** 아웃트로 이모지 */
  outroEmoji: z.string().default(''),
  /** TTS 오디오 활성화 */
  enableTts: z.boolean().default(true),
  /** 전체 스크립트 오디오 파일 (씬별 오디오 대신 사용) */
  fullAudioFile: z.string().optional(),
  /** TTS 볼륨 (0-1) */
  ttsVolume: z.number().min(0).max(1).default(1),
  /** 배경음악 파일 (bgm/ 폴더 기준) */
  bgmFile: z.string().optional(),
  /** 배경음악 볼륨 (0-1) */
  bgmVolume: z.number().min(0).max(1).default(0.3),
  /** 씬 전환 효과 */
  sceneTransition: transitionTypeSchema.default('fade'),
  /** 씬 전환 시간 (프레임) */
  transitionDuration: z.number().default(15),
  /** 오디오 페이드 시간 (프레임) */
  audioFadeDuration: z.number().default(15),
})

export type ShortFormScene = z.infer<typeof shortFormSceneSchema>
export type ShortFormBackground = z.infer<typeof shortFormBackgroundSchema>
export type ShortFormVideoProps = z.infer<typeof shortFormVideoSchema>
export type TransitionType = z.infer<typeof transitionTypeSchema>

// ==========================================
// 배경 영상/이미지 컴포넌트
// ==========================================

/** 이미지 확장자 목록 (브라우저 지원 포맷만) */
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']

/** 파일이 이미지인지 확인 */
const isImageFile = (filename: string): boolean => {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'))
  return IMAGE_EXTENSIONS.includes(ext)
}

const BackgroundClip: React.FC<{
  file: string
  startFrom: number
  videoScale: number
}> = ({ file, startFrom, videoScale }) => {
  const { width, height } = useVideoConfig()
  const videoHeight = (width / 16) * 9 * videoScale
  const videoTop = (height - videoHeight) / 2
  const isImage = isImageFile(file)

  return (
    <div
      style={{
        position: 'absolute',
        top: videoTop,
        left: 0,
        right: 0,
        height: videoHeight,
        overflow: 'hidden',
      }}
    >
      {isImage ? (
        <Img
          src={staticFile(`media/${file}`)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <OffthreadVideo
          src={staticFile(`media/${file}`)}
          startFrom={startFrom}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  )
}

// ==========================================
// 아웃트로 컴포넌트
// ==========================================

const OutroInner: React.FC<{ text: string; emoji: string }> = ({ text, emoji }) => {
  const frame = useCurrentFrame()

  const scale = interpolate(frame, [0, 20], [0.8, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.5)),
  })

  const textOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a0a',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
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
            fontSize: 32,
            fontFamily: 'SF Pro Display, system-ui, sans-serif',
            fontWeight: 600,
            color: 'white',
            opacity: textOpacity,
          }}
        >
          {text}
        </p>
      </div>
    </AbsoluteFill>
  )
}

// ==========================================
// 씬 컨텐츠 컴포넌트
// ==========================================

const SceneContent: React.FC<{
  scene: ShortFormScene & { startFrame: number }
  config: ReturnType<typeof mergeCaptionConfig>
  videoTop: number
  width: number
  height: number
}> = ({ scene, config, videoTop, width, height }) => {
  return (
    <AbsoluteFill>
      <CaptionRenderer
        text={scene.text}
        durationFrames={scene.durationFrames}
        config={config}
        videoTop={videoTop}
        width={width}
        height={height}
        wordTimings={scene.wordTimings as WordTiming[] | undefined}
      />
    </AbsoluteFill>
  )
}

// ==========================================
// 전환 효과 헬퍼
// ==========================================

const getTransitionPresentation = (type: TransitionType) => {
  switch (type) {
    case 'fade':
      return fade()
    case 'slide-left':
      return slide({ direction: 'from-right' })
    case 'slide-right':
      return slide({ direction: 'from-left' })
    case 'slide-up':
      return slide({ direction: 'from-bottom' })
    case 'slide-down':
      return slide({ direction: 'from-top' })
    case 'none':
    default:
      return null
  }
}

// ==========================================
// 메인 컴포지션
// ==========================================

export const ShortFormVideo: React.FC<ShortFormVideoProps> = ({
  scenes,
  backgrounds,
  videoScale,
  defaultCaptionConfig: projectCaptionConfig,
  showOutro,
  outroDuration,
  outroText,
  outroEmoji,
  enableTts = true,
  fullAudioFile,
  ttsVolume = 1,
  bgmFile,
  bgmVolume = 0.3,
  sceneTransition = 'fade',
  transitionDuration = 15,
  audioFadeDuration = 15,
}) => {
  const { width, height, fps, durationInFrames } = useVideoConfig()

  // 비디오 영역 계산
  const videoHeight = (width / 16) * 9 * videoScale
  const videoTop = (height - videoHeight) / 2

  // 씬 시작 프레임 계산
  let frameOffset = 0
  const scenesWithTiming = scenes.map((scene) => {
    const startFrame = frameOffset
    frameOffset += scene.durationFrames
    return { ...scene, startFrame }
  })

  const mainDuration = frameOffset

  // 전환 효과 설정
  const presentation = getTransitionPresentation(sceneTransition)
  const useTransitions = presentation !== null && scenes.length > 1

  // 오디오 페이드 인/아웃 볼륨 함수
  const createVolumeFunction = useCallback((baseVolume: number) => {
    return (f: number) => {
      const fadeIn = interpolate(
        f,
        [0, audioFadeDuration],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
      const fadeOut = interpolate(
        f,
        [durationInFrames - audioFadeDuration, durationInFrames],
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
      return baseVolume * Math.min(fadeIn, fadeOut)
    }
  }, [audioFadeDuration, durationInFrames])

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* 배경 영상 레이어 */}
      {backgrounds.map((bg, index) => (
        <Sequence
          key={`bg-${index}`}
          name={`BG: ${bg.file}`}
          from={bg.startFrame}
          durationInFrames={bg.durationFrames}
          premountFor={30}
        >
          <BackgroundClip
            file={bg.file}
            startFrom={bg.startFrom}
            videoScale={videoScale}
          />
        </Sequence>
      ))}

      {/* 자막 레이어 - TransitionSeries 또는 Sequence */}
      {useTransitions ? (
        <TransitionSeries>
          {scenesWithTiming.map((scene, index) => {
            const mergedConfig = mergeCaptionConfig(
              projectCaptionConfig,
              scene.captionConfig
            )

            return (
              <React.Fragment key={scene.id}>
                <TransitionSeries.Sequence
                  durationInFrames={scene.durationFrames}
                >
                  <SceneContent
                    scene={scene}
                    config={mergedConfig}
                    videoTop={videoTop}
                    width={width}
                    height={height}
                  />
                </TransitionSeries.Sequence>
                {index < scenesWithTiming.length - 1 && presentation && (
                  <TransitionSeries.Transition
                    presentation={presentation}
                    timing={linearTiming({ durationInFrames: transitionDuration })}
                  />
                )}
              </React.Fragment>
            )
          })}
        </TransitionSeries>
      ) : (
        // 전환 효과 없이 일반 Sequence 사용
        scenesWithTiming.map((scene) => {
          const mergedConfig = mergeCaptionConfig(
            projectCaptionConfig,
            scene.captionConfig
          )

          return (
            <Sequence
              key={`caption-${scene.id}`}
              name={`Caption: ${scene.text.substring(0, 20)}`}
              from={scene.startFrame}
              durationInFrames={scene.durationFrames}
              premountFor={30}
            >
              <CaptionRenderer
                text={scene.text}
                durationFrames={scene.durationFrames}
                config={mergedConfig}
                videoTop={videoTop}
                width={width}
                height={height}
                wordTimings={scene.wordTimings as WordTiming[] | undefined}
              />
            </Sequence>
          )
        })
      )}

      {/* TTS 오디오 레이어 */}
      {enableTts && fullAudioFile ? (
        // 전체 스크립트 오디오 사용 (페이드 인/아웃 적용)
        <Audio
          src={staticFile(`tts/${fullAudioFile}`)}
          volume={createVolumeFunction(ttsVolume)}
        />
      ) : (
        // 씬별 오디오 사용
        enableTts && scenesWithTiming.map((scene) => {
          if (!scene.audioFile) return null
          return (
            <Sequence
              key={`tts-${scene.id}`}
              name={`TTS: ${scene.text.substring(0, 15)}`}
              from={scene.startFrame}
              durationInFrames={scene.durationFrames}
            >
              <Audio
                src={staticFile(`tts/${scene.audioFile}`)}
                volume={ttsVolume}
              />
            </Sequence>
          )
        })
      )}

      {/* 배경음악 레이어 (페이드 인/아웃 적용) */}
      {bgmFile && (
        <Audio
          src={staticFile(`bgm/${bgmFile}`)}
          volume={createVolumeFunction(bgmVolume)}
        />
      )}

      {/* 아웃트로 */}
      {showOutro && outroDuration > 0 && (
        <Sequence
          name="Outro"
          from={mainDuration}
          durationInFrames={outroDuration}
        >
          <OutroInner text={outroText} emoji={outroEmoji} />
        </Sequence>
      )}
    </AbsoluteFill>
  )
}

// ==========================================
// Duration 계산 헬퍼
// ==========================================

export const calculateShortFormDuration = (props: ShortFormVideoProps): number => {
  const mainDuration = props.scenes.reduce(
    (sum, scene) => sum + scene.durationFrames,
    0
  )
  return mainDuration + (props.showOutro ? props.outroDuration : 0)
}

// ==========================================
// 기본 Props
// ==========================================

export const defaultShortFormVideoProps: ShortFormVideoProps = {
  scenes: [
    {
      id: 'scene-1',
      text: 'AI 덕분에 생산성 10배 올랐다는데',
      durationFrames: 150,
    },
    {
      id: 'scene-2',
      text: '왜 나는 더 바빠졌을까?',
      durationFrames: 120,
    },
    {
      id: 'scene-3',
      text: '진짜 문제는 AI가 아니라\n우리의 기대치다',
      durationFrames: 180,
    },
  ],
  backgrounds: [
    {
      file: 'IMG_0019.MOV',
      startFrom: 0,
      startFrame: 0,
      durationFrames: 450,
    },
  ],
  videoScale: 1.15,
  defaultCaptionConfig: {
    style: 'karaoke',
    position: 'bottom',
    fontSize: 52,
    fontColor: '#FFFFFF',
    highlightColor: '#FFD700',
  },
  showOutro: false,
  outroDuration: 0,
  outroText: '',
  outroEmoji: '',
  enableTts: true,
  ttsVolume: 1,
  bgmVolume: 0.3,
  sceneTransition: 'fade',
  transitionDuration: 15,
  audioFadeDuration: 15,
}
