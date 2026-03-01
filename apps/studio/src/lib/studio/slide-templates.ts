import type React from 'react'
import {
  BodyCompare,
  bodyCompareDefaultProps,
  BodyDiagram,
  bodyDiagramDefaultProps,
  BodyList,
  bodyListDefaultProps,
  BodyQuote,
  bodyQuoteDefaultProps,
  BodyStep,
  bodyStepDefaultProps,
  BodyText,
  bodyTextDefaultProps,
  CoverBold,
  coverBoldDefaultProps,
  CoverCentered,
  coverCenteredDefaultProps,
  CoverGradient,
  coverGradientDefaultProps,
  CoverMinimal,
  coverMinimalDefaultProps,
  CoverSplit,
  coverSplitDefaultProps,
  CTAFollow,
  ctaFollowDefaultProps,
  CTALink,
  ctaLinkDefaultProps,
  CTAQuestion,
  ctaQuestionDefaultProps,
  CTASave,
  ctaSaveDefaultProps,
  HookProblem,
  hookProblemDefaultProps,
  HookQuestion,
  hookQuestionDefaultProps,
  HookStat,
  hookStatDefaultProps,
  HookTeaser,
  hookTeaserDefaultProps,
} from '@/components/slide-templates'

export interface SlideTemplateInfo {
  id: string
  name: string
  category: 'cover' | 'hook' | 'body' | 'cta'
  description: string
  component: React.ComponentType<any>
  propsSchema: Record<string, { type: string; label: string; required?: boolean }>
  defaultProps: Record<string, any>
}

