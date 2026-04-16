-- ============================================================
-- FILE: 00_enums.sql
-- Run this FIRST. Creates all custom PostgreSQL enum types.
-- Safe to re-run (uses exception handling).
-- ============================================================

DO $$ BEGIN
  CREATE TYPE listing_type AS ENUM ('product', 'service');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Type listing_type already exists, skipping.';
END $$;

DO $$ BEGIN
  CREATE TYPE listing_status AS ENUM ('pending', 'live', 'suspended');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Type listing_status already exists, skipping.';
END $$;

DO $$ BEGIN
  CREATE TYPE operating_type AS ENUM ('home', 'shop');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Type operating_type already exists, skipping.';
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_plan AS ENUM ('free_trial', 'monthly', 'yearly');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Type subscription_plan already exists, skipping.';
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Type payment_status already exists, skipping.';
END $$;

DO $$ BEGIN
  CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Type gender_type already exists, skipping.';
END $$;

DO $$ BEGIN
  CREATE TYPE vote_type AS ENUM ('up', 'down');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Type vote_type already exists, skipping.';
END $$;
