#!/usr/bin/env npx tsx
/**
 * Fetch Content → LLM 카피라이팅 → Studio Carousel 등록
 *
 * 1. Supabase contents에서 body_md가 있는 콘텐츠를 가져옴
 * 2. LLM에 기존 고퀄리티 캐러셀 패턴 + body_md를 전달
 * 3. LLM이 Studio 슬라이드 포맷으로 카피라이팅
 * 4. carousels 테이블에 upsert
 *
 * 사용법:
 *   npx tsx scripts/fetch-carousel.ts --list-sources
 *   npx tsx scripts/fetch-carousel.ts --source-id <uuid>
 *   npx tsx scripts/fetch-carousel.ts --source-id <uuid> --dry-run
 */

// ==========================================
// 설정
// ==========================================

const SUPABASE_URL = 'https://euhxmmiqfyptvsvvbbvp.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aHhtbWlxZnlwdHZzdnZiYnZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkxNTkwMywiZXhwIjoyMDg2NDkxOTAzfQ.lkJCQ3y6QZ_TjNPUh187iELorIj64hyvmcfOhZ8zfuk'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
}

// ==========================================
// 타입
// ==========================================

interface Content {
  id: string; title: string; slug: string | null; status: string
  body_md: string | null; hook: string | null; core_message: string | null
  media_type: string | null; tags: string | string[] | null
  cta: string | null; subcategory: string | null; source_idea: string | null
}

interface CarouselSlide {
  id: string; templateId: string; label: string
  category: 'cover' | 'hook' | 'body' | 'cta'
  content: Record<string, any>; overrides: Record<string, any>
}

interface CliOptions {
  contentId?: string; sourceId?: string
  list: boolean; listSources: boolean; dryRun: boolean
}

// ==========================================
// Helpers
// ==========================================

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

async function supaFetch(endpoint: string, init?: RequestInit) {
  const res = await fetch(`${SUPABASE_URL}${endpoint}`, { ...init, headers: { ...HEADERS, ...init?.headers } })
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
  return res
}

async function fetchCarouselContents(): Promise<Content[]> {
  const res = await supaFetch('/rest/v1/contents?media_type=eq.carousel&select=*&order=created_at.desc')
  return res.json()
}

async function fetchContentById(id: string): Promise<Content | null> {
  const res = await supaFetch(`/rest/v1/contents?id=eq.${id}&select=*`)
  const data = await res.json()
  return data[0] || null
}

// ==========================================
// LLM 카피라이팅 — 기존 고퀄리티 캐러셀 패턴 기반
// ==========================================

