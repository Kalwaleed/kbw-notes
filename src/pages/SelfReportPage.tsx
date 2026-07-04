import type { CSSProperties, ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSelfReport } from '../hooks/useSelfReport'
import { isLate } from '../lib/self-reports/weekWindow'
import { RowsTable, type ColumnDef } from '../components/self-report/RowsTable'
import type { SelfReportFormData } from '../lib/self-reports/types'

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

const TOOL_COLUMNS: ColumnDef[] = [
  { key: 'tool', label: 'Tool', width: '18%' },
  { key: 'used_daily', label: 'Used daily?', type: 'select', options: yesNo, width: '12%' },
  { key: 'use_case', label: 'Main use case' },
  { key: 'example', label: 'Example output or task' },
]

const COVERAGE_COLUMNS: ColumnDef[] = [
  { key: 'category', label: 'Output category', width: '24%' },
  { key: 'total_outputs', label: 'Total', type: 'number', min: 0, width: '10%' },
  { key: 'ai_assisted', label: 'AI-assisted', type: 'number', min: 0, width: '10%' },
  { key: 'ai_pct', label: 'AI %', type: 'number', min: 0, max: 100, width: '10%' },
  { key: 'evidence', label: 'Evidence / link' },
]

const HOURS_COLUMNS: ColumnDef[] = [
  { key: 'task', label: 'Workflow / task' },
  { key: 'manual_time', label: 'Manual est.', width: '13%' },
  { key: 'ai_time', label: 'With AI', width: '13%' },
  { key: 'hours_saved', label: 'Hours saved', type: 'number', min: 0, width: '12%' },
  { key: 'evidence', label: 'Evidence / notes' },
]

const QUALITY_COLUMNS: ColumnDef[] = [
  { key: 'output', label: 'Output reviewed' },
  { key: 'baseline', label: 'Baseline / old process' },
  { key: 'result', label: "This week's result" },
  {
    key: 'delta',
    label: 'Delta',
    type: 'select',
    width: '11%',
    options: [
      { value: 'better', label: 'Better' },
      { value: 'same', label: 'Same' },
      { value: 'worse', label: 'Worse' },
    ],
  },
  { key: 'evidence', label: 'Evidence' },
]

const WORKFLOW_COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Workflow name' },
  {
    key: 'kind',
    label: 'New / improved / reused',
    type: 'select',
    width: '16%',
    options: [
      { value: 'new', label: 'New' },
      { value: 'improved', label: 'Improved' },
      { value: 'reused', label: 'Reused' },
    ],
  },
  { key: 'step_replaced', label: 'Manual step replaced' },
  { key: 'owner', label: 'Owner', width: '12%' },
  { key: 'link', label: 'Link or location' },
]

const DISCLOSURE_COLUMNS: ColumnDef[] = [
  { key: 'output', label: 'Output' },
  { key: 'ai_used', label: 'AI used?', type: 'select', options: yesNo, width: '10%' },
  {
    key: 'disclosed',
    label: 'Disclosure included?',
    type: 'select',
    width: '14%',
    options: [...yesNo, { value: 'na', label: 'N/A' }],
  },
  { key: 'reviewer', label: 'Human reviewer', width: '14%' },
  { key: 'notes', label: 'Notes' },
]

const BLOCKER_COLUMNS: ColumnDef[] = [
  { key: 'blocker', label: 'Blocker' },
  { key: 'impact', label: 'Impact on work' },
  { key: 'help_needed', label: 'Help needed' },
  { key: 'owner', label: 'Owner to resolve', width: '14%' },
  { key: 'deadline', label: 'Deadline', width: '12%' },
]

const sectionStyle: CSSProperties = {
  border: '1px solid var(--color-hair)',
  borderRadius: 6,
  padding: 'var(--space-5)',
  background: 'var(--color-surface, transparent)',
}

const inputStyle: CSSProperties = {
  padding: '8px 10px',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-mono-sm)',
  color: 'var(--color-ink)',
  background: 'var(--color-paper)',
  border: '1px solid var(--color-hair)',
  borderRadius: 4,
}

function Section({ number, title, blurb, children }: {
  number: string
  title: string
  blurb: string
  children: ReactNode
}) {
  return (
    <section style={sectionStyle}>
      <div
        className="font-mono uppercase"
        style={{ fontSize: 'var(--text-mono-xs)', letterSpacing: '0.08em', color: 'var(--color-accent)', fontWeight: 600 }}
      >
        Section {number}
      </div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-h3, 22px)', color: 'var(--color-ink)', margin: '4px 0 6px' }}>
        {title}
      </h2>
      <p style={{ color: 'var(--color-ink-muted)', fontSize: 14, margin: '0 0 var(--space-4)' }}>{blurb}</p>
      {children}
    </section>
  )
}

