import { describe, it, expect } from 'vitest'
import { THRESHOLDS, needsReviewFlags } from '../thresholds'

describe('THRESHOLDS', () => {
  it('matches the mandate v3.1 blended KPI thresholds', () => {
    expect(THRESHOLDS.day30).toMatchObject({
      recurringWorkflows: 2,
      dailyTools: 2,
      aiOutputPct: 40,
      hoursSavedPerWeek: 3,
      documentedWorkflowsCumulative: 1,
    })
    expect(THRESHOLDS.day60).toMatchObject({
      recurringWorkflows: 3,
      dailyTools: 3,
      aiOutputPct: 60,
      hoursSavedPerWeek: 5,
      documentedWorkflowsCumulative: 2,
    })
    expect(THRESHOLDS.day30Date).toBe('2026-07-31')
    expect(THRESHOLDS.day60Date).toBe('2026-08-31')
  })
})

describe('needsReviewFlags', () => {
  it('returns no flags for a compliant report', () => {
    expect(
      needsReviewFlags({
        disclosure: [{ output: 'Memo', ai_used: 'yes', disclosed: 'yes' }],
        submitted_without_review: false,
      })
    ).toEqual([])
  })

  it('flags AI-used output that was not disclosed', () => {
    const flags = needsReviewFlags({
      disclosure: [
        { output: 'Board memo', ai_used: 'yes', disclosed: 'no' },
        { output: 'Notes', ai_used: 'no', disclosed: 'na' },
      ],
      submitted_without_review: false,
    })
    expect(flags).toHaveLength(1)
    expect(flags[0]).toContain('Board memo')
  })

  it('flags submission without human review', () => {
    const flags = needsReviewFlags({
      disclosure: [],
      submitted_without_review: true,
    })
    expect(flags).toHaveLength(1)
    expect(flags[0].toLowerCase()).toContain('without human review')
  })

  it('tolerates malformed disclosure rows without throwing', () => {
    const flags = needsReviewFlags({
      // Simulates a hand-crafted PostgREST write bypassing the form
      disclosure: [null, 42, 'junk', { ai_used: 'yes', disclosed: 'no' }] as unknown as Record<
        string,
        unknown
      >[],
      submitted_without_review: false,
    })
    expect(flags).toHaveLength(1)
  })
})
