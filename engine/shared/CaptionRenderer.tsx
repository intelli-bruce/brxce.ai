import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, Easing, spring } from 'remotion'
import type { CaptionConfig, CaptionPosition, WordTiming } from './types'
import { frameToMs } from './types'

// ==========================================
// Caption Props 공통 인터페이스
// ==========================================

export interface CaptionProps {
  text: string
  durationFrames: number
  config: CaptionConfig
  videoTop: number
  width: number
  height: number
  wordTimings?: WordTiming[]
  sceneStartMs?: number
}

export const defaultCaptionConfig: Required<CaptionConfig> = {
  style: 'boxed',
  position: 'bottom',
  fontSize: 48,
  fontColor: '#FFFFFF',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  highlightColor: '#FFD700',
  highlightWords: [],
  typewriterSpeed: 50,
}

export function getPositionStyle(
  position: CaptionPosition,
  videoTop: number,
  height: number
): React.CSSProperties {
  const safeZoneHeight = videoTop

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 24px',
  }

  switch (position) {
    case 'top':
      return {
        ...baseStyle,
        top: 0,
        height: safeZoneHeight,
        alignItems: 'flex-end',
        paddingBottom: 40,
      }
    case 'bottom':
      return {
        ...baseStyle,
        bottom: 0,
        height: safeZoneHeight,
        alignItems: 'flex-start',
        paddingTop: 40,
      }
    case 'center':
    default:
      return {
        ...baseStyle,
        top: 0,
        bottom: 0,
      }
  }
}

// ==========================================
// Boxed 스타일 자막
// ==========================================

