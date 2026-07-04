import { supabase } from '../supabase'
import type { TablesInsert } from '../database.types'
import type {
  ReviewFormData,
  SelfReport,
  SelfReportFormData,
  SelfReportReview,
} from '../self-reports/types'

// Explicit projection, matching the repo convention (see submissions.ts).
const SELF_REPORT_COLUMNS =
  'id, staff_id, week_start_date, staff_name, role_function, main_workstream, ' +
  'tools, coverage, hours, quality, workflows, disclosure, blockers, ' +
  'tools_total_active, tools_total_daily, overall_ai_pct, total_hours_saved, ' +
  'net_quality, errors_found, errors_corrected, workflow_doc_submitted, ' +
  'cumulative_workflows, submitted_without_review, without_review_explain, ' +
  'cert_name, cert_signature, cert_date, submitted_at'

const REVIEW_COLUMNS =
  'id, report_id, reviewer_id, submitted_on_time, tool_usage_credible, ' +
  'evidence_provided, hours_saved_reasonable, disclosure_compliance, ' +
  'workflow_doc_progress, escalation_needed, comments, weekly_status, updated_at'

/**
 * Submit (or re-submit before the deadline) the caller's report for a week.
 * Explicit onConflict upsert — a concurrent draft-save/submit must land on the
 * same (staff_id, week_start_date) row, never 409 or duplicate.
 */
export async function upsertSelfReport(
  staffId: string,
  weekStart: string,
  data: SelfReportFormData
): Promise<SelfReport> {
  // Section-row interfaces lack the Json index signature the generated types
  // demand; the cast is safe — the shapes are JSON-serializable by construction.
  const payload = {
    staff_id: staffId,
    week_start_date: weekStart,
    ...data,
  } as unknown as TablesInsert<'self_reports'>

  const { data: row, error } = await supabase
    .from('self_reports')
    .upsert(payload, { onConflict: 'staff_id,week_start_date' })
    .select(SELF_REPORT_COLUMNS)
    .single()

  if (error) {
    throw new Error(`Failed to submit self-report: ${error.message}`)
  }
  return row as unknown as SelfReport
}

/** The caller's own report for a week, or null if not yet submitted. */
export async function fetchSelfReport(
  staffId: string,
  weekStart: string
): Promise<SelfReport | null> {
  const { data, error } = await supabase
    .from('self_reports')
    .select(SELF_REPORT_COLUMNS)
    .eq('staff_id', staffId)
    .eq('week_start_date', weekStart)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load self-report: ${error.message}`)
  }
  return (data as unknown as SelfReport) ?? null
}

export interface ReportWithReview {
  report: SelfReport
  review: SelfReportReview | null
}

/**
 * Reviewer view: every submitted report with its review (if any), newest week
 * first. RLS restricts this to reviewer/admin JWTs — staff calling it get
 * only their own rows and no reviews.
 */
export async function fetchReportsWithReviews(): Promise<ReportWithReview[]> {
  const { data, error } = await supabase
    .from('self_reports')
    .select(`${SELF_REPORT_COLUMNS}, self_report_reviews ( ${REVIEW_COLUMNS} )`)
    .order('week_start_date', { ascending: false })
    .order('submitted_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to load reports: ${error.message}`)
  }

  return (data ?? []).map((row) => {
    const { self_report_reviews, ...report } = row as unknown as SelfReport & {
      self_report_reviews: SelfReportReview[] | SelfReportReview | null
    }
    const review = Array.isArray(self_report_reviews)
      ? (self_report_reviews[0] ?? null)
      : (self_report_reviews ?? null)
    return { report: report as SelfReport, review }
  })
}

/** Create or update the (single) review for a report. */
export async function upsertReview(
  reportId: string,
  reviewerId: string,
  data: ReviewFormData
): Promise<SelfReportReview> {
  const { data: row, error } = await supabase
    .from('self_report_reviews')
    .upsert(
      { report_id: reportId, reviewer_id: reviewerId, ...data },
      { onConflict: 'report_id' }
    )
    .select(REVIEW_COLUMNS)
    .single()

  if (error) {
    throw new Error(`Failed to save review: ${error.message}`)
  }
  return row as unknown as SelfReportReview
}
