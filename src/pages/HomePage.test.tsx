import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HomePage } from './HomePage'
import type React from 'react'

vi.mock('../hooks', () => ({
  useBlogPosts: () => ({
    posts: [],
    isLoading: false,
    hasMore: false,
    loadMore: vi.fn(),
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

vi.mock('../components/blog-feed', () => ({
  BlogFeed: () => <div data-testid="blog-feed">Blog feed</div>,
}))

describe('HomePage', () => {
  it('renders the reader feed without an authenticated user model', () => {
    render(
      <MemoryRouter initialEntries={['/kbw-notes/home']}>
        <HomePage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Notes from the desk.' })).toBeInTheDocument()
    expect(screen.getByTestId('blog-feed')).toBeInTheDocument()
    expect(screen.getByText('Submissions')).toBeInTheDocument()
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument()
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
  })
})
