CREATE TABLE IF NOT EXISTS banned_ips (
  ip         TEXT PRIMARY KEY,
  reason     TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decks (
  id              TEXT PRIMARY KEY,
  author_id       TEXT,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  is_public       BOOLEAN NOT NULL DEFAULT TRUE,
  requires_answer BOOLEAN NOT NULL DEFAULT FALSE,
  hashtags        TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deck_votes (
  id         TEXT PRIMARY KEY,
  deck_id    TEXT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  voter_ip   TEXT NOT NULL,
  vote       TEXT NOT NULL CHECK (vote IN ('like', 'dislike')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (deck_id, voter_ip)
);

CREATE TABLE IF NOT EXISTS deck_favorites (
  id         TEXT PRIMARY KEY,
  deck_id    TEXT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  user_ip    TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (deck_id, user_ip)
);

CREATE TABLE IF NOT EXISTS flash_cards (
  id               TEXT PRIMARY KEY,
  deck_id          TEXT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  front            TEXT NOT NULL,
  back             TEXT NOT NULL,
  position         INTEGER NOT NULL DEFAULT 0,
  accepted_answers TEXT[] NOT NULL DEFAULT '{}',
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);
