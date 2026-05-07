import { describe, it, expect } from 'vitest'
import { getSubmissionRules, PUBLISHED_EDIT_CAP } from '../rules'

describe('getSubmissionRules — drafts', () => {
  const draft = { status: 'draft' as const, editCount: 0 }

  it('allows auto-save', () => {
    expect(getSubmissionRules(draft).canAutoSave).toBe(true)
  })

  it('reports Infinity edits remaining', () => {
    expect(getSubmissionRules(draft).editsRemaining).toBe(Infinity)
  })

  it('allows publish, blocks unpublish', () => {
    const rules = getSubmissionRules(draft)
    expect(rules.canPublish).toBe(true)
    expect(rules.canUnpublish).toBe(false)
  })
})

describe('getSubmissionRules — published', () => {
  it('blocks auto-save (each save consumes the cap)', () => {
    const rules = getSubmissionRules({ status: 'published', editCount: 0 })
    expect(rules.canAutoSave).toBe(false)
  })

  it('reports remaining edits with edit_count = 0', () => {
    const rules = getSubmissionRules({ status: 'published', editCount: 0 })
    expect(rules.editsRemaining).toBe(PUBLISHED_EDIT_CAP)
  })

  it('reports remaining edits with edit_count = 2', () => {
    const rules = getSubmissionRules({ status: 'published', editCount: 2 })
    expect(rules.editsRemaining).toBe(PUBLISHED_EDIT_CAP - 2)
  })

  it('clamps remaining edits at zero when over the cap', () => {
    const rules = getSubmissionRules({ status: 'published', editCount: 99 })
    expect(rules.editsRemaining).toBe(0)
  })

  it('blocks publish, allows unpublish', () => {
    const rules = getSubmissionRules({ status: 'published', editCount: 0 })
    expect(rules.canPublish).toBe(false)
    expect(rules.canUnpublish).toBe(true)
  })
})

describe('PUBLISHED_EDIT_CAP', () => {
  it('mirrors the migration 021 trigger value', () => {
    // ADR 0002: this constant must equal the SQL trigger's edit_count <= 3
    expect(PUBLISHED_EDIT_CAP).toBe(3)
  })
})
