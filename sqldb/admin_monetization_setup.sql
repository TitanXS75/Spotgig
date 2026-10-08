-- ============================================================
-- AASPASS / SPOTGIG: ADMIN, MONETIZATION & INCOME ENGINE SETUP
-- New Migration File: sqldb/admin_monetization_setup.sql
-- Run this in Supabase SQL Editor.
-- Safe, clean, and idempotent (preserves existing compiled schema).
-- ============================================================

-- ── 1. Ensure `is_admin` column exists on profiles ──────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);


-- ── 2. Platform Settings Table (Control Gateway & Monetization) ──
-- This allows the admin to start/pause the payment gateway in real time
-- and set free client/project limits. Billed strictly on a monthly basis.
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id                      TEXT PRIMARY KEY DEFAULT 'global',
  payment_gateway_enabled BOOLEAN NOT NULL DEFAULT false, -- Defaults to FALSE (FREE at start)
  free_client_limit       INTEGER NOT NULL DEFAULT 1,     -- 1 client free before requiring payment
  platform_fee_percent    NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  monthly_plan_price      INTEGER NOT NULL DEFAULT 10000, -- ₹100 / month in paise
  announcement_banner     TEXT DEFAULT '',
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by              UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Seed initial settings if not present (Gateway paused = Free mode by default)
INSERT INTO public.platform_settings (
  id,
  payment_gateway_enabled,
  free_client_limit,
  platform_fee_percent,
  monthly_plan_price
)
VALUES (
  'global',
  false, -- Free at start!
  1,     -- 1 client free
  0.00,
  10000  -- ₹100 / month
)
ON CONFLICT (id) DO UPDATE SET
  monthly_plan_price = EXCLUDED.monthly_plan_price;


-- ── 3. Payments Table (Real Platform Income & Ledger) ──────────
CREATE TABLE IF NOT EXISTS public.payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id          UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  listing_id          UUID,
  amount              NUMERIC(10, 2) NOT NULL DEFAULT 0, -- Amount in INR (₹)
  plan                TEXT NOT NULL DEFAULT 'monthly',   -- 'free', 'monthly', 'client_unlock'
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature  TEXT,
  status              TEXT NOT NULL DEFAULT 'paid',      -- 'pending', 'paid', 'failed'
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure columns exist if table was partially created previously
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS listing_id UUID,
  ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);


-- ── 4. Fallback Listings Table (Protects legacy listing queries) ──
CREATE TABLE IF NOT EXISTS public.listings (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug               TEXT,
  name               TEXT NOT NULL DEFAULT 'Listing',
  seller_name        TEXT NOT NULL DEFAULT 'Seller',
  type               TEXT NOT NULL DEFAULT 'service',
  operating_type     TEXT NOT NULL DEFAULT 'home',
  category           TEXT NOT NULL DEFAULT 'Technology',
  description        TEXT NOT NULL DEFAULT '',
  tags               TEXT[] DEFAULT '{}',
  area               TEXT DEFAULT 'Remote / Online',
  lat                DOUBLE PRECISION DEFAULT 0.0,
  lng                DOUBLE PRECISION DEFAULT 0.0,
  status             TEXT NOT NULL DEFAULT 'live',
  plan               TEXT NOT NULL DEFAULT 'free',
  views              INT NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_user ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);


-- ── 5. Row Level Security (RLS) Policies ───────────────────────

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- ── 5.1 Platform Settings RLS
-- Anyone (authenticated or public) can read settings so the app knows if payment is active
DROP POLICY IF EXISTS "settings_read_public" ON public.platform_settings;
CREATE POLICY "settings_read_public" ON public.platform_settings
  FOR SELECT USING (true);

-- Only verified admins can update settings
DROP POLICY IF EXISTS "settings_update_admin" ON public.platform_settings;
CREATE POLICY "settings_update_admin" ON public.platform_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ── 5.2 Payments RLS
-- Users can read their own payments; Admins can read ALL payments to monitor income
DROP POLICY IF EXISTS "payments_select_own_or_admin" ON public.payments;
CREATE POLICY "payments_select_own_or_admin" ON public.payments
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Authenticated users or Edge Function can insert payments
DROP POLICY IF EXISTS "payments_insert_auth" ON public.payments;
CREATE POLICY "payments_insert_auth" ON public.payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Admins or Service Role can update payment status
DROP POLICY IF EXISTS "payments_update_admin" ON public.payments;
CREATE POLICY "payments_update_admin" ON public.payments
  FOR UPDATE
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ── 5.3 Listings RLS
DROP POLICY IF EXISTS "listings_read_all" ON public.listings;
CREATE POLICY "listings_read_all" ON public.listings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "listings_write_own_or_admin" ON public.listings;
CREATE POLICY "listings_write_own_or_admin" ON public.listings
  FOR ALL
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );


