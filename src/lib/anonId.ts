// Device-scoped anonymous identity for public engagement (likes, reports).
//
// The public blog has no user accounts, so "who liked this" is answered at
// device granularity: a UUID minted once per browser and kept in
// localStorage. Clearing site data mints a new identity — accepted; the
// per-IP rate limit on the Edge Function bounds abuse. This id never
// identifies a person and is only ever sent to our own Edge Function.

const STORAGE_KEY = 'kbw-anon-id'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Module-level cache so a storage failure (private mode, quota) still yields
// a stable id for the lifetime of the page instead of a new one per call.
let cached: string | null = null

export function getAnonId(): string {
  if (cached) return cached

  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (existing && UUID_RE.test(existing)) {
      cached = existing
      return existing
    }
  } catch {
    // storage unavailable — fall through to mint a session-scoped id
  }

  const id = crypto.randomUUID()
  cached = id
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // storage unavailable — id stays page-scoped via the cache
  }
  return id
}
