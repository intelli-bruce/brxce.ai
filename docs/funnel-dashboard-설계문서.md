# 퍼널 대시보드 설계문서

> 작성: 2026-03-05 | 상태: 계획 확정 → 구현 진행

---

## 1. 왜 필요한가 (Problem)

현재 퍼널 현황을 파악하려면 **5곳을 뒤져야 한다:**
- 옵시디언 `BrxceAI/퍼널/` → 퍼널 설계 문서
- `memory/*.md` → 진행 상황 텍스트
- BRXCE → 태스크 상태
- Supabase `campaigns` + `contents` → 실제 콘텐츠 DB
- Studio `/studio/funnel` → **하드코딩된** 시각화 (DB 미연결)

**결과:** 매번 에이전트가 수작업으로 상태를 종합해야 하고, Bruce님도 전체 그림을 한눈에 못 봄.

---

## 2. 무엇을 만드는가 (Solution)

**`/studio/funnel` 페이지를 데이터 기반 퍼널 대시보드로 교체한다.**

하드코딩된 ReactFlow 맵 → Supabase DB에서 실시간으로 끌어오는 보드 뷰.
한 화면에서 "지금 퍼널 어디가 비어있고, 뭐가 진행 중인지" 즉시 파악.

---

## 3. 스코프 (What's In / What's Out)

### ✅ In Scope
1. **퍼널 보드 뷰** — TOFU / 캡처 / MOFU / BOFU 4단계 컬럼
2. **DB 기반 콘텐츠 카드** — campaigns + contents + campaign_atoms에서 집계
3. **갭 분석** — 단계별 목표 vs 실제 → 부족분 시각화
4. **계획된 슬롯** — `funnel_slots` 테이블로 "아직 없지만 필요한 콘텐츠" 표현
5. **상태 표시** — 각 카드에 진행 상태 (아이디어/제작중/완성/발행됨)
6. **링크** — 카드 클릭 → 해당 캠페인/콘텐츠 상세 페이지로 이동

### ❌ Out of Scope (다음 단계)
- ReactFlow 맵 뷰 (기존 것은 보드 뷰로 대체, 필요시 나중에 데이터 기반으로 재구현)
- 자동 발행 연동
- 실시간 metrics 연동 (campaign_metrics)
- BRXCE 태스크 양방향 동기화

---

## 4. DB 변경

### 4-1. `funnel_slots` 테이블 신규 생성

"퍼널에 필요하지만 아직 콘텐츠가 없는 자리"를 표현한다.

```sql
create table funnel_slots (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  funnel_stage text not null check (funnel_stage in ('tofu', 'capture', 'mofu', 'bofu')),
  channel text check (channel in ('brxce_guide', 'newsletter', 'threads', 'x', 'linkedin', 'instagram', 'youtube', 'landing', 'manychat', 'email_sequence', 'lead_magnet', 'community')),
  priority text default 'medium' check (priority in ('critical', 'high', 'medium', 'low')),
  phase int, -- 실행 Phase (1~4)
  status text default 'planned' check (status in ('planned', 'in_progress', 'completed', 'cancelled')),
  linked_campaign_id uuid references campaigns(id) on delete set null,
  linked_content_id uuid references contents(id) on delete set null,
  brxce_task_id text, -- BRXCE 워크노드 ID (외부 참조)
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index funnel_slots_stage on funnel_slots (funnel_stage);
create index funnel_slots_status on funnel_slots (status);

alter table funnel_slots enable row level security;
create policy "Admin full access funnel_slots" on funnel_slots for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create trigger funnel_slots_updated_at before update on funnel_slots
  for each row execute function update_updated_at();
```

### 4-2. funnel_stage 통일

현재 불일치:
- `contents.funnel_stage`: `awareness | interest | trust | conversion`
- `campaigns.funnel_stage`: `tofu | mofu | bofu`
- 퍼널 4단계(tofu/capture/mofu/bofu) 중 "capture"가 양쪽 다 없음

**해결:** contents의 funnel_stage 매핑을 **앱 레벨**에서 처리한다 (DB constraint 변경은 리스크).

```typescript
// lib/funnel.ts
const FUNNEL_STAGE_MAP: Record<string, FunnelStage> = {
  // contents.funnel_stage → 통합 stage
  awareness: "tofu",
  interest: "capture",
  trust: "mofu",
  conversion: "bofu",
  // campaigns.funnel_stage → 그대로
  tofu: "tofu",
  capture: "capture",
  mofu: "mofu",
  bofu: "bofu",
};
```

---

## 5. UI 설계

