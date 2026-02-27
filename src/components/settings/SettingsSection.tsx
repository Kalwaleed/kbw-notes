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
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-semibold text-slate-900 dark:text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {title}
          </h2>
          {disabled && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <Lock className="w-3 h-3" strokeWidth={1.5} />
              {disabledMessage}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {description}
          </p>
        )}
      </div>
      <div className={`px-6 py-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  )
}
