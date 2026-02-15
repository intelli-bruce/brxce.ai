---
tags:
  - brxce-ai
  - CMS
  - 시스템
created: 2026-02-15
updated: 2026-02-15
---

# brxce.ai CMS — 콘텐츠 관리 시스템 문서

> "CMS" 또는 "brxce CMS"라고 하면 이 시스템을 말한다.

## 개요

brxce.ai에 내장된 어드민 CMS. 콘텐츠 기획 → 초안 → 버전 비교 → 검토 → 발행 → 성과 추적까지 전 과정을 관리한다.

- **URL**: https://brxce.ai/admin (어드민 전용, Google/Kakao OAuth + admin role 필요)
- **스택**: Next.js 16 + TypeScript + Tailwind 4 + Supabase
- **배포**: Vercel (계정: brucechoe, bruce@intellieffect.com)
- **프로젝트 경로**: `/Volumes/WorkSSD/Projects/brxce.ai/`
- **GitHub**: intelli-bruce/brxce.ai

## Supabase 정보

- **Project**: euhxmmiqfyptvsvvbbvp
- **URL**: https://euhxmmiqfyptvsvvbbvp.supabase.co
- **Anon Key**: `sb_publishable_Tb9C7uTwjzu79wyHEahpfg_7R3Drb-D`
- **Service Role Key**: `.env.local`에 저장 (SUPABASE_SERVICE_ROLE_KEY)
- **Storage**: `content-media` 버킷 (public)

---

## DB 스키마

### contents (핵심 테이블)
콘텐츠 본문 관리. 46편 (2026-02-15 기준).

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | |
| title | TEXT | 제목 |
| slug | TEXT (UNIQUE) | URL 슬러그 |
| status | TEXT | `draft` / `review` / `published` |
| category | TEXT | `가이드북` / `실전 활용법` / `크리에이터` |
| **body_md** | TEXT | **마크다운 본문** (이 컬럼이 핵심) |
| hook | TEXT | 한 줄 요약 (목록/검색용) |
| core_message | TEXT | 핵심 메시지 |
| media_type | TEXT | text / image / video |
| media_urls | JSONB | 미디어 URL 배열 |
| tags | TEXT[] | 태그 배열 (예: `["lv1", "openclaw"]`) |
| funnel_stage | TEXT | TOFU / MOFU / BOFU |
| cashflow_line | TEXT | 캐시플로우 라인 |
| cta | TEXT | CTA 텍스트 (현재 null로 운영 — 세일즈 CTA 제거됨) |
| source_idea | UUID | ideas 테이블 참조 |
| fact_checked | BOOLEAN | 팩트체크 여부 |
| fact_check_notes | TEXT | 팩트체크 메모 |
| obsidian_path | TEXT | 원본 옵시디언 파일 경로 |
| embedding | VECTOR | (미사용) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### content_variants (버전 비교)
콘텐츠별 여러 버전 저장 → 쇼케이스에서 비교.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | |
| content_id | UUID (FK→contents) | |
| version_label | TEXT | "버전 A — 도발형" 등 |
| body_md | TEXT | 버전별 본문 |
| tone | TEXT | 도발적, 교육적, 스토리텔링 등 |
| angle | TEXT | 반전, 경험담, 개념정리 등 |
| is_selected | BOOLEAN | 확정된 버전 여부 |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### ideas (아이디어)
콘텐츠 씨앗. 38건.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | |
| raw_text | TEXT | 원문 (옵시디언 마크다운 포함) |
| source | TEXT | `obsidian` / `manual` |
| promoted_to | UUID | contents로 승격 시 해당 content_id |
| created_at | TIMESTAMPTZ | |

### publications (발행 기록)
채널별 발행 이력. 50건 (주로 Threads).

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | |
| content_id | UUID (FK) | 연결된 콘텐츠 |
| channel | TEXT | threads / x / linkedin / blog 등 |
| channel_post_id | TEXT | 채널 내부 포스트 ID |
| url | TEXT | 발행 URL |
| published_at | TIMESTAMPTZ | |
| metrics | JSONB | 성과 지표 |

