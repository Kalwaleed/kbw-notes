import { useEffect } from 'react'

const GATE_KEY = 'kbw-gate-passed'

interface GateGuardProps {
  children: React.ReactNode
}

/**
 * Soft route guard for /kbw-notes/*.
 *
 * Reads the localStorage flag set by the password popover on the static
 * landing at /. If the flag is missing, redirects the browser back to /
 * so the visitor sees the welcome page + popover instead of the gated app.
 *
 * The gate is soft — the password lives in client source (public/landing.js)
 * and the localStorage flag is bypassable via devtools. This is the
 * accepted MVP risk envelope. Phase 2 replaces it with a server-side
 * selective gate (Vercel Routing Middleware + signed cookie + /api/gate
 * Function); see ~/.claude/projects/.../memory/phase-2-real-gate-plan.md.
 *
 * The anonymous Supabase session bootstrap (used by the public submissions
 * cover uploader) lives in AuthContext.tsx now; this component is purely
 * a localStorage redirect.
 */
export function GateGuard({ children }: GateGuardProps) {
  let passed = false
  try {
    passed = typeof window !== 'undefined' && localStorage.getItem(GATE_KEY) === 'true'
  } catch {
    passed = false
  }

  useEffect(() => {
    if (!passed && typeof window !== 'undefined') {
      window.location.replace('/')
    }
  }, [passed])

  if (!passed) return null
  return <>{children}</>
}
