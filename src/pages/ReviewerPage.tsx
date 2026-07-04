import { useState, type CSSProperties } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useReviewerReports } from '../hooks/useReviewerReports'
import { isLate } from '../lib/self-reports/weekWindow'
import { needsReviewFlags } from '../lib/self-reports/thresholds'
import type { ReportWithReview } from '../lib/queries/selfReports'
import type { ReviewFormData } from '../lib/self-reports/types'

const selectStyle: CSSProperties = {
  padding: '6px 8px',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-mono-sm)',
  color: 'var(--color-ink)',
  background: 'var(--color-paper)',
  border: '1px solid var(--color-hair)',
  borderRadius: 3,
}

const defaultReview: ReviewFormData = {
  submitted_on_time: 'pass',
  tool_usage_credible: 'pass',
  evidence_provided: 'pass',
  hours_saved_reasonable: 'pass',
  disclosure_compliance: 'pass',
  workflow_doc_progress: 'on_track',
  escalation_needed: false,
  comments: '',
  weekly_status: 'on_track',
}

const REVIEW_ITEMS: { key: keyof ReviewFormData; label: string; options: string[] }[] = [
  { key: 'submitted_on_time', label: 'Submitted on time', options: ['pass', 'miss'] },
  { key: 'tool_usage_credible', label: 'Tool usage credible', options: ['pass', 'question'] },
  { key: 'evidence_provided', label: 'Evidence provided', options: ['pass', 'partial', 'miss'] },
  { key: 'hours_saved_reasonable', label: 'Hours saved reasonable', options: ['pass', 'question'] },
  { key: 'disclosure_compliance', label: 'Disclosure compliance', options: ['pass', 'miss', 'na'] },
  { key: 'workflow_doc_progress', label: 'Workflow doc progress', options: ['on_track', 'at_risk', 'behind'] },
]

function pretty(value: string): string {
  return value.replace(/_/g, ' ')
}

