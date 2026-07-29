CREATE TABLE IF NOT EXISTS preview_code_uses (
  preview_id TEXT NOT NULL,
  code_slot INTEGER NOT NULL CHECK (code_slot BETWEEN 1 AND 3),
  remaining_uses INTEGER NOT NULL DEFAULT 2
    CHECK (remaining_uses BETWEEN 0 AND 2),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (preview_id, code_slot)
);

CREATE TABLE IF NOT EXISTS preview_login_nonces (
  preview_id TEXT NOT NULL,
  nonce_fingerprint TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (preview_id, nonce_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_preview_login_nonces_expiry
  ON preview_login_nonces (preview_id, expires_at);

CREATE TABLE IF NOT EXISTS preview_login_attempts (
  preview_id TEXT NOT NULL,
  client_key TEXT NOT NULL,
  attempt_window INTEGER NOT NULL,
  failed_count INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (preview_id, client_key, attempt_window)
);

CREATE INDEX IF NOT EXISTS idx_preview_login_attempts_updated
  ON preview_login_attempts (preview_id, updated_at);
