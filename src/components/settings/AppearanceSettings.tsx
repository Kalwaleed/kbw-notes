import { SettingsSection } from './SettingsSection'
import { SettingRow } from './SettingRow'
import { SegmentedButtons } from './SegmentedButtons'
import type { Theme, FontSize, Density } from './types'

interface AppearanceSettingsProps {
  theme: Theme
  fontSize: FontSize
  density: Density
  onThemeChange: (theme: Theme) => void
  onFontSizeChange: (fontSize: FontSize) => void
  onDensityChange: (density: Density) => void
}

const themeOptions: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

const fontSizeOptions: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

const densityOptions: { value: Density; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
]

export function AppearanceSettings({
  theme,
  fontSize,
  density,
  onThemeChange,
  onFontSizeChange,
  onDensityChange,
}: AppearanceSettingsProps) {
  return (
    <SettingsSection
      title="Appearance"
      description="Customize how the app looks and feels"
    >
      <SettingRow
        label="Theme"
        description="Choose your preferred color scheme"
      >
        <SegmentedButtons
          value={theme}
          options={themeOptions}
          onChange={onThemeChange}
        />
      </SettingRow>

      <SettingRow
        label="Font Size"
        description="Adjust the text size throughout the app"
      >
        <SegmentedButtons
          value={fontSize}
          options={fontSizeOptions}
          onChange={onFontSizeChange}
        />
      </SettingRow>

      <SettingRow
        label="Density"
        description="Control spacing and padding in the interface"
      >
        <SegmentedButtons
          value={density}
          options={densityOptions}
          onChange={onDensityChange}
        />
      </SettingRow>
    </SettingsSection>
  )
}
