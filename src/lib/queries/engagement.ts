// Engagement: toggleable, idempotent, atomic interactions on a Submission or
// Comment. See CONTEXT.md "Engagement" for the domain contract.
//
// Today's only kind is comment_like. Post-likes and bookmarks are not exposed
// in the reader-only UI; if/when authenticated reading returns, add per-kind
// RPCs and entries below.

import { supabase } from '../supabase'

export type EngagementKind = 'comment_like'

interface KindConfig {
  rpc: string
  param: string
}

const KIND_CONFIG: Record<EngagementKind, KindConfig> = {
  comment_like: { rpc: 'toggle_comment_like', param: 'p_comment_id' },
}

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
  const cfg = KIND_CONFIG[kind]
  const { data, error } = await supabase.rpc(cfg.rpc, { [cfg.param]: entityId })
  if (error) {
    throw new Error(`Failed to toggle ${kind}: ${error.message}`)
  }
  return Boolean(data)
}
