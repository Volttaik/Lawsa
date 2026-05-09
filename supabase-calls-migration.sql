-- WebRTC call signaling table
CREATE TABLE IF NOT EXISTS call_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  from_user_id TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS call_signals_session_to_idx
  ON call_signals (session_id, to_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS call_signals_incoming_idx
  ON call_signals (to_user_id, type, created_at DESC);

-- Auto-delete old signals after 1 hour (run this as a scheduled job or cron)
-- DELETE FROM call_signals WHERE created_at < now() - interval '1 hour';

-- Live streams table
CREATE TABLE IF NOT EXISTS live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id TEXT NOT NULL,
  host_name TEXT NOT NULL,
  host_username TEXT NOT NULL,
  host_image TEXT DEFAULT '',
  title TEXT DEFAULT 'Live',
  status TEXT DEFAULT 'live',
  viewer_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS live_streams_active_idx
  ON live_streams (status, created_at DESC);
