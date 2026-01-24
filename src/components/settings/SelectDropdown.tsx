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
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        className={`
          appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
          rounded-lg px-3 py-1.5 pr-8 text-sm text-slate-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none"
        strokeWidth={1.5}
      />
    </div>
  )
}
