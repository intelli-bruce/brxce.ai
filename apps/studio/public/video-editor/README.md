# 🎬 Video Editor — Agent & Developer Guide

brxce studio의 영상 편집 시스템. AI 에이전트(OpenClaw 등)가 자동으로 영상 프로젝트를 생성하고, 사용자가 UI에서 세부 편집 후 렌더링하는 구조.

---

## 아키텍처

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  AI Agent        │     │  Python Server   │     │  Studio UI       │
│  (OpenClaw 등)   │────▶│  localhost:8090   │◀────│  localhost:3200  │
│                  │     │                  │     │  /studio/video-  │
│  - 영상 분석     │ API │  - 파일 서빙     │iframe│    edit          │
│  - 클립 선정     │     │  - 분석/렌더     │     │  - 타임라인 편집 │
│  - 자막 생성     │     │  - 프로젝트 CRUD │     │  - 자막 편집     │
│  - 프로젝트 생성 │     │  - ffmpeg 처리   │     │  - 렌더링 요청   │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

**핵심 개념:**
- **Python 서버** = 영상 파일 관리 + ffmpeg 처리 엔진 (로컬 전용)
- **Studio UI** = Next.js 앱 내 iframe으로 편집기 표시
- **AI Agent** = Python 서버 API를 호출하여 프로젝트 자동 생성

---

## 필수 환경

| 항목 | 요구사항 |
|------|----------|
| Python | 3.10+ |
| ffmpeg | 설치 필수 (`brew install ffmpeg`) |
| ffprobe | ffmpeg에 포함 |
| Whisper | 자동 자막 시 필요 (`pip install openai-whisper`) |
| Pillow | `pip install Pillow` |
| Node.js | Studio UI용 (pnpm dev) |

---

## 서버 실행

```bash
# Python 영상 서버 (포트 8090)
cd apps/studio/public/video-editor
python3 server.py

# Studio UI (포트 3200) — 별도 터미널
cd apps/studio
pnpm dev
```

Studio 접속: `http://localhost:3200/studio/video-edit`

---

## 영상 파일 관리

영상 파일은 `apps/studio/public/video-editor/` 디렉토리에 직접 복사합니다.

```bash
# 영상 추가
cp ~/Downloads/my_video.MOV apps/studio/public/video-editor/

# 등록된 영상 확인
curl http://localhost:8090/api/list-videos
```

**응답 예시:**
```json
{
  "videos": [
    {"name": "my_video.MOV", "duration": 15.5, "size": 29.0}
  ]
}
```

> ⚠️ `.gitignore`에 영상 파일(`.MOV`, `.mp4` 등)이 포함되어 있어 git에 커밋되지 않습니다.

---

## API Reference

### 1. 영상 목록 조회

```
GET /api/list-videos
```

서버 디렉토리의 영상 파일 목록을 반환합니다.

---

### 2. 영상 분석 (AI 클립 선정)

```
POST /api/analyze
Content-Type: application/json

{
  "files": ["video1.MOV", "video2.MOV"],
  "options": {
    "maxDuration": 30,        // 최종 영상 길이 (초)
    "clipMin": 2,             // 최소 클립 길이 (초)
    "clipMax": 6,             // 최대 클립 길이 (초)
    "sceneThreshold": 0.3,    // 장면 전환 감도 (0.1~0.5)
    "subtitleMode": "0",      // "0"=없음, "whisper"=자동, "context"=AI생성
    "subLang": "ko",          // Whisper 언어 코드
    "context": "",            // subtitleMode="context"일 때 자막 힌트
    "apiKey": ""              // AI 자막용 API 키 (OpenAI/Anthropic)
  }
}
```

**응답:** `{"status": "started"}` (비동기)

**진행 상태 확인:**
```
GET /api/analyze/status
```

**완료 응답:**
```json
{
  "state": "done",
  "result": {
    "clips": [
      {"source": "video1.MOV", "start": 0.0, "end": 4.0, "score": 13.0, "source_idx": 0},
      {"source": "video2.MOV", "start": 8.0, "end": 12.0, "score": 22.0, "source_idx": 1}
    ],
    "subs": ["자막1", "자막2"]
  }
}
```

분석 엔진은 내부적으로 `thread_video_cutter.py`를 사용하여:
- 장면 전환 감지 (scene detection)
- 무음 구간 분석
- 움직임/에너지 기반 클립 점수 산정
- 소스 간 균등 배분 (round-robin interleave)

---

### 3. 프로젝트 저장

```
POST /api/projects/save
Content-Type: application/json

{
  "id": "my-project-id",         // 고유 ID (없으면 자동 생성)
  "name": "프로젝트 이름",
  "sources": ["video1.MOV", "video2.MOV"],
  "clips": [
    {
      "source": "video1.MOV",    // 소스 파일명
      "start": 0.0,              // 시작 시간 (초)
      "end": 4.0,                // 끝 시간 (초)
      "subtitle": "자막 텍스트"   // 비어있으면 자막 없음
    }
  ],
  "totalDuration": 30.0,
  "settings": {
    "aspect": "9:16",            // "9:16" 또는 "16:9"
    "transition": "fade",        // "fade", "none"
    "transitionDur": 0.3,        // 전환 시간 (초)
    "subtitleFont": "Apple SD Gothic Neo",
    "subtitleSize": 24
  }
}
```