function LabeledInput({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
      <span className="font-mono uppercase" style={{ fontSize: 'var(--text-mono-xs)', color: 'var(--color-ink-muted)' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

export function SelfReportPage() {
  const { user, signOut } = useAuth()
  const report = useSelfReport({ staffId: user?.id ?? '' })
  const { week, formData, updateField, loading, submitting, submittedAt, error, submit } = report

  if (loading) {
    return <p style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-ink-muted)' }}>Loading…</p>
  }

  const submittedLate = submittedAt ? isLate(new Date(submittedAt), week.weekStart) : false
  const num = (v: string) => {
    const n = Number(v)
    return Number.isFinite(n) && n >= 0 ? n : 0
  }

  const rowsField = <K extends keyof SelfReportFormData>(field: K) =>
    (rows: Record<string, string>[]) =>
      updateField(field, rows as unknown as SelfReportFormData[K])

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 'var(--space-6) var(--space-4) var(--space-10)' }}>
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div
              className="font-mono uppercase"
              style={{ fontSize: 'var(--text-mono-xs)', letterSpacing: '0.08em', color: 'var(--color-accent)', fontWeight: 600 }}
            >
              KBW AI Adoption Mandate · Weekly self-report
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 'var(--text-h2)', color: 'var(--color-ink)', margin: '4px 0' }}>
              Week of {week.weekStart} — {week.weekEnd}
            </h1>
            <p className="font-mono" style={{ fontSize: 'var(--text-mono-sm)', color: 'var(--color-ink-muted)', margin: 0 }}>
              Due Thursday 5:00 PM Riyadh · covers the prior Friday–Thursday
            </p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="font-mono uppercase"
            style={{ fontSize: 'var(--text-mono-xs)', background: 'transparent', border: '1px solid var(--color-hair)', borderRadius: 4, padding: '6px 10px', color: 'var(--color-ink-muted)', cursor: 'pointer' }}
          >
            Sign out
          </button>
        </div>
        {submittedAt && (
          <p
            role="status"
            style={{ marginTop: 'var(--space-3)', padding: '8px 12px', borderRadius: 4, background: 'var(--color-accent-soft, rgba(63,91,58,0.08))', color: 'var(--color-ink)', fontSize: 14 }}
          >
            Submitted {new Date(submittedAt).toLocaleString('en-GB', { timeZone: 'Asia/Riyadh' })} (Riyadh)
            {submittedLate ? ' — after the deadline' : ''}. You can update and resubmit; the last
            submission counts.
          </p>
        )}
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}
      >
        <Section number="0" title="Staff details" blurb="Prefill once; carried into every week's report.">
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <LabeledInput label="Name">
              <input required value={formData.staff_name} onChange={(e) => updateField('staff_name', e.target.value)} style={inputStyle} />
            </LabeledInput>
            <LabeledInput label="Role / function">
              <input value={formData.role_function} onChange={(e) => updateField('role_function', e.target.value)} style={inputStyle} />
            </LabeledInput>
            <LabeledInput label="Main workstream this week">
              <input value={formData.main_workstream} onChange={(e) => updateField('main_workstream', e.target.value)} style={{ ...inputStyle, minWidth: 280 }} />
            </LabeledInput>
          </div>
        </Section>

        <Section number="1" title="AI tool use" blurb="Count only tools used in active workflows, not tools opened once.">
          <RowsTable columns={TOOL_COLUMNS} rows={formData.tools} onChange={rowsField('tools')} />
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
            <LabeledInput label="Total active AI tools this week">
              <input type="number" min={0} value={formData.tools_total_active} onChange={(e) => updateField('tools_total_active', num(e.target.value))} style={inputStyle} />
            </LabeledInput>
            <LabeledInput label="Total AI tools used daily">
              <input type="number" min={0} value={formData.tools_total_daily} onChange={(e) => updateField('tools_total_daily', num(e.target.value))} style={inputStyle} />
            </LabeledInput>
          </div>
        </Section>

        <Section number="2" title="Work output coverage" blurb="Share of weekly outputs meaningfully AI-assisted, by category.">
          <RowsTable columns={COVERAGE_COLUMNS} rows={formData.coverage} onChange={rowsField('coverage')} fixedRows readOnlyFirstColumn />
          <div style={{ marginTop: 'var(--space-4)' }}>
            <LabeledInput label="Overall AI-assisted output %">
              <input type="number" min={0} max={100} value={formData.overall_ai_pct} onChange={(e) => updateField('overall_ai_pct', Math.min(100, num(e.target.value)))} style={inputStyle} />
            </LabeledInput>
          </div>
        </Section>

        <Section number="3" title="Hours saved" blurb="Conservative estimates vs your normal manual process.">
          <RowsTable columns={HOURS_COLUMNS} rows={formData.hours} onChange={rowsField('hours')} />
          <div style={{ marginTop: 'var(--space-4)' }}>
            <LabeledInput label="Total hours saved this week">
              <input type="number" min={0} step="0.5" value={formData.total_hours_saved} onChange={(e) => updateField('total_hours_saved', num(e.target.value))} style={inputStyle} />
            </LabeledInput>
          </div>
        </Section>

        <Section number="4" title="Quality delta" blurb="Did AI improve quality, cut revision cycles, or create errors?">
          <RowsTable columns={QUALITY_COLUMNS} rows={formData.quality} onChange={rowsField('quality')} />
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <LabeledInput label="Net quality movement">
              <select value={formData.net_quality} onChange={(e) => updateField('net_quality', e.target.value as SelfReportFormData['net_quality'])} style={inputStyle}>
                <option value="better">Better</option>
                <option value="same">Same</option>
                <option value="worse">Worse</option>
              </select>
            </LabeledInput>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-ink)' }}>
              <input type="checkbox" checked={formData.errors_found} onChange={(e) => updateField('errors_found', e.target.checked)} />
              AI errors found before submission
            </label>
            {formData.errors_found && (
              <LabeledInput label="What was corrected?">
                <input value={formData.errors_corrected} onChange={(e) => updateField('errors_corrected', e.target.value)} style={{ ...inputStyle, minWidth: 280 }} />
              </LabeledInput>
            )}
          </div>
        </Section>

        <Section number="5" title="Workflow documentation" blurb="Repeatable workflows created, improved, or reused this week.">
          <RowsTable columns={WORKFLOW_COLUMNS} rows={formData.workflows} onChange={rowsField('workflows')} />
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-ink)' }}>
              <input type="checkbox" checked={formData.workflow_doc_submitted} onChange={(e) => updateField('workflow_doc_submitted', e.target.checked)} />
              Workflow documentation submitted this week
            </label>
            <LabeledInput label="Cumulative documented workflows since July 1">
              <input type="number" min={0} value={formData.cumulative_workflows} onChange={(e) => updateField('cumulative_workflows', num(e.target.value))} style={inputStyle} />
            </LabeledInput>
          </div>
        </Section>

        <Section number="6" title="AI disclosure compliance" blurb="For outputs prepared after July 1, confirm AI usage was disclosed.">
          <RowsTable columns={DISCLOSURE_COLUMNS} rows={formData.disclosure} onChange={rowsField('disclosure')} />
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-ink)' }}>
              <input type="checkbox" checked={formData.submitted_without_review} onChange={(e) => updateField('submitted_without_review', e.target.checked)} />
              AI-assisted output submitted without human review
            </label>
            {formData.submitted_without_review && (
              <LabeledInput label="Explain immediately">
                <input required value={formData.without_review_explain} onChange={(e) => updateField('without_review_explain', e.target.value)} style={{ ...inputStyle, minWidth: 320 }} />
              </LabeledInput>
            )}
          </div>
        </Section>

        <Section number="7" title="Blockers" blurb="Do not leave blank if you are missing access, training, examples, or feedback.">
          <RowsTable columns={BLOCKER_COLUMNS} rows={formData.blockers} onChange={rowsField('blockers')} />
        </Section>

        <Section number="8" title="Staff certification" blurb="I confirm this report is accurate; I reviewed all AI-assisted outputs and remain responsible for their accuracy.">
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <LabeledInput label="Name">
              <input required value={formData.cert_name} onChange={(e) => updateField('cert_name', e.target.value)} style={inputStyle} />
            </LabeledInput>
            <LabeledInput label="Signature / acknowledgement">
              <input required value={formData.cert_signature} onChange={(e) => updateField('cert_signature', e.target.value)} style={inputStyle} />
            </LabeledInput>
            <LabeledInput label="Date">
              <input type="date" required value={formData.cert_date} onChange={(e) => updateField('cert_date', e.target.value)} style={inputStyle} />
            </LabeledInput>
          </div>
        </Section>

        {error && (
          <p role="alert" style={{ color: 'var(--color-danger, #b3261e)', margin: 0 }}>
            {error.message} — your entries are saved as a draft on this device.
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="font-mono uppercase"
          style={{
            alignSelf: 'flex-start',
            padding: '12px 24px',
            fontSize: 'var(--text-mono-sm)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: 'var(--color-paper)',
            background: 'var(--color-accent)',
            border: 'none',
            borderRadius: 4,
            cursor: submitting ? 'wait' : 'pointer',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Submitting…' : submittedAt ? 'Resubmit report' : 'Submit report'}
        </button>
      </form>
    </div>
  )
}
