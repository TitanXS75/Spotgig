-- ============================================================
-- FILE: 08_indexes.sql
-- Requires: All table files (01–07)
-- Performance indexes for frequent query patterns.
-- Safe to re-run (uses IF NOT EXISTS).
-- ============================================================

-- ── listings ──────────────────────────────────────────────────
-- Filter by seller
CREATE INDEX IF NOT EXISTS idx_listings_user_id
  ON public.listings (user_id);

-- Filter by status (most common: WHERE status = 'live')
CREATE INDEX IF NOT EXISTS idx_listings_status
  ON public.listings (status);

-- Filter by category
CREATE INDEX IF NOT EXISTS idx_listings_category
  ON public.listings (category);

-- Filter by listing type
CREATE INDEX IF NOT EXISTS idx_listings_type
  ON public.listings (type);

-- Filter by operating type (home / shop)
CREATE INDEX IF NOT EXISTS idx_listings_operating_type
  ON public.listings (operating_type);

-- Slug lookups for /listing/:slug routes
CREATE INDEX IF NOT EXISTS idx_listings_slug
  ON public.listings (slug);

-- Geo queries (used by get_listings_nearby function)
CREATE INDEX IF NOT EXISTS idx_listings_location
  ON public.listings (lat, lng);

-- Subscription expiry checks (WHERE plan_expires_at > NOW())
CREATE INDEX IF NOT EXISTS idx_listings_plan_expires
  ON public.listings (plan_expires_at);

-- Sort by newest
CREATE INDEX IF NOT EXISTS idx_listings_created_at
  ON public.listings (created_at DESC);

-- Full-text search on name + description + category (GIN index)
CREATE INDEX IF NOT EXISTS idx_listings_fts
  ON public.listings
  USING GIN (
    to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(category, ''))
  );

-- ── favorites ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_favorites_user_id
  ON public.favorites (user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_listing_id
  ON public.favorites (listing_id);

-- ── comments ──────────────────────────────────────────────────
-- Load comments for a listing ordered newest first
CREATE INDEX IF NOT EXISTS idx_comments_listing_id
  ON public.comments (listing_id);

CREATE INDEX IF NOT EXISTS idx_comments_created_at
  ON public.comments (created_at DESC);

-- ── votes ─────────────────────────────────────────────────────
-- Aggregate vote counts per listing
CREATE INDEX IF NOT EXISTS idx_votes_listing_id
  ON public.votes (listing_id);

-- ── reviews ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id
  ON public.reviews (listing_id);

-- ── payments ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_payments_user_id
  ON public.payments (user_id);

CREATE INDEX IF NOT EXISTS idx_payments_listing_id
  ON public.payments (listing_id);

-- Find payments by Razorpay order ID (for webhook verification)
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id
  ON public.payments (razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;
