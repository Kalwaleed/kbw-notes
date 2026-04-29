import { ChevronDown } from 'lucide-react'

interface SelectOption<T extends string | number> {
  value: T
  label: string
}

interface SelectDropdownProps<T extends string | number> {
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  disabled?: boolean
}

export function SelectDropdown<T extends string | number>({
  value,
  options,
  onChange,
  disabled = false,
}: SelectDropdownProps<T>) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        className="font-mono uppercase"
        style={{
          appearance: 'none',
          background: 'var(--color-paper)',
          color: 'var(--color-ink)',
          border: '1px solid var(--color-hair)',
          borderRadius: 2,
          padding: '6px 32px 6px 12px',
          fontSize: 'var(--text-mono-sm)',
          fontWeight: 500,
          letterSpacing: '0.04em',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.4 : 1,
          outline: 'none',
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        strokeWidth={1.5}
        style={{
          position: 'absolute',
          top: '50%',
          right: 8,
          transform: 'translateY(-50%)',
          color: 'var(--color-ink-soft)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
    </div>
  )
}