const CAROUSEL_SYSTEM_PROMPT = `당신은 인스타그램/스레드 캐러셀 카피라이터입니다.

## 역할
원본 콘텐츠(body_md)를 받아서 BrxceStudio 캐러셀 슬라이드 JSON으로 변환합니다.

## 사용 가능한 슬라이드 템플릿

### cover 카테고리
- **cover-bold**: content: { title, subtitle }, overrides: { tag }
  - title: 줄바꿈(\\n)으로 2~3줄 분리, **bold** 강조 가능
  - subtitle: 1~2줄 부연
  - tag: 상단 태그 (예: "AGENTIC WORKFLOW")

### hook 카테고리
- **hook-stat**: content: {}, overrides: { statValue, statLabel, detail }
  - statValue: 큰 숫자/키워드 (예: "0원", "3시간", "10배")
  - statLabel: 숫자 설명 (예: "매일 절약", "24시간 가동 비용")
  - detail: 2~3줄 부연 설명
- **hook-teaser**: content: { title, subtitle }, overrides: {}
- **hook-question**: content: { question, subQuestion }, overrides: {}

### body 카테고리
- **body-text**: content: { title, body }, overrides: {}
  - title: 질문형/감성적 카피 (줄바꿈 가능, 예: "AI는 늘었는데\\n왜 내 시간은 그대로일까")
  - body: 3~6줄 본문, **bold** 강조 활용, 짧고 임팩트 있게
- **body-list**: content: { title, items[] }, overrides: {}
  - items: 3~5개, 각 항목 15자 이내로 간결하게

### cta 카테고리
- **cta-question**: content: {}, overrides: { question, guide, prompt }
  - question: 댓글 유도 질문 (줄바꿈 가능)
  - guide: 안내 (예: "댓글로 알려주세요 👇")
  - prompt: 해시태그

## 고퀄리티 캐러셀 예시 (이 패턴을 따르세요)

### 예시: "돈 버는 AI, 에이전틱 워크플로우" (8장)
1. cover-bold: title="월급 안 받는\\n**초능력 사원** 10명\\n(거의)무료로 채용하는 법", subtitle="단순 챗봇은 돈을 쓰지만,\\n에이전트는 돈을 벌어줍니다"
2. hook-stat: statValue="0원", statLabel="24시간 가동 비용", detail="사람 10명이 붙어야 할 일을\\nAI 에이전트 1명이 동시 처리\\n이런 에이전트가 10개라면?\\n\\n인건비는 1/10, 생산성은 100배"
3. body-text: title="AI는 늘었는데\\n왜 내 시간은 그대로일까", body="챗봇에게 시키고, 결과 확인하고, 다시 고쳐달라고 하고…\\n\\n결국 **사람이 AI의 뒷수습**을 하고 있다면?\\n\\n도구만 있고\\n**워크플로우**가 없기 때문입니다."
4. body-text: title="끝까지 해내는 지능", body="기존: 내가 질문하면 AI가 답함.\\n그게 끝.\\n\\n에이전틱: 내가 **목표**를 주면\\nAI가 전략을 짜고\\n도구를 써서\\n**완수**합니다."
5~6. body-text: (실전 사례/설명)
7. hook-stat: statValue="×100", statLabel="생산성 점프", detail="프롬프트를 공부하지 마세요\\n\\n디지털 일꾼을 고용하세요"
8. cta-question: question="당신의 '디지털 직원'에게\\n어떤 일을 시키겠습니까?", guide="댓글로 알려주세요 👇"

## 핵심 규칙
1. **원본 텍스트를 그대로 복붙하지 마세요** — 캐러셀용 짧은 카피로 재작성
2. **제목은 질문형/감성적** — 딱딱한 설명체 ❌, 공감/호기심 유발 ✅
3. **본문은 짧게** — body-text는 최대 6줄, body-list의 items는 15자 이내
4. **전문용어 금지** — "에스컬레이션", "선제 안내" 같은 말은 쉽게 바꾸기
5. **숫자 강조** — 임팩트 있는 수치가 있으면 hook-stat으로 분리
6. **커버 제목은 원본 제목 그대로 쓰지 마세요** — 더 임팩트 있게 재작성
7. **"5선"이면 5개 모두 포함** — 콘텐츠를 자르지 마세요
8. **마지막 직전에 hook-stat 임팩트 슬라이드 삽입** (기존 패턴)

## 출력 형식
JSON 배열만 출력하세요. 설명 없이 순수 JSON만.
각 슬라이드: { "templateId": "...", "label": "...", "category": "...", "content": {...}, "overrides": {...} }
`

async function generateCarouselWithLLM(content: Content): Promise<CarouselSlide[]> {
  // Anthropic API 키 확인
  let apiKey = ANTHROPIC_API_KEY
  if (!apiKey) {
    // openclaw 크레덴셜에서 가져오기 시도
    const fs = await import('fs')
    const path = await import('path')
    const home = process.env.HOME || ''
    const credPaths = [
      path.join(home, '.openclaw/credentials/anthropic.json'),
      path.join(home, '.config/openclaw/credentials/anthropic.json'),
    ]
    for (const p of credPaths) {
      try {
        const cred = JSON.parse(fs.readFileSync(p, 'utf-8'))
        apiKey = cred.apiKey || cred.key || ''
        if (apiKey) break
      } catch { /* ignore */ }
    }
  }

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY 환경변수가 필요합니다')
  }

  const userPrompt = `다음 콘텐츠를 캐러셀 슬라이드로 변환해주세요.

## 원본 콘텐츠
- 제목: ${content.title}
- 핵심 메시지: ${content.core_message || '없음'}
- 훅: ${content.hook || '없음'}
- CTA: ${content.cta || '@brxce.ai 팔로우'}

## 원본 본문 (body_md)
${content.body_md}

위 내용을 기반으로 캐러셀 슬라이드 JSON 배열을 생성해주세요.
커버(1) + 훅(1) + 본문(내용에 맞게) + 임팩트(1) + CTA(1) 구성.
JSON 배열만 출력하세요.`

  console.log('  🤖 LLM 카피라이팅 중...')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: CAROUSEL_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text || ''

  // JSON 파싱 (코드블록 제거)
  const jsonStr = text.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim()
  const slides: any[] = JSON.parse(jsonStr)

  // id 부여
  return slides.map((s: any) => ({
    id: uid('slide'),
    templateId: s.templateId,
    label: s.label || '',
    category: s.category,
    content: s.content || {},
    overrides: s.overrides || {},
  }))
}