### profiles (사용자)
2명: Bruce (admin), 기타.

### subscribers (뉴스레터 구독자)
1명. Resend API 연동.

### email_logs (이메일 발송 기록)
0건.

---

## 어드민 페이지 구조

| 경로 | 기능 |
|------|------|
| `/admin` | **대시보드** — 콘텐츠 수, 최근 활동, 상태별 통계 |
| `/admin/contents` | **콘텐츠 관리** — CRUD, 마크다운 에디터+프리뷰, 자동 slug, 전체 필드 폼 |
| `/admin/contents/new` | 새 콘텐츠 작성 |
| `/admin/contents/[id]` | 콘텐츠 수정 |
| `/admin/ideas` | **아이디어 관리** — 목록, 콘텐츠로 승격 |
| `/admin/publications` | **발행 관리** — 채널별 발행 기록 생성/관리 |
| `/admin/media` | **미디어 라이브러리** — Supabase Storage 파일 관리, 에디터 이미지 삽입 |
| `/admin/newsletter` | **뉴스레터** — 구독자 관리, 이메일 발송 (Resend API) |
| `/admin/showcase` | **🎨 쇼케이스** — 콘텐츠 버전 비교 갤러리, "이걸로 확정" 기능 |

---

## 퍼블릭 페이지

| 경로 | 기능 |
|------|------|
| `/` | 랜딩 페이지 (가이드 프리뷰, Discord CTA, 대기자 등록) |
| `/guides` | 가이드 목록 (published만, 태그 필터) |
| `/guides/[slug]` | 가이드 상세 (마크다운 렌더링, TOC, 관련 가이드, Author) |
| `/feed.xml` | RSS 피드 (네이버 서치어드바이저용) |
| `/sitemap.xml` | 동적 사이트맵 (published 콘텐츠 기반) |

### 프리뷰 시스템
- `?preview=brxce-preview-2026` 토큰으로 draft/review 콘텐츠 미리보기
- admin 유저는 자동 bypass (대기자 모달 스킵)

---

## 주요 컴포넌트

| 파일 | 역할 |
|------|------|
| `GuideBody.tsx` | 마크다운 렌더링 (react-markdown), `::excalidraw[]` 커스텀 문법 |
| `ExcalidrawViewer.tsx` | Excalidraw 다이어그램 SVG 렌더링 (exportToSvg) |
| `TableOfContents.tsx` | 사이드바 목차 (h2/h3 추출) |
| `MediaLibraryModal.tsx` | 미디어 라이브러리 모달 (에디터 이미지 삽입) |
| `SubscribeForm.tsx` | 뉴스레터 구독 폼 |
| `LatestGuides.tsx` | 홈페이지 최신 가이드 섹션 |
| `TagFilter.tsx` | 태그 필터 UI |

---

## API 라우트

| 경로 | 기능 |
|------|------|
| `/api/newsletter/subscribe` | 구독 등록 (POST) |
| `/api/newsletter/unsubscribe` | 구독 해지 (GET) |
| `/api/newsletter/send` | 뉴스레터 발송 (POST, Resend API) |
| `/api/sync-threads` | Threads API 동기화 (크론) |
| `/api/feed` | RSS XML 생성 |

---

## Supabase 클라이언트

| 파일 | 용도 |
|------|------|
| `supabase.ts` | `createClient()` (anon key), `createServiceClient()` (service role, RLS bypass) |
| `supabase-browser.ts` | 브라우저용 클라이언트 |
| `supabase-server.ts` | 서버 컴포넌트용 클라이언트 |
| `supabase-admin.ts` | 어드민 전용 (service role) |

---

## 콘텐츠 구조 (카테고리)

