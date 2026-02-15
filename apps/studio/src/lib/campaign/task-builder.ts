/**
 * OpenClaw 서브에이전트 task 템플릿 빌더
 * 
 * Campaign 콘텐츠 생성을 위한 task 문자열을 조립한다.
 * 이 task는 sessions_spawn에 전달되어 서브에이전트가 실행한다.
 */

import type { GenerateTaskInput } from './types';

const CHANNEL_GUIDELINES: Record<string, string> = {
  brxce_guide: `
- 길이: 2000~5000자
- 톤: 실천자, 상세, "나는 이렇게 쓰고 있다"
- SEO 키워드 자연 배치, H2/H3 구조, 목차 포함
- CTA 필수 (뉴스레터 구독 or 다음 가이드)
- 이모지 최소 (🦞만)`,

  newsletter: `
- 길이: 500~1000자
- 톤: 친근+전문, 호기심 유발
- 가이드 CTA로 연결
- 첫 문장에 훅`,

  threads: `
- 길이: ~500자 (한국어)
- 톤: 독백/일기체, 짧고 끊어치기
- 이모지: 🦞만 사용
- 마지막에 찌르기 (반전/질문)
- 해시태그 없음`,

  x: `
- 길이: ~280자 (영어)
- 톤: 간결, 임팩트
- 해시태그 2~3개
- 영어로 작성`,

  linkedin: `
- 길이: ~1000자
- 톤: 전문가 1인칭, 경험 기반
- 인사이트 중심
- CTA: 댓글/공유 유도`,

  instagram: `
- 길이: ~300자 (캡션)
- 톤: 캐주얼
- 해시태그 다수 (10~15개)
- CTA: 프로필 링크`,

  youtube: `
- 숏폼 스크립트 (15~60초)
- 훅 (3초) → 핵심 포인트 3개 → CTA
- 자막 기준으로 작성`,
};

