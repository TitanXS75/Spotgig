// ============================================================
// src/hooks/use-image-upload.ts
// Backward-compatibility re-export.
// New code should import from use-cloudinary-upload instead.
// ============================================================

export {
  useCloudinaryUpload as useImageUpload,
  useImagePreview,
} from '@/hooks/use-cloudinary-upload';
