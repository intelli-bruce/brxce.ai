---
tags:
  - brxce-ai
  - studio
  - 설계
  - 시스템
created: 2026-02-15
updated: 2026-02-15
---

# BrxceStudio — 콘텐츠 CMS + 미디어 제작 스튜디오

> brxce.ai에서 어드민/CMS를 완전 분리한 독립 앱.
> 콘텐츠 관리 + 영상/캐러셀/이미지 미디어 제작을 하나의 스튜디오에서.
> BRXCE: #339 BRUCE-STUDIO 하위

---

## 1. 아키텍처 — 두 앱 분리

```
┌──────────────────────────┐     ┌──────────────────────────────────────┐
│     brxce.ai             │     │     studio.brxce.ai (BrxceStudio)   │
│     (퍼블릭)              │     │     (어드민 + 미디어)                │
├──────────────────────────┤     ├──────────────────────────────────────┤
│ · 랜딩 페이지             │     │ · CMS (콘텐츠 CRUD)                 │
│ · /guides (가이드)        │     │ · 아이디어 / 발행 / 뉴스레터         │
│ · /showcase              │     │ · 미디어 라이브러리                  │
│ · 구독/문의 폼            │     │ · 쇼케이스 (버전 비교)              │
│ · SEO / OG               │     │ · 🎬 스튜디오 (영상/캐러셀/이미지)   │
│ · RSS / sitemap           │     │ · 대시보드 / 분석                   │
│                          │     │                                     │
│ 가볍다. 퍼블릭 전용.      │     │ 무거워도 됨. Bruce님 전용.          │
│ Vercel 배포               │     │ 로컬 전용 (localhost:3200)          │
└────────────┬─────────────┘     └──────────────────┬───────────────────┘
             │                                      │
             └──────────────┬───────────────────────┘
                            │
                   ┌────────▼────────┐
                   │    Supabase     │
                   │  (공유 DB/Storage) │
                   │  euhxmmiqfy...  │
                   └─────────────────┘
```

### 왜 분리하는가

1. **brxce.ai가 무거워질 필요 없음** — 퍼블릭 방문자에겐 가이드/랜딩만 보이면 됨
2. **어드민은 Bruce님만 사용** — 배포 불필요, 로컬이면 충분
3. **스튜디오(Remotion) 추가 시 빌드 복잡도 증가** — 분리하면 각자 독립
4. **개발 속도** — 어드민 수정이 퍼블릭 빌드에 영향 없음

### 공유하는 것

| 공유 자원 | 설명 |
|----------|------|
| **Supabase DB** | 같은 프로젝트, 같은 테이블 |
| **Supabase Storage** | `content-media` 버킷 |
| **Supabase Auth** | 같은 OAuth (Google/Kakao) |
| **도메인** | brxce.ai / studio.brxce.ai (나중에 배포 시) |

### 분리되는 것

| | brxce.ai | BrxceStudio |
|---|---|---|
| **레포** | intelli-bruce/brxce.ai | intelli-bruce/brxce-studio (신규) |
| **포트** | 3100 | 3200 |
| **배포** | Vercel (프로덕션) | 로컬 (우선), 나중에 Vercel |
| **도메인** | brxce.ai | studio.brxce.ai (나중에) |
| **React** | 19 (Next.js 16) | 19 (Next.js 16) + 18 (Remotion, 하위 패키지) |

---

## 2. 프로젝트 구조

