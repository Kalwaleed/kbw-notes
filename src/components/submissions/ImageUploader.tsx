import { useState, useCallback, useRef } from 'react'
import { Upload, X, Image, Loader2 } from 'lucide-react'
import { useImageUpload } from '../../hooks/useImageUpload'

interface ImageUploaderProps {
  currentImageUrl: string | null
  onImageUploaded: (url: string) => void
  onImageRemoved: () => void
}

export function ImageUploader({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadImage, isUploading, progress, error, clearError } = useImageUpload()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      clearError()

      const files = e.dataTransfer.files
      if (files.length > 0) {
        const url = await uploadImage(files[0])
        if (url) {
          onImageUploaded(url)
        }
      }
    },
    [uploadImage, onImageUploaded, clearError]
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      clearError()
      const files = e.target.files
      if (files && files.length > 0) {
        const url = await uploadImage(files[0])
        if (url) {
          onImageUploaded(url)
        }
      }
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [uploadImage, onImageUploaded, clearError]
  )

  if (currentImageUrl) {
    return (
      <div className="relative group">
        <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
          <img
            src={currentImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
        <button
          onClick={onImageRemoved}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          aria-label="Remove cover image"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          isDragging
            ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-violet-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        } ${isUploading ? 'pointer-events-none' : ''}`}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Uploading... {progress}%
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800">
              <Image className="w-6 h-6 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="text-violet-600 dark:text-violet-400">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PNG, JPG, GIF or WebP (max 5MB)
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}

// Mini version for inline use in editor toolbar
interface MiniImageUploaderProps {
  onImageUploaded: (url: string) => void
}

export function MiniImageUploader({ onImageUploaded }: MiniImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadImage, isUploading, error } = useImageUpload()

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        const url = await uploadImage(files[0])
        if (url) {
          onImageUploaded(url)
        }
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [uploadImage, onImageUploaded]
  )

  return (
    <div className="relative">
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        aria-label="Insert image"
        title="Insert image"
      >
        {isUploading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Upload className="w-5 h-5" />
        )}
      </button>

      {error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400 whitespace-nowrap">
          {error.message}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