**응답:** `{"status": "saved", "id": "my-project-id"}`

---

### 4. 프로젝트 목록 조회

```
GET /api/projects
```

```json
[
  {
    "id": "my-project-id",
    "name": "프로젝트 이름",
    "clipCount": 8,
    "totalDuration": 30.0,
    "updatedAt": 1741331234.5,
    "sources": ["video1.MOV", "video2.MOV"]
  }
]
```

---

### 5. 프로젝트 로드

```
GET /api/projects/load/{project_id}
```

저장된 프로젝트 JSON 전체를 반환합니다.

---

### 6. 프로젝트 삭제

```
POST /api/projects/delete
Content-Type: application/json

{"id": "my-project-id"}
```

---

### 7. 렌더링

```
POST /api/render
Content-Type: application/json

{
  "clips": [...],            // 프로젝트의 clips 배열
  "settings": {...},         // 프로젝트의 settings
  "outputName": "output"     // 출력 파일명 (확장자 제외)
}
```

**응답:** `{"status": "started", "total": 8}`

**진행 상태:**
```
GET /api/render/status
```

```json
{"state": "rendering", "progress": 5, "total": 8, "error": null, "output": null}
// 완료 시:
{"state": "done", "progress": 8, "total": 8, "error": null, "output": "/path/to/output.mp4"}
```

**다운로드:**
```
GET /api/render/download
```

---

### 8. 파일 업로드

```
POST /api/upload
Content-Type: multipart/form-data

(file 필드에 영상 파일)
```

---

## 🤖 AI 에이전트 워크플로우

에이전트가 영상 편집 프로젝트를 자동 생성하는 전체 흐름:

### Step 1: 영상 파일 준비

```bash
# 영상 파일을 서버 디렉토리에 복사
cp /path/to/source/*.MOV apps/studio/public/video-editor/
```

### Step 2: 서버 실행 확인

```bash
# 서버가 안 떠있으면 실행
curl -s http://localhost:8090/api/list-videos || \
  (cd apps/studio/public/video-editor && python3 server.py &)
```

### Step 3: 자동 분석

```bash
curl -s -X POST http://localhost:8090/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "files": ["video1.MOV", "video2.MOV"],
    "options": {
      "maxDuration": 30,
      "clipMin": 2,
      "clipMax": 6,
      "subtitleMode": "whisper",
      "subLang": "ko"
    }
  }'

# 완료 대기 (폴링)
while true; do
  STATUS=$(curl -s http://localhost:8090/api/analyze/status | python3 -c "import sys,json; print(json.load(sys.stdin)['state'])")
  [ "$STATUS" = "done" ] && break
  sleep 3
done

# 결과 가져오기
RESULT=$(curl -s http://localhost:8090/api/analyze/status)
```

### Step 4: 프로젝트 생성

분석 결과의 `clips`와 `subs`를 조합하여 프로젝트 저장:

```bash
curl -s -X POST http://localhost:8090/api/projects/save \
  -H "Content-Type: application/json" \
  -d '{
    "name": "프로젝트 이름",
    "sources": ["video1.MOV", "video2.MOV"],
    "clips": [
      {"source": "video1.MOV", "start": 0.0, "end": 4.0, "subtitle": "첫 번째 장면"},
      {"source": "video2.MOV", "start": 8.0, "end": 12.0, "subtitle": "두 번째 장면"}
    ],
    "totalDuration": 30.0,
    "settings": {
      "aspect": "9:16",
      "transition": "fade",
      "transitionDur": 0.3,
      "subtitleFont": "Apple SD Gothic Neo",
      "subtitleSize": 24
    }
  }'
```

### Step 5: 사용자에게 안내

```
프로젝트 생성 완료!
http://localhost:3200/studio/video-edit 에서 편집하세요.
```

---

## 프로젝트 파일 구조

```
apps/studio/public/video-editor/
├── index.html          # 편집기 UI (타임라인, 프리뷰, 자막 편집)
├── editor.html         # → index.html 리다이렉트
├── server.py           # Python 서버 (API + 파일 서빙 + ffmpeg 렌더링)
├── README.md           # 이 문서
├── _projects/          # 프로젝트 JSON 저장소 (git 제외)
│   ├── office-move-in.json
│   └── ...
├── *.MOV / *.mp4       # 영상 소스 파일 (git 제외)
└── vlog_subs.srt       # 예제 자막 파일
```

---

## 주의사항

1. **로컬 전용**: Python 서버는 ffmpeg/Whisper를 사용하므로 클라우드 배포 불가. 반드시 로컬에서 실행.
2. **포트 고정**: Python 서버 = `8090`, Studio UI = `3200`. 변경 시 `server.py`의 `PORT`와 `index.html`의 `API_BASE` 수정 필요.
3. **영상 파일**: `.gitignore`에 포함됨. 공유 시 별도 전달 필요.
4. **CORS**: `server.py`에서 `Access-Control-Allow-Origin: *` 설정됨. 프로덕션 배포 시 제한 필요.
5. **thread_video_cutter**: `~/clawd/skills/thread-video-cutter/thread_video_cutter.py` 경로에 의존. 없으면 분석 실패.
