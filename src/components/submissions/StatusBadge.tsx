import type { SubmissionStatus } from '../../types/submission'

interface StatusBadgeProps {
  status: SubmissionStatus
  size?: 'sm' | 'md'
}

/**
 * Hairline-bordered uppercase mono pill. Uses accent for published,
 * muted ink for draft. No chromatic differentiation — type does the work.
 */
const statusConfig: Record<SubmissionStatus, { label: string; color: string }> = {
  draft:     { label: 'Draft',     color: 'var(--color-ink-muted)' },
  published: { label: 'Published', color: 'var(--color-accent)' },
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status]
  const fontSize = size === 'sm' ? 'var(--text-mono-xs)' : 'var(--text-mono-sm)'

  return (
    <span
      className="inline-flex items-center font-mono uppercase"
      style={{
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.04em',
        color: config.color,
        padding: size === 'sm' ? '2px 8px' : '3px 10px',
        border: `1px solid ${config.color}`,
        borderRadius: 2,
      }}
    >
      {config.label}
    </span>
  )
}
