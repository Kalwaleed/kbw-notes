interface SegmentOption<T extends string> {
  value: T
  label: string
}

interface SegmentedButtonsProps<T extends string> {
  value: T
  options: SegmentOption<T>[]
  onChange: (value: T) => void
  disabled?: boolean
}

/**
 * Editorial segmented control. Selected = ink fill, paper text.
 * Unselected = transparent background, muted ink. Hairline-bordered.
 */
export function SegmentedButtons<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
}: SegmentedButtonsProps<T>) {
  return (
    <div
      className="inline-flex"
      role="group"
      style={{
        border: '1px solid var(--color-hair)',
        borderRadius: 2,
        overflow: 'hidden',
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {options.map((option, idx) => {
        const isSelected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            aria-pressed={isSelected}
            className="font-mono uppercase"
            style={{
              padding: '6px 14px',
              fontSize: 'var(--text-mono-sm)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              background: isSelected ? 'var(--color-ink)' : 'transparent',
              color: isSelected ? 'var(--color-paper)' : 'var(--color-ink-muted)',
              border: 'none',
              borderLeft: idx === 0 ? 'none' : '1px solid var(--color-hair)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'background-color 100ms ease, color 100ms ease',
            }}
            onMouseEnter={(e) => {
              if (isSelected || disabled) return
              e.currentTarget.style.color = 'var(--color-ink)'
            }}
            onMouseLeave={(e) => {
              if (isSelected || disabled) return
              e.currentTarget.style.color = 'var(--color-ink-muted)'
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
