# BrxceStudio Agent Guide

AI 에이전트가 미디어(영상/캐러셀/이미지)를 자동 생성할 때 참조하는 가이드.

## 전체 흐름

```
1. studio_projects INSERT (scenes + template 지정)
2. POST /api/render { project_id }
3. Remotion 렌더링 → Supabase Storage 업로드
4. studio_projects.output_urls 에 결과 URL 저장
```

---

## 1. 프로젝트 생성

### DB 스키마: `studio_projects`

| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | uuid | auto | PK |
| `content_id` | uuid | - | contents 테이블 FK (선택) |
| `title` | text | O | 프로젝트 제목 |
| `type` | text | O | `video` \| `carousel` \| `image` |
| `status` | text | auto | `draft` → `editing` → `rendering` → `rendered` \| `failed` |
| `template` | text | O | 템플릿 ID (아래 목록 참조) |
| `width` | int | auto | 해상도 가로 (기본 1080) |
| `height` | int | auto | 해상도 세로 (기본 1920) |
| `fps` | int | - | 영상 전용 (기본 60) |
| `scenes` | jsonb | O | 씬/슬라이드/레이어 배열 (타입별 구조 다름) |
| `style_config` | jsonb | - | 스타일 설정 |
| `media_mappings` | jsonb | - | 미디어 매핑 |
| `output_urls` | jsonb | auto | 렌더 결과 URL 배열 |
| `render_log` | text | auto | 렌더 로그/에러 |

### Supabase INSERT 예시

```sql
INSERT INTO studio_projects (title, type, template, width, height, fps, scenes, style_config)
VALUES (
  'AI 생산성 숏폼',
  'video',
  'ShortFormVideo',
  1080, 1920, 60,
  '[
    {"id":"s1","text":"AI 덕분에 생산성 10배 올랐다는데","durationFrames":150},
    {"id":"s2","text":"왜 나는 더 바빠졌을까?","durationFrames":120},
    {"id":"s3","text":"진짜 문제는 AI가 아니라 우리의 기대치다","durationFrames":180}
  ]'::jsonb,
  '{"primaryColor":"#FF6B35","backgroundColor":"#0A0A0A"}'::jsonb
)
RETURNING id;
```

---

## 2. 템플릿 카탈로그

### Video (1080x1920, 60fps)

| template ID | 용도 | scenes 구조 |
|-------------|------|-------------|
| `ShortFormVideo` | TTS+자막 숏폼 릴스 | `VideoScene[]` — 범용, 가장 자주 사용 |
| `TextOverVideo` | 텍스트+배경영상 | `VideoScene[]` — 텍스트 위치(top/center/bottom) 지정 가능 |
| `VSReel` | A vs B 비교 릴스 | `VideoScene[]` — 상단 로고 비교, 하단 배경영상 |
| `NewsBreaking` | 뉴스 속보 스타일 | `VideoScene[]` — 첫 씬=헤드라인, 나머지=포인트 |
| `Demo60s` | 60초 스크린캐스트 데모 | `VideoScene[]` — 첫 씬=훅 텍스트 |
| `DayInTheLife` | 일상 타임랩스 | `VideoScene[]` — 각 씬=클립 라벨 |

### Carousel (1080x1440, Still)

| template ID | 용도 | scenes 구조 |
|-------------|------|-------------|
| `CardNews` | 카드뉴스 | `CarouselSlide[]` — title + body |
| `StepByStep` | 단계별 가이드 | `CarouselSlide[]` — 각 슬라이드가 step |
| `BeforeAfter` | 전후 비교 | `CarouselSlide[]` — title=before, body=after |
| `ListCarousel` | Top N 리스트 | `CarouselSlide[]` — body를 줄바꿈으로 분리 → 리스트 아이템 |
| `QuoteCarousel` | 인용구/인사이트 | `CarouselSlide[]` — quoteText + quoteAuthor |

### Image (Still)

| template ID | 해상도 | 용도 | scenes 구조 |
|-------------|--------|------|-------------|
| `OgImage` | 1200x630 | 블로그 OG | `ImageLayer[]` — 첫 텍스트=title, 둘째=subtitle |
| `SocialPost` | 1080x1080 | SNS 포스트 | `ImageLayer[]` — title + message |
| `Infographic` | 1080x1920 | 인포그래픽 | `ImageLayer[]` — 여러 텍스트 레이어 → sections |
| `Quote` | 1080x1080 | 인용구 카드 | `ImageLayer[]` — 첫 텍스트=인용문, 둘째=저자 |
| `Thumbnail` | 1280x720 | 영상 썸네일 | `ImageLayer[]` — 첫 텍스트=title |

---

## 3. scenes 데이터 구조

### VideoScene (video 타입)

```json
{
  "id": "uuid",
  "text": "화면에 표시할 텍스트",
  "durationFrames": 180,
  "captionConfig": {
    "style": "karaoke|boxed|typewriter",
    "position": "top|center|bottom",
    "fontSize": 52,
    "fontColor": "#FFFFFF",
    "highlightColor": "#FFD700"
  },
  "audioFile": "scene-1.mp3",
  "audioDurationMs": 3000,
  "wordTimings": [
    { "text": "AI", "startMs": 0, "endMs": 200 },
    { "text": "덕분에", "startMs": 200, "endMs": 500 }
  ]
}
```

**필수**: `id`, `text`, `durationFrames`
**선택**: `captionConfig`, `audioFile`, `audioDurationMs`, `wordTimings`

> `durationFrames` 기준: 60fps. 1초 = 60프레임, 3초 = 180프레임.

### CarouselSlide (carousel 타입)

