/**
 * 영상 템플릿 정의 — engine/video/*.tsx Remotion 컴포지션 기반
 */

export interface VideoTemplateInfo {
  id: string
  name: string
  description: string
  /** 한줄 태그라인 */
  tagline: string
  /** 용도 설명 */
  useCase: string
  /** 해상도 */
  width: number
  height: number
  fps: number
  /** 예상 길이 (초) */
  defaultDuration: number
  /** 필요한 소스 종류 */
  requiredSources: ('video' | 'image' | 'text' | 'audio' | 'srt')[]
  /** 주요 Props 필드 설명 */
  propsGuide: { key: string; label: string; desc: string }[]
  /** 예시 시나리오 */
  examples: string[]
  /** 컴포지션 파일 경로 (engine/ 기준) */
  compositionPath: string
  /** 태그 */
  tags: string[]
}

export const VIDEO_TEMPLATES: VideoTemplateInfo[] = [
  {
    id: 'day-in-the-life',
    name: 'DayInTheLife',
    description: '일상/작업 타임랩스 쇼츠',
    tagline: '에이전트가 일하는 하루를 60초로 압축',
    useCase: '작업 과정 스크린 녹화 클립들을 연결해서 타임랩스 형태의 숏폼 영상으로 만듭니다. 각 클립에 시간/라벨/이모지 오버레이가 표시됩니다.',
    width: 1080,
    height: 1920,
    fps: 60,
    defaultDuration: 60,
    requiredSources: ['video'],
    propsGuide: [
      { key: 'clips', label: '클립 배열', desc: '{ file, time, label, emoji } 형태. 각 클립의 파일명, 시간대, 설명, 이모지' },
      { key: 'clipDuration', label: '클립 길이', desc: '각 클립 재생 프레임 수 (60fps 기준, 기본 150 = 2.5초)' },
      { key: 'transitionDuration', label: '전환 시간', desc: '클립 간 트랜지션 프레임 (기본 30 = 0.5초)' },
      { key: 'showOutro', label: '아웃트로 표시', desc: 'true면 마지막에 CTA 슬라이드 추가' },
      { key: 'outroText', label: '아웃트로 텍스트', desc: '마지막 CTA 문구' },
    ],
    examples: [
      '에이전트 14개가 동시에 작업하는 화면 타임랩스',
      '코딩 에이전트가 PR 올리고 리뷰하는 과정',
      '하루 일과: 아침 브리핑 → 개발 → 배포까지',
    ],
    compositionPath: 'engine/video/DayInTheLife.tsx',
    tags: ['타임랩스', '일상', '작업과정', 'vlog'],
  },
  {
    id: 'demo-60s',
    name: 'Demo60s',
    description: '60초 데모 릴스',
    tagline: '60초 안에 만들어 보여주는 데모',
    useCase: '스크린캐스트 영상 위에 Hook 텍스트 → 데모 과정 → 결과물 → CTA를 오버레이합니다. 제품/기능 시연에 최적화.',
    width: 1080,
    height: 1920,
    fps: 60,
    defaultDuration: 60,
    requiredSources: ['video', 'text'],
    propsGuide: [
      { key: 'hookText', label: 'Hook 텍스트', desc: '상단에 표시되는 훅 문구 (예: "60초 만에 만든다")' },
      { key: 'demoVideo', label: '데모 영상', desc: '스크린캐스트/녹화 영상 파일명' },
      { key: 'resultText', label: '결과 설명', desc: '결과물 설명 텍스트' },
      { key: 'ctaText', label: 'CTA', desc: '마지막 행동 유도 문구' },
      { key: 'ctaKeyword', label: 'CTA 키워드', desc: 'DM/댓글 키워드 (예: "템플릿")' },
    ],
    examples: [
      '텔레그램으로 웹사이트 만드는 과정 60초',
      'AI 에이전트 세팅하는 데모',
      'Obsidian 볼트 정리 자동화 시연',
    ],
    compositionPath: 'engine/video/Demo60s.tsx',
    tags: ['데모', '시연', '튜토리얼', '60초'],
  },
  {
    id: 'short-form-video',
    name: 'ShortFormVideo',
    description: 'TTS + 자막 숏폼',
    tagline: '텍스트를 영상으로 — 자막 기반 숏폼',
    useCase: '씬(Scene) 단위로 영상/이미지 + TTS 음성 + 워드 단위 자막을 조합합니다. 가장 범용적인 숏폼 포맷.',
    width: 1080,
    height: 1920,
    fps: 60,
    defaultDuration: 45,
    requiredSources: ['video', 'image', 'text', 'audio', 'srt'],
    propsGuide: [
      { key: 'scenes', label: '씬 배열', desc: '각 씬의 배경(영상/이미지), 자막, 오디오 설정' },
      { key: 'captions', label: '자막 설정', desc: '폰트, 크기, 위치, 스타일 (워드 하이라이트 지원)' },
      { key: 'bgMusic', label: '배경 음악', desc: '배경 음악 파일 + 볼륨' },
    ],
    examples: [
      '에이전틱 워크플로우 설명 숏폼',
      'AI 뉴스 요약 + 내 의견 숏폼',
      '블로그 글을 영상으로 변환',
    ],
    compositionPath: 'engine/video/ShortFormVideo.tsx',
    tags: ['TTS', '자막', '숏폼', '범용'],
  },
  {
    id: 'vs-reel',
    name: 'VSReel',
    description: 'A vs B 비교 릴스',
    tagline: '두 가지를 나란히 비교하는 릴스',
    useCase: '상단에 VS 로고/텍스트, 하단에 두 영상을 나란히 배치. 도구 비교, Before/After에 적합.',
    width: 1080,
    height: 1920,
    fps: 60,
    defaultDuration: 30,
    requiredSources: ['video', 'text'],
    propsGuide: [
      { key: 'leftVideo', label: '왼쪽 영상', desc: 'A 측 영상 (예: IDE 코딩)' },
      { key: 'rightVideo', label: '오른쪽 영상', desc: 'B 측 영상 (예: 터미널 코딩)' },
      { key: 'vsText', label: 'VS 텍스트', desc: '비교 제목 (예: "IDE vs Terminal")' },
      { key: 'textItems', label: '텍스트 오버레이', desc: '시간별 표시할 텍스트 배열' },
    ],
    examples: [
      'IDE 코딩 vs 터미널 코딩 속도 비교',
      '수동 배포 vs 자동 배포',
      'ChatGPT vs 에이전틱 워크플로우',
    ],
    compositionPath: 'engine/video/VSReel.tsx',
    tags: ['비교', 'VS', 'A/B', '대결'],
  },
  {
    id: 'text-over-video',
    name: 'TextOverVideo',
    description: '텍스트 오버레이 영상',
    tagline: '배경 영상 위에 텍스트를 순서대로 표시',
    useCase: '배경 영상(작업 화면, 풍경 등) 위에 시간별로 텍스트를 띄웁니다. 심플하지만 강력한 스토리텔링.',
    width: 1080,
    height: 1920,
    fps: 60,
    defaultDuration: 30,
    requiredSources: ['video', 'text'],
    propsGuide: [
      { key: 'backgrounds', label: '배경 영상', desc: '배경 영상 파일(들). 여러 개면 순서대로 전환' },
      { key: 'textItems', label: '텍스트 항목', desc: '{ text, startFrame, durationFrames } 배열' },
      { key: 'bgMusic', label: '배경 음악', desc: '선택적 배경 BGM' },
    ],
    examples: [
      '코딩 타임랩스 위에 인사이트 텍스트',
      '작업 화면 + 핵심 메시지 오버레이',
      '감성 브이로그 스타일 텍스트 릴스',
    ],
    compositionPath: 'engine/video/TextOverVideo.tsx',
    tags: ['텍스트', '오버레이', '스토리텔링', '심플'],
  },
  {
    id: 'news-breaking',
    name: 'NewsBreaking',
    description: '뉴스 속보 릴스',
    tagline: '🚨 속보! AI/테크 뉴스를 릴스로',
    useCase: '뉴스 속보 알림 → 헤드라인 → 요약 포인트 → 내 의견 순서로 구성되는 뉴스 릴스. 테크/AI 뉴스 큐레이션용.',
    width: 1080,
    height: 1920,
    fps: 60,
    defaultDuration: 30,
    requiredSources: ['text', 'image'],
    propsGuide: [
      { key: 'headline', label: '헤드라인', desc: '뉴스 제목' },
      { key: 'source', label: '출처', desc: '뉴스 소스 (선택)' },
      { key: 'points', label: '요약 포인트', desc: '핵심 내용 배열' },
      { key: 'opinion', label: '의견', desc: '내 해석/코멘트' },
      { key: 'backgroundImage', label: '배경 이미지', desc: '뉴스 관련 이미지 (선택)' },
    ],
    examples: [
      'Claude 5 출시 속보',
      'OpenAI 새 정책 발표',
      'AI 규제 법안 요약',
    ],
    compositionPath: 'engine/video/NewsBreaking.tsx',
    tags: ['뉴스', '속보', '큐레이션', '정보'],
  },
]

export function getVideoTemplate(id: string) {
  return VIDEO_TEMPLATES.find((t) => t.id === id)
}
