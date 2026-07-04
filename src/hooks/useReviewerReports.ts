import { useCallback, useEffect, useState } from 'react'
import {
  fetchReportsWithReviews,
  upsertReview,
  type ReportWithReview,
} from '../lib/queries/selfReports'
import type { ReviewFormData } from '../lib/self-reports/types'

interface UseReviewerReportsOptions {
  reviewerId: string
}

interface UseReviewerReportsReturn {
  items: ReportWithReview[]
  loading: boolean
  error: Error | null
  saveReview: (reportId: string, data: ReviewFormData) => Promise<Error | null>
  reload: () => Promise<void>
}

/** Reviewer worklist: all submitted reports with their review state. */
export function useReviewerReports({
  reviewerId,
}: UseReviewerReportsOptions): UseReviewerReportsReturn {
  const [items, setItems] = useState<ReportWithReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const reload = useCallback(async () => {
    try {
      setItems(await fetchReportsWithReviews())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load reports'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const saveReview = useCallback(
    async (reportId: string, data: ReviewFormData): Promise<Error | null> => {
      try {
        const saved = await upsertReview(reportId, reviewerId, data)
        setItems((prev) =>
          prev.map((item) =>
            item.report.id === reportId ? { ...item, review: saved } : item
          )
        )
        return null
      } catch (err) {
        const saveErr = err instanceof Error ? err : new Error('Failed to save review')
        setError(saveErr)
        return saveErr
      }
    },
    [reviewerId]
  )

  return { items, loading, error, saveReview, reload }
}
