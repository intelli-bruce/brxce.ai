-- Inline comments: text selection → comment on content body
CREATE TABLE IF NOT EXISTS inline_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  selected_text text NOT NULL,
  comment text NOT NULL,
  author text DEFAULT 'bruce',
  resolved boolean DEFAULT false,
  -- position info for highlighting
  start_offset integer,
  end_offset integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inline_comments_content ON inline_comments(content_id);

-- RLS: allow all for authenticated (admin app)
ALTER TABLE inline_comments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow all for service role" ON inline_comments FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
