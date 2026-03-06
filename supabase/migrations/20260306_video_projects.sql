-- video_projects 테이블 생성
-- Supabase Dashboard > SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS video_projects (
  id text PRIMARY KEY DEFAULT 'vp-' || substr(md5(random()::text), 1, 12),
  title text NOT NULL,
  template_id text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'rendering', 'done', 'error')),
  props jsonb NOT NULL DEFAULT '{}',
  source_files jsonb DEFAULT '[]',
  output_url text,
  duration_sec integer,
  thumbnail_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE video_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON video_projects FOR ALL USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_video_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_video_projects_updated ON video_projects;
CREATE TRIGGER trg_video_projects_updated
  BEFORE UPDATE ON video_projects
  FOR EACH ROW EXECUTE FUNCTION update_video_projects_updated_at();