```
brxce-studio/                         # 신규 레포
├── package.json                      # Next.js 16 + Tailwind 4
├── next.config.ts
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                # 어드민 레이아웃 (사이드바)
│   │   ├── page.tsx                  # 대시보드
│   │   │
│   │   ├── contents/                 # 📝 콘텐츠 CMS (brxce.ai/admin에서 이식)
│   │   │   ├── page.tsx              #   목록
│   │   │   ├── new/page.tsx          #   신규 작성
│   │   │   └── [id]/page.tsx         #   편집
│   │   │
│   │   ├── ideas/page.tsx            # 💡 아이디어
│   │   ├── publications/page.tsx     # 📢 발행
│   │   ├── newsletter/page.tsx       # 📩 뉴스레터
│   │   ├── showcase/page.tsx         # 🎨 쇼케이스
│   │   ├── media/page.tsx            # 🖼️ 미디어 라이브러리
│   │   │
│   │   ├── studio/                   # 🎬 스튜디오 (신규)
│   │   │   ├── page.tsx              #   프로젝트 목록
│   │   │   ├── new/page.tsx          #   새 프로젝트 (템플릿 선택)
│   │   │   ├── [id]/page.tsx         #   편집 (씬/슬라이드/레이어)
│   │   │   ├── media/page.tsx        #   미디어 카탈로그 브라우저
│   │   │   └── templates/page.tsx    #   템플릿 갤러리
│   │   │
│   │   ├── api/                      # API Routes
│   │   │   ├── studio/
│   │   │   │   ├── projects/route.ts
│   │   │   │   ├── render/route.ts
│   │   │   │   └── media/route.ts
│   │   │   └── newsletter/
│   │   │       ├── send/route.ts
│   │   │       └── subscribe/route.ts
│   │   │
│   │   └── auth/                     # Supabase Auth
│   │       ├── login/page.tsx
│   │       └── callback/route.ts
│   │
│   ├── components/
│   │   ├── Sidebar.tsx               # 어드민 사이드바
│   │   ├── ContentEditor.tsx         # 마크다운 에디터
│   │   ├── MediaLibraryModal.tsx     # 미디어 선택 모달
│   │   ├── studio/
│   │   │   ├── SceneEditor.tsx       # 영상 씬 편집
│   │   │   ├── SlideEditor.tsx       # 캐러셀 슬라이드 편집
│   │   │   ├── LayerEditor.tsx       # 이미지 레이어 편집
│   │   │   ├── MediaBrowser.tsx      # 카탈로그 브라우저
│   │   │   ├── CanvasPreview.tsx     # 실시간 프리뷰
│   │   │   └── RenderButton.tsx      # 렌더 트리거 + 상태
│   │   └── shared/
│   │       ├── TagFilter.tsx
│   │       ├── SubscribeForm.tsx
│   │       └── ExcalidrawViewer.tsx
│   │
│   └── lib/
│       ├── supabase.ts               # Supabase 클라이언트
│       ├── supabase-admin.ts         # Service Role
│       ├── supabase-server.ts        # Server Component용
│       ├── studio/
│       │   ├── types.ts              # Studio 타입 정의
│       │   ├── templates.ts          # 템플릿 레지스트리
│       │   ├── media-catalog.ts      # 카탈로그 로드/검색
│       │   └── render-client.ts      # 렌더 요청
│       └── newsletter-template.ts
│
├── engine/                           # 🎬 렌더 엔진 (독립 패키지)
│   ├── package.json                  #   Remotion 4 + React 18
│   ├── remotion.config.ts
│   │
│   ├── video/                        #   영상 컴포지션 (Bruce Studio 이식)
│   │   ├── VSReel.tsx
│   │   ├── DayInTheLife.tsx
│   │   ├── ShortFormVideo.tsx
│   │   ├── NewsBreaking.tsx
│   │   ├── TextOverVideo.tsx
│   │   └── Demo60s.tsx
│   │
│   ├── carousel/                     #   캐러셀 컴포지션 (신규)
│   │   ├── CardNews.tsx
│   │   ├── StepByStep.tsx
│   │   ├── BeforeAfter.tsx
│   │   ├── ListCarousel.tsx
│   │   └── QuoteCarousel.tsx
│   │
│   ├── image/                        #   이미지 컴포지션 (신규)
│   │   ├── OgImage.tsx
│   │   ├── SocialPost.tsx
│   │   ├── Infographic.tsx
│   │   ├── Quote.tsx
│   │   └── Thumbnail.tsx
│   │
│   ├── shared/                       #   공유 컴포넌트
│   │   ├── BrxceBrand.tsx
│   │   ├── CaptionRenderer.tsx
│   │   └── Layout.tsx
│   │
│   ├── scripts/                      #   CLI
│   │   ├── scan-media.ts
│   │   ├── render-video.ts
│   │   ├── render-carousel.ts
│   │   ├── render-image.ts
│   │   └── extract-thumbnails.ts
│   │
│   └── data/                         #   미디어 카탈로그
│       ├── media-catalog.json
│       └── thumbnails/
│
└── supabase/                         # 마이그레이션 (공유 DB)
    └── migrations/
        └── 20260216_studio_projects.sql
```

