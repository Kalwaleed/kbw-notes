import type { SubmissionStatus } from '../../types/submission'

interface StatusBadgeProps {
  status: SubmissionStatus
  size?: 'sm' | 'md'
}

const statusConfig: Record<
  SubmissionStatus,
  { label: string; bgClass: string; textClass: string }
> = {
  draft: {
    label: 'Draft',
    bgClass: 'bg-slate-100 dark:bg-slate-800',
    textClass: 'text-slate-600 dark:text-slate-400',
  },
  published: {
    label: 'Published',
    bgClass: 'bg-emerald-100 dark:bg-emerald-950/50',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status]

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses} ${config.bgClass} ${config.textClass}`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {config.label}
    </span>
  )
}
