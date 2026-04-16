-- ============================================================
-- FILE: 11_triggers.sql
-- Requires: 01_profiles.sql, 02_listings.sql, 04_reviews.sql
-- Automatic triggers:
--   1. Create profile row when new user signs up (Auth → profiles)
--   2. Keep updated_at columns in sync on any UPDATE
-- Safe to re-run (drops before recreating).
-- ============================================================


-- ── Helper function: set updated_at to NOW() ─────────────────

CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ── Trigger: auto-create profile on user signup ───────────────
-- When a user registers via Supabase Auth (email or Google),
-- a matching row is automatically inserted into public.profiles.
-- full_name and avatar_url come from Supabase Auth metadata
-- (set during signUp or Google OAuth).

CREATE OR REPLACE FUNCTION public.fn_handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;  -- Safe if profile already exists
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_handle_new_user();


-- ── Trigger: keep listings.updated_at current ────────────────

DROP TRIGGER IF EXISTS trg_listings_updated_at ON public.listings;
CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_set_updated_at();


-- ── Trigger: keep profiles.updated_at current ────────────────

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_set_updated_at();


-- ── Trigger: keep reviews.updated_at current ─────────────────

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON public.reviews;
CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_set_updated_at();
