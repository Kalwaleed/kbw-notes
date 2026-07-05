// Engagement: toggleable, idempotent, atomic interactions on a Submission or
// Comment. See CONTEXT.md "Engagement" for the domain contract.
//
// Two identity paths:
// - Authenticated (staff): `toggleEngagement` calls user-scoped RPCs under RLS.
// - Anonymous (the public readership): `publicEngagement` posts to the
//   `public-engagement` Edge Function with the device's anon id; the function
//   writes via service-role-only RPCs. The browser has no direct write access.

import { supabase } from '../supabase'
import { getAnonId } from '../anonId'

export type EngagementKind = 'comment_like'

/**
 * Toggle an engagement. Returns true if the engagement is now active
 * (e.g., comment is now liked) and false if it was removed.
 *
 * Atomic at the database via unique-constraint conflict; concurrent toggles
 * by the same user serialize on the unique index. The user identity is read
 * server-side from auth.uid(); callers do not pass userId.
 */
export async function toggleEngagement(
  kind: EngagementKind,
  entityId: string
): Promise<boolean> {
  switch (kind) {
    case 'comment_like': {
      const { data, error } = await supabase.rpc('toggle_comment_like', {
        p_comment_id: entityId,
      })
      if (error) {
        throw new Error(`Failed to toggle ${kind}: ${error.message}`)
      }
      return Boolean(data)
    }
  }
}

export type PublicEngagementAction =
  | 'toggle_post_like'
  | 'toggle_comment_like'
  | 'report_comment'

export interface PublicEngagementResult {
  liked?: boolean
  count?: number
  reported?: boolean
  alreadyReported?: boolean
}

/**
 * Anonymous engagement via the `public-engagement` Edge Function.
 * Identity is the device's anon id (see lib/anonId.ts). Rate-limited
 * server-side per IP; a 429 surfaces as a thrown Error with the server's
 * message.
 */
export async function publicEngagement(
  action: PublicEngagementAction,
  targetId: string
): Promise<PublicEngagementResult> {
  const { data, error } = await supabase.functions.invoke('public-engagement', {
    body: { action, targetId, anonId: getAnonId() },
  })

  if (error) {
    let message = error.message || 'Action failed. Please try again.'
    try {
      if (error.context && typeof error.context.json === 'function') {
        const body = await error.context.json()
        message = body.error || message
      }
    } catch {
      // could not parse error body; keep the default message
    }
    throw new Error(message)
  }

  return data as PublicEngagementResult
}