---

## 3. brxce.ai에서 이식할 것

### CMS 페이지 (전부 이동)

| brxce.ai 원본 | → BrxceStudio |
|---|---|
| `src/app/admin/page.tsx` | `src/app/page.tsx` (대시보드) |
| `src/app/admin/contents/` | `src/app/contents/` |
| `src/app/admin/ideas/page.tsx` | `src/app/ideas/page.tsx` |
| `src/app/admin/publications/page.tsx` | `src/app/publications/page.tsx` |
| `src/app/admin/newsletter/page.tsx` | `src/app/newsletter/page.tsx` |
| `src/app/admin/showcase/page.tsx` | `src/app/showcase/page.tsx` |
| `src/app/admin/media/page.tsx` | `src/app/media/page.tsx` |
| `src/app/admin/layout.tsx` | `src/app/layout.tsx` |
| `src/components/MediaLibraryModal.tsx` | `src/components/MediaLibraryModal.tsx` |
| `src/components/ExcalidrawViewer.tsx` | `src/components/ExcalidrawViewer.tsx` |
| `src/components/TagFilter.tsx` | `src/components/shared/TagFilter.tsx` |
| `src/lib/supabase*.ts` | `src/lib/supabase*.ts` |
| `src/lib/newsletter-template.ts` | `src/lib/newsletter-template.ts` |
| `src/app/api/newsletter/` | `src/app/api/newsletter/` |
| `src/app/api/sync-threads/route.ts` | `src/app/api/sync-threads/route.ts` |
| `src/app/auth/` | `src/app/auth/` |

### brxce.ai에 남는 것 (퍼블릭 전용)

```
brxce.ai/
├── src/app/
│   ├── page.tsx              # 랜딩
│   ├── guides/               # 가이드 페이지 (published 콘텐츠 렌더)
│   ├── showcase/page.tsx     # 퍼블릭 쇼케이스
│   ├── practical/page.tsx    # 실전 활용법
│   ├── feed.xml/route.ts     # RSS
│   ├── sitemap.ts            # sitemap
│   ├── newsletter/           # 구독해지 등 퍼블릭 페이지
│   ├── api/
│   │   ├── feed/route.ts
│   │   └── newsletter/subscribe/route.ts  # 구독 폼 (퍼블릭에서도 필요)
│   └── auth/                 # OAuth 콜백 (퍼블릭 로그인용)
├── src/components/
│   ├── GuideBody.tsx
│   ├── GuideHeader.tsx
│   ├── GuideSection.tsx
│   ├── LatestGuides.tsx
│   ├── TableOfContents.tsx
│   ├── SubscribeForm.tsx
│   ├── UnpublishedBanner.tsx
│   └── SocialLoginButtons.tsx
└── src/lib/
    ├── supabase.ts           # 같은 Supabase 프로젝트
    └── supabase-server.ts
```

### Bruce Studio에서 이식할 것

| Bruce Studio 소스 | → BrxceStudio engine/ |
|---|---|
| `bruce-studio-video/src/compositions/*.tsx` | `engine/video/` |
| `bruce-studio-video/src/components/captions/` | `engine/shared/CaptionRenderer.tsx` |
| `bruce-studio-video/scripts/scan-media.ts` | `engine/scripts/scan-media.ts` |
| `bruce-studio-video/scripts/render-from-project.ts` | `engine/scripts/render-video.ts` |
| `bruce-studio-video/scripts/extract-thumbnails.ts` | `engine/scripts/extract-thumbnails.ts` |
| `bruce-studio-video/data/` | `engine/data/` |

---

## 4. 데이터 모델

### 기존 테이블 (공유, 변경 없음)

- `contents` (33편) — 콘텐츠 본문
- `content_variants` — 버전 A/B/C
- `adaptations` — 채널별 변환
- `publications` — 발행 기록
- `ideas` (38건) — 아이디어 씨앗
- `subscribers` / `email_logs` — 뉴스레터
- `submissions` — 폼 제출
- `profiles` — 유저
- `content_reviews` — 리뷰

### 신규 테이블

