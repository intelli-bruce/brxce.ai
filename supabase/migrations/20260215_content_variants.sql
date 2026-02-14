CREATE TABLE content_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  version_label TEXT NOT NULL,
  body_md TEXT NOT NULL,
  tone TEXT,
  angle TEXT,
  is_selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE content_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON content_variants FOR ALL USING (true);
