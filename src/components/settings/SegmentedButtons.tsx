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

export function SegmentedButtons<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
}: SegmentedButtonsProps<T>) {
  return (
    <div
      className={`
        inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {options.map((option) => {
        const isSelected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`
              px-3 py-1 text-sm font-medium rounded-md transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800
              ${
                isSelected
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }
            `}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
