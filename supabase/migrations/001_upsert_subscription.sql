-- Migration 001: Atomic subscription upsert RPC
-- NOTE: Run 005_final_security_hardening.sql on existing databases.
-- Use this only when initializing a fresh database before running 005.

-- Pre-flight: remove duplicate active subscriptions before creating the unique index.
-- Keeps only the most-recently-created active row per user; deletes the rest.
-- No-op on a clean database. Makes the migration safe against prior data bugs.
DELETE FROM subscriptions
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY user_id
             ORDER BY created_at DESC, id DESC   -- deterministic tiebreaker
           ) AS rn
    FROM   subscriptions
    WHERE  status = 'active'
  ) ranked
  WHERE rn > 1
);

-- Partial unique index required by ON CONFLICT (user_id) WHERE status = 'active'.
-- Enforces one active subscription per user at the DB level.
-- Safe to re-run — IF NOT EXISTS is a no-op if already created by migration 004/005.
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_id_active_uidx
  ON subscriptions (user_id)
  WHERE status = 'active';

DROP FUNCTION IF EXISTS upsert_subscription(UUID, TEXT, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS upsert_subscription(TEXT, TEXT);
DROP FUNCTION IF EXISTS upsert_subscription(TEXT);

CREATE FUNCTION upsert_subscription(pplan_type TEXT)
RETURNS subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_result  subscriptions;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF pplan_type IS NULL OR NOT (pplan_type = ANY(ARRAY['free', 'pro', 'premium'])) THEN
    RAISE EXCEPTION 'Invalid plan_type: %. Must be one of: free, pro, premium', pplan_type;
  END IF;

  -- XOR-fold both 64-bit halves of the UUID hex string.
  -- Retains all 128 bits of UUID entropy in the advisory lock key,
  -- eliminating false sharing between users sharing the same upper 64 bits.
  PERFORM pg_advisory_xact_lock(
    (
      ('x' || substring(replace(v_user_id::text, '-', ''),  1, 16))::bit(64) #
      ('x' || substring(replace(v_user_id::text, '-', ''), 17, 16))::bit(64)
    )::bigint
  );

  INSERT INTO subscriptions (user_id, plan_type, status, start_date)
  VALUES (v_user_id, pplan_type, 'active', NOW())
  ON CONFLICT (user_id) WHERE status = 'active'
  DO UPDATE SET plan_type = EXCLUDED.plan_type
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION upsert_subscription(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION upsert_subscription(TEXT) TO authenticated;
