-- Block Editor: content_blocks + block_revisions + document_snapshots
-- 콘텐츠를 주소 지정 가능한 블록으로 구조화

-- 1. content_blocks
CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL CHECK (block_type IN ('heading', 'paragraph', 'list', 'code', 'blockquote', 'image', 'divider')),
  body TEXT NOT NULL DEFAULT '',
  position INT NOT NULL,
  current_version INT NOT NULL DEFAULT 1,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_blocks_content_id ON content_blocks(content_id);
CREATE INDEX idx_content_blocks_position ON content_blocks(content_id, position);

-- 2. block_revisions
CREATE TABLE IF NOT EXISTS block_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL REFERENCES content_blocks(id) ON DELETE CASCADE,
  version INT NOT NULL,
  body TEXT NOT NULL,
  trigger TEXT, -- 수정 지시 ("더 구체적으로, RPA 예시 포함")
  actor TEXT NOT NULL DEFAULT 'system' CHECK (actor IN ('user', 'ai', 'system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(block_id, version)
);

CREATE INDEX idx_block_revisions_block_id ON block_revisions(block_id);

-- 3. document_snapshots
CREATE TABLE IF NOT EXISTS document_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT '스냅샷',
  blocks JSONB NOT NULL, -- 전체 블록 상태
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_snapshots_content_id ON document_snapshots(content_id);

-- RLS: admin only (service role bypass)
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_content_blocks" ON content_blocks
  FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "admin_block_revisions" ON block_revisions
  FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "admin_document_snapshots" ON document_snapshots
  FOR ALL USING (auth.uid() IS NOT NULL);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_content_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_blocks_updated_at
  BEFORE UPDATE ON content_blocks
  FOR EACH ROW EXECUTE FUNCTION update_content_blocks_updated_at();
