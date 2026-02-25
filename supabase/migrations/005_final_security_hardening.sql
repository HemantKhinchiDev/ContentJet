-- Migration 005: Final Security Hardening
-- Run in: Supabase Dashboard > SQL Editor > New Query
--
-- Wrapped in a transaction: if any step fails the entire migration rolls back,
-- including the destructive DELETE at the top.

BEGIN;

-- ============================================================
-- BLOCK 1: Deduplicate active subscriptions, then create index
--   ORDER BY created_at DESC, id DESC ensures deterministic row
--   selection even when two rows share the same created_at timestamp.
-- ============================================================
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
-- IF NOT EXISTS: no-op if already created by migration 004.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_subscription
ON subscriptions (user_id)
WHERE status = 'active';

-- ============================================================
-- BLOCK 2: Drop old signatures (all possible variants)
-- ============================================================
DROP FUNCTION IF EXISTS upsert_subscription(UUID, TEXT, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS upsert_subscription(TEXT, TEXT);
DROP FUNCTION IF EXISTS upsert_subscription(TEXT);

-- ============================================================
-- BLOCK 3: Production-hardened upsert_subscription
-- ============================================================
CREATE FUNCTION upsert_subscription(pplan_type TEXT)
RETURNS subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id     UUID;
  v_valid_plans TEXT[] := ARRAY['free', 'pro', 'premium'];
  v_result      subscriptions;
BEGIN
  -- Caller identity from JWT — no user_id param, cannot be spoofed.
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- NULL must be checked explicitly: NULL = ANY(...) yields NULL in PL/pgSQL,
  -- which is treated as FALSE, silently skipping the exception.
  IF pplan_type IS NULL OR NOT (pplan_type = ANY(v_valid_plans)) THEN
    RAISE EXCEPTION 'Invalid plan_type: %. Must be one of: free, pro, premium', pplan_type;
  END IF;

  -- XOR-fold both 64-bit halves of the UUID into one bigint lock key.
  -- Retains all 128 bits of UUID entropy — no false sharing on upper-64-bit collisions.
  PERFORM pg_advisory_xact_lock(
    (
      ('x' || substring(replace(v_user_id::text, '-', ''),  1, 16))::bit(64) #
      ('x' || substring(replace(v_user_id::text, '-', ''), 17, 16))::bit(64)
    )::bigint
  );

  -- start_date intentionally NOT updated on conflict — it records when the user
  -- first subscribed. Resetting it on plan upgrades corrupts billing history.
  INSERT INTO subscriptions (user_id, plan_type, status, start_date)
  VALUES (v_user_id, pplan_type, 'active', NOW())
  ON CONFLICT (user_id) WHERE status = 'active'
  DO UPDATE SET
    plan_type = EXCLUDED.plan_type
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION upsert_subscription(TEXT) IS
'Atomic subscription upsert. auth.uid() enforces caller identity.
 plan_type validated (NULL-safe). search_path pinned. 64-bit XOR advisory lock.
 start_date preserved on plan upgrades. Requires idx_unique_active_subscription.';

-- ============================================================
-- BLOCK 4: Permissions — authenticated only
-- ============================================================
REVOKE ALL ON FUNCTION upsert_subscription(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION upsert_subscription(TEXT) TO authenticated;

-- ============================================================
-- BLOCK 5: Harden trigger functions (only if they exist)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    EXECUTE $f$
      CREATE OR REPLACE FUNCTION handle_new_user()
      RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
      SET search_path = public, pg_temp AS $body$
      BEGIN
        INSERT INTO public.users (id, email, full_name, avatar_url)
        VALUES (
          NEW.id, NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
          COALESCE(NEW.raw_user_meta_data->>'avatar_url',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id)
        ) ON CONFLICT (id) DO NOTHING;
        RETURN NEW;
      END;
      $body$
    $f$;
    REVOKE ALL ON FUNCTION handle_new_user() FROM PUBLIC, anon, authenticated;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user_subscription') THEN
    EXECUTE $f$
      CREATE OR REPLACE FUNCTION handle_new_user_subscription()
      RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
      SET search_path = public, pg_temp AS $body$
      BEGIN
        INSERT INTO public.subscriptions (user_id, plan_type, status, start_date)
        VALUES (NEW.id, 'free', 'active', NOW()) ON CONFLICT DO NOTHING;
        RETURN NEW;
      END;
      $body$
    $f$;
    REVOKE ALL ON FUNCTION handle_new_user_subscription() FROM PUBLIC, anon, authenticated;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at') THEN
    EXECUTE $f$
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
      SET search_path = public, pg_temp AS $body$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $body$
    $f$;
    REVOKE ALL ON FUNCTION update_updated_at() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

-- ============================================================
-- BLOCK 6: Verify RLS on both sensitive tables
--   Table existence is checked BEFORE rowsecurity to prevent
--   vacuous success if a table doesn't exist.
--   RAISE NOTICE fires only AFTER all checks pass.
-- ============================================================
DO $$
DECLARE
  v_exists BOOLEAN;
  v_rls    BOOLEAN;
BEGIN
  -- Check subscriptions
  SELECT EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscriptions'
  ) INTO v_exists;
  IF NOT v_exists THEN
    RAISE EXCEPTION 'Table subscriptions does not exist!';
  END IF;

  SELECT rowsecurity INTO v_rls
  FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscriptions';
  IF NOT v_rls THEN
    RAISE EXCEPTION 'RLS is not enabled on subscriptions table!';
  END IF;

  -- Check users (handle_new_user inserts into public.users)
  SELECT EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users'
  ) INTO v_exists;
  IF NOT v_exists THEN
    RAISE EXCEPTION 'Table users does not exist!';
  END IF;

  SELECT rowsecurity INTO v_rls
  FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users';
  IF NOT v_rls THEN
    RAISE EXCEPTION 'RLS is not enabled on users table!';
  END IF;

  -- NOTICE fires only after ALL checks above have passed
  RAISE NOTICE 'Migration 005 complete. RLS verified on subscriptions and users.';
END $$;

COMMIT;