// ==========================================
// carousels 테이블 upsert
// ==========================================

async function upsertCarousel(title: string, slides: CarouselSlide[], caption?: string, carouselId?: string): Promise<string> {
  const id = carouselId || uid('carousel')
  const res = await supaFetch('/rest/v1/carousels', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation,resolution=merge-duplicates',
    },
    body: JSON.stringify({ id, title, caption: caption || null, slides, updated_at: new Date().toISOString() }),
  })
  const data = await res.json()
  return data[0]?.id || id
}

// ==========================================
// CLI
// ==========================================

function parseArgs(): CliOptions {
  const args = process.argv.slice(2)
  const options: CliOptions = { list: false, listSources: false, dryRun: false }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i], next = args[i + 1]
    switch (arg) {
      case '--id': options.contentId = next; i++; break
      case '--source-id': options.sourceId = next; i++; break
      case '--list': options.list = true; break
      case '--list-sources': options.listSources = true; break
      case '--dry-run': options.dryRun = true; break
    }
  }
  return options
}

async function main() {
  const options = parseArgs()

  // ── 소스 목록 ──
  if (options.listSources) {
    const res = await supaFetch('/rest/v1/contents?body_md=not.is.null&select=id,title,media_type,status,body_md,hook&order=created_at.desc')
    const data: Content[] = await res.json()
    console.log(`\n📄 캐러셀 소스 콘텐츠 ${data.length}개\n`)
    for (const c of data) {
      const bodyLen = (c.body_md || '').length
      const hasHook = c.hook ? '✅' : '❌'
      console.log(`${c.id}  ${String(bodyLen + '자').padEnd(8)} hook=${hasHook}  ${c.title.substring(0, 50)}`)
    }
    return
  }

  // ── 캐러셀 목록 ──
  if (options.list) {
    const contents = await fetchCarouselContents()
    const existingRes = await supaFetch('/rest/v1/carousels?select=id')
    const existing: { id: string }[] = await existingRes.json()
    const existingIds = new Set(existing.map(e => e.id))

    console.log(`\n🎠 캐러셀 콘텐츠 ${contents.length}개 (Studio: ${existing.length}개)\n`)
    for (const c of contents) {
      const inStudio = existingIds.has(c.source_idea || '') || existingIds.has(c.slug || '') ? '✅' : '❌'
      console.log(`${c.id}  Studio=${inStudio}  ${c.title}`)
    }
    return
  }

  // ── 콘텐츠 선택 ──
  let content: Content | null
  if (options.sourceId) {
    content = await fetchContentById(options.sourceId)
    if (!content) { console.error(`❌ 없음: ${options.sourceId}`); process.exit(1) }
    if (!content.body_md) { console.error(`❌ body_md 비어있음: "${content.title}"`); process.exit(1) }
    console.log(`📄 소스: "${content.title}" (${content.body_md.length}자)`)
  } else if (options.contentId) {
    content = await fetchContentById(options.contentId)
    if (!content) { console.error(`❌ 없음: ${options.contentId}`); process.exit(1) }
    if (!content.body_md) { console.error(`❌ body_md 비어있음`); process.exit(1) }
  } else {
    console.error('❌ --source-id <uuid> 또는 --id <uuid> 필요')
    process.exit(1)
  }

  // ── LLM 카피라이팅 ──
  const slides = await generateCarouselWithLLM(content)

  console.log(`\n🎠 캐러셀 생성 완료`)
  console.log(`   제목: ${content.title}`)
  console.log(`   슬라이드: ${slides.length}장`)
  console.log(`   구성:`)
  for (const s of slides) {
    console.log(`     [${s.category.padEnd(5)}] ${s.templateId.padEnd(16)} "${s.label}"`)
  }

  if (options.dryRun) {
    console.log('\n📋 JSON:')
    console.log(JSON.stringify({ title: content.title, slides }, null, 2))
    return
  }

  // ── DB 등록 ──
  const carouselId = await upsertCarousel(
    content.title,
    slides,
    content.hook || undefined,
    content.source_idea || content.slug || undefined,
  )

  console.log(`\n✅ Studio 등록 완료!`)
  console.log(`   ID: ${carouselId}`)
  console.log(`   확인: /carousel/${carouselId}`)
}

main().catch((err) => {
  console.error('❌ 오류:', err)
  process.exit(1)
})
