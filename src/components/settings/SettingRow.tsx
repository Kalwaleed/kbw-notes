import type { ReactNode } from 'react'

interface SettingRowProps {
  label: string
  description?: string
  children: ReactNode
}

export function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-900 dark:text-white">
          {label}
        </div>
        {description && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </div>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}
