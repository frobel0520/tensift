-- Chinese content moves from Simplified (zh-Hans) to Traditional (zh-Hant).
--
-- SQLite cannot alter a CHECK constraint, so every table is rebuilt:
-- new *_v3 tables are created and filled, the old tables are dropped
-- children-first (so no ON DELETE CASCADE can reach rows being kept),
-- and the *_v3 tables are renamed into place. Renaming a parent also
-- rewrites the foreign-key references held by the renamed children.
--
-- zh-Hans puzzles are removed here; the zh-Hant puzzles are inserted by
-- the normal seed step (npm run db:seed:remote) right after this migration.

PRAGMA defer_foreign_keys = on;

DELETE FROM puzzles WHERE locale = 'zh-Hans';

CREATE TABLE puzzles_v3 (
  puzzle_id TEXT PRIMARY KEY,
  puzzle_family_id TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'zh-Hant', 'es-419')),
  publish_date TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC' CHECK (timezone = 'UTC'),
  status TEXT NOT NULL CHECK (status IN ('draft', 'reviewed', 'scheduled', 'published', 'retired')),
  theme TEXT NOT NULL,
  hidden_dimension TEXT NOT NULL,
  explanation TEXT NOT NULL,
  difficulty_band TEXT NOT NULL CHECK (difficulty_band IN ('easy', 'medium', 'hard')),
  difficulty_score REAL NOT NULL CHECK (difficulty_score >= 0 AND difficulty_score <= 1),
  hint_policy TEXT NOT NULL DEFAULT 'random-unlocked-correct-row',
  max_hints INTEGER NOT NULL DEFAULT 1 CHECK (max_hints = 1),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (locale, publish_date)
);
INSERT INTO puzzles_v3 (puzzle_id, puzzle_family_id, locale, publish_date, timezone, status, theme,
  hidden_dimension, explanation, difficulty_band, difficulty_score, hint_policy, max_hints, created_at, updated_at)
SELECT puzzle_id, puzzle_family_id, locale, publish_date, timezone, status, theme,
  hidden_dimension, explanation, difficulty_band, difficulty_score, hint_policy, max_hints, created_at, updated_at
FROM puzzles;

CREATE TABLE puzzle_items_v3 (
  puzzle_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  label TEXT NOT NULL,
  visual_json TEXT,
  rights_note TEXT,
  display_order INTEGER NOT NULL,
  PRIMARY KEY (puzzle_id, item_id),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles_v3(puzzle_id) ON DELETE CASCADE
);
INSERT INTO puzzle_items_v3 (puzzle_id, item_id, label, visual_json, rights_note, display_order)
SELECT puzzle_id, item_id, label, visual_json, rights_note, display_order FROM puzzle_items;

CREATE TABLE puzzle_rows_v3 (
  puzzle_id TEXT NOT NULL,
  row_id TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity IN (1, 2, 3, 4)),
  PRIMARY KEY (puzzle_id, row_id),
  UNIQUE (puzzle_id, capacity),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles_v3(puzzle_id) ON DELETE CASCADE
);
INSERT INTO puzzle_rows_v3 (puzzle_id, row_id, capacity)
SELECT puzzle_id, row_id, capacity FROM puzzle_rows;

CREATE TABLE solution_groups_v3 (
  puzzle_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  label TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity IN (1, 2, 3, 4)),
  display_order INTEGER NOT NULL,
  PRIMARY KEY (puzzle_id, group_id),
  UNIQUE (puzzle_id, capacity),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles_v3(puzzle_id) ON DELETE CASCADE
);
INSERT INTO solution_groups_v3 (puzzle_id, group_id, label, capacity, display_order)
SELECT puzzle_id, group_id, label, capacity, display_order FROM solution_groups;

CREATE TABLE solution_group_items_v3 (
  puzzle_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  PRIMARY KEY (puzzle_id, group_id, item_id),
  UNIQUE (puzzle_id, item_id),
  FOREIGN KEY (puzzle_id, group_id) REFERENCES solution_groups_v3(puzzle_id, group_id) ON DELETE CASCADE,
  FOREIGN KEY (puzzle_id, item_id) REFERENCES puzzle_items_v3(puzzle_id, item_id) ON DELETE CASCADE
);
INSERT INTO solution_group_items_v3 (puzzle_id, group_id, item_id)
SELECT puzzle_id, group_id, item_id FROM solution_group_items;

CREATE TABLE puzzle_sources_v3 (
  puzzle_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  retrieved_at TEXT NOT NULL,
  PRIMARY KEY (puzzle_id, source_id),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles_v3(puzzle_id) ON DELETE CASCADE
);
INSERT INTO puzzle_sources_v3 (puzzle_id, source_id, title, url, retrieved_at)
SELECT puzzle_id, source_id, title, url, retrieved_at FROM puzzle_sources;

CREATE TABLE action_receipts_v3 (
  puzzle_id TEXT NOT NULL,
  client_session_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('hint', 'reveal')),
  response_json TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  idempotency_key TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (puzzle_id, client_session_id, action),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles_v3(puzzle_id) ON DELETE CASCADE
);
INSERT INTO action_receipts_v3 (puzzle_id, client_session_id, action, response_json, expires_at, idempotency_key)
SELECT puzzle_id, client_session_id, action, response_json, expires_at, idempotency_key FROM action_receipts;

DROP TABLE solution_group_items;
DROP TABLE solution_groups;
DROP TABLE puzzle_items;
DROP TABLE puzzle_rows;
DROP TABLE puzzle_sources;
DROP TABLE action_receipts;
DROP TABLE puzzles;

ALTER TABLE puzzles_v3 RENAME TO puzzles;
ALTER TABLE puzzle_items_v3 RENAME TO puzzle_items;
ALTER TABLE puzzle_rows_v3 RENAME TO puzzle_rows;
ALTER TABLE solution_groups_v3 RENAME TO solution_groups;
ALTER TABLE solution_group_items_v3 RENAME TO solution_group_items;
ALTER TABLE puzzle_sources_v3 RENAME TO puzzle_sources;
ALTER TABLE action_receipts_v3 RENAME TO action_receipts;

CREATE INDEX IF NOT EXISTS idx_puzzles_release
  ON puzzles (locale, publish_date, status);

CREATE INDEX IF NOT EXISTS idx_action_receipts_expiry
  ON action_receipts (expires_at);
