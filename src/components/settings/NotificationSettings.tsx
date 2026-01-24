import { SettingsSection } from './SettingsSection'
import { SettingRow } from './SettingRow'
import { SelectDropdown } from './SelectDropdown'
import { ToggleSwitch } from './ToggleSwitch'
import type { EmailDigest } from './types'

const emailDigestOptions: { value: EmailDigest; label: string }[] = [
  { value: 'daily', label: 'Daily digest' },
  { value: 'weekly', label: 'Weekly digest' },
  { value: 'never', label: 'Never' },
]

export function NotificationSettings() {
  return (
    <SettingsSection
      title="Notifications"
      description="Manage how you receive updates"
      disabled={true}
      disabledMessage="Sign in required"
    >
      <SettingRow
        label="Email Digest"
        description="Receive a summary of activity"
      >
        <SelectDropdown
          value="weekly"
          options={emailDigestOptions}
          onChange={() => {}}
          disabled={true}
        />
      </SettingRow>

      <SettingRow
        label="Reply Alerts"
        description="Get notified when someone replies to you"
      >
        <ToggleSwitch checked={true} onChange={() => {}} disabled={true} />
      </SettingRow>

      <SettingRow
        label="Mention Alerts"
        description="Get notified when someone mentions you"
      >
        <ToggleSwitch checked={true} onChange={() => {}} disabled={true} />
      </SettingRow>
    </SettingsSection>
  )
}