```sql
-- studio_projects: 미디어 제작 프로젝트
create table studio_projects (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references contents(id) on delete set null,
  
  title text not null,
  type text not null check (type in ('video', 'carousel', 'image')),
  status text not null default 'draft' 
    check (status in ('draft', 'editing', 'ready', 'rendering', 'rendered', 'failed')),
  
  template text not null,             -- 'VSReel', 'CardNews', 'OgImage' 등
  width int not null default 1080,
  height int not null default 1920,
  fps int default 60,                 -- 영상 전용
  
  scenes jsonb default '[]',          -- Video: Scene[], Carousel: Slide[], Image: Layer[]
  media_mappings jsonb default '{}',
  style_config jsonb default '{}',
  
  output_urls jsonb default '[]',     -- 렌더 결과 URL 배열
  render_log text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index studio_projects_content_id on studio_projects(content_id);
create index studio_projects_type on studio_projects(type);
alter table studio_projects enable row level security;
create policy "Admin full access" on studio_projects for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create trigger studio_projects_updated_at 
  before update on studio_projects 
  for each row execute function update_updated_at();
```

---

## 5. 미디어 타입별 설계

### 5.1 영상 (Video) — 6 템플릿

Bruce Studio Remotion 컴포지션 이식:

| 템플릿 | 용도 | 해상도 |
|--------|------|--------|
| VSReel | 비교형 릴스 | 1080×1920 |
| ShortFormVideo | TTS+자막 숏폼 | 1080×1920 |
| DayInTheLife | 일상 타임랩스 | 1080×1920 |
| NewsBreaking | 뉴스 속보 | 1080×1920 |
| TextOverVideo | 텍스트 오버레이 | 1080×1920 |
| Demo60s | 60초 데모 | 1080×1920 |

### 5.2 캐러셀 (Carousel) — 5 템플릿 (신규)

| 템플릿 | 용도 | 해상도 |
|--------|------|--------|
| CardNews | 카드뉴스 | 1080×1080 / 1080×1350 |
| StepByStep | 단계별 가이드 | 1080×1080 |
| BeforeAfter | Before/After | 1080×1080 |
| ListCarousel | Top N, 팁 | 1080×1080 |
| QuoteCarousel | 인사이트 카드 | 1080×1080 |

슬라이드 구조:
```
[Cover] 제목 + 훅 + 🦞
[Content ×N] 본문 (layout: text-only / text-image / quote)
[CTA] 팔로우 유도 + @brxce.ai
```

