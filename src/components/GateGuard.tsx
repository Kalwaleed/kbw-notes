import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const GATE_KEY = 'kbw-gate-passed'

interface GateGuardProps {
  children: React.ReactNode
}

/**
 * Soft route guard for /kbw-notes/*.
 *
 * Checks the localStorage flag set by the password gate on the static landing.
 * If the flag is missing, redirects the browser to the static landing at "/".
 * If the flag is set but no Supabase session exists, signs in anonymously so
 * Storage uploads (which require auth.role() = 'authenticated') work.
 *
 * The gate is soft — the password lives in client source. Real auth is a
 * future phase.
 *
 * POST-MVP TODO (auth hardening — must do all three before going public):
 *   1. Remove the soft password from client source. Replace with the existing
 *      invite-only magic-link flow (request-magic-link Edge Function +
 *      invited_emails table) OR a server-validated cookie gate.
 *   2. Re-enable Supabase Auth → Attack Protection → CAPTCHA, and integrate
 *      hCaptcha or Turnstile here. Pass the captcha token to
 *      signInAnonymously({ options: { captchaToken } }).
 *   3. Replace anonymous Supabase sessions with a service-role Edge Function
 *      that handles public cover uploads server-side (validates magic numbers,
 *      size, MIME, rate-limits per IP, writes with service role). Then revert
 *      migration 026 so the @kbw.vc domain lock applies to every signup again
 *      and remove the signInAnonymously() call below.
 */
export function GateGuard({ children }: GateGuardProps) {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>(
    'checking'
  )

  useEffect(() => {
    let cancelled = false

    async function check() {
      let passed = false
      try {
        passed = localStorage.getItem(GATE_KEY) === 'true'
      } catch {
        passed = false
      }
      if (!passed) {
        if (!cancelled) setStatus('denied')
        return
      }

      // Ensure a Supabase session exists so the existing storage policy
      // (auth.role() = 'authenticated') accepts uploads.
      try {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          await supabase.auth.signInAnonymously()
        }
      } catch (err) {
        // If anon sign-in fails (e.g. project disables it), let the user
        // through anyway — only the upload feature degrades, the rest of
        // the SPA still works for reading. The uploader surfaces its own
        // error if storage rejects.
        console.warn('[GateGuard] anonymous sign-in failed', err)
      }

      if (!cancelled) setStatus('allowed')
    }

    check()
    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'checking') {
    return null
  }
  if (status === 'denied') {
    if (typeof window !== 'undefined') {
      window.location.replace('/')
    }
    return null
  }
  return <>{children}</>
}