-- ── 6. Helper RPC Function: Promote User to Admin by Email ─────
-- Run: SELECT public.set_admin_role_by_email('your-email@example.com');
CREATE OR REPLACE FUNCTION public.set_admin_role_by_email(target_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = target_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN 'Error: User with email ' || target_email || ' not found in auth.users';
  END IF;

  UPDATE public.profiles
  SET is_admin = true, role = 'admin'
  WHERE id = v_user_id;

  RETURN 'Success: Admin role granted to ' || target_email;
END;
$$;


-- ── 7. RPC: Admin Income & Dashboard Metrics ───────────────────
CREATE OR REPLACE FUNCTION public.get_admin_financial_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_result JSONB;
BEGIN
  -- Security check
  SELECT is_admin INTO v_is_admin
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_is_admin IS NOT TRUE THEN
    RAISE EXCEPTION 'Access denied. Administrator privileges required.';
  END IF;

  SELECT jsonb_build_object(
    'total_income', COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0),
    'paid_transactions_count', COUNT(*) FILTER (WHERE status = 'paid'),
    'pending_transactions_count', COUNT(*) FILTER (WHERE status = 'pending'),
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'total_projects', (SELECT COUNT(*) FROM public.projects),
    'payment_gateway_enabled', (SELECT payment_gateway_enabled FROM public.platform_settings WHERE id = 'global'),
    'free_client_limit', (SELECT free_client_limit FROM public.platform_settings WHERE id = 'global')
  )
  INTO v_result
  FROM public.payments;

  RETURN v_result;
END;
$$;


-- ── 8. Project Comments / Candidate Messages (1 Per Account) ──
-- Allows gigs/developers to comment a pitch/message on any project.
-- The UNIQUE constraint strictly enforces: 1 message per account per project.
CREATE TABLE IF NOT EXISTS public.project_comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT one_pitch_per_user_per_project UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_comments_project ON public.project_comments(project_id);

ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments / pitches on a project
DROP POLICY IF EXISTS "comments_read_all" ON public.project_comments;
CREATE POLICY "comments_read_all" ON public.project_comments
  FOR SELECT USING (true);

-- Authenticated developers can submit their 1 message
DROP POLICY IF EXISTS "comments_insert_auth" ON public.project_comments;
CREATE POLICY "comments_insert_auth" ON public.project_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Authors or Project Owners can delete
DROP POLICY IF EXISTS "comments_delete" ON public.project_comments;
CREATE POLICY "comments_delete" ON public.project_comments
  FOR DELETE USING (
    auth.uid() = user_id
    OR auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id)
  );


-- ── 9. Wipe All Messages Automatically When Project Is Accepted ──
-- As soon as the project owner accepts a developer request,
-- ALL comment messages for that project are wiped from the database.
CREATE OR REPLACE FUNCTION public.fn_wipe_project_messages_on_accept()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' THEN
    DELETE FROM public.project_comments WHERE project_id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wipe_messages_on_accept ON public.project_requests;
CREATE TRIGGER trg_wipe_messages_on_accept
  AFTER UPDATE OF status ON public.project_requests
  FOR EACH ROW
  WHEN (NEW.status = 'accepted')
  EXECUTE FUNCTION public.fn_wipe_project_messages_on_accept();

-- Also wipe messages if project status is changed directly to 'in_progress' or 'completed'
CREATE OR REPLACE FUNCTION public.fn_wipe_on_project_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('in_progress', 'completed') AND (OLD.status IS NULL OR OLD.status NOT IN ('in_progress', 'completed')) THEN
    DELETE FROM public.project_comments WHERE project_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wipe_on_project_status ON public.projects;
CREATE TRIGGER trg_wipe_on_project_status
  AFTER UPDATE OF status ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_wipe_on_project_status_change();


-- ── 10. Admin Project Moderation & Deletion Policy ─────────────
-- Allows verified administrators to delete or moderate any project in the platform.
DROP POLICY IF EXISTS "projects_delete_admin" ON public.projects;
CREATE POLICY "projects_delete_admin" ON public.projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "projects_update_admin" ON public.projects;
CREATE POLICY "projects_update_admin" ON public.projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ── 11. One-Time Cleanup for Test/Mock Projects ────────────────
-- Run these statements in Supabase SQL editor to remove the 2 demo projects:
-- DELETE FROM public.projects WHERE title ILIKE '%Photo Studio%' OR title ILIKE '%Demetia%';


-- ── 12. Promote Administrators by Email ────────────────────────
-- Run these statements in Supabase SQL Editor to grant full admin rights:
/*
UPDATE public.profiles
SET is_admin = true, role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN (
    'sarthak.sontakke05@gmail.com',
    'rohitsable504@gmail.com'
  )
);

-- Or run via helper RPC:
SELECT public.set_admin_role_by_email('sarthak.sontakke05@gmail.com');
SELECT public.set_admin_role_by_email('rohitsable504@gmail.com');
*/


