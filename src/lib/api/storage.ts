import { supabase } from '@/lib/supabase';

const STORAGE_BUCKET = 'listing-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Upload an image to Supabase Storage. Returns the public URL.
 * @param file - The image file to upload
 * @param listingId - The listing ID this image belongs to
 * @returns Promise with the public URL of the uploaded image
 */
export async function uploadListingImage(file: File, listingId: string): Promise<string> {
  // Validation
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File must be smaller than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, WebP, and GIF images are allowed');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${listingId}/${timestamp}-${random}.${ext}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);

  return publicUrl;
}

/**
 * Delete an image from Supabase Storage.
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteListingImage(imageUrl: string): Promise<void> {
  // Extract filename from URL
  const url = new URL(imageUrl);
  const filename = decodeURIComponent(url.pathname.split('/').pop() || '');

  if (!filename) {
    throw new Error('Invalid image URL');
  }

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filename]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Optimize image dimensions and format (client-side).
 * Returns a canvas blob ready to upload.
 */
export async function optimizeImage(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = options?.maxWidth || 1200;
        const maxHeight = options?.maxHeight || 900;
        const quality = options?.quality || 0.8;

        let width = img.width;
        let height = img.height;

        // Calculate scaled dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to optimize image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
