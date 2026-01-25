import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

interface UseImageUploadOptions {
  bucket?: string
  maxSizeMB?: number
  allowedTypes?: string[]
}

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<string | null>
  isUploading: boolean
  progress: number
  error: Error | null
  clearError: () => void
}

// Magic number signatures for image validation
const MAGIC_NUMBERS: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]], // GIF87a and GIF89a
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header (WebP container)
}

/**
 * Validate file content by checking magic numbers
 * This prevents uploading malicious files with spoofed MIME types
 */
async function validateMagicNumber(file: File, expectedType: string): Promise<boolean> {
  const signatures = MAGIC_NUMBERS[expectedType]
  if (!signatures) return false

  // Read the first 12 bytes to check magic numbers
  const buffer = await file.slice(0, 12).arrayBuffer()
  const bytes = new Uint8Array(buffer)

  for (const signature of signatures) {
    let matches = true
    for (let i = 0; i < signature.length; i++) {
      if (bytes[i] !== signature[i]) {
        matches = false
        break
      }
    }
    if (matches) {
      // Additional check for WebP: verify "WEBP" at bytes 8-11
      if (expectedType === 'image/webp') {
        const webpMarker = [0x57, 0x45, 0x42, 0x50] // "WEBP"
        const hasWebpMarker = webpMarker.every((b, i) => bytes[8 + i] === b)
        return hasWebpMarker
      }
      return true
    }
  }
  return false
}

export function useImageUpload({
  bucket = 'post-images',
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
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

      // Validate MIME type
      if (!allowedTypes.includes(file.type)) {
        setError(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`))
        return null
      }

      // Validate actual file content via magic numbers (prevents MIME spoofing)
      const isValidContent = await validateMagicNumber(file, file.type)
      if (!isValidContent) {
        setError(new Error('File content does not match its declared type. Please upload a valid image.'))
        return null
      }

      // Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxSizeBytes) {
        setError(new Error(`File too large. Maximum size: ${maxSizeMB}MB`))
        return null
      }

      setIsUploading(true)
      setProgress(0)
      setError(null)

      try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop()
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
