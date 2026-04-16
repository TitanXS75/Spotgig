-- ============================================================
-- FILE: 09_rls_policies.sql
-- Requires: All table files (01–07)
-- Enables Row Level Security and creates access policies.
-- Safe to re-run (drops policies before recreating them).
-- ============================================================

-- ── Enable RLS on all tables ──────────────────────────────────
ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments  ENABLE ROW LEVEL SECURITY;


-- ── profiles ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "profiles_select_all"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON public.profiles;

-- Anyone (including unauthenticated) can read profiles (needed for seller name display)
CREATE POLICY "profiles_select_all"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Users can insert their own profile (handled by trigger, but policy needed as safety net)
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING     (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ── listings ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "listings_select_public"      ON public.listings;
DROP POLICY IF EXISTS "listings_select_own_pending" ON public.listings;
DROP POLICY IF EXISTS "listings_insert_own"         ON public.listings;
DROP POLICY IF EXISTS "listings_update_own"         ON public.listings;
DROP POLICY IF EXISTS "listings_delete_own"         ON public.listings;

-- Anyone can view live listings
CREATE POLICY "listings_select_public"
  ON public.listings
  FOR SELECT
  USING (status = 'live');

-- Sellers can also see their own pending/suspended listings
CREATE POLICY "listings_select_own_pending"
  ON public.listings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can create a listing (must match their user_id)
CREATE POLICY "listings_insert_own"
  ON public.listings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Sellers can update their own listings
CREATE POLICY "listings_update_own"
  ON public.listings
  FOR UPDATE
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Sellers can delete their own listings
CREATE POLICY "listings_delete_own"
  ON public.listings
  FOR DELETE
  USING (auth.uid() = user_id);


-- ── favorites ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "favorites_select_own" ON public.favorites;
DROP POLICY IF EXISTS "favorites_insert_own" ON public.favorites;
DROP POLICY IF EXISTS "favorites_delete_own" ON public.favorites;

-- Users can only see their own favorites
CREATE POLICY "favorites_select_own"
  ON public.favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add favorites for themselves only
CREATE POLICY "favorites_insert_own"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
CREATE POLICY "favorites_delete_own"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);


-- ── comments ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "comments_select_all"  ON public.comments;
DROP POLICY IF EXISTS "comments_insert_own"  ON public.comments;
DROP POLICY IF EXISTS "comments_delete_own"  ON public.comments;

-- Anyone can read comments on a listing
CREATE POLICY "comments_select_all"
  ON public.comments
  FOR SELECT
  USING (true);

-- Authenticated users can post a comment
CREATE POLICY "comments_insert_own"
  ON public.comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments only
CREATE POLICY "comments_delete_own"
  ON public.comments
  FOR DELETE
  USING (auth.uid() = user_id);


-- ── votes ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "votes_select_all"  ON public.votes;
DROP POLICY IF EXISTS "votes_insert_own"  ON public.votes;
DROP POLICY IF EXISTS "votes_update_own"  ON public.votes;
DROP POLICY IF EXISTS "votes_delete_own"  ON public.votes;

-- Anyone can see vote counts
CREATE POLICY "votes_select_all"
  ON public.votes
  FOR SELECT
  USING (true);

-- Authenticated users can cast a vote
CREATE POLICY "votes_insert_own"
  ON public.votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can change their vote (up ↔ down)
CREATE POLICY "votes_update_own"
  ON public.votes
  FOR UPDATE
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their vote
CREATE POLICY "votes_delete_own"
  ON public.votes
  FOR DELETE
  USING (auth.uid() = user_id);


-- ── reviews ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "reviews_select_all" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;
DROP POLICY IF EXISTS "reviews_delete_own" ON public.reviews;

-- Anyone can read reviews
CREATE POLICY "reviews_select_all"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Authenticated users can write a review
CREATE POLICY "reviews_insert_own"
  ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can edit their own review
CREATE POLICY "reviews_update_own"
  ON public.reviews
  FOR UPDATE
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own review
CREATE POLICY "reviews_delete_own"
  ON public.reviews
  FOR DELETE
  USING (auth.uid() = user_id);


-- ── payments ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;

-- Users can only see their own payment records
CREATE POLICY "payments_select_own"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create a payment record for their own listings
CREATE POLICY "payments_insert_own"
  ON public.payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
