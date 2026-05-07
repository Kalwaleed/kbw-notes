// Submission lifecycle rules — single source of truth for what a Submission
// in a given state is allowed to do. See CONTEXT.md "Submission rules".

import type { Submission, SubmissionStatus } from '../../types/submission'

// MUST mirror migration 021 trigger enforce_submission_edit_rules: edit_count <= 3.
// See ADR 0002. The DB is authoritative; this constant is a presentation mirror.
export const PUBLISHED_EDIT_CAP = 3

export interface SubmissionRules {
  /** Auto-save is safe (does not consume the edit cap). */
  canAutoSave: boolean
  /** Edits remaining for published submissions; Infinity for drafts. */
  editsRemaining: number
  /** Submission may transition draft -> published. */
  canPublish: boolean
  /** Submission may transition published -> draft. */
  canUnpublish: boolean
}

interface RulesInput {
  status: SubmissionStatus
  editCount: number
}

/**
 * Resolve the rules for a Submission in its current state.
 *
 * Accepts either a full Submission or just the fields that drive the rules
 * — this lets callers (e.g. `useSubmissionDraft`) avoid round-tripping the
 * whole row when they already have the inputs.
 */
export function getSubmissionRules(input: Submission | RulesInput): SubmissionRules {
  const status = input.status
  const editCount = input.editCount
  const isPublished = status === 'published'

  return {
    canAutoSave: !isPublished,
    editsRemaining: isPublished
      ? Math.max(0, PUBLISHED_EDIT_CAP - editCount)
      : Infinity,
    canPublish: !isPublished,
    canUnpublish: isPublished,
  }
}
