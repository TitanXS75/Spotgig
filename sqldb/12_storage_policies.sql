-- ============================================================
-- FILE: 12_storage_policies.sql
-- Requires: The 'listing-images' bucket to already exist.
--
-- BEFORE running this file:
--   1. Go to Supabase Dashboard → Storage
--   2. Click "New Bucket"
--   3. Name: listing-images
--   4. Toggle "Public bucket" → ON
--   5. Click Save
--
-- Then run this file to add upload/delete policies.
-- Safe to re-run (drops policies before recreating).
-- ============================================================


-- ── listing-images bucket policies ───────────────────────────

-- Allow anyone to VIEW / READ images (bucket is already public,
-- but the policy makes it explicit and readable).
DROP POLICY IF EXISTS "listing_images_public_read" ON storage.objects;
CREATE POLICY "listing_images_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'listing-images');


-- Allow authenticated sellers to UPLOAD images.
-- Files must be uploaded into a folder matching their own user ID:
--   listing-images/{user_id}/{listing_id}/...
-- This prevents one user from overwriting another's images.
DROP POLICY IF EXISTS "listing_images_auth_upload" ON storage.objects;
CREATE POLICY "listing_images_auth_upload"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );


-- Allow sellers to UPDATE (replace) their own images.
DROP POLICY IF EXISTS "listing_images_auth_update" ON storage.objects;
CREATE POLICY "listing_images_auth_update"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'listing-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );


-- Allow sellers to DELETE their own images.
DROP POLICY IF EXISTS "listing_images_auth_delete" ON storage.objects;
CREATE POLICY "listing_images_auth_delete"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'listing-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );


-- ── File path convention (reference, not SQL) ─────────────────
-- When uploading from the frontend, use this path structure:
--
--   listing-images/{user_id}/{listing_id}/logo.webp
--   listing-images/{user_id}/{listing_id}/gallery_0.webp
--   listing-images/{user_id}/{listing_id}/gallery_1.webp
--   listing-images/{user_id}/{listing_id}/gallery_2.webp
--
-- Example TypeScript upload call:
--
--   const path = `${userId}/${listingId}/logo.webp`;
--   const { data } = await supabase.storage
--     .from('listing-images')
--     .upload(path, file, { upsert: true });
--
--   const { data: urlData } = supabase.storage
--     .from('listing-images')
--     .getPublicUrl(path);
--
--   const imageUrl = urlData.publicUrl;
