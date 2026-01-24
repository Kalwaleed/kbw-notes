import { SettingsSection } from './SettingsSection'
import { SettingRow } from './SettingRow'
import { Download, Trash2, User } from 'lucide-react'

export function AccountSettings() {
  return (
    <SettingsSection
      title="Account"
      description="Manage your account and data"
      disabled={true}
      disabledMessage="Sign in required"
    >
      <SettingRow
        label="Connected Account"
        description="Your sign-in provider"
      >
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <User className="w-4 h-4" strokeWidth={1.5} />
          <span>Not signed in</span>
        </div>
      </SettingRow>

      <SettingRow
        label="Export Data"
        description="Download a copy of your data"
      >
        <button
          disabled={true}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Export
        </button>
      </SettingRow>

      <SettingRow
        label="Delete Account"
        description="Permanently delete your account and all data"
      >
        <button
          disabled={true}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Delete
        </button>
      </SettingRow>
    </SettingsSection>
  )
}
