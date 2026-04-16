-- ============================================================
-- FILE: 06_votes.sql
-- Requires: 00_enums.sql, 01_profiles.sql, 02_listings.sql
-- Thumbs up / thumbs down per listing.
-- Mapped to the vote buttons in ListingDetail.tsx
-- Safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.votes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  listing_id  UUID        NOT NULL REFERENCES public.listings(id)  ON DELETE CASCADE,
  vote        vote_type   NOT NULL,   -- 'up' | 'down'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One vote per user per listing (can change vote by updating)
  CONSTRAINT votes_user_listing_unique UNIQUE (user_id, listing_id)
);

COMMENT ON TABLE public.votes IS 'Thumbs up/down reactions. One per user per listing. Updatable to change vote.';