const RAW_SLIDE_TEMPLATES: SlideTemplateInfo[] = [
  {
    id: 'cover-bold',
    name: 'CoverBold',
    category: 'cover',
    description: '큰 임팩트 텍스트, 배경 이미지/색상',
    component: CoverBold,
    propsSchema: { title: { type: 'string', label: '제목', required: true }, subtitle: { type: 'string', label: '부제목' }, tag: { type: 'string', label: '태그' }, backgroundImageUrl: { type: 'image', label: '배경 이미지' } },
    defaultProps: coverBoldDefaultProps,
  },
  { id: 'cover-centered', name: 'CoverCentered', category: 'cover', description: '중앙 정렬, 깔끔한 타이틀', component: CoverCentered, propsSchema: { title: { type: 'string', label: '제목', required: true }, subtitle: { type: 'string', label: '부제목' }, kicker: { type: 'string', label: '상단 카피' } }, defaultProps: coverCenteredDefaultProps },
  { id: 'cover-minimal', name: 'CoverMinimal', category: 'cover', description: '미니멀, 여백 중심', component: CoverMinimal, propsSchema: { title: { type: 'string', label: '제목', required: true }, subtitle: { type: 'string', label: '부제목' }, issue: { type: 'string', label: '이슈 라벨' } }, defaultProps: coverMinimalDefaultProps },
  { id: 'cover-split', name: 'CoverSplit', category: 'cover', description: '좌우 분할 (이미지 + 텍스트)', component: CoverSplit, propsSchema: { title: { type: 'string', label: '제목', required: true }, subtitle: { type: 'string', label: '부제목' }, imageUrl: { type: 'image', label: '좌측 이미지' } }, defaultProps: coverSplitDefaultProps },
  { id: 'cover-gradient', name: 'CoverGradient', category: 'cover', description: '그라디언트 배경 + 타이틀', component: CoverGradient, propsSchema: { title: { type: 'string', label: '제목', required: true }, subtitle: { type: 'string', label: '부제목' }, gradientFrom: { type: 'color', label: '그라디언트 시작' }, gradientTo: { type: 'color', label: '그라디언트 끝' } }, defaultProps: coverGradientDefaultProps },

  { id: 'hook-question', name: 'HookQuestion', category: 'hook', description: '질문형 훅', component: HookQuestion, propsSchema: { question: { type: 'string', label: '질문', required: true }, subQuestion: { type: 'string', label: '보조 질문' } }, defaultProps: hookQuestionDefaultProps },
  { id: 'hook-stat', name: 'HookStat', category: 'hook', description: '통계 숫자 강조', component: HookStat, propsSchema: { statValue: { type: 'string', label: '숫자', required: true }, statLabel: { type: 'string', label: '라벨' }, detail: { type: 'string', label: '설명' } }, defaultProps: hookStatDefaultProps },
  { id: 'hook-problem', name: 'HookProblem', category: 'hook', description: '문제 제기형', component: HookProblem, propsSchema: { title: { type: 'string', label: '제목' }, points: { type: 'string[]', label: '문제 목록' } }, defaultProps: hookProblemDefaultProps },
  { id: 'hook-teaser', name: 'HookTeaser', category: 'hook', description: '티저/예고형', component: HookTeaser, propsSchema: { overline: { type: 'string', label: '오버라인' }, title: { type: 'string', label: '제목', required: true }, teaser: { type: 'string', label: '티저 문구' } }, defaultProps: hookTeaserDefaultProps },

  { id: 'body-text', name: 'BodyText', category: 'body', description: '설명형 본문', component: BodyText, propsSchema: { heading: { type: 'string', label: '제목' }, body: { type: 'string', label: '본문' } }, defaultProps: bodyTextDefaultProps },
  { id: 'body-list', name: 'BodyList', category: 'body', description: '리스트/불릿', component: BodyList, propsSchema: { title: { type: 'string', label: '제목' }, items: { type: 'string[]', label: '리스트' } }, defaultProps: bodyListDefaultProps },
  { id: 'body-step', name: 'BodyStep', category: 'body', description: '넘버링 단계별', component: BodyStep, propsSchema: { title: { type: 'string', label: '제목' }, steps: { type: 'object[]|string[]', label: '단계 목록' } }, defaultProps: bodyStepDefaultProps },
  { id: 'body-compare', name: 'BodyCompare', category: 'body', description: 'Before/After 비교', component: BodyCompare, propsSchema: { title: { type: 'string', label: '제목' }, beforeTitle: { type: 'string', label: 'Before 제목' }, beforeDesc: { type: 'string', label: 'Before 설명' }, beforeItems: { type: 'string[]', label: 'Before 항목' }, afterTitle: { type: 'string', label: 'After 제목' }, afterDesc: { type: 'string', label: 'After 설명' }, afterItems: { type: 'string[]', label: 'After 항목' } }, defaultProps: bodyCompareDefaultProps },
  { id: 'body-diagram', name: 'BodyDiagram', category: 'body', description: '플로우/다이어그램', component: BodyDiagram, propsSchema: { title: { type: 'string', label: '제목' }, nodes: { type: 'string[]', label: '노드 목록' } }, defaultProps: bodyDiagramDefaultProps },
  { id: 'body-quote', name: 'BodyQuote', category: 'body', description: '인용구/명언', component: BodyQuote, propsSchema: { quote: { type: 'string', label: '인용문' }, author: { type: 'string', label: '저자' } }, defaultProps: bodyQuoteDefaultProps },

  { id: 'cta-follow', name: 'CTAFollow', category: 'cta', description: '팔로우 유도', component: CTAFollow, propsSchema: { title: { type: 'string', label: '제목' }, handle: { type: 'string', label: '핸들' }, reason: { type: 'string', label: '설명' } }, defaultProps: ctaFollowDefaultProps },
  { id: 'cta-save', name: 'CTASave', category: 'cta', description: '저장 유도', component: CTASave, propsSchema: { title: { type: 'string', label: '제목' }, subtitle: { type: 'string', label: '설명' }, tip: { type: 'string', label: '팁' } }, defaultProps: ctaSaveDefaultProps },
  { id: 'cta-link', name: 'CTALink', category: 'cta', description: '링크/프로필 유도', component: CTALink, propsSchema: { title: { type: 'string', label: '제목' }, linkLabel: { type: 'string', label: '링크 라벨' }, linkValue: { type: 'string', label: '링크 주소' }, caption: { type: 'string', label: '설명' } }, defaultProps: ctaLinkDefaultProps },
  { id: 'cta-question', name: 'CTAQuestion', category: 'cta', description: '댓글 유도 질문', component: CTAQuestion, propsSchema: { question: { type: 'string', label: '질문' }, guide: { type: 'string', label: '안내' }, prompt: { type: 'string', label: '해시태그/프롬프트' } }, defaultProps: ctaQuestionDefaultProps },
]

export const SLIDE_TEMPLATES: SlideTemplateInfo[] = RAW_SLIDE_TEMPLATES.map((template) => ({
  ...template,
  propsSchema: {
    ...template.propsSchema,
    slideNumber: { type: 'string', label: '슬라이드 번호' },
  },
}))

export function getSlideTemplate(id: string) {
  return SLIDE_TEMPLATES.find((template) => template.id === id)
}
