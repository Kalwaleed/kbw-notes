import { SettingsSection } from './SettingsSection'
import { SettingRow } from './SettingRow'
import { SelectDropdown } from './SelectDropdown'
import type { Visibility } from './types'

const visibilityOptions: { value: Visibility; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
]

export function PrivacySettings() {
  return (
    <SettingsSection
      title="Privacy"
      description="Control who can see your information"
      disabled={true}
      disabledMessage="Sign in required"
    >
      <SettingRow
        label="Profile Visibility"
        description="Who can view your profile"
      >
        <SelectDropdown
          value="public"
          options={visibilityOptions}
          onChange={() => {}}
          disabled={true}
        />
      </SettingRow>

      <SettingRow
        label="Bookmarks Visibility"
        description="Who can see your bookmarked posts"
      >
        <SelectDropdown
          value="private"
          options={visibilityOptions}
          onChange={() => {}}
          disabled={true}
        />
      </SettingRow>
    </SettingsSection>
  )
}
