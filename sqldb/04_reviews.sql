-- ============================================================
-- FILE: 04_reviews.sql
-- Requires: 01_profiles.sql, 02_listings.sql
-- Star-rated reviews. One review per user per listing.
-- Safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  listing_id  UUID        NOT NULL REFERENCES public.listings(id)  ON DELETE CASCADE,
  rating      SMALLINT    NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One review per user per listing
  CONSTRAINT reviews_user_listing_unique UNIQUE (user_id, listing_id)
);

COMMENT ON TABLE  public.reviews         IS 'Star ratings (1–5) with optional text. One per user per listing.';
COMMENT ON COLUMN public.reviews.rating  IS 'Integer between 1 and 5 inclusive.';
COMMENT ON COLUMN public.reviews.comment IS 'Optional text review accompanying the rating.';