export function buildGenerateTask(input: GenerateTaskInput): string {
  const { campaign, atom, config, styleProfile, baseVariant } = input;

  const sections: string[] = [];

  // 헤더
  sections.push(`## 캠페인 콘텐츠 생성

> 이 작업은 BrxceStudio Campaign System의 콘텐츠 생성 태스크입니다.
> 결과를 Supabase campaign_variants 테이블에 직접 저장하세요.`);

  // 캠페인 정보
  sections.push(`### 캠페인 정보
- **캠페인 ID**: \`${campaign.id}\`
- **제목**: ${campaign.title}
- **주제**: ${campaign.topic}
${campaign.brief ? `- **브리프**: ${campaign.brief}` : ''}
- **퍼널**: ${campaign.funnel_stage.toUpperCase()}
- **CTA**: ${campaign.cta_type}${campaign.cta_target ? ` → ${campaign.cta_target}` : ''}
${campaign.seo_keywords?.length ? `- **SEO 키워드**: ${campaign.seo_keywords.join(', ')}` : ''}
${campaign.style_notes ? `- **스타일 노트**: ${campaign.style_notes}` : ''}`);

  // 생성 대상
  sections.push(`### 생성 대상 Atom
- **Atom ID**: \`${atom.id}\`
- **포맷**: ${atom.format}
- **채널**: ${atom.channel}`);

  // 생성 옵션
  sections.push(`### 생성 옵션
- **버전 수**: ${config.variant_count}
- **다양화**: ${config.diversity}
${config.feedback ? `- **피드백**: ${config.feedback}` : ''}
${config.base_variant_id ? `- **기반 버전 ID**: \`${config.base_variant_id}\`` : ''}`);

  // 기반 버전 내용
  if (baseVariant?.output?.body) {
    sections.push(`### 기반 버전 (이 버전을 발전시킬 것)
\`\`\`
${baseVariant.output.body}
\`\`\``);
  }

  // 스타일 프로필
  if (styleProfile) {
    const styleParts: string[] = ['### 스타일 프로필'];
    if (styleProfile.patterns) {
      styleParts.push(`**패턴 (따를 것):**\n${styleProfile.patterns}`);
    }
    if (styleProfile.anti_patterns) {
      styleParts.push(`**안티패턴 (하지 말 것):**\n${styleProfile.anti_patterns}`);
    }
    if (styleProfile.examples_summary) {
      styleParts.push(`**완성작 요약:**\n${styleProfile.examples_summary}`);
    } else if (styleProfile.examples?.length) {
      const exampleTexts = styleProfile.examples
        .slice(0, styleProfile.max_examples || 5)
        .map((ex: any, i: number) => `[예시 ${i + 1}] ${typeof ex === 'string' ? ex.substring(0, 300) : JSON.stringify(ex).substring(0, 300)}`)
        .join('\n\n');
      styleParts.push(`**참고 완성작:**\n${exampleTexts}`);
    }
    sections.push(styleParts.join('\n\n'));
  }

  // 채널 가이드라인
  const guideline = CHANNEL_GUIDELINES[atom.channel];
  if (guideline) {
    sections.push(`### 채널 가이드라인 (${atom.channel})
${guideline}`);
  }

  // 출력 규칙
  sections.push(`### 출력 규칙

1. **${config.variant_count}개 variant 생성** — 각각 다른 접근법으로
2. **각 variant를 Supabase에 INSERT**:
   \`\`\`
   POST https://euhxmmiqfyptvsvvbbvp.supabase.co/rest/v1/campaign_variants
   Headers:
     apikey: (환경변수 또는 anon key)
     Authorization: Bearer (같은 키)
     Content-Type: application/json
     Prefer: return=representation
   
   Body:
   {
     "atom_id": "${atom.id}",
     "parent_id": ${config.base_variant_id ? `"${config.base_variant_id}"` : 'null'},
     "generation": (세대 번호),
     "params": { "tone": "...", "hook_type": "...", ... },
     "output": { "body": "본문 전체", "word_count": N },
     "model": "(사용한 모델)",
     "is_selected": false
   }
   \`\`\`
3. **팩트체크 플래그**: 수치/통계/인용이 포함된 문장에 주목하여
   atom의 fact_check_flags를 업데이트:
   \`\`\`
   PATCH .../campaign_atoms?id=eq.${atom.id}
   { "fact_check_flags": [{"text": "...", "reason": "...", "verified": false}] }
   \`\`\`
4. **atom 상태 업데이트**: 생성 완료 후
   \`\`\`
   PATCH .../campaign_atoms?id=eq.${atom.id}
   { "status": "comparing" }
   \`\`\`
5. **결과 요약을 announce** — 각 variant의 핵심 차이점 1줄씩`);

  // 콘텐츠 작성 필수 원칙
  sections.push(`### 콘텐츠 작성 원칙 (필수)
- 실전 사례 중심: "이론적으로는~" 금지. "나는 이렇게 쓰고 있다" 톤
- 독자 이익 중심: "이걸 쓰면 당신에게 이런 일이 생긴다"
- CTA 없는 콘텐츠 = 알맹이 없음
- 한국 시장 특화: 위기감/경쟁 자극
- Bruce 개인 브랜딩: "에이전틱 워크플로우로 회사를 운영하는 CEO"
- 팩트체크 필수: 제품/회사 언급 시 웹 검색으로 검증`);

  return sections.join('\n\n---\n\n');
}

/**
 * 서브에이전트 모델 선택
 */
export function selectModel(format: string): string {
  switch (format) {
    case 'long_text':
      return 'anthropic/claude-opus-4-6';
    default:
      return 'anthropic/claude-sonnet-4-20250514';
  }
}

/**
 * 서브에이전트 label 생성
 */
export function buildLabel(campaignId: string, channel: string, format: string): string {
  return `campaign-gen-${campaignId.slice(0, 8)}-${channel}-${format}`;
}