const BoxedCaptions: React.FC<CaptionProps> = ({
  text,
  durationFrames,
  config,
  videoTop,
  width,
  height,
  wordTimings,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const fontSize = config.fontSize ?? defaultCaptionConfig.fontSize
  const fontColor = config.fontColor ?? defaultCaptionConfig.fontColor
  const backgroundColor = config.backgroundColor ?? defaultCaptionConfig.backgroundColor
  const position = config.position ?? defaultCaptionConfig.position
  const highlightWords = config.highlightWords ?? []
  const highlightColor = config.highlightColor ?? defaultCaptionConfig.highlightColor

  const fadeInDuration = Math.min(15, Math.floor(durationFrames / 6))
  const fadeOutStart = durationFrames - fadeInDuration

  const entrance = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: fadeInDuration,
  })

  const exitOpacity = interpolate(
    frame,
    [fadeOutStart, durationFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  const opacity = Math.min(entrance, exitOpacity)
  const scale = interpolate(entrance, [0, 1], [0.9, 1])

  const currentMs = frameToMs(frame, fps)
  const useTtsSync = wordTimings && wordTimings.length > 0

  const findActiveWordIndex = (): number => {
    if (!useTtsSync || !wordTimings) return -1
    for (let i = 0; i < wordTimings.length; i++) {
      const word = wordTimings[i]
      if (currentMs >= word.startMs && currentMs < word.endMs) {
        return i
      }
    }
    return -1
  }

  const ttsActiveIndex = useTtsSync ? findActiveWordIndex() : -1

  const renderText = () => {
    if (useTtsSync && wordTimings) {
      return wordTimings.map((word, index) => {
        const isActive = index === ttsActiveIndex
        const isPast = index < ttsActiveIndex

        return (
          <React.Fragment key={index}>
            <span
              style={{
                color: isActive || isPast ? highlightColor : fontColor,
                fontWeight: isActive ? 800 : 700,
                transform: isActive ? 'scale(1.05)' : undefined,
                display: 'inline-block',
              }}
            >
              {word.text}
            </span>
            {index < wordTimings.length - 1 && <span> </span>}
          </React.Fragment>
        )
      })
    }

    if (highlightWords.length === 0) {
      return text
    }

    const regex = new RegExp(`(${highlightWords.join('|')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) => {
      const isHighlight = highlightWords.some(
        (word) => word.toLowerCase() === part.toLowerCase()
      )
      return isHighlight ? (
        <span key={index} style={{ color: highlightColor, fontWeight: 800 }}>
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      )
    })
  }

  const positionStyle = getPositionStyle(position, videoTop, height)
  const translateY = interpolate(entrance, [0, 1], [15, 0])

  return (
    <div style={positionStyle}>
      <div
        style={{
          backgroundColor,
          padding: '16px 28px',
          borderRadius: 12,
          opacity,
          transform: `scale(${scale}) translateY(${translateY}px)`,
          maxWidth: width * 0.85,
        }}
      >
        <div
          style={{
            fontSize,
            fontFamily: 'SF Pro Display, system-ui, sans-serif',
            fontWeight: 700,
            color: fontColor,
            textAlign: 'center',
            lineHeight: 1.4,
            letterSpacing: -0.5,
            whiteSpace: 'pre-wrap',
          }}
        >
          {renderText()}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// Karaoke 스타일 자막
// ==========================================

const KaraokeCaptions: React.FC<CaptionProps> = ({
  text,
  durationFrames,
  config,
  videoTop,
  width,
  height,
  wordTimings,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const fontSize = config.fontSize ?? defaultCaptionConfig.fontSize
  const fontColor = config.fontColor ?? defaultCaptionConfig.fontColor
  const highlightColor = config.highlightColor ?? defaultCaptionConfig.highlightColor
  const position = config.position ?? defaultCaptionConfig.position

  const fadeInDuration = Math.min(10, Math.floor(durationFrames / 8))
  const fadeOutStart = durationFrames - fadeInDuration

  const entranceOpacity = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: fadeInDuration,
  })

  const exitOpacity = interpolate(
    frame,
    [fadeOutStart, durationFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  const opacity = Math.min(entranceOpacity, exitOpacity)

  const currentMs = frameToMs(frame, fps)
  const useTtsSync = wordTimings && wordTimings.length > 0

  const textWords = text.split(/(\s+)/).filter(Boolean)
  const textWordCount = textWords.filter((w) => w.trim()).length

  const activeRange = durationFrames - fadeInDuration * 2
  const progressFrame = Math.max(0, frame - fadeInDuration)
  const frameProgress = progressFrame / activeRange
  const frameBasedWordIndex = Math.floor(frameProgress * textWordCount)

  const findActiveWordIndex = (): number => {
    if (!useTtsSync || !wordTimings) return -1
    const relativeMs = currentMs
    for (let i = 0; i < wordTimings.length; i++) {
      const word = wordTimings[i]
      if (relativeMs >= word.startMs && relativeMs < word.endMs) {
        return i
      }
    }
    if (wordTimings.length > 0 && relativeMs >= wordTimings[wordTimings.length - 1].endMs) {
      return wordTimings.length - 1
    }
    return -1
  }

  const ttsActiveIndex = useTtsSync ? findActiveWordIndex() : -1

  const wordsToRender = useTtsSync && wordTimings
    ? wordTimings.map(w => w.text)
    : textWords.filter(w => w.trim())

  const renderedWords = wordsToRender.map((word, index) => {
    let isPast = false
    let isCurrent = false
    let isFuture = false
    let wordProgress = 0

    if (useTtsSync && wordTimings) {
      isPast = index < ttsActiveIndex
      isCurrent = index === ttsActiveIndex
      isFuture = index > ttsActiveIndex || ttsActiveIndex === -1

      if (isCurrent && wordTimings[index]) {
        const w = wordTimings[index]
        const duration = w.endMs - w.startMs
        wordProgress = duration > 0 ? Math.min(1, (currentMs - w.startMs) / duration) : 1
      } else if (isPast) {
        wordProgress = 1
      }
    } else {
      isPast = index < frameBasedWordIndex
      isCurrent = index === frameBasedWordIndex
      isFuture = index > frameBasedWordIndex

      if (isCurrent) {
        wordProgress = (frameProgress * textWordCount) % 1
      }
    }

    let wordScale = 1
    let wordOpacity = 1

    if (isCurrent) {
      wordScale = interpolate(wordProgress, [0, 0.3, 1], [1, 1.12, 1.05], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
      })
    }

    if (isFuture) {
      wordOpacity = 0.5
    }

    const wordColor = isPast || isCurrent ? highlightColor : fontColor

    return (
      <React.Fragment key={index}>
        <span
          style={{
            display: 'inline-block',
            color: wordColor,
            opacity: wordOpacity,
            transform: `scale(${wordScale})`,
            fontWeight: isCurrent ? 800 : 700,
            transition: useTtsSync ? undefined : 'all 0.1s ease-out',
          }}
        >
          {word}
        </span>
        {index < wordsToRender.length - 1 && <span> </span>}
      </React.Fragment>
    )
  })

  const positionStyle = getPositionStyle(position, videoTop, height)

  const translateY = interpolate(
    entranceOpacity,
    [0, 1],
    [20, 0],
    { extrapolateRight: 'clamp' }
  )

  return (
    <div style={positionStyle}>
      <div
        style={{
          opacity,
          maxWidth: width * 0.9,
          textAlign: 'center',
          transform: `translateY(${translateY}px)`,
        }}
      >
        <div
          style={{
            fontSize,
            fontFamily: 'SF Pro Display, system-ui, sans-serif',
            fontWeight: 700,
            lineHeight: 1.4,
            letterSpacing: -0.5,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {renderedWords}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// Typewriter 스타일 자막
// ==========================================

const TypewriterCaptions: React.FC<CaptionProps> = ({
  text,
  durationFrames,
  config,
  videoTop,
  width,
  height,
  wordTimings,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const fontSize = config.fontSize ?? defaultCaptionConfig.fontSize
  const fontColor = config.fontColor ?? defaultCaptionConfig.fontColor
  const highlightColor = config.highlightColor ?? defaultCaptionConfig.highlightColor
  const position = config.position ?? defaultCaptionConfig.position
  const typewriterSpeed = config.typewriterSpeed ?? defaultCaptionConfig.typewriterSpeed
  const highlightWords = config.highlightWords ?? []

  const fadeInDuration = Math.min(5, Math.floor(durationFrames / 10))
  const fadeOutDuration = Math.min(10, Math.floor(durationFrames / 8))
  const fadeOutStart = durationFrames - fadeOutDuration

  const currentMs = frameToMs(frame, fps)
  const useTtsSync = wordTimings && wordTimings.length > 0

  const entrance = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: fadeInDuration,
  })

  const exitOpacity = interpolate(
    frame,
    [fadeOutStart, durationFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  const opacity = Math.min(entrance, exitOpacity)

  const getVisibleTextTts = (): { text: string; activeWordIndex: number } => {
    if (!useTtsSync || !wordTimings) {
      return { text: '', activeWordIndex: -1 }
    }

    let visibleText = ''
    let activeWordIndex = -1

    for (let i = 0; i < wordTimings.length; i++) {
      const word = wordTimings[i]
      if (currentMs >= word.startMs) {
        if (visibleText) visibleText += ' '
        visibleText += word.text
        if (currentMs < word.endMs) {
          activeWordIndex = i
        }
      }
    }

    return { text: visibleText, activeWordIndex }
  }

  const framesPerChar = Math.max(1, Math.round((typewriterSpeed / 1000) * fps))
  const typingFrame = Math.max(0, frame - fadeInDuration)
  const visibleCharsFrame = Math.min(text.length, Math.floor(typingFrame / framesPerChar))

  let visibleText: string

  if (useTtsSync) {
    const ttsResult = getVisibleTextTts()
    visibleText = ttsResult.text
  } else {
    visibleText = text.slice(0, visibleCharsFrame)
  }

  const isTypingComplete = useTtsSync
    ? wordTimings && currentMs >= wordTimings[wordTimings.length - 1]?.endMs
    : visibleCharsFrame >= text.length
  const cursorBlink = Math.floor(frame / (fps / 2)) % 2 === 0
  const showCursor = !isTypingComplete || (isTypingComplete && cursorBlink)

  const renderText = () => {
    if (useTtsSync && wordTimings) {
      const visibleWords = wordTimings.filter((w) => currentMs >= w.startMs)

      return visibleWords.map((word, index) => {
        const isActive = currentMs >= word.startMs && currentMs < word.endMs
        const originalIndex = wordTimings.indexOf(word)

        return (
          <React.Fragment key={originalIndex}>
            <span
              style={{
                color: isActive ? highlightColor : fontColor,
                fontWeight: isActive ? 800 : 600,
              }}
            >
              {word.text}
            </span>
            {index < visibleWords.length - 1 && <span> </span>}
          </React.Fragment>
        )
      })
    }

    if (highlightWords.length === 0) {
      return visibleText
    }

    const regex = new RegExp(`(${highlightWords.join('|')})`, 'gi')
    const parts = visibleText.split(regex)

    return parts.map((part, index) => {
      const isHighlight = highlightWords.some(
        (word) => word.toLowerCase() === part.toLowerCase()
      )
      return isHighlight ? (
        <span key={index} style={{ color: highlightColor, fontWeight: 800 }}>
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      )
    })
  }

  const lastCharFrame = typingFrame % framesPerChar
  const newCharScale =
    lastCharFrame < framesPerChar * 0.3
      ? interpolate(lastCharFrame, [0, framesPerChar * 0.3], [1.05, 1], {
          easing: Easing.out(Easing.cubic),
        })
      : 1

  const positionStyle = getPositionStyle(position, videoTop, height)
  const translateY = interpolate(entrance, [0, 1], [10, 0])

  return (
    <div style={positionStyle}>
      <div
        style={{
          opacity,
          maxWidth: width * 0.9,
          textAlign: 'center',
          transform: `translateY(${translateY}px)`,
        }}
      >
        <div
          style={{
            fontSize,
            fontFamily: 'SF Pro Mono, Menlo, monospace',
            fontWeight: 600,
            color: fontColor,
            lineHeight: 1.5,
            letterSpacing: 0,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
            whiteSpace: 'pre-wrap',
            transform: visibleText.length > 0 ? `scale(${newCharScale})` : undefined,
            transformOrigin: 'center center',
          }}
        >
          {renderText()}
          <span
            style={{
              display: 'inline-block',
              width: 3,
              height: fontSize * 0.8,
              backgroundColor: showCursor ? highlightColor : 'transparent',
              marginLeft: 2,
              verticalAlign: 'middle',
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ==========================================
// CaptionRenderer — 스타일에 따라 적절한 컴포넌트 반환
// ==========================================

export const CaptionRenderer: React.FC<CaptionProps> = (props) => {
  const style = props.config.style ?? defaultCaptionConfig.style

  switch (style) {
    case 'karaoke':
      return <KaraokeCaptions {...props} />
    case 'typewriter':
      return <TypewriterCaptions {...props} />
    case 'boxed':
    default:
      return <BoxedCaptions {...props} />
  }
}

export function mergeCaptionConfig(
  projectDefault?: CaptionConfig,
  sceneOverride?: CaptionConfig
): CaptionConfig {
  return {
    ...defaultCaptionConfig,
    ...projectDefault,
    ...sceneOverride,
  }
}
