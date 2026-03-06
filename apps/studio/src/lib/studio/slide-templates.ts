import type React from 'react'
import {
  BodyBeforeAfter,
  bodyBeforeAfterDefaultProps,
  BodyChecklist,
  bodyChecklistDefaultProps,
  BodyCompare,
  bodyCompareDefaultProps,
  BodyMythFact,
  bodyMythFactDefaultProps,
  BodyNumbered,
  bodyNumberedDefaultProps,
  BodyTipCard,
  bodyTipCardDefaultProps,
  BodyTimeline,
  bodyTimelineDefaultProps,
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
  CoverNumbered,
  coverNumberedDefaultProps,
  CoverBeforeAfter,
  coverBeforeAfterDefaultProps,
  CoverSplit,
  coverSplitDefaultProps,
  CTADM,
  ctaDMDefaultProps,
  CTAShare,
  ctaShareDefaultProps,
  CTAChecklistScore,
  ctaChecklistScoreDefaultProps,
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
  HookRoadmap,
  hookRoadmapDefaultProps,
  HookSelfQualify,
  hookSelfQualifyDefaultProps,
  HookVS,
  hookVSDefaultProps,
  HookMyth,
  hookMythDefaultProps,
  HookResult,
  hookResultDefaultProps,
  HookControversial,
  hookControversialDefaultProps,
  HookPainPoint,
  hookPainPointDefaultProps,
  HookListPreview,
  hookListPreviewDefaultProps,
} from '@/components/slide-templates'

export type PropSchemaType = 'string' | 'number' | 'boolean' | 'color' | 'image' | 'string[]' | 'object[]|string[]'

export interface PropSchema {
  type: PropSchemaType
  label: string
  required?: boolean
  group?: 'content' | 'style'
  min?: number
  max?: number
  step?: number
  default?: any
}

export interface SlideTemplateInfo {
  id: string
  name: string
  category: 'cover' | 'hook' | 'body' | 'cta'
  description: string
  component: React.ComponentType<any>
  propsSchema: Record<string, PropSchema>
  defaultProps: Record<string, any>
}

