// Image validation: MIME + magic-number + size checks for client and edge runtimes.
// Platform-neutral (uses Web APIs only — File, ArrayBuffer, Uint8Array).

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number]
export type ImageExtension = 'jpg' | 'png' | 'gif' | 'webp'

const MAGIC_NUMBERS: Record<AllowedImageType, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF — extra "WEBP" check at offset 8
}

const MIME_EXT_MAP: Record<AllowedImageType, ImageExtension> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

export interface ImageValidationOk {
  valid: true
  mimeType: AllowedImageType
  extension: ImageExtension
}

export interface ImageValidationFail {
  valid: false
  error: string
}

export type ImageValidationResult = ImageValidationOk | ImageValidationFail

export interface ValidateImageOptions {
  maxSizeMB?: number
  allowedTypes?: readonly AllowedImageType[]
}

function isAllowedType(type: string, allowed: readonly AllowedImageType[]): type is AllowedImageType {
  return (allowed as readonly string[]).includes(type)
}

async function readMagicBytes(file: File): Promise<Uint8Array> {
  const buffer = await file.slice(0, 12).arrayBuffer()
  return new Uint8Array(buffer)
}

function magicMatches(bytes: Uint8Array, expected: AllowedImageType): boolean {
  const signatures = MAGIC_NUMBERS[expected]
  for (const signature of signatures) {
    let ok = true
    for (let i = 0; i < signature.length; i++) {
      if (bytes[i] !== signature[i]) {
        ok = false
        break
      }
    }
    if (!ok) continue

    if (expected === 'image/webp') {
      // Verify "WEBP" at offset 8 — RIFF prefix matches many container formats.
      const webpMarker = [0x57, 0x45, 0x42, 0x50]
      const ok8 = webpMarker.every((b, i) => bytes[8 + i] === b)
      if (!ok8) return false
    }
    return true
  }
  return false
}

export async function validateImage(
  file: File,
  options: ValidateImageOptions = {}
): Promise<ImageValidationResult> {
  const { maxSizeMB = 5, allowedTypes = ALLOWED_IMAGE_TYPES } = options

  if (!isAllowedType(file.type, allowedTypes)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }

  const bytes = await readMagicBytes(file)
  if (!magicMatches(bytes, file.type)) {
    return {
      valid: false,
      error: 'File content does not match its declared type. Please upload a valid image.',
    }
  }

  const maxBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxBytes) {
    return { valid: false, error: `File too large. Maximum size: ${maxSizeMB}MB` }
  }

  return {
    valid: true,
    mimeType: file.type,
    extension: MIME_EXT_MAP[file.type],
  }
}
