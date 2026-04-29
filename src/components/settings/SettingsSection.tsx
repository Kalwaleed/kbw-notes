import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'

interface SettingsSectionProps {
  title: string
  description?: string
  children: ReactNode
  disabled?: boolean
  disabledMessage?: string
}

export function SettingsSection({
  title,
  description,
  children,
  disabled = false,
  disabledMessage = 'Sign in required',
}: SettingsSectionProps) {
  return (
    <section
      style={{
        background: 'var(--color-paper-raised)',
        border: '1px solid var(--color-hair)',
      }}
    >
      <header
        style={{
          padding: 'var(--space-5) var(--space-6)',
          borderBottom: '1px solid var(--color-hair)',
        }}
      >
        <div className="flex items-center justify-between" style={{ gap: 'var(--space-3)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              fontSize: 'var(--text-section)',
              lineHeight: 1.25,
              color: 'var(--color-ink)',
              margin: 0,
            }}
          >
            {title}
          </h2>
          {disabled && (
            <span
              className="inline-flex items-center font-mono uppercase"
              style={{
                gap: 6,
                fontSize: 'var(--text-mono-xs)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                padding: '2px 8px',
                border: '1px solid var(--color-hair)',
                borderRadius: 2,
                color: 'var(--color-ink-muted)',
              }}
            >
              <Lock size={12} strokeWidth={1.5} />
              {disabledMessage}
            </span>
          )}
        </div>
        {description && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-ui-sm)',
              color: 'var(--color-ink-muted)',
              margin: 0,
              marginTop: 'var(--space-2)',
            }}
          >
            {description}
          </p>
        )}
      </header>
      <div
        style={{
          padding: 'var(--space-5) var(--space-6)',
          opacity: disabled ? 0.4 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
        }}
      >
        {children}
      </div>
    </section>
  )
}
