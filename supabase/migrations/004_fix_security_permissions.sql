-- Migration 004: Fix Critical Security Permissions
-- Run in: Supabase Dashboard > SQL Editor > New Query
-- Description: Revoke anon EXECUTE on trigger functions + add unique constraint

-- ============================================================
-- STEP 1: Revoke anon EXECUTE from all trigger functions
-- ============================================================
-- Trigger functions are invoked by the PostgreSQL trigger mechanism,
-- not by users directly. SECURITY DEFINER means they run as the
-- function owner (postgres). No user-role grant is needed or safe.

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon, public;
REVOKE EXECUTE ON FUNCTION handle_new_user_subscription() FROM anon, public;
REVOKE EXECUTE ON FUNCTION update_updated_at() FROM anon, public;

-- Authenticated grant kept only if any of these need direct invocation.
-- For pure trigger functions, even this is optional.
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user_subscription() TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at() TO authenticated;

-- Security model annotation
COMMENT ON FUNCTION handle_new_user() IS
'Trigger function (SECURITY DEFINER). Runs as owner. No anon access.';
COMMENT ON FUNCTION handle_new_user_subscription() IS
'Trigger function (SECURITY DEFINER). Creates free subscription on signup. No anon access.';

-- ============================================================
-- STEP 2: Unique constraint - prevent multiple active subscriptions
-- ============================================================
-- Enforces at the DB level that each user can have at most one
-- active subscription at a time. Also makes the upsert_subscription
-- RPC advisory-lock strategy a belt-and-suspenders approach.

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_subscription
ON subscriptions (user_id)
WHERE status = 'active';

-- ============================================================
-- STEP 3: Verify RLS is still active on sensitive tables
-- ============================================================
DO $$
BEGIN
  IF NOT (
    SELECT rowsecurity
    FROM pg_tables
    WHERE tablename = 'subscriptions' AND schemaname = 'public'
  ) THEN
    RAISE EXCEPTION 'SECURITY: RLS is not enabled on subscriptions table!';
  END IF;

  IF NOT (
    SELECT rowsecurity
    FROM pg_tables
    WHERE tablename = 'users' AND schemaname = 'public'
  ) THEN
    RAISE EXCEPTION 'SECURITY: RLS is not enabled on users table!';
  END IF;
END $$;
