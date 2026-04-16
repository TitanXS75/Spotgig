-- ============================================================
-- FILE: 13_admin_setup.sql
-- Requires: 01_profiles.sql, 09_rls_policies.sql
-- Sets up admin role support for the Aaspass admin panel.
-- Run AFTER all other SQL files.
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE).
-- ============================================================


-- ── 1. Add is_admin flag to profiles ─────────────────────────

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.profiles.is_admin IS 'When TRUE, the user has full admin access to the admin panel.';


-- ── 2. Admin RLS: read ALL listings (including pending/suspended) ────

DROP POLICY IF EXISTS "listings_select_admin" ON public.listings;

CREATE POLICY "listings_select_admin"
  ON public.listings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );


-- ── 3. Admin RLS: update ANY listing (e.g. suspend, reinstate) ──────

DROP POLICY IF EXISTS "listings_update_admin" ON public.listings;

CREATE POLICY "listings_update_admin"
  ON public.listings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );


-- ── 4. Grant admin access to your account ────────────────────
-- IMPORTANT: Sign up / log in to the app first with your email,
-- then run this block to make yourself admin.

UPDATE public.profiles
SET is_admin = TRUE
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'sarthak.sontakke05@gmail.com'
);
