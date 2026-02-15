# BrxceStudio — Claude Code 지침

## 프로젝트 개요
brxce.ai에서 어드민/CMS를 분리한 독립 Next.js 앱.
콘텐츠 관리(CMS) + 미디어 제작 스튜디오(영상/캐러셀/이미지).

## 참조 문서
- `DESIGN.md` — 전체 설계문서 (아키텍처, DB, 로드맵)
- `CMS-REFERENCE.md` — 기존 CMS DB 스키마, API, 컴포넌트 상세

## 기술 스택
- Next.js 16 + React 19 + TypeScript + Tailwind 4
- Supabase (기존 brxce.ai와 같은 DB/Auth/Storage 공유)
- 포트: 3200 (dev)

## Supabase 정보
- Project: euhxmmiqfyptvsvvbbvp
- URL: https://euhxmmiqfyptvsvvbbvp.supabase.co
- Anon Key: sb_publishable_Tb9C7uTwjzu79wyHEahpfg_7R3Drb-D
- Service Role Key는 .env.local에서 관리

## 원본 소스
- CMS 소스: ~/Projects/brxce.ai/src/ (여기서 admin 관련 파일 복사)
- 복사할 파일은 DESIGN.md "3. brxce.ai에서 이식할 것" 섹션 참조

## 규칙
- Next.js App Router 사용
- admin/ 하위가 아닌 루트 라우트로 이식 (/contents, /ideas 등)
- Supabase 클라이언트 코드는 그대로 재사용
- Tailwind 4 사용 (brxce.ai와 동일)
- 사이드바 네비게이션 레이아웃 (DESIGN.md 섹션 8 참조)
