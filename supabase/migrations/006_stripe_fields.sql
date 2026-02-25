-- Migration 006: Add Stripe-specific columns to subscriptions table
-- Run in: Supabase Dashboard > SQL Editor > New Query
-- Safe to re-run — all ALTER TABLEs use IF NOT EXISTS.

BEGIN;

-- ============================================================
-- BLOCK 1: Add Stripe columns (idempotent)
-- ============================================================
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id      VARCHAR(255),
  ADD COLUMN IF NOT EXISTS stripe_subscription_id  VARCHAR(255),
  ADD COLUMN IF NOT EXISTS current_period_start     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS canceled_at              TIMESTAMPTZ;

-- ============================================================
-- BLOCK 2: Indexes for fast Stripe lookups
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer
  ON subscriptions (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription
  ON subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- ============================================================
-- BLOCK 3: RPC — update_subscription_from_stripe
--   Called by the webhook handler (service-role key, not user JWT).
--   Matches by stripe_subscription_id; creates or updates row.
-- ============================================================
CREATE OR REPLACE FUNCTION update_subscription_from_stripe(
  p_stripe_customer_id      TEXT,
  p_stripe_subscription_id  TEXT,
  p_plan_type               TEXT,   -- 'monthly' | 'yearly' | 'free'
  p_status                  TEXT,   -- 'active' | 'cancelled' | 'expired'
  p_current_period_start    TIMESTAMPTZ,
  p_current_period_end      TIMESTAMPTZ,
  p_cancel_at_period_end    BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE subscriptions
  SET
    plan_type              = p_plan_type,
    status                 = p_status,
    stripe_customer_id     = p_stripe_customer_id,
    stripe_subscription_id = p_stripe_subscription_id,
    current_period_start   = p_current_period_start,
    current_period_end     = p_current_period_end,
    cancel_at_period_end   = p_cancel_at_period_end
  WHERE stripe_subscription_id = p_stripe_subscription_id;

  -- If no row matched by subscription ID, fall back to customer ID (first webhook)
  IF NOT FOUND THEN
    UPDATE subscriptions
    SET
      plan_type              = p_plan_type,
      status                 = p_status,
      stripe_customer_id     = p_stripe_customer_id,
      stripe_subscription_id = p_stripe_subscription_id,
      current_period_start   = p_current_period_start,
      current_period_end     = p_current_period_end,
      cancel_at_period_end   = p_cancel_at_period_end
    WHERE stripe_customer_id = p_stripe_customer_id
      AND status = 'active';

    -- Both UPDATEs matched zero rows — raise so the webhook handler sees the
    -- failure and Stripe retries the event rather than silently losing it.
    IF NOT FOUND THEN
      RAISE EXCEPTION
        'No subscription row found for stripe_subscription_id=% or stripe_customer_id=%',
        p_stripe_subscription_id, p_stripe_customer_id;
    END IF;
  END IF;
END;
$$;

COMMENT ON FUNCTION update_subscription_from_stripe IS
'Called by Stripe webhook handler (service-role). Updates subscription row by stripe_subscription_id or stripe_customer_id. No auth.uid() — webhook requests are not authenticated via JWT.';

-- Webhook handler uses service key; revoke from normal roles
REVOKE ALL ON FUNCTION update_subscription_from_stripe(TEXT,TEXT,TEXT,TEXT,TIMESTAMPTZ,TIMESTAMPTZ,BOOLEAN)
  FROM PUBLIC, anon, authenticated;

COMMIT;
