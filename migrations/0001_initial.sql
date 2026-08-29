PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS puzzles (
  puzzle_id TEXT PRIMARY KEY,
  puzzle_family_id TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'zh-Hans', 'es-419')),
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

CREATE TABLE IF NOT EXISTS puzzle_items (
  puzzle_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  label TEXT NOT NULL,
  visual_json TEXT,
  rights_note TEXT,
  display_order INTEGER NOT NULL,
  PRIMARY KEY (puzzle_id, item_id),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(puzzle_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS puzzle_rows (
  puzzle_id TEXT NOT NULL,
  row_id TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity IN (1, 2, 3, 4)),
  PRIMARY KEY (puzzle_id, row_id),
  UNIQUE (puzzle_id, capacity),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(puzzle_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS solution_groups (
  puzzle_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  label TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity IN (1, 2, 3, 4)),
  display_order INTEGER NOT NULL,
  PRIMARY KEY (puzzle_id, group_id),
  UNIQUE (puzzle_id, capacity),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(puzzle_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS solution_group_items (
  puzzle_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  PRIMARY KEY (puzzle_id, group_id, item_id),
  UNIQUE (puzzle_id, item_id),
  FOREIGN KEY (puzzle_id, group_id) REFERENCES solution_groups(puzzle_id, group_id) ON DELETE CASCADE,
  FOREIGN KEY (puzzle_id, item_id) REFERENCES puzzle_items(puzzle_id, item_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS puzzle_sources (
  puzzle_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  retrieved_at TEXT NOT NULL,
  PRIMARY KEY (puzzle_id, source_id),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(puzzle_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS action_receipts (
  puzzle_id TEXT NOT NULL,
  client_session_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('hint', 'reveal')),
  response_json TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  PRIMARY KEY (puzzle_id, client_session_id, action),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(puzzle_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_puzzles_release
  ON puzzles (locale, publish_date, status);

CREATE INDEX IF NOT EXISTS idx_action_receipts_expiry
  ON action_receipts (expires_at);
