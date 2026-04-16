// ============================================================
// src/lib/api/storage.ts
// This file now re-exports from cloudinary.ts so that any
// existing code importing from '@/lib/api/storage' still works
// without modification.
// ============================================================

export {
  uploadToCloudinary   as uploadListingImage,
  deleteFromCloudinary as deleteListingImage,
  resizeImage          as optimizeImage,
  getOptimizedUrl,
  extractPublicId,
  type CloudinaryUploadResult,
  type ImageSlot,
} from '@/lib/api/cloudinary';