const RAW_SLIDE_TEMPLATES: SlideTemplateInfo[] = [
  {
    id: 'cover-bold',
    name: 'CoverBold',
    category: 'cover',
    description: '큰 임팩트 텍스트, 배경 이미지/색상',
    component: CoverBold,
    propsSchema: {
      title: { type: 'string', label: '제목', required: true },
      subtitle: { type: 'string', label: '부제목' },
      tag: { type: 'string', label: '태그' },
      backgroundImageUrl: { type: 'image', label: '배경 이미지' },
      // Style overrides
      titleFontSize: { type: 'number', label: '제목 크기', group: 'style', min: 60, max: 120, step: 2, default: 94 },
      subtitleFontSize: { type: 'number', label: '부제목 크기', group: 'style', min: 30, max: 80, step: 2, default: 56 },
      tagFontSize: { type: 'number', label: '태그 크기', group: 'style', min: 20, max: 60, step: 2, default: 38 },
      showAccentBar: { type: 'boolean', label: '악센트 바 표시', group: 'style', default: true },
      barWidth: { type: 'number', label: '바 너비', group: 'style', min: 60, max: 300, step: 4, default: 176 },
      paddingX: { type: 'number', label: '좌우 패딩', group: 'style', min: 32, max: 120, step: 4, default: 64 },
    },
    defaultProps: coverBoldDefaultProps,
  },
  { id: 'cover-centered', name: 'CoverCentered', category: 'cover', description: '중앙 정렬, 깔끔한 타이틀', component: CoverCentered, propsSchema: { title: { type: 'string', label: '제목', required: true }, subtitle: { type: 'string', label: '부제목' }, kicker: { type: 'string', label: '상단 카피' } }, defaultProps: coverCenteredDefaultProps },
  { id: 'cover-minimal', name: 'CoverMinimal', category: 'cover', description: '미니멀, 여백 중심', component: CoverMinimal, propsSchema: { title: { type: 'string', label: '제목', required: true }, subtitle: { type: 'string', label: '부제목' }, issue: { type: 'string', label: '이슈 라벨' } }, defaultProps: coverMinimalDefaultProps },
  { id: 'cover-split', name: 'CoverSplit', category: 'cover', description: '좌우 분할 (이미지 + 텍스트)', component: CoverSplit, propsSchema: { title: { type: 'string', label: '제목', required: true }, subtitle: { type: 'string', label: '부제목' }, imageUrl: { type: 'image', label: '좌측 이미지' } }, defaultProps: coverSplitDefaultProps },
  { id: 'cover-gradient', name: 'CoverGradient', category: 'cover', description: '그라디언트 배경 + 타이틀', component: CoverGradient, propsSchema: { title: { type: 'string', label: '제목', required: true }, subtitle: { type: 'string', label: '부제목' }, gradientFrom: { type: 'color', label: '그라디언트 시작' }, gradientTo: { type: 'color', label: '그라디언트 끝' } }, defaultProps: coverGradientDefaultProps },
  { id: 'cover-numbered', name: 'CoverNumbered', category: 'cover', description: '넘버 시리즈 커버', component: CoverNumbered, propsSchema: { number: { type: 'string', label: '숫자' }, title: { type: 'string', label: '제목' }, subtitle: { type: 'string', label: '부제목' }, tag: { type: 'string', label: '태그' } }, defaultProps: coverNumberedDefaultProps },
  { id: 'cover-before-after', name: 'CoverBeforeAfter', category: 'cover', description: 'Before/After 분할 커버', component: CoverBeforeAfter, propsSchema: { beforeText: { type: 'string', label: 'Before 텍스트' }, afterText: { type: 'string', label: 'After 텍스트' }, tag: { type: 'string', label: '태그' }, subtitle: { type: 'string', label: '하단 안내' } }, defaultProps: coverBeforeAfterDefaultProps },

  { id: 'hook-question', name: 'HookQuestion', category: 'hook', description: '질문형 훅', component: HookQuestion, propsSchema: { question: { type: 'string', label: '질문', required: true }, subQuestion: { type: 'string', label: '보조 질문' } }, defaultProps: hookQuestionDefaultProps },
  {
    id: 'hook-stat', name: 'HookStat', category: 'hook', description: '통계 숫자 강조', component: HookStat,
    propsSchema: {
      statValue: { type: 'string', label: '숫자', required: true },
      statLabel: { type: 'string', label: '라벨' },
      detail: { type: 'string', label: '설명' },
      // Style overrides
      statFontSize: { type: 'number', label: '숫자 크기', group: 'style', min: 80, max: 300, step: 2, default: 220 },
      labelFontSize: { type: 'number', label: '라벨 크기', group: 'style', min: 30, max: 120, step: 2, default: 64 },
      detailFontSize: { type: 'number', label: '설명 크기', group: 'style', min: 24, max: 80, step: 2, default: 44 },
      overlineText: { type: 'string', label: '오버라인 텍스트', group: 'style', default: 'impact metric' },
      showOverline: { type: 'boolean', label: '오버라인 표시', group: 'style', default: true },
      showAccentBar: { type: 'boolean', label: '악센트 바 표시', group: 'style', default: true },
      barWidth: { type: 'number', label: '바 너비', group: 'style', min: 60, max: 300, step: 4, default: 160 },
      paddingX: { type: 'number', label: '좌우 패딩', group: 'style', min: 32, max: 120, step: 4, default: 64 },
    },
    defaultProps: hookStatDefaultProps,
  },
  { id: 'hook-problem', name: 'HookProblem', category: 'hook', description: '문제 제기형', component: HookProblem, propsSchema: { title: { type: 'string', label: '제목' }, points: { type: 'string[]', label: '문제 목록' } }, defaultProps: hookProblemDefaultProps },
  { id: 'hook-teaser', name: 'HookTeaser', category: 'hook', description: '티저/예고형', component: HookTeaser, propsSchema: { overline: { type: 'string', label: '오버라인' }, title: { type: 'string', label: '제목', required: true }, teaser: { type: 'string', label: '티저 문구' } }, defaultProps: hookTeaserDefaultProps },
  { id: 'hook-roadmap', name: 'HookRoadmap', category: 'hook', description: '목차/로드맵', component: HookRoadmap, propsSchema: { title: { type: 'string', label: '제목' }, items: { type: 'string[]', label: '항목' }, subtitle: { type: 'string', label: '하단 안내' } }, defaultProps: hookRoadmapDefaultProps },
  { id: 'hook-self-qualify', name: 'HookSelfQualify', category: 'hook', description: '타겟 셀프체크', component: HookSelfQualify, propsSchema: { title: { type: 'string', label: '제목' }, conditions: { type: 'string[]', label: '조건 목록' }, conclusion: { type: 'string', label: '결론' } }, defaultProps: hookSelfQualifyDefaultProps },
  { id: 'hook-vs', name: 'HookVS', category: 'hook', description: 'A vs B 대결', component: HookVS, propsSchema: { leftLabel: { type: 'string', label: '왼쪽' }, rightLabel: { type: 'string', label: '오른쪽' }, title: { type: 'string', label: '제목' } }, defaultProps: hookVSDefaultProps },
  { id: 'hook-myth', name: 'HookMyth', category: 'hook', description: '착각 깨기', component: HookMyth, propsSchema: { myth: { type: 'string', label: '착각' }, reveal: { type: 'string', label: '진실' }, label: { type: 'string', label: '라벨' } }, defaultProps: hookMythDefaultProps },
  { id: 'hook-result', name: 'HookResult', category: 'hook', description: '결과 임팩트', component: HookResult, propsSchema: { result: { type: 'string', label: '결과' }, context: { type: 'string', label: '맥락' }, overline: { type: 'string', label: '오버라인' } }, defaultProps: hookResultDefaultProps },
  { id: 'hook-controversial', name: 'HookControversial', category: 'hook', description: '논란/도발', component: HookControversial, propsSchema: { statement: { type: 'string', label: '주장' }, subtext: { type: 'string', label: '보조 텍스트' } }, defaultProps: hookControversialDefaultProps },
  { id: 'hook-pain-point', name: 'HookPainPoint', category: 'hook', description: '공감 페인포인트', component: HookPainPoint, propsSchema: { painPoint: { type: 'string', label: '페인포인트' }, empathy: { type: 'string', label: '공감' }, transition: { type: 'string', label: '전환 문구' } }, defaultProps: hookPainPointDefaultProps },
  { id: 'hook-list-preview', name: 'HookListPreview', category: 'hook', description: '리스트 미리보기', component: HookListPreview, propsSchema: { title: { type: 'string', label: '제목' }, items: { type: 'string[]', label: '항목' }, revealCount: { type: 'number', label: '공개 수', min: 1, max: 10, step: 1 }, overline: { type: 'string', label: '오버라인' } }, defaultProps: hookListPreviewDefaultProps },

  {
    id: 'body-text', name: 'BodyText', category: 'body', description: '설명형 본문', component: BodyText,
    propsSchema: {
      heading: { type: 'string', label: '제목' },
      body: { type: 'string', label: '본문' },
      // Style overrides
      headingFontSize: { type: 'number', label: '제목 크기', group: 'style', min: 36, max: 100, step: 2, default: 62 },
      bodyFontSize: { type: 'number', label: '본문 크기', group: 'style', min: 24, max: 60, step: 2, default: 38 },
      showAccentBar: { type: 'boolean', label: '악센트 바 표시', group: 'style', default: true },
      headingBodyGap: { type: 'number', label: '제목-본문 간격', group: 'style', min: 20, max: 120, step: 4, default: 64 },
      paddingX: { type: 'number', label: '좌우 패딩', group: 'style', min: 32, max: 120, step: 4, default: 64 },
    },
    defaultProps: bodyTextDefaultProps,
  },
  { id: 'body-list', name: 'BodyList', category: 'body', description: '리스트/불릿', component: BodyList, propsSchema: { title: { type: 'string', label: '제목' }, items: { type: 'string[]', label: '리스트' } }, defaultProps: bodyListDefaultProps },
  { id: 'body-step', name: 'BodyStep', category: 'body', description: '넘버링 단계별', component: BodyStep, propsSchema: { title: { type: 'string', label: '제목' }, steps: { type: 'object[]|string[]', label: '단계 목록' } }, defaultProps: bodyStepDefaultProps },
  { id: 'body-compare', name: 'BodyCompare', category: 'body', description: 'Before/After 비교', component: BodyCompare, propsSchema: { title: { type: 'string', label: '제목' }, beforeTitle: { type: 'string', label: 'Before 제목' }, beforeDesc: { type: 'string', label: 'Before 설명' }, beforeItems: { type: 'string[]', label: 'Before 항목' }, afterTitle: { type: 'string', label: 'After 제목' }, afterDesc: { type: 'string', label: 'After 설명' }, afterItems: { type: 'string[]', label: 'After 항목' } }, defaultProps: bodyCompareDefaultProps },
  { id: 'body-diagram', name: 'BodyDiagram', category: 'body', description: '플로우/다이어그램', component: BodyDiagram, propsSchema: { title: { type: 'string', label: '제목' }, nodes: { type: 'string[]', label: '노드 목록' } }, defaultProps: bodyDiagramDefaultProps },
  { id: 'body-quote', name: 'BodyQuote', category: 'body', description: '인용구/명언', component: BodyQuote, propsSchema: { quote: { type: 'string', label: '인용문' }, author: { type: 'string', label: '저자' } }, defaultProps: bodyQuoteDefaultProps },
  { id: 'body-checklist', name: 'BodyChecklist', category: 'body', description: '체크리스트', component: BodyChecklist, propsSchema: { title: { type: 'string', label: '제목' }, items: { type: 'string[]', label: '항목' } }, defaultProps: bodyChecklistDefaultProps },
  { id: 'body-myth-fact', name: 'BodyMythFact', category: 'body', description: 'Myth vs Fact', component: BodyMythFact, propsSchema: { myth: { type: 'string', label: 'Myth' }, fact: { type: 'string', label: 'Fact' }, mythLabel: { type: 'string', label: 'Myth 라벨' }, factLabel: { type: 'string', label: 'Fact 라벨' } }, defaultProps: bodyMythFactDefaultProps },
  { id: 'body-before-after', name: 'BodyBeforeAfter', category: 'body', description: 'Before → After', component: BodyBeforeAfter, propsSchema: { beforeTitle: { type: 'string', label: 'Before 제목' }, beforeBody: { type: 'string', label: 'Before 내용' }, afterTitle: { type: 'string', label: 'After 제목' }, afterBody: { type: 'string', label: 'After 내용' } }, defaultProps: bodyBeforeAfterDefaultProps },
  { id: 'body-numbered', name: 'BodyNumbered', category: 'body', description: '넘버 포인트', component: BodyNumbered, propsSchema: { number: { type: 'string', label: '번호' }, title: { type: 'string', label: '제목' }, body: { type: 'string', label: '본문' }, totalLabel: { type: 'string', label: '전체 표시' } }, defaultProps: bodyNumberedDefaultProps },
  { id: 'body-tip-card', name: 'BodyTipCard', category: 'body', description: '팁 카드', component: BodyTipCard, propsSchema: { emoji: { type: 'string', label: '이모지' }, title: { type: 'string', label: '제목' }, body: { type: 'string', label: '본문' }, tipNumber: { type: 'string', label: '팁 번호' } }, defaultProps: bodyTipCardDefaultProps },
  { id: 'body-timeline', name: 'BodyTimeline', category: 'body', description: '타임라인', component: BodyTimeline, propsSchema: { title: { type: 'string', label: '제목' }, items: { type: 'object[]|string[]', label: '타임라인 항목' } }, defaultProps: bodyTimelineDefaultProps },

  { id: 'cta-follow', name: 'CTAFollow', category: 'cta', description: '팔로우 유도', component: CTAFollow, propsSchema: { title: { type: 'string', label: '제목' }, handle: { type: 'string', label: '핸들' }, reason: { type: 'string', label: '설명' } }, defaultProps: ctaFollowDefaultProps },
  { id: 'cta-save', name: 'CTASave', category: 'cta', description: '저장 유도', component: CTASave, propsSchema: { title: { type: 'string', label: '제목' }, subtitle: { type: 'string', label: '설명' }, tip: { type: 'string', label: '팁' } }, defaultProps: ctaSaveDefaultProps },
  { id: 'cta-link', name: 'CTALink', category: 'cta', description: '링크/프로필 유도', component: CTALink, propsSchema: { title: { type: 'string', label: '제목' }, linkLabel: { type: 'string', label: '링크 라벨' }, linkValue: { type: 'string', label: '링크 주소' }, caption: { type: 'string', label: '설명' } }, defaultProps: ctaLinkDefaultProps },
  {
    id: 'cta-question', name: 'CTAQuestion', category: 'cta', description: '댓글 유도 질문', component: CTAQuestion,
    propsSchema: {
      question: { type: 'string', label: '질문' },
      guide: { type: 'string', label: '안내' },
      prompt: { type: 'string', label: '해시태그/프롬프트' },
      // Style overrides
      questionFontSize: { type: 'number', label: '질문 크기', group: 'style', min: 40, max: 120, step: 2, default: 74 },
      guideFontSize: { type: 'number', label: '안내 크기', group: 'style', min: 18, max: 50, step: 2, default: 30 },
      promptFontSize: { type: 'number', label: '프롬프트 크기', group: 'style', min: 20, max: 60, step: 2, default: 36 },
      padding: { type: 'number', label: '패딩', group: 'style', min: 32, max: 140, step: 4, default: 80 },
    },
    defaultProps: ctaQuestionDefaultProps,
  },
  { id: 'cta-dm', name: 'CTADM', category: 'cta', description: 'DM 유도', component: CTADM, propsSchema: { title: { type: 'string', label: '제목' }, keyword: { type: 'string', label: '키워드' }, description: { type: 'string', label: '설명' }, prompt: { type: 'string', label: '해시태그' } }, defaultProps: ctaDMDefaultProps },
  { id: 'cta-share', name: 'CTAShare', category: 'cta', description: '공유 유도', component: CTAShare, propsSchema: { title: { type: 'string', label: '제목' }, targetPerson: { type: 'string', label: '대상' }, reason: { type: 'string', label: '이유' }, prompt: { type: 'string', label: '해시태그' } }, defaultProps: ctaShareDefaultProps },
  { id: 'cta-checklist-score', name: 'CTAChecklistScore', category: 'cta', description: '점수 카드', component: CTAChecklistScore, propsSchema: { title: { type: 'string', label: '제목' }, footer: { type: 'string', label: '하단 안내' }, prompt: { type: 'string', label: '해시태그' } }, defaultProps: ctaChecklistScoreDefaultProps },
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
