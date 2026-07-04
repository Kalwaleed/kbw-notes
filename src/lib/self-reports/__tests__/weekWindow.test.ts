import { describe, it, expect } from 'vitest'
import { getReportingWeek, isLate } from '../weekWindow'

// Reporting weeks are Friday 00:00 → Thursday, deadline Thursday 17:00,
// all in Asia/Riyadh (fixed UTC+3, no DST). 2026-07-03 was a Friday.

describe('getReportingWeek', () => {
  it('anchors a mid-week instant to the preceding Friday (Riyadh)', () => {
    // Saturday 2026-07-04 15:00 Riyadh (12:00 UTC)
    const week = getReportingWeek(new Date('2026-07-04T12:00:00Z'))
    expect(week.weekStart).toBe('2026-07-03')
    expect(week.weekEnd).toBe('2026-07-09')
  })

  it('reports the deadline as Thursday 17:00 Riyadh = 14:00 UTC', () => {
    const week = getReportingWeek(new Date('2026-07-04T12:00:00Z'))
    expect(week.deadline.toISOString()).toBe('2026-07-09T14:00:00.000Z')
  })

  it('keeps Thursday evening (after deadline, before midnight) in the same week', () => {
    // Thursday 2026-07-09 23:00 Riyadh (20:00 UTC) — late, but still this week
    const week = getReportingWeek(new Date('2026-07-09T20:00:00Z'))
    expect(week.weekStart).toBe('2026-07-03')
  })

  it('rolls to a new week at Friday 00:00 Riyadh, not UTC', () => {
    // Friday 2026-07-10 00:30 Riyadh = Thursday 2026-07-09 21:30 UTC
    const week = getReportingWeek(new Date('2026-07-09T21:30:00Z'))
    expect(week.weekStart).toBe('2026-07-10')
    expect(week.weekEnd).toBe('2026-07-16')
  })

  it('handles a Friday instant as day zero of its own week', () => {
    // Friday 2026-07-03 09:00 Riyadh (06:00 UTC)
    const week = getReportingWeek(new Date('2026-07-03T06:00:00Z'))
    expect(week.weekStart).toBe('2026-07-03')
  })

  it('crosses month boundaries correctly', () => {
    // Saturday 2026-08-01 12:00 Riyadh (09:00 UTC) → week started Friday 2026-07-31
    const week = getReportingWeek(new Date('2026-08-01T09:00:00Z'))
    expect(week.weekStart).toBe('2026-07-31')
    expect(week.weekEnd).toBe('2026-08-06')
  })
})

describe('isLate', () => {
  it('is not late one minute before the Thursday 17:00 Riyadh deadline', () => {
    expect(isLate(new Date('2026-07-09T13:59:00Z'), '2026-07-03')).toBe(false)
  })

  it('is late one minute after the deadline', () => {
    expect(isLate(new Date('2026-07-09T14:01:00Z'), '2026-07-03')).toBe(true)
  })

  it('is not late exactly at the deadline', () => {
    expect(isLate(new Date('2026-07-09T14:00:00Z'), '2026-07-03')).toBe(false)
  })
})
