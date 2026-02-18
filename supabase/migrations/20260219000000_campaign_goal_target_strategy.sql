-- Campaign Goal/Target/Strategy 분리
-- goal: 측정 가능한 전환 목표 (e.g. "brxce.ai/guides 유입")
-- target_audience: 타겟 세그먼트 + 맥락 (e.g. "TOFU — 에이전틱 워크플로우 모르는 사람")
-- strategy: 핵심 전략/프레이밍 (e.g. "격차 프레이밍 + 3줄 비유")

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS goal text,
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS strategy text;

COMMENT ON COLUMN campaigns.goal IS '측정 가능한 전환 목표 — 이 캠페인으로 어떤 행동을 유도하는가';
COMMENT ON COLUMN campaigns.target_audience IS '타겟 세그먼트 — 누구에게, 어떤 상태의 사람에게';
COMMENT ON COLUMN campaigns.strategy IS '핵심 전략/프레이밍 — 어떤 방식으로 전달하는가';
