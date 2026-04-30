import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PostPage } from './PostPage'
import type React from 'react'

vi.mock('../hooks', () => ({
  useAuth: () => ({ user: null }),
  useComments: () => ({
    comments: [],
    isLoading: false,
    moderationError: null,
    clearModerationError: vi.fn(),
    userLikedComments: new Set<string>(),
    addComment: vi.fn(),
    addReply: vi.fn(),
    deleteComment: vi.fn(),
    likeComment: vi.fn(),
  }),
}))

vi.mock('../lib/queries/blog', () => ({
  fetchBlogPost: vi.fn(async () => ({
    id: 'post-1',
    title: 'Public post',
    excerpt: 'Public excerpt',
    content: '<p>Body</p>',
    publishedAt: '2026-04-30T00:00:00.000Z',
    tags: ['Essay'],
    author: {
      id: 'author-1',
      name: 'KBW',
      avatarUrl: null,
    },
  })),
  getPostLikeCount: vi.fn(async () => 0),
}))

vi.mock('../components/shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('../components/blog-post', () => ({
  BlogPostView: ({ blogPost, isAuthenticated }: { blogPost: { title: string }, isAuthenticated?: boolean }) => (
    <article>
      <h1>{blogPost.title}</h1>
      <span data-testid="auth-state">{String(isAuthenticated)}</span>
    </article>
  ),
}))

describe('PostPage', () => {
  it('renders a public post without an authenticated user', async () => {
    render(
      <MemoryRouter initialEntries={['/kbw-notes/post/post-1']}>
        <Routes>
          <Route path="/kbw-notes/post/:id" element={<PostPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByRole('heading', { name: 'Public post' })).toBeInTheDocument()
    expect(screen.getByTestId('auth-state')).toHaveTextContent('false')
  })
})
