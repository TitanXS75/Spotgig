-- ============================================================
-- FILE: 10_functions.sql
-- Requires: All table files (01–07) + 00_enums.sql
-- PostgreSQL helper functions called from the frontend via
-- supabase.rpc('function_name', { ...args }).
-- Safe to re-run (uses CREATE OR REPLACE).
-- ============================================================


-- ── 1. Increment view count ───────────────────────────────────
-- Called every time a listing detail page is opened.
-- Usage: await supabase.rpc('increment_listing_views', { p_listing_id: id })

CREATE OR REPLACE FUNCTION public.increment_listing_views(p_listing_id UUID)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE public.listings
  SET    views = views + 1
  WHERE  id = p_listing_id;
$$;


-- ── 2. Get nearby listings (Haversine formula) ────────────────
-- Returns live, non-expired listings within radius_km of user.
-- Results are sorted by distance ascending.
-- Usage: await supabase.rpc('get_listings_nearby', { user_lat, user_lng, radius_km })

CREATE OR REPLACE FUNCTION public.get_listings_nearby(
  user_lat  DOUBLE PRECISION,
  user_lng  DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10
)
RETURNS TABLE (
  id                UUID,
  slug              TEXT,
  user_id           UUID,
  name              TEXT,
  seller_name       TEXT,
  emoji             TEXT,
  image_url         TEXT,
  supportive_images TEXT[],
  type              listing_type,
  operating_type    operating_type,
  category          TEXT,
  description       TEXT,
  tags              TEXT[],
  whatsapp          TEXT,
  instagram         TEXT,
  website           TEXT,
  other_handle      TEXT,
  area              TEXT,
  lat               DOUBLE PRECISION,
  lng               DOUBLE PRECISION,
  hide_location     BOOLEAN,
  price             NUMERIC,
  price_unit        TEXT,
  status            listing_status,
  plan              subscription_plan,
  plan_expires_at   TIMESTAMPTZ,
  views             INTEGER,
  created_at        TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ,
  distance_km       DOUBLE PRECISION
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT
    l.id,
    l.slug,
    l.user_id,
    l.name,
    l.seller_name,
    l.emoji,
    l.image_url,
    l.supportive_images,
    l.type,
    l.operating_type,
    l.category,
    l.description,
    l.tags,
    l.whatsapp,
    l.instagram,
    l.website,
    l.other_handle,
    l.area,
    l.lat,
    l.lng,
    l.hide_location,
    l.price,
    l.price_unit,
    l.status,
    l.plan,
    l.plan_expires_at,
    l.views,
    l.created_at,
    l.updated_at,
    -- Haversine distance calculation
    (
      6371.0 * acos(
        LEAST(1.0,
          cos(radians(user_lat))
          * cos(radians(l.lat))
          * cos(radians(l.lng) - radians(user_lng))
          + sin(radians(user_lat))
          * sin(radians(l.lat))
        )
      )
    ) AS distance_km
  FROM  public.listings l
  WHERE l.status = 'live'
    AND l.plan_expires_at > NOW()
    AND (
      6371.0 * acos(
        LEAST(1.0,
          cos(radians(user_lat))
          * cos(radians(l.lat))
          * cos(radians(l.lng) - radians(user_lng))
          + sin(radians(user_lat))
          * sin(radians(l.lat))
        )
      )
    ) <= radius_km
  ORDER BY distance_km ASC;
$$;


-- ── 3. Full-text search across listings ───────────────────────
-- Searches name + description + category using PostgreSQL FTS.
-- Usage: await supabase.rpc('search_listings', { query: 'homemade snacks' })

CREATE OR REPLACE FUNCTION public.search_listings(query TEXT)
RETURNS SETOF public.listings
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT *
  FROM   public.listings
  WHERE  status           = 'live'
    AND  plan_expires_at  > NOW()
    AND  to_tsvector('english',
           COALESCE(name,        '') || ' ' ||
           COALESCE(description, '') || ' ' ||
           COALESCE(category,    '')
         ) @@ plainto_tsquery('english', query)
  ORDER BY
    ts_rank(
      to_tsvector('english',
        COALESCE(name,        '') || ' ' ||
        COALESCE(description, '') || ' ' ||
        COALESCE(category,    '')
      ),
      plainto_tsquery('english', query)
    ) DESC;
$$;


-- ── 4. Get vote counts for a listing ─────────────────────────
-- Returns total thumbs-up and thumbs-down counts.
-- Usage: await supabase.rpc('get_vote_counts', { p_listing_id: id })

CREATE OR REPLACE FUNCTION public.get_vote_counts(p_listing_id UUID)
RETURNS TABLE (ups BIGINT, downs BIGINT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT
    COUNT(*) FILTER (WHERE vote = 'up')   AS ups,
    COUNT(*) FILTER (WHERE vote = 'down') AS downs
  FROM public.votes
  WHERE listing_id = p_listing_id;
$$;


-- ── 5. Get average rating for a listing ──────────────────────
-- Returns the average star rating (1–5) and total review count.
-- Usage: await supabase.rpc('get_listing_rating', { p_listing_id: id })

CREATE OR REPLACE FUNCTION public.get_listing_rating(p_listing_id UUID)
RETURNS TABLE (average_rating NUMERIC, review_count BIGINT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT
    ROUND(AVG(rating)::NUMERIC, 1) AS average_rating,
    COUNT(*)                        AS review_count
  FROM public.reviews
  WHERE listing_id = p_listing_id;
$$;


-- ── 6. Activate listing after successful payment ──────────────
-- Called from the Razorpay webhook handler (server-side / Edge Function).
-- Sets listing status → live and updates plan & expiry date.
-- Usage: await supabase.rpc('activate_listing', { p_listing_id, p_plan, p_payment_id })

CREATE OR REPLACE FUNCTION public.activate_listing(
  p_listing_id  UUID,
  p_plan        subscription_plan,
  p_payment_id  TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expiry TIMESTAMPTZ;
BEGIN
  -- Calculate expiry based on plan
  CASE p_plan
    WHEN 'free_trial' THEN v_expiry := NOW() + INTERVAL '20 days';
    WHEN 'monthly'    THEN v_expiry := NOW() + INTERVAL '30 days';
    WHEN 'yearly'     THEN v_expiry := NOW() + INTERVAL '365 days';
    ELSE                   v_expiry := NOW() + INTERVAL '20 days';
  END CASE;

  -- Activate the listing
  UPDATE public.listings
  SET
    status          = 'live',
    plan            = p_plan,
    plan_expires_at = v_expiry,
    updated_at      = NOW()
  WHERE id = p_listing_id;

  -- Mark the most recent pending payment as paid
  UPDATE public.payments
  SET
    status              = 'paid',
    razorpay_payment_id = p_payment_id
  WHERE listing_id = p_listing_id
    AND status     = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;
END;
$$;


-- ── 7. Toggle favorite (upsert / delete) ─────────────────────
-- Adds the favorite if it doesn't exist; removes it if it does.
-- Returns TRUE if added, FALSE if removed.
-- Usage: await supabase.rpc('toggle_favorite', { p_listing_id: id })

CREATE OR REPLACE FUNCTION public.toggle_favorite(p_listing_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.favorites
    WHERE user_id   = auth.uid()
      AND listing_id = p_listing_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM public.favorites
    WHERE user_id    = auth.uid()
      AND listing_id = p_listing_id;
    RETURN FALSE;   -- Removed
  ELSE
    INSERT INTO public.favorites (user_id, listing_id)
    VALUES (auth.uid(), p_listing_id);
    RETURN TRUE;    -- Added
  END IF;
END;
$$;
