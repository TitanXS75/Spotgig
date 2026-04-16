-- ============================================================
-- FILE: 03_favorites.sql
-- Requires: 01_profiles.sql, 02_listings.sql
-- Users can save/bookmark listings they like.
-- Safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.favorites (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  listing_id  UUID        NOT NULL REFERENCES public.listings(id)  ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One favorite per user per listing
  CONSTRAINT favorites_user_listing_unique UNIQUE (user_id, listing_id)
);

COMMENT ON TABLE public.favorites IS 'Bookmarked listings per user. Deleted when user or listing is deleted.';
