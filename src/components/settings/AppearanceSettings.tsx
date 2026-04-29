import { SettingsSection } from './SettingsSection'
import { SettingRow } from './SettingRow'
import { SegmentedButtons } from './SegmentedButtons'
import type { Theme } from './types'

interface AppearanceSettingsProps {
  theme: Theme
  onThemeChange: (theme: Theme) => void
}

const themeOptions: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export function AppearanceSettings({ theme, onThemeChange }: AppearanceSettingsProps) {
  return (
    <SettingsSection
      title="Appearance"
      description="Choose how kbw Notes is rendered in your browser."
    >
      <SettingRow
        label="Theme"
        description="Light is the default. Dark is the same magazine, lit by a single warm lamp."
      >
        <SegmentedButtons
          value={theme}
          options={themeOptions}
          onChange={onThemeChange}
        />
      </SettingRow>
    </SettingsSection>
  )
}
