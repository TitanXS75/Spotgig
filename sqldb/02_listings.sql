-- ============================================================
-- FILE: 02_listings.sql
-- Requires: 00_enums.sql, 01_profiles.sql
-- Core listings table for Aaspass sellers.
-- Safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.listings (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID            NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- URL identity
  slug              TEXT            UNIQUE NOT NULL,

  -- Seller identity
  name              TEXT            NOT NULL,
  seller_name       TEXT            NOT NULL,
  emoji             TEXT            NOT NULL DEFAULT '🏠',

  -- Images (stored as Supabase Storage public URLs)
  image_url         TEXT,                             -- Main logo / banner
  supportive_images TEXT[]          DEFAULT '{}',     -- Up to 3 gallery images

  -- Classification
  type              listing_type    NOT NULL,          -- 'product' | 'service'
  operating_type    operating_type  NOT NULL DEFAULT 'home',  -- 'home' | 'shop'
  category          TEXT            NOT NULL,

  -- Description
  description       TEXT            NOT NULL,
  tags              TEXT[]          DEFAULT '{}',      -- Max 5 tags

  -- Contact channels
  whatsapp          TEXT,                             -- 10-digit number, no country code
  instagram         TEXT,                             -- Handle without @
  website           TEXT,
  other_handle      TEXT,

  -- Location (exact address is NEVER stored, only area + coords)
  area              TEXT            NOT NULL,          -- Human-readable area name shown to buyers
  lat               DOUBLE PRECISION NOT NULL,
  lng               DOUBLE PRECISION NOT NULL,
  hide_location     BOOLEAN         NOT NULL DEFAULT FALSE, -- Hides map pin, keeps area name

  -- Pricing (optional)
  price             NUMERIC(10, 2),
  price_unit        TEXT,                             -- e.g. 'per kg', 'per month', 'fixed'

  -- Subscription & Status
  status            listing_status  NOT NULL DEFAULT 'pending',
  plan              subscription_plan NOT NULL DEFAULT 'free_trial',
  plan_expires_at   TIMESTAMPTZ,

  -- Metadata
  views             INTEGER         NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Column comments
COMMENT ON TABLE  public.listings               IS 'Each row is one seller listing on Aaspass.';
COMMENT ON COLUMN public.listings.slug          IS 'URL-safe unique identifier used in /listing/:slug routes.';
COMMENT ON COLUMN public.listings.hide_location IS 'When TRUE the map pin is hidden but area name is still shown.';
COMMENT ON COLUMN public.listings.status        IS 'pending → paid → live. Suspended by admin.';
COMMENT ON COLUMN public.listings.plan_expires_at IS 'Listing is hidden from public feed after this date.';
COMMENT ON COLUMN public.listings.whatsapp      IS 'Must be exactly 10 digits (Indian number, no +91 stored).';