content.body_md → 헤딩(##) 단위 자동 분할 → 슬라이드

### 5.3 이미지 (Image) — 5 템플릿 (신규)

| 템플릿 | 용도 | 해상도 |
|--------|------|--------|
| OgImage | 블로그/가이드 OG | 1200×630 |
| SocialPost | SNS 이미지 | 1080×1080 |
| Infographic | 인포그래픽 | 1080×자동 |
| Quote | 인용구 카드 | 1080×1080 |
| Thumbnail | 영상 썸네일 | 1280×720 |

---

## 6. 미디어 카탈로그

| 항목 | 내용 |
|------|------|
| 원본 | `/Volumes/WorkSSD/Media/` (411개 파일, 영상 208개) |
| 카탈로그 | `engine/data/media-catalog.json` (exiftool 스캔) |
| 스캔 | `engine/scripts/scan-media.ts` (증분 스캔 지원) |
| 검색 | 타입, 태그, 날짜, 촬영모드, 텍스트 |
| 렌더 결과 저장 | Supabase Storage `content-media/studio/` |

---

## 7. 브랜드 디자인 시스템

```typescript
export const BRXCE_BRAND = {
  colors: {
    primary: '#FF6B35',       // 🦞
    background: '#0A0A0A',
    surface: '#1A1A1A',
    text: '#FAFAFA',
    textMuted: '#A0A0A0',
    accent: '#4ECDC4',
  },
  fonts: {
    headline: 'Pretendard',
    body: 'Pretendard',
    code: 'JetBrains Mono',
  },
  logo: { svg: '/brxce-logo.svg', emoji: '🦞' },
  watermark: '@brxce.ai',
}
```

모든 미디어(영상/캐러셀/이미지)에 자동 적용. 템플릿별 오버라이드 가능.

---

## 8. Admin UI 네비게이션

```
BrxceStudio (studio.brxce.ai / localhost:3200)

사이드바:
  📊 대시보드        ← /
  ─────────────────
  📝 콘텐츠          ← /contents
  💡 아이디어         ← /ideas
  📢 발행            ← /publications
  🎨 쇼케이스         ← /showcase
  ─────────────────
  🎬 스튜디오         ← /studio
  🖼️ 미디어 라이브러리  ← /studio/media
  📐 템플릿           ← /studio/templates
  ─────────────────
  📩 뉴스레터         ← /newsletter
  🗄️ 미디어(CMS)      ← /media
```

---

## 9. 실행 로드맵

### Phase 1: 프로젝트 생성 + CMS 이식 (2일)

- [ ] `brxce-studio` 레포 생성 (Next.js 16 + Tailwind 4 + Supabase)
- [ ] brxce.ai/admin 페이지 전부 이식
  - 대시보드, 콘텐츠, 아이디어, 발행, 뉴스레터, 쇼케이스, 미디어
  - Auth (Google/Kakao OAuth)
  - API routes (newsletter, sync-threads)
- [ ] brxce.ai에서 admin 관련 코드 제거 (퍼블릭만 남김)
- [ ] 로컬 동작 확인 (localhost:3200)

### Phase 2: 스튜디오 기반 — 영상 엔진 (1~2일)

- [ ] `engine/` 디렉토리 생성 + Remotion 세팅
- [ ] 영상 컴포지션 6개 이식 (Bruce Studio → engine/video/)
- [ ] CaptionRenderer, BrxceBrand 공유 컴포넌트
- [ ] 미디어 카탈로그 이식 (scan-media, data/)
- [ ] Supabase 마이그레이션 (studio_projects)
- [ ] `/studio` 기본 CRUD UI
- [ ] render-video.ts + API route

### Phase 3: 캐러셀 엔진 (1~2일)

- [ ] `engine/carousel/` 5개 컴포지션 개발
- [ ] render-carousel.ts (renderStill → PNG 시퀀스)
- [ ] content.body_md → 슬라이드 자동 분할
- [ ] SlideEditor UI

### Phase 4: 이미지 엔진 (1일)

- [ ] `engine/image/` 5개 컴포지션 개발
- [ ] render-image.ts
- [ ] OG 이미지 자동 생성 (contents 발행 시)

### Phase 5: 고급 기능 (추후)

- [ ] TTS 연동 (ElevenLabs)
- [ ] 영상 렌더 → 썸네일 자동 생성
- [ ] MCP 서버 (에이전트가 미디어 제작)
- [ ] Vercel 배포 (studio.brxce.ai)
- [ ] brxce.ai에서 published OG 이미지 자동 요청

---

## 10. 의존성

### BrxceStudio (Next.js)

```json
{
  "dependencies": {
    "next": "16.x",
    "react": "19.x",
    "react-dom": "19.x",
    "@supabase/supabase-js": "^2.95",
    "@supabase/ssr": "^0.8",
    "@excalidraw/excalidraw": "^0.18",
    "react-markdown": "^10",
    "rehype-highlight": "^7",
    "remark-gfm": "^4"
  }
}
```

### engine/ (Remotion)

```json
{
  "dependencies": {
    "remotion": "4.0.403",
    "@remotion/cli": "4.0.403",
    "@remotion/renderer": "4.0.403",
    "@remotion/captions": "4.0.407",
    "@remotion/transitions": "4.0.403",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "zod": "^3.23"
  }
}
```

---

## 11. 관련 문서

- [[CMS-문서]] — brxce CMS DB 스키마, API, 컴포넌트 상세
- [[퍼널-설계-v1]] — 마케팅 퍼널 설계
- Bruce Studio 원본: `~/Projects/bruce-studio/`
- brxce.ai 원본: `~/Projects/brxce.ai/`

---

## 부록: 가져오지 않는 것

| 모듈 | 이유 |
|------|------|
| bruce-studio-api (Fastify) | Next.js API routes가 대체 |
| bruce-studio-web | BrxceStudio UI가 대체 |
| bruce-studio-mcp | Phase 5에서 별도 설계 |
| bruce-studio-cli | 불필요 |
| bruce-studio-recorder | 불필요 |
| Brand MCP 20+ 도구 | BrxceBrand 상수로 간소화 |
| instagram-analysis/ | 별도 도구 |
