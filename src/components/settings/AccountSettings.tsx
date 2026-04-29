import { SettingsSection } from './SettingsSection'
import { SettingRow } from './SettingRow'
import { Download, Trash2, User } from 'lucide-react'

export function AccountSettings() {
  return (
    <SettingsSection
      title="Account"
      description="Manage your account and data."
      disabled={true}
      disabledMessage="Sign in required"
    >
      <SettingRow
        label="Connected account"
        description="Your sign-in provider"
      >
        <div
          className="flex items-center"
          style={{
            gap: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-mono-sm)',
            color: 'var(--color-ink-soft)',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          <User size={14} strokeWidth={1.5} />
          Not signed in
        </div>
      </SettingRow>

      <SettingRow
        label="Export data"
        description="Download a copy of your data"
      >
        <SecondaryButton disabled icon={Download}>Export</SecondaryButton>
      </SettingRow>

      <SettingRow
        label="Delete account"
        description="Permanently delete your account and all data"
      >
        <DestructiveButton disabled icon={Trash2}>Delete</DestructiveButton>
      </SettingRow>
    </SettingsSection>
  )
}

function SecondaryButton({
  disabled,
  icon: Icon,
  children,
}: {
  disabled?: boolean
  icon: typeof Download
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="font-mono uppercase inline-flex items-center"
      style={{
        gap: 6,
        fontSize: 'var(--text-mono-sm)',
        fontWeight: 600,
        letterSpacing: '0.04em',
        background: 'transparent',
        color: 'var(--color-ink)',
        border: '1px solid var(--color-ink)',
        borderRadius: 2,
        padding: '8px 14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Icon size={14} strokeWidth={1.5} />
      {children}
    </button>
  )
}

function DestructiveButton({
  disabled,
  icon: Icon,
  children,
}: {
  disabled?: boolean
  icon: typeof Trash2
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="font-mono uppercase inline-flex items-center"
      style={{
        gap: 6,
        fontSize: 'var(--text-mono-sm)',
        fontWeight: 600,
        letterSpacing: '0.04em',
        background: 'transparent',
        color: 'var(--color-rose)',
        border: '1px solid var(--color-rose)',
        borderRadius: 2,
        padding: '8px 14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Icon size={14} strokeWidth={1.5} />
      {children}
    </button>
  )
}
