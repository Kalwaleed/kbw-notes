import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { isLocalAuthBypassEnabled } from '../lib/localDev'
import {
  validateImage,
  ALLOWED_IMAGE_TYPES,
  type AllowedImageType,
} from '../lib/images/validation'

interface UseImageUploadOptions {
  bucket?: string
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

export function useImageUpload({
  bucket = 'post-images',
  maxSizeMB = 5,
  allowedTypes = ALLOWED_IMAGE_TYPES,
}: UseImageUploadOptions = {}): UseImageUploadReturn {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      if (!user) {
        setError(new Error('Must be logged in to upload images'))
        return null
      }

      const validation = await validateImage(file, { maxSizeMB, allowedTypes })
      if (!validation.valid) {
        setError(new Error(validation.error))
        return null
      }

      setIsUploading(true)
      setProgress(0)
      setError(null)

      try {
        if (isLocalAuthBypassEnabled) {
          setProgress(100)
          return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result))
            reader.onerror = () => reject(new Error('Failed to read local image'))
            reader.readAsDataURL(file)
          })
        }

        const fileExt = validation.extension
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`

        // Upload to Supabase Storage
        setProgress(10)
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`)
        }

        setProgress(90)

        // Get public URL
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

        setProgress(100)
        return urlData.publicUrl
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to upload image')
        setError(error)
        return null
      } finally {
        setIsUploading(false)
      }
    },
    [user, bucket, maxSizeMB, allowedTypes]
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
