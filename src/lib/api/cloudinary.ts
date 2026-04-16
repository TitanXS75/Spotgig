// ============================================================
// src/lib/api/cloudinary.ts
// All image operations go through Cloudinary.
// Supabase Storage is NOT used for images.
//
// Upload flow:
//   1. Browser calls uploadToCloudinary() directly using an
//      UNSIGNED upload preset (no secrets on client).
//   2. Cloudinary returns a secure public URL stored in the DB.
//   3. To delete, the public_id is extracted from the URL and
//      sent to a Supabase Edge Function that calls the
//      Cloudinary Admin API with the secret key server-side.
//
// Folder structure in Cloudinary:
//   aaspass/listings/{userId}/{listingId}/logo
//   aaspass/listings/{userId}/{listingId}/gallery_0
//   aaspass/listings/{userId}/{listingId}/gallery_1
//   aaspass/listings/{userId}/{listingId}/gallery_2
//   aaspass/avatars/{userId}/profile
// ============================================================

import { supabase } from '@/lib/supabase';

// ── Constants ───────────────────────────────────────────────

const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string; // unsigned preset

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE    = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES    = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// ── Types ────────────────────────────────────────────────────

export interface CloudinaryUploadResult {
  /** Full secure URL — store this in the DB */
  url: string;
  /** Cloudinary public_id — needed for deletions */
  publicId: string;
  /** Original filename */
  originalFilename: string;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** File size in bytes */
  bytes: number;
  /** Format: 'jpg', 'webp', etc. */
  format: string;
}

export type ImageSlot =
  | 'logo'
  | 'gallery_0'
  | 'gallery_1'
  | 'gallery_2'
  | 'profile';

// ── Validation ───────────────────────────────────────────────

function validateFile(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Only JPEG, PNG, WebP, and GIF images are allowed. Got: ${file.type}`);
  }
}

// ── Client-side image resize (before upload) ─────────────────

export async function resizeImage(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<File> {
  const { maxWidth = 1400, maxHeight = 1050, quality = 0.88 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Scale down only — never upscale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width  = Math.round(width  * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context unavailable')); return; }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Failed to compress image')); return; }
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to decode image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ── Build Cloudinary public_id (folder path) ─────────────────

function buildPublicId(
  slot: ImageSlot,
  userId: string,
  listingId?: string
): string {
  if (slot === 'profile') {
    return `aaspass/avatars/${userId}/profile`;
  }
  return `aaspass/listings/${userId}/${listingId}/${slot}`;
}

// ── Core upload function ─────────────────────────────────────

/**
 * Upload a listing image to Cloudinary.
 *
 * Uses an UNSIGNED upload preset so no secret key is needed
 * on the client. Create the preset in:
 *   Cloudinary Dashboard → Settings → Upload → Upload Presets
 *   → Add upload preset → Signing mode: Unsigned
 *
 * @param file      - Image file selected by user
 * @param slot      - Which image slot ('logo' | 'gallery_0' | ...)
 * @param userId    - Current user's Supabase UUID
 * @param listingId - Listing UUID (not needed for profile)
 * @param onProgress - Optional progress callback (0–100)
 */
export async function uploadToCloudinary(
  file: File,
  slot: ImageSlot,
  userId: string,
  listingId?: string,
  onProgress?: (pct: number) => void
): Promise<CloudinaryUploadResult> {
  // 1. Validate
  validateFile(file);

  // 2. Resize client-side before uploading
  onProgress?.(10);
  const resized = await resizeImage(file, {
    maxWidth:  slot === 'logo' ? 1200 : 900,
    maxHeight: slot === 'logo' ?  900 : 900,
    quality:   0.88,
  });
  onProgress?.(30);

  // 3. Build FormData for Cloudinary API
  const publicId = buildPublicId(slot, userId, listingId);

  const form = new FormData();
  form.append('file',           resized);
  form.append('upload_preset',  UPLOAD_PRESET);
  form.append('public_id',      publicId);
  form.append('overwrite',      'true');           // Replace previous image in same slot
  form.append('folder',         '');               // folder is part of public_id path
  form.append('resource_type',  'image');

  // 4. Upload with XMLHttpRequest for real progress tracking
  onProgress?.(35);
  const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        // Progress from 35% → 95% during actual upload
        const uploadPct = 35 + Math.round((e.loaded / e.total) * 60);
        onProgress?.(uploadPct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url:              data.secure_url,
          publicId:         data.public_id,
          originalFilename: data.original_filename,
          width:            data.width,
          height:           data.height,
          bytes:            data.bytes,
          format:           data.format,
        });
      } else {
        const err = JSON.parse(xhr.responseText);
        reject(new Error(err?.error?.message || `Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload. Check your connection.'));
    xhr.ontimeout = () => reject(new Error('Upload timed out. Check your connection.'));

    xhr.open('POST', CLOUDINARY_UPLOAD_URL);
    xhr.timeout = 60_000; // 60s timeout
    xhr.send(form);
  });

  onProgress?.(100);
  return result;
}

// ── Delete image via Supabase Edge Function ──────────────────

/**
 * Delete a Cloudinary image by its public_id.
 *
 * The Cloudinary API secret is NEVER stored on the client.
 * This function calls a Supabase Edge Function that holds the
 * secret and calls the Cloudinary Admin API server-side.
 *
 * @param publicId - Cloudinary public_id (e.g. 'aaspass/listings/...')
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('cloudinary-delete', {
    body: { publicId },
  });

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
  if (!data?.success) {
    throw new Error('Image deletion was not confirmed by Cloudinary');
  }
}

// ── Extract public_id from a Cloudinary URL ──────────────────

/**
 * Extract the Cloudinary public_id from a full secure URL.
 * Needed when you have the URL but not the public_id stored.
 *
 * Example URL:
 *   https://res.cloudinary.com/demo/image/upload/v1234567890/aaspass/listings/uid/lid/logo.jpg
 * Returns:
 *   aaspass/listings/uid/lid/logo
 */
export function extractPublicId(url: string): string | null {
  try {
    // Match everything after /upload/<version>/ and strip the extension
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]{2,4})?$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// ── Get optimized URL with Cloudinary transformations ────────

/**
 * Return a Cloudinary URL with on-the-fly transformations.
 * Use this instead of storing resized copies — Cloudinary handles it.
 *
 * @param url     - Original secure_url from Cloudinary
 * @param width   - Desired width in px
 * @param height  - Desired height in px (optional)
 * @param mode    - 'fill' crops to fit, 'fit' preserves aspect ratio
 */
export function getOptimizedUrl(
  url: string,
  width: number,
  height?: number,
  mode: 'fill' | 'fit' | 'scale' = 'fill'
): string {
  if (!url || !url.includes('cloudinary.com')) return url;

  const cropMode = mode === 'fill' ? 'fill' : mode === 'fit' ? 'fit' : 'scale';
  const h = height ? `,h_${height}` : '';
  const transformation = `c_${cropMode},w_${width}${h},q_auto,f_auto`;

  return url.replace('/upload/', `/upload/${transformation}/`);
}
