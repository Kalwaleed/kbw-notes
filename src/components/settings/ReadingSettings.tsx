import { SettingsSection } from './SettingsSection'
import { SettingRow } from './SettingRow'
import { SelectDropdown } from './SelectDropdown'
import { ToggleSwitch } from './ToggleSwitch'
import type { SortOrder, PostsPerPage } from './types'

interface ReadingSettingsProps {
  defaultSort: SortOrder
  postsPerPage: PostsPerPage
  autoExpandComments: boolean
  onDefaultSortChange: (sort: SortOrder) => void
  onPostsPerPageChange: (count: PostsPerPage) => void
  onAutoExpandCommentsChange: (expand: boolean) => void
}

const sortOptions: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'popular', label: 'Most popular' },
]

const postsPerPageOptions: { value: PostsPerPage; label: string }[] = [
  { value: 6, label: '6 posts' },
  { value: 12, label: '12 posts' },
  { value: 24, label: '24 posts' },
]

export function ReadingSettings({
  defaultSort,
  postsPerPage,
  autoExpandComments,
  onDefaultSortChange,
  onPostsPerPageChange,
  onAutoExpandCommentsChange,
}: ReadingSettingsProps) {
  return (
    <SettingsSection
      title="Reading"
      description="Configure how content is displayed"
    >
      <SettingRow
        label="Default Sort"
        description="How posts are ordered by default"
      >
        <SelectDropdown
          value={defaultSort}
          options={sortOptions}
          onChange={onDefaultSortChange}
        />
      </SettingRow>

      <SettingRow
        label="Posts per Page"
        description="Number of posts to show at once"
      >
        <SelectDropdown
          value={postsPerPage}
          options={postsPerPageOptions}
          onChange={(value) => onPostsPerPageChange(Number(value) as PostsPerPage)}
        />
      </SettingRow>

      <SettingRow
        label="Auto-expand Comments"
        description="Automatically show comments when viewing posts"
      >
        <ToggleSwitch
          checked={autoExpandComments}
          onChange={onAutoExpandCommentsChange}
        />
      </SettingRow>
    </SettingsSection>
  )
}
