// Single source of truth for the AI Adoption Mandate (v3.1) KPI thresholds
// and reviewer-flag rules. The mandate owns these numbers — if it changes,
// change them HERE only; views and rollups must read from this module.

export const THRESHOLDS = {
  day30Date: '2026-07-31',
  day60Date: '2026-08-31',
  day30: {
    recurringWorkflows: 2,
    dailyTools: 2,
    aiOutputPct: 40,
    hoursSavedPerWeek: 3,
    documentedWorkflowsCumulative: 1,
    quality: 'same-or-better',
  },
  day60: {
    recurringWorkflows: 3,
    dailyTools: 3,
    aiOutputPct: 60,
    hoursSavedPerWeek: 5,
    documentedWorkflowsCumulative: 2,
    quality: 'measurably-better',
  },
} as const

interface DisclosureLike {
  disclosure: Record<string, unknown>[]
  submitted_without_review: boolean
}

function normalize(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

/**
 * Reviewer attention flags for one report. Computed at read time (reviewer
 * view / rollups) rather than stored — the rules will churn as PK tunes the
 * mandate. Tolerates malformed rows: JSONB shape is only top-level-checked in
 * the DB, so a hand-crafted API write can contain junk elements.
 */
export function needsReviewFlags(report: DisclosureLike): string[] {
  const flags: string[] = []

  const rows = Array.isArray(report.disclosure) ? report.disclosure : []
  for (const row of rows) {
    if (row === null || typeof row !== 'object') continue
    if (normalize(row.ai_used) === 'yes' && normalize(row.disclosed) === 'no') {
      const output = typeof row.output === 'string' && row.output ? row.output : 'an output'
      flags.push(`AI used but not disclosed: ${output}`)
    }
  }

  if (report.submitted_without_review === true) {
    flags.push('AI-assisted output submitted without human review')
  }

  return flags
}
