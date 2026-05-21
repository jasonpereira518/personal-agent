-- Phase 2: capture webhook audit log
CREATE TABLE capture_webhook_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT,
  device_token_id TEXT,
  source          TEXT,
  payload_preview TEXT,
  status_code     INT,
  error_message   TEXT,
  ip_address      TEXT,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX capture_log_user_idx ON capture_webhook_log(user_id, created_at DESC);

ALTER TABLE capture_webhook_log ENABLE ROW LEVEL SECURITY;
-- Users can read their own logs; webhook inserts via service role (bypasses RLS)
CREATE POLICY cwl_select ON capture_webhook_log
  FOR SELECT USING ((auth.jwt() ->> 'sub') = user_id);
