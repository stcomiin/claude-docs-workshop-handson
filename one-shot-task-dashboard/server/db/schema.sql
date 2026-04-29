CREATE TABLE IF NOT EXISTS intel_items (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL CHECK(source_type IN ('news', 'social', 'technical', 'custom')),
  source_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  author TEXT,
  published_at TEXT NOT NULL,
  collected_at TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK(severity IN ('info', 'low', 'medium', 'high', 'critical')),
  sentiment REAL NOT NULL DEFAULT 0,
  tags TEXT NOT NULL DEFAULT '[]',
  geo TEXT,
  raw_data TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_items_collected_at ON intel_items(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_source_type ON intel_items(source_type);
CREATE INDEX IF NOT EXISTS idx_items_severity ON intel_items(severity);

CREATE VIRTUAL TABLE IF NOT EXISTS intel_items_fts USING fts5(
  title, content, source_name, tags,
  content='intel_items',
  content_rowid='rowid'
);

CREATE TRIGGER IF NOT EXISTS intel_items_ai AFTER INSERT ON intel_items BEGIN
  INSERT INTO intel_items_fts(rowid, title, content, source_name, tags)
  VALUES (new.rowid, new.title, new.content, new.source_name, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS intel_items_ad AFTER DELETE ON intel_items BEGIN
  INSERT INTO intel_items_fts(intel_items_fts, rowid, title, content, source_name, tags)
  VALUES ('delete', old.rowid, old.title, old.content, old.source_name, old.tags);
END;

CREATE TABLE IF NOT EXISTS watchlists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  keywords TEXT NOT NULL DEFAULT '[]',
  sources TEXT NOT NULL DEFAULT '["all"]',
  severity_override TEXT,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS collectors (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('rss', 'twitter', 'reddit', 'cve', 'webhook')),
  name TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  interval_seconds INTEGER NOT NULL DEFAULT 300,
  config TEXT NOT NULL DEFAULT '{}'
);
