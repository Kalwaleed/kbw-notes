import { useState, useCallback, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
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
        if (url) onImageUploaded(url)
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
        if (url) onImageUploaded(url)
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [uploadImage, onImageUploaded, clearError]
  )

  if (currentImageUrl) {
    return (
      <div className="group" style={{ position: 'relative' }}>
        <div
          style={{
            aspectRatio: '16 / 9',
            background: 'var(--color-paper-sunken)',
            border: '1px solid var(--color-hair)',
            overflow: 'hidden',
          }}
        >
          <img
            src={currentImageUrl}
            alt="Cover"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <button
          type="button"
          onClick={onImageRemoved}
          aria-label="Remove cover image"
          className="opacity-0 group-hover:opacity-100"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-ink)',
            color: 'var(--color-paper)',
            border: '1px solid var(--color-hair)',
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'opacity 100ms ease',
          }}
        >
          <X size={14} strokeWidth={1.5} />
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
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-7)',
          border: `1px dashed ${isDragging ? 'var(--color-accent)' : 'var(--color-hair)'}`,
          background: isDragging ? 'var(--color-accent-tint)' : 'var(--color-paper-raised)',
          cursor: 'pointer',
          pointerEvents: isUploading ? 'none' : 'auto',
          transition: 'background-color 100ms ease, border-color 100ms ease',
        }}
      >
        {isUploading ? (
          <>
            <div className="skeleton" style={{ width: 32, height: 4 }} />
            <p
              className="font-mono uppercase"
              style={{
                margin: 0,
                fontSize: 'var(--text-mono-xs)',
                letterSpacing: '0.04em',
                color: 'var(--color-ink-muted)',
              }}
            >
              Uploading… {progress}%
            </p>
          </>
        ) : (
          <>
            <ImageIcon size={24} strokeWidth={1.5} style={{ color: 'var(--color-ink-soft)' }} />
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-ui-base)',
                  color: 'var(--color-ink)',
                }}
              >
                <span style={{ color: 'var(--color-accent)', textDecoration: 'underline', textDecorationThickness: 1, textUnderlineOffset: 3 }}>
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p
                className="font-mono uppercase"
                style={{
                  margin: 0,
                  marginTop: 4,
                  fontSize: 'var(--text-mono-xs)',
                  letterSpacing: '0.04em',
                  color: 'var(--color-ink-soft)',
                }}
              >
                PNG · JPG · GIF · WebP · max 5MB
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p
          role="alert"
          style={{
            marginTop: 8,
            fontFamily: 'var(--font-sans)',
            fontStyle: 'italic',
            fontSize: 'var(--text-ui-sm)',
            color: 'var(--color-rose)',
          }}
        >
          {error.message}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  )
}

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
        if (url) onImageUploaded(url)
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [uploadImage, onImageUploaded]
  )

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        aria-label="Insert image"
        title="Insert image"
        style={{
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          color: 'var(--color-ink-muted)',
          border: 'none',
          borderRadius: 2,
          cursor: isUploading ? 'not-allowed' : 'pointer',
          opacity: isUploading ? 0.4 : 1,
        }}
        onMouseEnter={(e) => {
          if (isUploading) return
          e.currentTarget.style.background = 'var(--color-accent-tint)'
          e.currentTarget.style.color = 'var(--color-ink)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--color-ink-muted)'
        }}
      >
        <Upload size={14} strokeWidth={1.5} />
      </button>

      {error && (
        <div
          role="alert"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            padding: '4px 8px',
            background: 'var(--color-rose-tint)',
            border: '1px solid var(--color-rose)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-ui-sm)',
            color: 'var(--color-rose)',
            whiteSpace: 'nowrap',
          }}
        >
          {error.message}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  )
}
