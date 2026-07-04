import { useState, useCallback } from 'react'
import {
  validateImage,
  ALLOWED_IMAGE_TYPES,
  type AllowedImageType,
} from '../lib/images/validation'

interface UseImageUploadOptions {
  maxSizeMB?: number
  allowedTypes?: readonly AllowedImageType[]
}

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<string | null>
  isUploading: boolean
  progress: number
  error: Error | null
  clearError: () => void
}

/**
 * Validates an image (MIME + magic-number check) and returns it as a `data:`
 * URL. The actual upload to storage happens server-side in the
 * submit-reader-submission Edge Function, so the client no longer needs a
 * Supabase session or storage write access. The returned data URL is used for
 * preview and is sent to the function on submit.
 */
export function useImageUpload({
  maxSizeMB = 5,
  allowedTypes = ALLOWED_IMAGE_TYPES,
}: UseImageUploadOptions = {}): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      const validation = await validateImage(file, { maxSizeMB, allowedTypes })
      if (!validation.valid) {
        setError(new Error(validation.error))
        return null
      }

      setIsUploading(true)
      setProgress(0)
      setError(null)

      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = () => reject(new Error('Failed to read image'))
          reader.readAsDataURL(file)
        })
        setProgress(100)
        return dataUrl
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to read image'))
        return null
      } finally {
        setIsUploading(false)
      }
    },
    [maxSizeMB, allowedTypes]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    uploadImage,
    isUploading,
    progress,
    error,
    clearError,
  }
}
