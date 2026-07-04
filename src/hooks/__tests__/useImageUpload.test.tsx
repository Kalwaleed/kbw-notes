import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useImageUpload } from '../useImageUpload'

// Helper to create File objects with specific magic numbers
function createFileWithBytes(bytes: number[], name: string, type: string): File {
  const arr = new Uint8Array(bytes)
  return new File([arr], name, { type })
}

// Valid JPEG magic bytes
const JPEG_BYTES = [0xFF, 0xD8, 0xFF, 0xE0, ...Array(8).fill(0)]
// Valid PNG magic bytes
const PNG_BYTES = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, ...Array(4).fill(0)]
// Valid GIF89a magic bytes
const GIF_BYTES = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, ...Array(6).fill(0)]
// Valid WebP magic bytes (RIFF....WEBP)
const WEBP_BYTES = [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]
// Spoofed: claims JPEG but has PNG bytes
const SPOOFED_BYTES = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, ...Array(4).fill(0)]

// The hook now validates and returns a `data:` URL for preview; the real upload
// happens server-side in the submit-reader-submission Edge Function. No Supabase
// session or storage write is involved anymore.
describe('useImageUpload', () => {
  it('rejects disallowed MIME types', async () => {
    const { result } = renderHook(() => useImageUpload())

    const file = new File(['data'], 'file.pdf', { type: 'application/pdf' })
    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadImage(file)
    })

    expect(url).toBeNull()
    expect(result.current.error?.message).toContain('File type not allowed')
  })

  it('returns a data URL for a valid JPEG', async () => {
    const { result } = renderHook(() => useImageUpload())

    const file = createFileWithBytes(JPEG_BYTES, 'photo.jpg', 'image/jpeg')
    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadImage(file)
    })

    expect(url).toMatch(/^data:image\/jpeg;base64,/)
    expect(result.current.isUploading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('returns a data URL for a valid PNG', async () => {
    const { result } = renderHook(() => useImageUpload())

    const file = createFileWithBytes(PNG_BYTES, 'image.png', 'image/png')
    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadImage(file)
    })

    expect(url).toMatch(/^data:/)
  })

  it('returns a data URL for a valid GIF', async () => {
    const { result } = renderHook(() => useImageUpload())

    const file = createFileWithBytes(GIF_BYTES, 'anim.gif', 'image/gif')
    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadImage(file)
    })

    expect(url).toMatch(/^data:/)
  })

  it('returns a data URL for a valid WebP', async () => {
    const { result } = renderHook(() => useImageUpload())

    const file = createFileWithBytes(WEBP_BYTES, 'photo.webp', 'image/webp')
    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadImage(file)
    })

    expect(url).toMatch(/^data:/)
  })

  it('rejects spoofed file (JPEG type but PNG bytes)', async () => {
    const { result } = renderHook(() => useImageUpload())

    const file = createFileWithBytes(SPOOFED_BYTES, 'fake.jpg', 'image/jpeg')
    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadImage(file)
    })

    expect(url).toBeNull()
    expect(result.current.error?.message).toContain('File content does not match')
  })

  it('rejects files exceeding size limit', async () => {
    const { result } = renderHook(() => useImageUpload({ maxSizeMB: 1 }))

    const bigBytes = [...JPEG_BYTES, ...new Array(1.5 * 1024 * 1024).fill(0)]
    const file = createFileWithBytes(bigBytes, 'huge.jpg', 'image/jpeg')
    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadImage(file)
    })

    expect(url).toBeNull()
    expect(result.current.error?.message).toContain('File too large')
  })

  it('clearError resets error state', async () => {
    const { result } = renderHook(() => useImageUpload())

    const file = new File(['bad'], 'file.exe', { type: 'application/exe' })
    await act(async () => {
      await result.current.uploadImage(file)
    })

    expect(result.current.error).not.toBeNull()

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })
})
