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

-- Contents (pillar content) — 각 콘텐츠별 고유한 goal/target/strategy
ALTER TABLE contents
  ADD COLUMN IF NOT EXISTS goal text,
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS strategy text;

COMMENT ON COLUMN contents.goal IS '콘텐츠 전환 목표 — 이 콘텐츠가 달성해야 하는 것';
COMMENT ON COLUMN contents.target_audience IS '콘텐츠 타겟 — 이 콘텐츠를 읽는 사람';
COMMENT ON COLUMN contents.strategy IS '콘텐츠 전략 — 이 콘텐츠의 설득/전달 방식';

-- Campaign Atoms (channel derivatives) — 채널별 고유한 goal/target/strategy
ALTER TABLE campaign_atoms
  ADD COLUMN IF NOT EXISTS goal text,
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS strategy text;

COMMENT ON COLUMN campaign_atoms.goal IS '채널 전환 목표 — 이 채널에서 유도하는 행동';
COMMENT ON COLUMN campaign_atoms.target_audience IS '채널 타겟 — 이 채널의 오디언스';
COMMENT ON COLUMN campaign_atoms.strategy IS '채널 전략 — 이 채널에 맞는 전달 방식';
