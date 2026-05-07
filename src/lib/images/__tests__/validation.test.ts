import { describe, it, expect } from 'vitest'
import { validateImage, ALLOWED_IMAGE_TYPES } from '../validation'

function fileFromBytes(bytes: number[], type: string, name = 'test.bin'): File {
  return new File([new Uint8Array(bytes)], name, { type })
}

const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]
const GIF87a = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61, 0, 0, 0, 0, 0, 0]
const GIF89a = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0, 0, 0, 0, 0, 0]
const WEBP = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]
const RIFF_BUT_NOT_WEBP = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45]

describe('validateImage — happy paths', () => {
  it('accepts valid JPEG', async () => {
    const result = await validateImage(fileFromBytes(JPEG, 'image/jpeg'))
    expect(result).toEqual({ valid: true, mimeType: 'image/jpeg', extension: 'jpg' })
  })

  it('accepts valid PNG', async () => {
    const result = await validateImage(fileFromBytes(PNG, 'image/png'))
    expect(result).toEqual({ valid: true, mimeType: 'image/png', extension: 'png' })
  })

  it('accepts GIF87a', async () => {
    const result = await validateImage(fileFromBytes(GIF87a, 'image/gif'))
    expect(result.valid).toBe(true)
    if (result.valid) expect(result.extension).toBe('gif')
  })

  it('accepts GIF89a', async () => {
    const result = await validateImage(fileFromBytes(GIF89a, 'image/gif'))
    expect(result.valid).toBe(true)
  })

  it('accepts valid WebP with WEBP marker at offset 8', async () => {
    const result = await validateImage(fileFromBytes(WEBP, 'image/webp'))
    expect(result).toEqual({ valid: true, mimeType: 'image/webp', extension: 'webp' })
  })
})

describe('validateImage — spoof detection', () => {
  it('rejects PNG bytes claiming to be JPEG', async () => {
    const result = await validateImage(fileFromBytes(PNG, 'image/jpeg'))
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toMatch(/does not match/i)
  })

  it('rejects JPEG bytes claiming to be PNG', async () => {
    const result = await validateImage(fileFromBytes(JPEG, 'image/png'))
    expect(result.valid).toBe(false)
  })

  it('rejects RIFF container that is not WebP (e.g. WAVE audio)', async () => {
    const result = await validateImage(fileFromBytes(RIFF_BUT_NOT_WEBP, 'image/webp'))
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toMatch(/does not match/i)
  })

  it('rejects empty file', async () => {
    const result = await validateImage(new File([], 'empty.png', { type: 'image/png' }))
    expect(result.valid).toBe(false)
  })
})

describe('validateImage — type allowlist', () => {
  it('rejects unsupported MIME type', async () => {
    const result = await validateImage(fileFromBytes(JPEG, 'application/pdf', 'fake.pdf'))
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toMatch(/not allowed/i)
  })

  it('honors a narrowed allowedTypes option', async () => {
    const result = await validateImage(fileFromBytes(JPEG, 'image/jpeg'), {
      allowedTypes: ['image/png'],
    })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toMatch(/not allowed/i)
  })

  it('exposes the canonical allowlist', () => {
    expect(ALLOWED_IMAGE_TYPES).toEqual(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
  })
})

describe('validateImage — size limits', () => {
  it('rejects oversize file', async () => {
    // Build a file whose size exceeds 1 MB but starts with valid JPEG bytes
    const padding = new Uint8Array(2 * 1024 * 1024)
    const file = new File([new Uint8Array(JPEG), padding], 'big.jpg', { type: 'image/jpeg' })
    const result = await validateImage(file, { maxSizeMB: 1 })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toMatch(/too large/i)
  })

  it('accepts file at exactly the size limit', async () => {
    const padding = new Uint8Array(1 * 1024 * 1024 - JPEG.length)
    const file = new File([new Uint8Array(JPEG), padding], 'edge.jpg', { type: 'image/jpeg' })
    const result = await validateImage(file, { maxSizeMB: 1 })
    expect(result.valid).toBe(true)
  })
})