### 5-1. 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│  🦞 퍼널 대시보드                              [+ 슬롯 추가]│
├─────────────────────────────────────────────────────────────┤
│  진행률: ████████░░░░ 35% (7/20)   P1: 2/2 | P2: 1/4 ...  │
├──────────┬──────────┬──────────┬──────────────────────────── │
│  TOFU    │  캡처    │  MOFU    │  BOFU                      │
│  인지    │  리드    │  신뢰    │  전환                       │
│  60%     │          │  30%     │  10%                        │
│  3/7     │  1/3     │  0/4     │  0/3                        │
│ ──────── │ ──────── │ ──────── │ ────────                    │
│ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐                   │
│ │캐러셀│ │ │Many  │ │ │웰컴  │ │ │상담  │                   │
│ │OpenCL│ │ │Chat  │ │ │이메일│ │ │CTA   │                   │
│ │✅완성 │ │ │✅연결 │ │ │❌계획 │ │ │❌계획 │                   │
│ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘                   │
│ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐                   │
│ │캐러셀│ │ │리드  │ │ │너처링│ │ │케이스│                   │
│ │v4    │ │ │마그넷│ │ │5통   │ │ │스터디│                   │
│ │✅완성 │ │ │🟡초안 │ │ │❌계획 │ │ │❌계획 │                   │
│ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘                   │
│ ┌──────┐ │ ┌──────┐ │          │                            │
│ │Threa.│ │ │랜딩  │ │   ...    │                            │
│ │      │ │ │CTA   │ │          │                            │
│ │❌계획 │ │ │❌계획 │ │          │                            │
│ └──────┘ │ └──────┘ │          │                            │
│  ...     │          │          │                            │
└──────────┴──────────┴──────────┴────────────────────────────┘
```

### 5-2. 카드 유형

1. **Campaign 카드** — `campaigns` 테이블에서. 클릭 → `/campaigns/[id]`
2. **Content 카드** — `contents` 테이블에서. 클릭 → `/contents/[id]`
3. **Slot 카드 (빈 슬롯)** — `funnel_slots` 테이블에서. 점선 테두리, 클릭 → 슬롯 상세 or 캠페인 생성

### 5-3. 카드 정보

```
┌─────────────────────────┐
│ 📸 캐러셀: OpenClaw 앵글 │  ← 제목
│ 🟢 완성 · P1 · critical │  ← 상태, Phase, 우선도
│ instagram · 8 slides     │  ← 채널, 부가정보
│ → campaign fd414c4d      │  ← 연결된 캠페인/콘텐츠 링크
└─────────────────────────┘
```

### 5-4. 헤더 통계

각 컬럼 상단:
- 단계 이름 + 아이콘
- 목표 비율 (TOFU 60% / MOFU 30% / BOFU 10%)
- 진행률: completed / total slots
- 색상 코딩: 목표 비율에 못 미치면 경고

전체 상단:
- 총 진행률 바
- Phase별 진행 요약

---

## 6. 데이터 흐름

```
Supabase DB
├── campaigns (funnel_stage: tofu/mofu/bofu)
├── contents (funnel_stage: awareness/interest/trust/conversion → 앱에서 매핑)
├── campaign_atoms (channel, status, is_pillar)
└── funnel_slots (funnel_stage: tofu/capture/mofu/bofu) ← NEW

↓ fetch (createSupabaseBrowser)

lib/funnel.ts
├── normalizeFunnelStage() — 통합 매핑
├── aggregateFunnelData() — 4단계별 카드 리스트 조합
└── calculateProgress() — 진행률 계산

↓

/studio/funnel/page.tsx
├── FunnelBoard — 4컬럼 보드
├── FunnelColumn — 단계별 컬럼
├── FunnelCard — Campaign/Content/Slot 카드
├── FunnelHeader — 통계 바
└── AddSlotModal — 빈 슬롯 추가 모달
```

---

## 7. 구현 파일 목록

| 파일 | 설명 | 신규/수정 |
|------|------|-----------|
| `supabase/migrations/20260305_funnel_slots.sql` | funnel_slots 테이블 | 신규 |
| `apps/studio/src/lib/funnel.ts` | 퍼널 데이터 집계/매핑 유틸 | 신규 |
| `apps/studio/src/app/studio/funnel/page.tsx` | 퍼널 대시보드 페이지 (교체) | 수정 |
| `apps/studio/src/components/funnel/FunnelBoard.tsx` | 4컬럼 보드 컴포넌트 | 신규 |
| `apps/studio/src/components/funnel/FunnelColumn.tsx` | 단계별 컬럼 | 신규 |
| `apps/studio/src/components/funnel/FunnelCard.tsx` | 카드 (Campaign/Content/Slot) | 신규 |
| `apps/studio/src/components/funnel/FunnelHeader.tsx` | 상단 통계 바 | 신규 |
| `apps/studio/src/components/funnel/AddSlotModal.tsx` | 슬롯 추가 모달 | 신규 |
| `apps/studio/src/app/api/funnel-slots/route.ts` | CRUD API | 신규 |
| `apps/studio/src/components/AppSidebar.tsx` | "퍼널 맵" → "퍼널 대시보드" 라벨 변경 | 수정 |

---

## 8. Seed Data

초기 슬롯 데이터 — 현재 퍼널 콘텐츠 리스트 v2 기반:

```sql
-- Phase 1 (critical)
INSERT INTO funnel_slots (title, funnel_stage, channel, priority, phase, status, notes) VALUES
  ('캐러셀: 돈 버는 AI, 에이전틱 워크플로우', 'tofu', 'instagram', 'critical', 1, 'completed', '~/Downloads/carousel-openclaw/ 렌더링 완료, 미발행'),
  ('캐러셀: 에이전틱 워크플로우에 열광하는 진짜 이유', 'tofu', 'instagram', 'critical', 1, 'completed', '~/Downloads/carousel-v4/ 렌더링 완료, 미발행'),
  ('리드마그넷 PDF 재작성 (타겟B)', 'capture', 'lead_magnet', 'critical', 1, 'in_progress', '초안 v1 있음, 타겟B 중심 재작성 필요');

