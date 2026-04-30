import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SettingsPage } from './SettingsPage'
import type React from 'react'

vi.mock('../hooks', () => ({
  useSettings: () => ({
    appearance: { theme: 'system' },
    setTheme: vi.fn(),
    reading: {
      defaultSort: 'latest',
      postsPerPage: 6,
      autoExpandComments: false,
    },
    setDefaultSort: vi.fn(),
    setPostsPerPage: vi.fn(),
    setAutoExpandComments: vi.fn(),
  }),
}))

vi.mock('../components/shell', () => ({
  AppShell: ({
    children,
    navigationItems,
  }: {
    children: React.ReactNode
    navigationItems: Array<{ label: string }>
  }) => (
    <div>
      <nav aria-label="test nav">
        {navigationItems.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </nav>
      {children}
    </div>
  ),
}))

vi.mock('../components/settings', () => ({
  AppearanceSettings: () => <section aria-label="Appearance settings">Appearance</section>,
  ReadingSettings: () => <section aria-label="Reading settings">Reading</section>,
  NotificationSettings: () => <section aria-label="Notification settings">Notifications</section>,
  PrivacySettings: () => <section aria-label="Privacy settings">Privacy</section>,
  AccountSettings: () => <section aria-label="Account settings">Account</section>,
}))

describe('SettingsPage', () => {
  it('renders only anonymous local preference controls', () => {
    render(
      <MemoryRouter initialEntries={['/kbw-notes/settings']}>
        <SettingsPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Settings.' })).toBeInTheDocument()
    expect(screen.getByLabelText('Appearance settings')).toBeInTheDocument()
    expect(screen.getByLabelText('Reading settings')).toBeInTheDocument()

    expect(screen.queryByLabelText('Notification settings')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Privacy settings')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Account settings')).not.toBeInTheDocument()
    expect(screen.queryByText('Submissions')).not.toBeInTheDocument()
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument()
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
  })
})
