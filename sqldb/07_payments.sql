-- ============================================================
-- FILE: 07_payments.sql
-- Requires: 00_enums.sql, 01_profiles.sql, 02_listings.sql
-- Razorpay payment records for listing subscriptions.
-- Safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id                    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID            NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  listing_id            UUID            NOT NULL REFERENCES public.listings(id)  ON DELETE CASCADE,

  -- Amount stored in PAISE (smallest Indian currency unit)
  -- free_trial = 0, monthly = 10000 (₹100), yearly = 120000 (₹1200)
  amount                INTEGER         NOT NULL DEFAULT 0,

  plan                  subscription_plan NOT NULL,

  -- Razorpay fields (populated after payment gateway response)
  razorpay_order_id     TEXT,
  razorpay_payment_id   TEXT,
  razorpay_signature    TEXT,

  status                payment_status  NOT NULL DEFAULT 'pending',
  created_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.payments                       IS 'Razorpay payment records linked to listing subscriptions.';
COMMENT ON COLUMN public.payments.amount                IS 'Amount in PAISE. ₹100 = 10000, ₹1200 = 120000, free = 0.';
COMMENT ON COLUMN public.payments.razorpay_order_id     IS 'Populated when Razorpay order is created server-side.';
COMMENT ON COLUMN public.payments.razorpay_payment_id   IS 'Populated after successful payment by Razorpay webhook.';
COMMENT ON COLUMN public.payments.razorpay_signature    IS 'HMAC signature for payment verification.';