-- Phase 2 (high)
INSERT INTO funnel_slots (title, funnel_stage, channel, priority, phase, status) VALUES
  ('Threads 숏텍스트 시리즈 (5개)', 'tofu', 'threads', 'high', 2, 'planned'),
  ('웰컴 이메일', 'mofu', 'email_sequence', 'high', 2, 'planned'),
  ('ManyChat 리드마그넷 시퀀스', 'capture', 'manychat', 'high', 2, 'planned'),
  ('brxce.ai 랜딩 리드마그넷 CTA', 'capture', 'landing', 'high', 2, 'planned');

-- Phase 3 (medium)
INSERT INTO funnel_slots (title, funnel_stage, channel, priority, phase, status) VALUES
  ('SEO 블로그: 에이전틱 워크플로우란', 'tofu', 'brxce_guide', 'medium', 3, 'in_progress'),
  ('너처링 이메일 시퀀스 5통', 'mofu', 'email_sequence', 'medium', 3, 'planned'),
  ('뉴스레터 1호', 'mofu', 'newsletter', 'medium', 3, 'planned');

-- Phase 4 (medium)
INSERT INTO funnel_slots (title, funnel_stage, channel, priority, phase, status) VALUES
  ('SEO 블로그: ChatGPT vs AI 에이전트 차이', 'tofu', 'brxce_guide', 'medium', 4, 'planned'),
  ('SEO 블로그: 에이전틱 워크플로우 실전 사례', 'tofu', 'brxce_guide', 'medium', 4, 'planned'),
  ('무료 상담 CTA 포스트', 'bofu', 'threads', 'medium', 4, 'planned'),
  ('케이스 스터디 1개', 'bofu', 'brxce_guide', 'medium', 4, 'planned'),
  ('디스코드 AWC 커뮤니티 온보딩', 'bofu', 'community', 'medium', 4, 'planned'),
  ('릴스: 빌더 작업 영상', 'tofu', 'instagram', 'low', 4, 'planned');
```

---

## 9. 기술 스택

- **프레임워크**: Next.js (기존 Studio 앱)
- **스타일**: Tailwind CSS (기존 패턴)
- **데이터**: Supabase (createSupabaseBrowser)
- **상태**: React useState + useEffect (기존 패턴, 별도 상태 관리 불필요)
- **아이콘**: Lucide React (기존)
- **브랜치**: `feat/funnel-dashboard` (main에서 분기)

---

## 10. 제약 사항

1. **RLS**: 기존 패턴대로 admin-only. Dev 환경에서는 service role key 사용.
2. **기존 ReactFlow 코드**: 삭제하지 않고 `_legacy_funnel_map.tsx`로 백업.
3. **funnel_stage 통일**: DB constraint 변경 없이 앱 레벨 매핑으로 처리.
4. **ManyChat/랜딩 등 외부 채널**: `funnel_slots`로만 추적 (DB 직접 연동 X).

---

## 11. 체크리스트

- [ ] Migration 파일 생성 + Supabase 적용
- [ ] Seed data 삽입
- [ ] `lib/funnel.ts` 유틸 구현
- [ ] 퍼널 대시보드 UI 구현 (FunnelBoard + Column + Card + Header)
- [ ] 슬롯 추가/수정 모달
- [ ] API route (`/api/funnel-slots`)
- [ ] 사이드바 라벨 변경
- [ ] 기존 퍼널 맵 백업
- [ ] 브라우저 테스트