### 📘 가이드북 (커리큘럼)
순서대로 밟는 교육 콘텐츠. brxce.ai/guides 메인. SEO 유입.
- Lv.1 입문 → Lv.2 기본 → Lv.3 중급 → Lv.4 고급
- 톤: 객관적, 단계별, 초보도 따라할 수 있게
- 퍼널: TOFU

### 🔥 실전 활용법 (레시피)
필요한 거 골라보는 사례별 활용법.
- 개발 / 업무 자동화 / 콘텐츠·지식
- 톤: 독백체, 실제 결과물/수치, "해봤는데 이랬다"
- 퍼널: MOFU

### 🎨 크리에이터
Threads/SNS용 숏폼 콘텐츠, 전략 메모.

---

## 콘텐츠 파이프라인

```
아이디어 (ideas 테이블)
  → 승격 → 콘텐츠 (contents, draft)
    → AI가 여러 버전 생성 (content_variants)
      → Bruce님 쇼케이스에서 비교/선택
        → 확정 → contents body_md 반영
          → 팩트체크
            → Bruce님 최종 승인 → published
              → 발행 기록 (publications)
```

### 절대 규칙
- **status를 `published`로 바꾸는 건 Bruce님 승인 필요** (AI가 임의로 변경 금지)
- **팩트체크**: 기술 정보 → 공식 문서 검증, 수치 → 출처 명시
- **세일즈 CTA 제거**: 현 단계에서 "도입 상담" 같은 전환 광고 금지

---

## 콘텐츠 현황 (2026-02-15)

| 카테고리 | 총 | published | draft |
|----------|---|-----------|-------|
| 가이드북 | 18 | 3 | 15 |
| 실전 활용법 | 15 | 0 | 15 |
| 크리에이터 | 13 | 0 | 13 |
| **합계** | **46** | **3** | **43** |

---

## 외부 연동

| 서비스 | 용도 | 상태 |
|--------|------|------|
| **Vercel** | 배포 | ✅ live |
| **Cloudflare** | DNS (proxy OFF) | ✅ |
| **Resend** | 이메일 (bruce@brxce.ai) | ✅ |
| **Google OAuth** | 로그인 | ✅ |
| **Kakao OAuth** | 로그인 | ✅ |
| **Threads API** | 발행 동기화 | ✅ (크론 매일 3AM) |
| **Google Search Console** | SEO | ✅ 등록/색인 완료 |
| **네이버 서치어드바이저** | SEO | ✅ 등록/사이트맵/RSS 완료 |
| **Discord** | 커뮤니티 | ✅ 서버 생성 완료 |

---

## 에이전트 접근 가이드

### DB 조회 (curl)
```bash
SRK="(서비스 롤 키)"
curl -s "https://euhxmmiqfyptvsvvbbvp.supabase.co/rest/v1/contents?select=title,status,category&order=category" \
  -H "apikey: $SRK" -H "Authorization: Bearer $SRK"
```

### DB 수정 (PATCH)
```bash
curl -X PATCH "https://euhxmmiqfyptvsvvbbvp.supabase.co/rest/v1/contents?id=eq.UUID" \
  -H "apikey: $SRK" -H "Authorization: Bearer $SRK" \
  -H "Content-Type: application/json" -H "Prefer: return=minimal" \
  -d '{"body_md": "새 본문"}'
```

### 주의사항
- URL에 한국어 포함 시 `%` 인코딩 필요 (curl에서 자동 안 됨)
- `body_md` 컬럼명 주의 (`body` 아님)
- RLS 활성화 — anon key는 published만 조회 가능, service role은 전부
- 한 번에 대량 데이터 읽을 때 JSON 파싱 주의 (큰 body_md 포함 시)

---

## 관련 문서
- [[콘텐츠 구조]] — 가이드북/실전활용법 상세
- [[콘텐츠 전략]] — Voice 가이드라인, 파이프라인
- [[퍼널-설계-v1]] — AWARENESS → CLOSE 퍼널 전체 맵
