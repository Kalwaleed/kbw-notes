import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSelfReport } from '../useSelfReport'
import { emptyFormData } from '../../lib/self-reports/types'
import { getReportingWeek } from '../../lib/self-reports/weekWindow'

const mockFetchSelfReport = vi.hoisted(() => vi.fn())
const mockUpsertSelfReport = vi.hoisted(() => vi.fn())
vi.mock('../../lib/queries/selfReports', () => ({
  fetchSelfReport: mockFetchSelfReport,
  upsertSelfReport: mockUpsertSelfReport,
}))

const STAFF_ID = 'staff-1'
const week = getReportingWeek(new Date())
const draftKey = `kbw-self-report-draft-${week.weekStart}`

function filledForm() {
  return {
    ...emptyFormData(),
    staff_name: 'Test Staffer',
    cert_name: 'Test Staffer',
    cert_signature: 'Test Staffer',
    cert_date: '2026-07-04',
  }
}

describe('useSelfReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockFetchSelfReport.mockResolvedValue(null)
    mockUpsertSelfReport.mockImplementation(async (staffId, weekStart, data) => ({
      ...data,
      id: 'r-1',
      staff_id: staffId,
      week_start_date: weekStart,
      submitted_at: '2026-07-04T10:00:00Z',
    }))
  })

  it('exposes the current reporting week', async () => {
    const { result } = renderHook(() => useSelfReport({ staffId: STAFF_ID }))
    expect(result.current.week.weekStart).toBe(week.weekStart)
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('populates the form from an already-submitted report', async () => {
    mockFetchSelfReport.mockResolvedValue({
      ...filledForm(),
      id: 'r-9',
      staff_id: STAFF_ID,
      week_start_date: week.weekStart,
      submitted_at: '2026-07-04T09:00:00Z',
    })
    const { result } = renderHook(() => useSelfReport({ staffId: STAFF_ID }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.formData.staff_name).toBe('Test Staffer')
    expect(result.current.submittedAt).toBe('2026-07-04T09:00:00Z')
  })

  it('restores a localStorage draft when nothing is submitted yet', async () => {
    localStorage.setItem(
      draftKey,
      JSON.stringify({ ...emptyFormData(), staff_name: 'Draft Person' })
    )
    const { result } = renderHook(() => useSelfReport({ staffId: STAFF_ID }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.formData.staff_name).toBe('Draft Person')
  })

  it('persists field updates to the localStorage draft', async () => {
    const { result } = renderHook(() => useSelfReport({ staffId: STAFF_ID }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.updateField('main_workstream', 'Fund II diligence')
    })

    const stored = JSON.parse(localStorage.getItem(draftKey) ?? '{}')
    expect(stored.main_workstream).toBe('Fund II diligence')
  })

  it('submits via upsert and clears the draft', async () => {
    const { result } = renderHook(() => useSelfReport({ staffId: STAFF_ID }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.setFormData(filledForm())
    })

    await act(async () => {
      const err = await result.current.submit()
      expect(err).toBeNull()
    })

    expect(mockUpsertSelfReport).toHaveBeenCalledWith(
      STAFF_ID,
      week.weekStart,
      expect.objectContaining({ staff_name: 'Test Staffer' })
    )
    expect(localStorage.getItem(draftKey)).toBeNull()
    expect(result.current.submittedAt).toBe('2026-07-04T10:00:00Z')
  })

  it('refuses to submit without certification', async () => {
    const { result } = renderHook(() => useSelfReport({ staffId: STAFF_ID }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      const err = await result.current.submit()
      expect(err).toBeInstanceOf(Error)
      expect(err?.message.toLowerCase()).toContain('certification')
    })

    expect(mockUpsertSelfReport).not.toHaveBeenCalled()
  })

  it('keeps the draft and surfaces the error when submission fails', async () => {
    mockUpsertSelfReport.mockRejectedValue(new Error('network down'))
    const { result } = renderHook(() => useSelfReport({ staffId: STAFF_ID }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.setFormData(filledForm())
    })

    await act(async () => {
      const err = await result.current.submit()
      expect(err?.message).toBe('network down')
    })

    // Filled report must never be silently dropped
    const stored = JSON.parse(localStorage.getItem(draftKey) ?? '{}')
    expect(stored.staff_name).toBe('Test Staffer')
    expect(result.current.error?.message).toBe('network down')
  })
})
