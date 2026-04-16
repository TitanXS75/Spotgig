-- ============================================================
-- FILE: 01_profiles.sql
-- Requires: 00_enums.sql
-- User profiles table — mirrors auth.users (1:1 relationship).
-- Safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  phone        TEXT,
  avatar_url   TEXT,
  gender       gender_type,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add a comment for clarity
COMMENT ON TABLE public.profiles IS 'User profile data. id matches auth.users.id.';
COMMENT ON COLUMN public.profiles.phone IS 'Indian 10-digit phone number (no country code stored).';
COMMENT ON COLUMN public.profiles.avatar_url IS 'Public URL from Supabase Storage avatars bucket.';
