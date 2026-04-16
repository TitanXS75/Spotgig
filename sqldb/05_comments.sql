-- ============================================================
-- FILE: 05_comments.sql
-- Requires: 01_profiles.sql, 02_listings.sql
-- Public community comments on listings.
-- Mapped to the "Community Feedback" section in ListingDetail.tsx
-- Safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.comments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  listing_id  UUID        NOT NULL REFERENCES public.listings(id)  ON DELETE CASCADE,
  text        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.comments IS 'Public text comments on listings. Visible to all. Authors can delete their own.';
COMMENT ON COLUMN public.comments.text IS 'Plain text comment content (no HTML).';