function SectionDump({ title, rows }: { title: string; rows: Record<string, unknown>[] }) {
  const real = (Array.isArray(rows) ? rows : []).filter(
    (r) => r && typeof r === 'object' && Object.values(r).some((v) => v !== '' && v != null)
  )
  if (real.length === 0) return null
  const keys = Object.keys(real[0])
  return (
    <div style={{ marginTop: 12 }}>
      <div className="font-mono uppercase" style={{ fontSize: 'var(--text-mono-xs)', color: 'var(--color-ink-muted)', marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {keys.map((k) => (
                <th key={k} style={{ textAlign: 'left', padding: '2px 8px 2px 0', color: 'var(--color-ink-muted)', fontWeight: 500 }}>
                  {pretty(k)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {real.map((row, i) => (
              <tr key={i}>
                {keys.map((k) => (
                  <td key={k} style={{ padding: '2px 8px 2px 0', color: 'var(--color-ink)', verticalAlign: 'top' }}>
                    {String(row[k] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ReportCard({ item, onSave }: {
  item: ReportWithReview
  onSave: (reportId: string, data: ReviewFormData) => Promise<Error | null>
}) {
  const { report, review } = item
  const [expanded, setExpanded] = useState(false)
  const [form, setForm] = useState<ReviewFormData>(review ?? defaultReview)
  const [saving, setSaving] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle')

  const late = isLate(new Date(report.submitted_at), report.week_start_date)
  const flags = needsReviewFlags(report)

  const badge = (text: string, tone: 'warn' | 'ok' | 'muted') => (
    <span
      className="font-mono uppercase"
      style={{
        fontSize: 'var(--text-mono-xs)',
        padding: '2px 8px',
        borderRadius: 3,
        letterSpacing: '0.04em',
        color: tone === 'warn' ? '#7a2e26' : tone === 'ok' ? 'var(--color-accent)' : 'var(--color-ink-muted)',
        border: `1px solid ${tone === 'warn' ? '#c9847c' : 'var(--color-hair)'}`,
      }}
    >
      {text}
    </span>
  )

  return (
    <article style={{ border: '1px solid var(--color-hair)', borderRadius: 6, padding: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--color-ink)', margin: 0 }}>
            {report.staff_name || '(no name)'}
          </h2>
          <p className="font-mono" style={{ fontSize: 'var(--text-mono-xs)', color: 'var(--color-ink-muted)', margin: '2px 0 0' }}>
            Week {report.week_start_date} · submitted{' '}
            {new Date(report.submitted_at).toLocaleString('en-GB', { timeZone: 'Asia/Riyadh' })} Riyadh
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {late && badge('Late', 'warn')}
          {flags.map((f) => badge(f, 'warn'))}
          {review ? badge(`Reviewed: ${pretty(review.weekly_status)}`, 'ok') : badge('Awaiting review', 'muted')}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="font-mono uppercase"
            style={{ fontSize: 'var(--text-mono-xs)', background: 'transparent', border: '1px solid var(--color-hair)', borderRadius: 3, padding: '4px 10px', cursor: 'pointer', color: 'var(--color-ink)' }}
          >
            {expanded ? 'Collapse' : 'Open'}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>
            {report.role_function && <span>{report.role_function} · </span>}
            {report.main_workstream && <span>Workstream: {report.main_workstream} · </span>}
            <span>
              Tools {report.tools_total_active} active / {report.tools_total_daily} daily · AI output{' '}
              {report.overall_ai_pct}% · {report.total_hours_saved}h saved · quality {report.net_quality} ·{' '}
              {report.cumulative_workflows} workflows cumulative
            </span>
          </div>

          <SectionDump title="1 · Tools" rows={report.tools} />
          <SectionDump title="2 · Coverage" rows={report.coverage} />
          <SectionDump title="3 · Hours saved" rows={report.hours} />
          <SectionDump title="4 · Quality" rows={report.quality} />
          <SectionDump title="5 · Workflows" rows={report.workflows} />
          <SectionDump title="6 · Disclosure" rows={report.disclosure} />
          <SectionDump title="7 · Blockers" rows={report.blockers} />
          <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginTop: 8 }}>
            Certified by {report.cert_name} ({report.cert_signature}) on {report.cert_date}
            {report.errors_found && ` · errors corrected: ${report.errors_corrected}`}
            {report.submitted_without_review && ` · WITHOUT-REVIEW EXPLANATION: ${report.without_review_explain}`}
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-hair)', margin: 'var(--space-4) 0' }} />

          <div className="font-mono uppercase" style={{ fontSize: 'var(--text-mono-xs)', letterSpacing: '0.08em', color: 'var(--color-accent)', fontWeight: 600, marginBottom: 8 }}>
            Reviewer section
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
            {REVIEW_ITEMS.map(({ key, label, options }) => (
              <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{label}</span>
                <select
                  value={String(form[key])}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  style={selectStyle}
                >
                  {options.map((o) => (
                    <option key={o} value={o}>{pretty(o)}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-ink)' }}>
              <input
                type="checkbox"
                checked={form.escalation_needed}
                onChange={(e) => setForm((f) => ({ ...f, escalation_needed: e.target.checked }))}
              />
              Escalation needed
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>Weekly status</span>
              <select
                value={form.weekly_status}
                onChange={(e) => setForm((f) => ({ ...f, weekly_status: e.target.value as ReviewFormData['weekly_status'] }))}
                style={selectStyle}
              >
                <option value="on_track">On track</option>
                <option value="at_risk">At risk</option>
                <option value="not_started">Not started</option>
              </select>
            </label>
          </div>
          <textarea
            placeholder="Reviewer comments"
            value={form.comments}
            onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
            rows={3}
            style={{ ...selectStyle, width: '100%', marginTop: 10, resize: 'vertical' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                setSaving(true)
                setSaveState('idle')
                const err = await onSave(report.id, form)
                setSaving(false)
                setSaveState(err ? 'error' : 'saved')
              }}
              className="font-mono uppercase"
              style={{ padding: '8px 16px', fontSize: 'var(--text-mono-sm)', fontWeight: 600, color: 'var(--color-paper)', background: 'var(--color-accent)', border: 'none', borderRadius: 4, cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving…' : review ? 'Update review' : 'Save review'}
            </button>
            {saveState === 'saved' && <span style={{ color: 'var(--color-accent)', fontSize: 13 }}>Saved.</span>}
            {saveState === 'error' && <span style={{ color: '#b3261e', fontSize: 13 }}>Save failed — try again.</span>}
          </div>
        </div>
      )}
    </article>
  )
}

export function ReviewerPage() {
  const { user, signOut } = useAuth()
  const { items, loading, error, saveReview } = useReviewerReports({ reviewerId: user?.id ?? '' })

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 'var(--space-6) var(--space-4) var(--space-10)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
        <div>
          <div className="font-mono uppercase" style={{ fontSize: 'var(--text-mono-xs)', letterSpacing: '0.08em', color: 'var(--color-accent)', fontWeight: 600 }}>
            KBW AI Adoption Mandate · Reviewer
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 'var(--text-h2)', color: 'var(--color-ink)', margin: '4px 0 0' }}>
            Weekly self-reports
          </h1>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          className="font-mono uppercase"
          style={{ fontSize: 'var(--text-mono-xs)', background: 'transparent', border: '1px solid var(--color-hair)', borderRadius: 4, padding: '6px 10px', color: 'var(--color-ink-muted)', cursor: 'pointer' }}
        >
          Sign out
        </button>
      </header>

      {loading && <p style={{ color: 'var(--color-ink-muted)' }}>Loading…</p>}
      {error && (
        <p role="alert" style={{ color: '#b3261e' }}>{error.message}</p>
      )}
      {!loading && !error && items.length === 0 && (
        <p style={{ color: 'var(--color-ink-muted)' }}>No reports submitted yet.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {items.map((item) => (
          <ReportCard key={item.report.id} item={item} onSave={saveReview} />
        ))}
      </div>
    </div>
  )
}
