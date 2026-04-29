import type { ReactNode } from 'react'

interface SettingRowProps {
  label: string
  description?: string
  children: ReactNode
}

export function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ gap: 'var(--space-4)', padding: 'var(--space-2) 0' }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-ui-base)',
            fontWeight: 500,
            color: 'var(--color-ink)',
          }}
        >
          {label}
        </div>
        {description && (
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-ui-sm)',
              color: 'var(--color-ink-muted)',
              marginTop: 2,
            }}
          >
            {description}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}
