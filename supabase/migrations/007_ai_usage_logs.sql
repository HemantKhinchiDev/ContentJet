-- supabase/migrations/007_ai_usage_logs.sql
-- AI generation usage tracking table

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name    VARCHAR(100) NOT NULL,
  provider         VARCHAR(50)  NOT NULL,
  model            VARCHAR(100) NOT NULL,
  prompt_tokens    INTEGER      NOT NULL DEFAULT 0,
  completion_tokens INTEGER     NOT NULL DEFAULT 0,
  total_tokens     INTEGER      NOT NULL DEFAULT 0,
  duration_ms      INTEGER      NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date    ON ai_usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_template     ON ai_usage_logs(template_name);
CREATE INDEX IF NOT EXISTS idx_ai_usage_provider     ON ai_usage_logs(provider);

-- Row Level Security
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can only read their own logs
CREATE POLICY "Users can read own AI usage logs"
  ON ai_usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- The API route runs as the anon/service role; allow inserts from authenticated users
CREATE POLICY "Authenticated users can insert own AI usage logs"
  ON ai_usage_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE ai_usage_logs IS 'Tracks AI content generation usage per user for analytics and billing purposes.';
COMMENT ON COLUMN ai_usage_logs.template_name IS 'One of the named prompt templates (e.g. BLOG_POST, SOCIAL_POST).';
COMMENT ON COLUMN ai_usage_logs.provider IS 'AI provider used: groq | google | huggingface | together.';
COMMENT ON COLUMN ai_usage_logs.duration_ms IS 'Wall-clock time from API call start to first byte of response.';
