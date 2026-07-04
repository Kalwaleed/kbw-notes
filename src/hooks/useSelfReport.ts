import { useCallback, useEffect, useState } from 'react'
import { fetchSelfReport, upsertSelfReport } from '../lib/queries/selfReports'
import { getReportingWeek, type ReportingWeek } from '../lib/self-reports/weekWindow'
import { emptyFormData, type SelfReportFormData } from '../lib/self-reports/types'

interface UseSelfReportOptions {
  staffId: string
}

interface UseSelfReportReturn {
  week: ReportingWeek
  formData: SelfReportFormData
  setFormData: React.Dispatch<React.SetStateAction<SelfReportFormData>>
  updateField: <K extends keyof SelfReportFormData>(
    field: K,
    value: SelfReportFormData[K]
  ) => void
  loading: boolean
  submitting: boolean
  submittedAt: string | null
  error: Error | null
  submit: () => Promise<Error | null>
}

const draftKey = (weekStart: string) => `kbw-self-report-draft-${weekStart}`

function readDraft(weekStart: string): SelfReportFormData | null {
  try {
    const raw = localStorage.getItem(draftKey(weekStart))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<SelfReportFormData>
    // Merge over the empty shape so a stale draft from an older form version
    // can't leave fields undefined.
    return { ...emptyFormData(), ...parsed }
  } catch {
    return null
  }
}

/**
 * Staff self-report state for the current reporting week.
 *
 * Drafts persist to localStorage on every change and are only cleared after
 * the server confirms the upsert — a filled report is never silently dropped.
 * Submitting again before the deadline updates the same (staff, week) row.
 */
export function useSelfReport({ staffId }: UseSelfReportOptions): UseSelfReportReturn {
  // The week is fixed for the lifetime of the page view; recomputing it live
  // mid-session (e.g. across the Friday boundary) would silently retarget the
  // submission.
  const [week] = useState(() => getReportingWeek(new Date()))
  const [formData, setFormData] = useState<SelfReportFormData>(emptyFormData)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submittedAt, setSubmittedAt] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const existing = await fetchSelfReport(staffId, week.weekStart)
        if (cancelled) return
        if (existing) {
          const { id, staff_id, week_start_date, submitted_at, ...fields } = existing
          void id
          void staff_id
          void week_start_date
          setFormData({ ...emptyFormData(), ...fields })
          setSubmittedAt(submitted_at)
        } else {
          const draft = readDraft(week.weekStart)
          if (draft) setFormData(draft)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err : new Error('Failed to load report'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [staffId, week.weekStart])

  const persistDraft = useCallback(
    (data: SelfReportFormData) => {
      try {
        localStorage.setItem(draftKey(week.weekStart), JSON.stringify(data))
      } catch {
        // Quota/private-mode failures shouldn't block typing; the server
        // submit path is the durable one.
      }
    },
    [week.weekStart]
  )

  const updateField = useCallback(
    <K extends keyof SelfReportFormData>(field: K, value: SelfReportFormData[K]) => {
      setFormData((prev) => {
        const next = { ...prev, [field]: value }
        persistDraft(next)
        return next
      })
    },
    [persistDraft]
  )

  const submit = useCallback(async (): Promise<Error | null> => {
    if (!formData.cert_name.trim() || !formData.cert_signature.trim() || !formData.cert_date) {
      const err = new Error('Complete the certification section (name, signature, date) before submitting.')
      setError(err)
      return err
    }

    setSubmitting(true)
    setError(null)
    try {
      const saved = await upsertSelfReport(staffId, week.weekStart, formData)
      setSubmittedAt(saved.submitted_at)
      localStorage.removeItem(draftKey(week.weekStart))
      return null
    } catch (err) {
      // Failed submit: force-persist the draft so the filled report survives
      // even if it was set programmatically rather than typed field-by-field.
      persistDraft(formData)
      const submitErr = err instanceof Error ? err : new Error('Failed to submit report')
      setError(submitErr)
      return submitErr
    } finally {
      setSubmitting(false)
    }
  }, [formData, persistDraft, staffId, week.weekStart])

  return {
    week,
    formData,
    setFormData,
    updateField,
    loading,
    submitting,
    submittedAt,
    error,
    submit,
  }
}
