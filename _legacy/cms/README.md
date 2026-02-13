# brxce CMS

로컬 SQLite 기반 콘텐츠 관리 시스템.

## 설치

```bash
cd /Volumes/WorkSSD/Projects/brxce.ai/cms
npm install
```

## 초기화 & 마이그레이션

```bash
# DB 자동 생성 (첫 실행 시)
node cli.js stats

# 옵시디언 + Threads 데이터 마이그레이션
node migrate.js
```

## CLI 사용법

```bash
# 콘텐츠 관리
node cli.js list                          # 전체 목록
node cli.js list --status draft           # 상태 필터
node cli.js add --title "제목" --status idea
node cli.js get <id>                      # 상세 조회
node cli.js update <id> --status draft --body-file ./path.md
node cli.js search "키워드"               # FTS 검색

# 채널 변환
node cli.js adapt <content-id> --channel threads --body "변환 텍스트"

# 발행 기록
node cli.js publish <adaptation-id> --url "https://..." --channel-post-id "123"

# 아이디어
node cli.js idea "아이디어 텍스트"
node cli.js ideas
node cli.js promote <idea-id>

# 현황
node cli.js stats
```

## 가이드 빌드

```bash
cd /Volumes/WorkSSD/Projects/brxce.ai
npm install  # marked 필요
node build.js
```

## 스키마

- **contents** — 원본 콘텐츠 (마크다운, 메타데이터, 임베딩)
- **adaptations** — 채널별 변환본
- **publications** — 발행 기록 + 메트릭
- **ideas** — 아이디어 시드

## DB 위치

`cms/content.db` (gitignored)
