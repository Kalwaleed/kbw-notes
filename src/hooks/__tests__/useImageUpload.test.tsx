import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider } from '../../contexts/AuthContext'
import type { ReactNode } from 'react'

const mockSupabase = vi.hoisted(() => ({
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test/image.png' }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/image.png' } }),
    })),
  },
}))
vi.mock('../../lib/supabase', () => ({ supabase: mockSupabase }))

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

const MOCK_USER = {
  id: 'user-001',
  email: 'test@kbw.vc',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  created_at: '2026-01-01T00:00:00Z',
}

describe('useImageUpload', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
    // Default: user is logged in
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: MOCK_USER, access_token: 'tok', refresh_token: 'ref', expires_in: 3600, token_type: 'bearer' } },
      error: null,
    })
    mockSupabase.auth.onAuthStateChange.mockImplementation((cb: (event: string, session: unknown) => void) => {
      cb('SIGNED_IN', { user: MOCK_USER, access_token: 'tok', refresh_token: 'ref', expires_in: 3600, token_type: 'bearer' })
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    // Reset storage mock
    mockSupabase.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'user-001/img.png' }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/img.png' } }),
    })
  })

  it('rejects upload when unauthenticated', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })

    const { result } = renderHook(() => useImageUpload(), { wrapper })

    // Wait for auth to settle
    await act(async () => { await new Promise((r) => setTimeout(r, 0)) })

    const file = createFileWithBytes(JPEG_BYTES, 'photo.jpg', 'image/jpeg')
    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadImage(file)
    })

    expect(url).toBeNull()
    expect(result.current.error?.message).toBe('Must be logged in to upload images')
  })

  it('rejects disallowed MIME types', async () => {
    const { result } = renderHook(() => useImageUpload(), { wrapper })
    await act(async () => { await new Promise((r) => setTimeout(r, 0)) })

    const file = new File(['data'], 'file.pdf', { type: 'application/pdf' })
    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadImage(file)
    })

    expect(url).toBeNull()
    expect(result.current.error?.message).toContain('File type not allowed')
  })

  it('validates JPEG magic numbers', async () => {
    const { result } = renderHook(() => useImageUpload(), { wrapper })
    await act(async () => { await new Promise((r) => setTimeout(r, 0)) })

    const file = createFileWithBytes(JPEG_BYTES, 'photo.jpg', 'image/jpeg')
    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadImage(file)
    })

    expect(url).toBe('https://cdn.example.com/img.png')
  })

  it('validates PNG magic numbers', async () => {
    const { result } = renderHook(() => useImageUpload(), { wrapper })
    await act(async () => { await new Promise((r) => setTimeout(r, 0)) })

    const file = createFileWithBytes(PNG_BYTES, 'image.png', 'image/png')
    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadImage(file)
    })

    expect(url).toBe('https://cdn.example.com/img.png')
  })

  it('validates GIF magic numbers', async () => {
    const { result } = renderHook(() => useImageUpload(), { wrapper })
    await act(async () => { await new Promise((r) => setTimeout(r, 0)) })

    const file = createFileWithBytes(GIF_BYTES, 'anim.gif', 'image/gif')
    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadImage(file)
    })

    expect(url).toBe('https://cdn.example.com/img.png')
  })

  it('validates WebP magic numbers', async () => {
    const { result } = renderHook(() => useImageUpload(), { wrapper })
    await act(async () => { await new Promise((r) => setTimeout(r, 0)) })

    const file = createFileWithBytes(WEBP_BYTES, 'photo.webp', 'image/webp')
    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadImage(file)
    })

    expect(url).toBe('https://cdn.example.com/img.png')
  })

  it('rejects spoofed file (JPEG type but PNG bytes)', async () => {
    const { result } = renderHook(() => useImageUpload(), { wrapper })
    await act(async () => { await new Promise((r) => setTimeout(r, 0)) })

    const file = createFileWithBytes(SPOOFED_BYTES, 'fake.jpg', 'image/jpeg')
    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadImage(file)
    })

    expect(url).toBeNull()
    expect(result.current.error?.message).toContain('File content does not match')
  })

  it('rejects files exceeding size limit', async () => {
    const { result } = renderHook(() => useImageUpload({ maxSizeMB: 1 }), { wrapper })
    await act(async () => { await new Promise((r) => setTimeout(r, 0)) })

    // Create file that passes magic number check but is too large
    const bigBytes = [...JPEG_BYTES, ...new Array(1.5 * 1024 * 1024).fill(0)]
    const file = createFileWithBytes(bigBytes, 'huge.jpg', 'image/jpeg')
    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadImage(file)
    })

    expect(url).toBeNull()
    expect(result.current.error?.message).toContain('File too large')
  })

  it('handles upload error from storage', async () => {
    mockSupabase.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: null, error: { message: 'Bucket full' } }),
      getPublicUrl: vi.fn(),
    })

    const { result } = renderHook(() => useImageUpload(), { wrapper })
    await act(async () => { await new Promise((r) => setTimeout(r, 0)) })

    const file = createFileWithBytes(JPEG_BYTES, 'photo.jpg', 'image/jpeg')
    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadImage(file)
    })

    expect(url).toBeNull()
    expect(result.current.error?.message).toContain('Bucket full')
  })

  it('clearError resets error state', async () => {
    const { result } = renderHook(() => useImageUpload(), { wrapper })
    await act(async () => { await new Promise((r) => setTimeout(r, 0)) })

    // Trigger an error
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

  it('returns public URL on successful upload', async () => {
    mockSupabase.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'user-001/photo.jpg' }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/photo.jpg' } }),
    })

    const { result } = renderHook(() => useImageUpload(), { wrapper })
    await act(async () => { await new Promise((r) => setTimeout(r, 0)) })

    const file = createFileWithBytes(JPEG_BYTES, 'photo.jpg', 'image/jpeg')
    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadImage(file)
    })

    expect(url).toBe('https://cdn.example.com/photo.jpg')
    expect(result.current.isUploading).toBe(false)
    expect(result.current.error).toBeNull()
  })
})
