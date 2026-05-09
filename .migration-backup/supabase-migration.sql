-- ============================================================
-- Sosa Socials — Social Events Migration
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Create the social_events table
CREATE TABLE IF NOT EXISTS social_events (
  id            TEXT PRIMARY KEY,
  type          TEXT        NOT NULL,                    -- 'follow' | 'like' | 'comment' | 'repost'
  actor_id      TEXT        NOT NULL,                    -- who did the action
  actor_name    TEXT        NOT NULL DEFAULT '',
  actor_username TEXT       NOT NULL DEFAULT '',
  actor_image   TEXT        NOT NULL DEFAULT '',
  recipient_id  TEXT        NOT NULL DEFAULT '',         -- who receives the action (post author, followee)
  target_id     TEXT        NOT NULL DEFAULT '',         -- post id, user id, comment id
  target_type   TEXT        NOT NULL DEFAULT '',         -- 'post' | 'user' | 'comment'
  metadata      JSONB       NOT NULL DEFAULT '{}',       -- extra context (comment content, post excerpt, etc.)
  status        TEXT        NOT NULL DEFAULT 'active',   -- 'active' | 'removed'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for the most common query patterns
CREATE INDEX IF NOT EXISTS idx_se_actor_type_status
  ON social_events (actor_id, type, status);

CREATE INDEX IF NOT EXISTS idx_se_recipient_type_status
  ON social_events (recipient_id, type, status);

CREATE INDEX IF NOT EXISTS idx_se_target_type_status
  ON social_events (target_id, type, status);

CREATE INDEX IF NOT EXISTS idx_se_type_status_created
  ON social_events (type, status, created_at DESC);

-- 3. Optional: denormalized count columns on users (already added by previous migration)
--    Run only if you haven't already:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS posts_count    INTEGER DEFAULT 0;

-- ============================================================
-- After running this SQL, call the backfill endpoint ONCE
-- to populate social_events from your existing data:
--
--   POST /api/admin/backfill-events
--   Header: X-Admin-Key: sossa-admin
--
-- You can do this with curl or any API client (Postman, etc.)
-- The endpoint is idempotent — safe to call more than once.
-- ============================================================
