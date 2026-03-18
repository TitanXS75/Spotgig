import { useMutation } from '@tanstack/react-query';
import { uploadListingImage, deleteListingImage, optimizeImage } from '@/lib/api/storage';
import { useCallback, useState } from 'react';

/**
 * Hook to upload listing images.
 */
export function useImageUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: async (params: { file: File; listingId: string }) => {
      try {
        setUploadProgress(0);

        // Optimize image
        const optimized = await optimizeImage(params.file, {
          maxWidth: 1200,
          maxHeight: 900,
          quality: 0.85,
        });

        setUploadProgress(50);

        // Create a new File from the optimized blob
        const optimizedFile = new File([optimized], params.file.name, {
          type: 'image/jpeg',
        });

        setUploadProgress(70);

        // Upload to storage
        const url = await uploadListingImage(optimizedFile, params.listingId);

        setUploadProgress(100);

        return url;
      } catch (error) {
        setUploadProgress(0);
        throw error;
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteListingImage,
  });

  return {
    upload: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    uploadError: uploadMutation.error,
    uploadedUrl: uploadMutation.data,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}

/**
 * Hook to preview image before upload.
 */
export function useImagePreview(file: File | null) {
  const [preview, setPreview] = useState<string | null>(null);

  const generatePreview = useCallback(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [file]);

  // Auto-generate preview when file changes
  if (file && !preview) {
    generatePreview();
  }

  return { preview, regenerate: generatePreview, clear: () => setPreview(null) };
}
