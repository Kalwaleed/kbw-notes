interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function ToggleSwitch({ checked, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        height: 24,
        width: 44,
        flexShrink: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: 2,
        border: `1px solid ${checked ? 'var(--color-accent)' : 'var(--color-hair)'}`,
        background: checked ? 'var(--color-accent)' : 'var(--color-paper-sunken)',
        opacity: disabled ? 0.4 : 1,
        transition: 'background-color 100ms ease, border-color 100ms ease',
        padding: 0,
      }}
    >
      <span className="sr-only">Toggle setting</span>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 1,
          left: checked ? 22 : 1,
          height: 20,
          width: 20,
          background: 'var(--color-paper)',
          border: '1px solid var(--color-hair)',
          transition: 'left 150ms ease',
        }}
      />
    </button>
  )
}