```json
{
  "id": "uuid",
  "layout": "text-only|text-image|quote",
  "title": "슬라이드 제목",
  "body": "본문 텍스트",
  "imageUrl": "https://...",
  "quoteText": "인용문 (quote 레이아웃용)",
  "quoteAuthor": "저자"
}
```

**필수**: `id`, `layout`
**text-only/text-image**: `title`, `body` 사용
**quote**: `quoteText`, `quoteAuthor` 사용

### ImageLayer (image 타입)

```json
{
  "id": "uuid",
  "type": "text|image|shape",
  "content": "텍스트 내용 또는 이미지 URL 또는 색상코드",
  "x": 0,
  "y": 0,
  "width": 540,
  "height": 100,
  "style": { "fontSize": 32, "color": "#FFFFFF" }
}
```

**필수**: `id`, `type`, `content`, `x`, `y`, `width`, `height`

---

## 4. style_config

```json
{
  "fontFamily": "Pretendard, Inter, sans-serif",
  "primaryColor": "#FF6B35",
  "backgroundColor": "#0A0A0A",
  "accentColor": "#4ECDC4",
  "borderRadius": 16
}
```

모든 필드 선택. 미지정 시 BRXCE 브랜드 기본값 사용.

---

## 5. 렌더링 트리거

### API 호출

```
POST /api/render
Content-Type: application/json

{ "project_id": "<uuid>" }
```

### 응답

**성공:**
```json
{ "ok": true, "output_urls": ["https://...supabase.co/.../output.mp4"] }
```

**실패:**
```json
{ "error": "Render failed", "detail": "에러 메시지" }
```

### 렌더링 소요 시간 (참고)

| 타입 | 대략적 소요 시간 |
|------|-----------------|
| Image (Still) | 3-10초 |
| Carousel (N slides) | 3-10초 x N |
| Video (10초 분량) | 30-120초 |

### 결과물 위치

- **Supabase Storage**: `studio-renders` bucket
- **경로 패턴**: `renders/{project_id}/output.mp4` 또는 `slide-{n}.png` 또는 `output.png`
- **DB**: `studio_projects.output_urls` 에 public URL 배열 저장

---

## 6. 에이전트 워크플로우 예시

### 예시 A: 캠페인 원자 → 숏폼 영상

```
1. campaign_atoms에서 format='reel', channel='instagram' 인 원자 조회
2. 원자의 body를 3-5개 씬으로 분할
3. studio_projects INSERT:
   - type: 'video'
   - template: 'ShortFormVideo'
   - scenes: 분할된 씬 배열
4. POST /api/render → 영상 URL 획득
5. media_assets에 결과 저장 (선택)
```

### 예시 B: 콘텐츠 → OG 이미지

```
1. contents에서 title, tags 조회
2. studio_projects INSERT:
   - type: 'image'
   - template: 'OgImage'
   - width: 1200, height: 630
   - scenes: [{ id: "l1", type: "text", content: title, x: 0, y: 0, width: 1200, height: 400 }]
3. POST /api/render → 이미지 URL 획득
```

### 예시 C: 콘텐츠 → 카드뉴스 캐러셀

```
1. 콘텐츠 본문을 5-7개 슬라이드로 구조화
2. studio_projects INSERT:
   - type: 'carousel'
   - template: 'CardNews'
   - width: 1080, height: 1440
   - scenes: [
       { id: "s1", layout: "text-only", title: "커버 제목", body: "서브타이틀" },
       { id: "s2", layout: "text-only", title: "포인트 1", body: "설명..." },
       ...
       { id: "sN", layout: "text-only", title: "CTA", body: "팔로우하기" }
     ]
3. POST /api/render → 슬라이드별 PNG URL 배열 획득
```

---

## 7. 템플릿 선택 가이드

| 콘텐츠 의도 | 추천 템플릿 | 이유 |
|-------------|-------------|------|
| 도구/서비스 비교 | `VSReel` | 좌우 로고 + 비교 텍스트 |
| 인사이트/생각 공유 | `ShortFormVideo` | 자막 애니메이션 + 배경영상 |
| 뉴스/업데이트 전달 | `NewsBreaking` | 속보 스타일 주목도 높음 |
| 사용법/튜토리얼 | `Demo60s` | 스크린캐스트 + 훅/CTA |
| 일상/브이로그 | `DayInTheLife` | 타임랩스 클립 구성 |
| 정보 요약 | `CardNews` | 슬라이드별 포인트 전달 |
| How-to 가이드 | `StepByStep` | 단계별 구조화 |
| 전후 비교 | `BeforeAfter` | 직관적 비교 |
| 리스트/추천 | `ListCarousel` | Top N 형식 |
| 인용구/명언 | `QuoteCarousel` 또는 `Quote` | 인용문 강조 |
| 블로그 OG/SEO | `OgImage` | 1200x630 표준 |
| SNS 이미지 포스트 | `SocialPost` | 1:1 정사각 |
| 데이터/통계 시각화 | `Infographic` | 세로형 섹션 구조 |
| 영상 썸네일 | `Thumbnail` | 16:9 표준 |

---

## 8. 주의사항

- `durationFrames`는 60fps 기준. **3초 = 180**, 5초 = 300, 10초 = 600.
- 비디오 렌더링은 서버 리소스를 많이 사용. 60초 이상 영상은 피할 것.
- `scenes` 배열은 최소 1개 이상 필요.
- `template`은 정확한 ID를 사용해야 함 (대소문자 구분).
- 렌더링 중 `status`가 `rendering`으로 바뀌고, 완료 시 `rendered` 또는 `failed`.
- 실패 시 `render_log`에 에러 내용 저장됨 — 디버깅에 활용.
- Storage bucket `studio-renders`는 public. output_urls의 URL을 바로 사용 가능.
