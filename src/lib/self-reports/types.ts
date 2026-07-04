// Shared shapes for the weekly self-report. JSONB row keys are snake_case to
// match the DB column style (thresholds.ts reads the same keys).

export type ToolRow = {
  tool: string
  used_daily: 'yes' | 'no' | ''
  use_case: string
  example: string
}

export type CoverageRow = {
  category: string
  total_outputs: string
  ai_assisted: string
  ai_pct: string
  evidence: string
}

export type HoursRow = {
  task: string
  manual_time: string
  ai_time: string
  hours_saved: string
  evidence: string
}

export type QualityRow = {
  output: string
  baseline: string
  result: string
  delta: 'better' | 'same' | 'worse' | ''
  evidence: string
}

export type WorkflowRow = {
  name: string
  kind: 'new' | 'improved' | 'reused' | ''
  step_replaced: string
  owner: string
  link: string
}

export type DisclosureRow = {
  output: string
  ai_used: 'yes' | 'no' | ''
  disclosed: 'yes' | 'no' | 'na' | ''
  reviewer: string
  notes: string
}

export type BlockerRow = {
  blocker: string
  impact: string
  help_needed: string
  owner: string
  deadline: string
}

/** The seven fixed categories of section 2 (order matters — mirrors the form). */
export const COVERAGE_CATEGORIES = [
  'Memos / reports',
  'Research / due diligence',
  'Financial analysis / modeling',
  'Portfolio monitoring',
  'CEO / internal reporting',
  'Admin / comms',
  'Other',
] as const

/** Everything the staff form collects (client-side shape). */
export interface SelfReportFormData {
  staff_name: string
  role_function: string
  main_workstream: string
  tools: ToolRow[]
  coverage: CoverageRow[]
  hours: HoursRow[]
  quality: QualityRow[]
  workflows: WorkflowRow[]
  disclosure: DisclosureRow[]
  blockers: BlockerRow[]
  tools_total_active: number
  tools_total_daily: number
  overall_ai_pct: number
  total_hours_saved: number
  net_quality: 'better' | 'same' | 'worse'
  errors_found: boolean
  errors_corrected: string
  workflow_doc_submitted: boolean
  cumulative_workflows: number
  submitted_without_review: boolean
  without_review_explain: string
  cert_name: string
  cert_signature: string
  cert_date: string
}

/** A stored report row (subset the app reads back). */
export interface SelfReport extends SelfReportFormData {
  id: string
  staff_id: string
  week_start_date: string
  submitted_at: string
}

export interface ReviewFormData {
  submitted_on_time: 'pass' | 'miss'
  tool_usage_credible: 'pass' | 'question'
  evidence_provided: 'pass' | 'partial' | 'miss'
  hours_saved_reasonable: 'pass' | 'question'
  disclosure_compliance: 'pass' | 'miss' | 'na'
  workflow_doc_progress: 'on_track' | 'at_risk' | 'behind'
  escalation_needed: boolean
  comments: string
  weekly_status: 'on_track' | 'at_risk' | 'not_started'
}

export interface SelfReportReview extends ReviewFormData {
  id: string
  report_id: string
  reviewer_id: string
  updated_at: string
}

export function emptyFormData(): SelfReportFormData {
  return {
    staff_name: '',
    role_function: '',
    main_workstream: '',
    tools: [{ tool: '', used_daily: '', use_case: '', example: '' }],
    coverage: COVERAGE_CATEGORIES.map((category) => ({
      category,
      total_outputs: '',
      ai_assisted: '',
      ai_pct: '',
      evidence: '',
    })),
    hours: [{ task: '', manual_time: '', ai_time: '', hours_saved: '', evidence: '' }],
    quality: [{ output: '', baseline: '', result: '', delta: '', evidence: '' }],
    workflows: [{ name: '', kind: '', step_replaced: '', owner: '', link: '' }],
    disclosure: [{ output: '', ai_used: '', disclosed: '', reviewer: '', notes: '' }],
    blockers: [{ blocker: '', impact: '', help_needed: '', owner: '', deadline: '' }],
    tools_total_active: 0,
    tools_total_daily: 0,
    overall_ai_pct: 0,
    total_hours_saved: 0,
    net_quality: 'same',
    errors_found: false,
    errors_corrected: '',
    workflow_doc_submitted: false,
    cumulative_workflows: 0,
    submitted_without_review: false,
    without_review_explain: '',
    cert_name: '',
    cert_signature: '',
    cert_date: '',
  }
}
