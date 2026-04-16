// ============================================================
// src/hooks/use-cloudinary-upload.ts
// React hook for Cloudinary image uploads with progress tracking.
// Replaces the old Supabase-based useImageUpload hook.
// ============================================================

import { useState, useCallback, useRef } from 'react';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  type CloudinaryUploadResult,
  type ImageSlot,
} from '@/lib/api/cloudinary';
import { useAppStore } from '@/store/app-store';

// ── Types ────────────────────────────────────────────────────

interface UploadState {
  isUploading: boolean;
  progress:    number;       // 0–100
  result:      CloudinaryUploadResult | null;
  error:       string | null;
}

interface UseCloudinaryUploadReturn {
  // State
  isUploading: boolean;
  progress:    number;
  uploadedUrl: string | null;
  error:       string | null;

  // Actions
  upload: (params: {
    file:       File;
    slot:       ImageSlot;
    listingId?: string;
  }) => Promise<CloudinaryUploadResult | null>;

  deleteImage: (publicIdOrUrl: string) => Promise<void>;

  reset:        () => void;
  isDeleting:   boolean;
  deleteError:  string | null;
}

// ── Hook ─────────────────────────────────────────────────────

export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const { user } = useAppStore();

  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress:    0,
    result:      null,
    error:       null,
  });

  const [isDeleting,  setIsDeleting]  = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Track ongoing upload so it can be referenced in callbacks
  const abortRef = useRef<boolean>(false);

  // ── upload ─────────────────────────────────────────────────

  const upload = useCallback(
    async (params: {
      file:       File;
      slot:       ImageSlot;
      listingId?: string;
    }): Promise<CloudinaryUploadResult | null> => {
      if (!user) {
        setState(s => ({ ...s, error: 'You must be logged in to upload images.' }));
        return null;
      }

      abortRef.current = false;
      setState({ isUploading: true, progress: 0, result: null, error: null });

      try {
        const result = await uploadToCloudinary(
          params.file,
          params.slot,
          user.id,          // Supabase Auth UUID
          params.listingId,
          (pct) => {
            if (!abortRef.current) {
              setState(s => ({ ...s, progress: pct }));
            }
          }
        );

        if (abortRef.current) return null;

        setState({ isUploading: false, progress: 100, result, error: null });
        return result;

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setState({ isUploading: false, progress: 0, result: null, error: message });
        return null;
      }
    },
    [user]
  );

  // ── deleteImage ────────────────────────────────────────────

  const deleteImage = useCallback(async (publicIdOrUrl: string) => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Accept either a Cloudinary public_id or a full URL
      let publicId = publicIdOrUrl;

      if (publicIdOrUrl.startsWith('http')) {
        const { extractPublicId } = await import('@/lib/api/cloudinary');
        const extracted = extractPublicId(publicIdOrUrl);
        if (!extracted) throw new Error('Could not extract public_id from URL');
        publicId = extracted;
      }

      await deleteFromCloudinary(publicId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      setDeleteError(message);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // ── reset ──────────────────────────────────────────────────

  const reset = useCallback(() => {
    abortRef.current = true;
    setState({ isUploading: false, progress: 0, result: null, error: null });
    setDeleteError(null);
  }, []);

  return {
    isUploading: state.isUploading,
    progress:    state.progress,
    uploadedUrl: state.result?.url ?? null,
    error:       state.error,
    upload,
    deleteImage,
    reset,
    isDeleting,
    deleteError,
  };
}

// ── Convenience: multi-slot uploader ─────────────────────────

/**
 * Upload multiple images at once (logo + up to 3 gallery images).
 * Returns an object with all uploaded URLs.
 */
export function useMultiImageUpload(initialSlots?: Partial<Record<ImageSlot, string | null>>) {
  const [slots, setSlots] = useState<Record<ImageSlot, string | null>>({
    logo:      initialSlots?.logo || null,
    gallery_0: initialSlots?.gallery_0 || null,
    gallery_1: initialSlots?.gallery_1 || null,
    gallery_2: initialSlots?.gallery_2 || null,
    profile:   initialSlots?.profile || null,
  });

  const [uploading, setUploading] = useState<Partial<Record<ImageSlot, boolean>>>({});
  const [errors,    setErrors]    = useState<Partial<Record<ImageSlot, string>>>({});
  const { user } = useAppStore();

  const uploadSlot = useCallback(
    async (
      file:       File,
      slot:       ImageSlot,
      listingId?: string
    ): Promise<string | null> => {
      if (!user) return null;

      setUploading(u => ({ ...u, [slot]: true }));
      setErrors(e => ({ ...e, [slot]: undefined }));

      try {
        const result = await uploadToCloudinary(file, slot, user.id, listingId);
        setSlots(s => ({ ...s, [slot]: result.url }));
        return result.url;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setErrors(e => ({ ...e, [slot]: message }));
        return null;
      } finally {
        setUploading(u => ({ ...u, [slot]: false }));
      }
    },
    [user]
  );

  const clearSlot = useCallback((slot: ImageSlot) => {
    setSlots(s => ({ ...s, [slot]: null }));
  }, []);

  return { slots, uploading, errors, uploadSlot, clearSlot };
}

// ── Image preview hook (unchanged from before) ───────────────

export function useImagePreview(file: File | null) {
  const [preview, setPreview] = useState<string | null>(null);

  const generatePreview = useCallback(() => {
    if (!file) { setPreview(null); return; }
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, [file]);

  if (file && !preview) generatePreview();

  return { preview, regenerate: generatePreview, clear: () => setPreview(null) };
}
