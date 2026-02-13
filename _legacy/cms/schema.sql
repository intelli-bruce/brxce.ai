-- Content CMS Schema

CREATE TABLE IF NOT EXISTS contents (
  id TEXT PRIMARY KEY,
  title TEXT,
  slug TEXT UNIQUE,
  status TEXT DEFAULT 'idea' CHECK(status IN ('idea','draft','fact-check','ready','published','archived')),
  category TEXT,
  body_md TEXT,
  hook TEXT,
  core_message TEXT,
  media_type TEXT DEFAULT 'text' CHECK(media_type IN ('text','image','video','carousel')),
  media_urls TEXT DEFAULT '[]',
  tags TEXT DEFAULT '[]',
  funnel_stage TEXT CHECK(funnel_stage IN ('awareness','interest','trust','conversion')),
  cashflow_line TEXT CHECK(cashflow_line IN ('consulting','course','service','community')),
  cta TEXT,
  source_idea TEXT,
  fact_checked INTEGER DEFAULT 0,
  fact_check_notes TEXT,
  obsidian_path TEXT,
  embedding BLOB,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS adaptations (
  id TEXT PRIMARY KEY,
  content_id TEXT REFERENCES contents(id),
  channel TEXT,
  format TEXT,
  body_adapted TEXT,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft','ready','published')),
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS publications (
  id TEXT PRIMARY KEY,
  adaptation_id TEXT REFERENCES adaptations(id),
  content_id TEXT REFERENCES contents(id),
  channel TEXT,
  channel_post_id TEXT,
  url TEXT,
  published_at TEXT,
  metrics TEXT DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS ideas (
  id TEXT PRIMARY KEY,
  raw_text TEXT,
  source TEXT DEFAULT 'manual',
  promoted_to TEXT REFERENCES contents(id),
  created_at TEXT DEFAULT (datetime('now','localtime'))
);

-- FTS5 for full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS contents_fts USING fts5(
  title, body_md, hook, core_message, tags,
  content='contents',
  content_rowid='rowid'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS contents_ai AFTER INSERT ON contents BEGIN
  INSERT INTO contents_fts(rowid, title, body_md, hook, core_message, tags)
  VALUES (new.rowid, new.title, new.body_md, new.hook, new.core_message, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS contents_ad AFTER DELETE ON contents BEGIN
  INSERT INTO contents_fts(contents_fts, rowid, title, body_md, hook, core_message, tags)
  VALUES ('delete', old.rowid, old.title, old.body_md, old.hook, old.core_message, old.tags);
END;

CREATE TRIGGER IF NOT EXISTS contents_au AFTER UPDATE ON contents BEGIN
  INSERT INTO contents_fts(contents_fts, rowid, title, body_md, hook, core_message, tags)
  VALUES ('delete', old.rowid, old.title, old.body_md, old.hook, old.core_message, old.tags);
  INSERT INTO contents_fts(rowid, title, body_md, hook, core_message, tags)
  VALUES (new.rowid, new.title, new.body_md, new.hook, new.core_message, new.tags);
END;
