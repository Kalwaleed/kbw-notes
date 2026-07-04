import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useReviewerReports } from '../useReviewerReports'
import { emptyFormData } from '../../lib/self-reports/types'

const mockFetchReportsWithReviews = vi.hoisted(() => vi.fn())
const mockUpsertReview = vi.hoisted(() => vi.fn())
vi.mock('../../lib/queries/selfReports', () => ({
  fetchReportsWithReviews: mockFetchReportsWithReviews,
  upsertReview: mockUpsertReview,
}))

const report = {
  ...emptyFormData(),
  id: 'r-1',
  staff_id: 'staff-1',
  week_start_date: '2026-07-03',
  staff_name: 'Test Staffer',
  submitted_at: '2026-07-08T10:00:00Z',
}

const reviewData = {
  submitted_on_time: 'pass' as const,
  tool_usage_credible: 'pass' as const,
  evidence_provided: 'partial' as const,
  hours_saved_reasonable: 'pass' as const,
  disclosure_compliance: 'pass' as const,
  workflow_doc_progress: 'on_track' as const,
  escalation_needed: false,
  comments: 'Solid week.',
  weekly_status: 'on_track' as const,
}

describe('useReviewerReports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchReportsWithReviews.mockResolvedValue([{ report, review: null }])
    mockUpsertReview.mockResolvedValue({
      ...reviewData,
      id: 'rev-1',
      report_id: 'r-1',
      reviewer_id: 'donya-1',
      updated_at: '2026-07-08T11:00:00Z',
    })
  })

  it('loads reports with their reviews', async () => {
    const { result } = renderHook(() => useReviewerReports({ reviewerId: 'donya-1' }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].report.staff_name).toBe('Test Staffer')
    expect(result.current.items[0].review).toBeNull()
  })

  it('saves a review and reflects it in local state', async () => {
    const { result } = renderHook(() => useReviewerReports({ reviewerId: 'donya-1' }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      const err = await result.current.saveReview('r-1', reviewData)
      expect(err).toBeNull()
    })

    expect(mockUpsertReview).toHaveBeenCalledWith('r-1', 'donya-1', reviewData)
    expect(result.current.items[0].review?.weekly_status).toBe('on_track')
  })

  it('surfaces load errors', async () => {
    mockFetchReportsWithReviews.mockRejectedValue(new Error('forbidden'))
    const { result } = renderHook(() => useReviewerReports({ reviewerId: 'donya-1' }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error?.message).toBe('forbidden')
  })
})
