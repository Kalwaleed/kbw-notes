import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlogFeed } from '../BlogFeed'
import type { BlogPost } from '../types'

// Sample test data
const mockBlogPosts: BlogPost[] = [
  {
    id: 'post-001',
    title: 'Building a Real-Time Collaborative Editor with CRDTs',
    excerpt: 'I spent the last month diving deep into Conflict-free Replicated Data Types.',
    publishedAt: '2026-01-06T14:30:00Z',
    author: { id: 'user-001', name: 'Khalid Waleed', avatarUrl: null },
    tags: ['distributed-systems', 'javascript'],
    likeCount: 142,
    commentCount: 23,
    isLiked: false,
    isBookmarked: true,
  },
  {
    id: 'post-002',
    title: 'Why I Switched from REST to tRPC',
    excerpt: 'Type safety from database to frontend changed how I think about API design.',
    publishedAt: '2026-01-03T09:15:00Z',
    author: { id: 'user-001', name: 'Khalid Waleed', avatarUrl: null },
    tags: ['typescript', 'api-design'],
    likeCount: 89,
    commentCount: 31,
    isLiked: true,
    isBookmarked: false,
  },
]

describe('BlogFeed', () => {
  describe('Rendering posts', () => {
    it('renders all provided blog posts', () => {
      render(<BlogFeed blogPosts={mockBlogPosts} />)

      expect(screen.getByText(mockBlogPosts[0].title)).toBeInTheDocument()
      expect(screen.getByText(mockBlogPosts[1].title)).toBeInTheDocument()
    })

    it('displays posts in provided order (newest first when sorted)', () => {
      render(<BlogFeed blogPosts={mockBlogPosts} />)

      const titles = screen.getAllByRole('heading', { level: 2 })
      expect(titles[0]).toHaveTextContent(mockBlogPosts[0].title)
      expect(titles[1]).toHaveTextContent(mockBlogPosts[1].title)
    })
  })

  describe('Empty state', () => {
    it('shows "No posts yet" heading when blogPosts is empty', () => {
      render(<BlogFeed blogPosts={[]} />)
      expect(screen.getByText('No posts yet')).toBeInTheDocument()
    })

    it('shows "Check back soon for new content." message when empty', () => {
      render(<BlogFeed blogPosts={[]} />)
      expect(screen.getByText('Check back soon for new content.')).toBeInTheDocument()
    })

    it('does not show empty state when posts exist', () => {
      render(<BlogFeed blogPosts={mockBlogPosts} />)
      expect(screen.queryByText('No posts yet')).not.toBeInTheDocument()
    })
  })

  describe('Loading state', () => {
    it('shows loading indicator when isLoading is true', () => {
      render(<BlogFeed blogPosts={mockBlogPosts} isLoading={true} />)
      expect(screen.getByText('Loading more posts...')).toBeInTheDocument()
    })

    it('does not show loading indicator when isLoading is false', () => {
      render(<BlogFeed blogPosts={mockBlogPosts} isLoading={false} />)
      expect(screen.queryByText('Loading more posts...')).not.toBeInTheDocument()
    })

    it('does not show empty state when loading with no posts', () => {
      render(<BlogFeed blogPosts={[]} isLoading={true} />)
      expect(screen.queryByText('No posts yet')).not.toBeInTheDocument()
    })
  })

  describe('End of feed', () => {
    it('shows "You\'ve reached the end" when hasMore is false and posts exist', () => {
      render(<BlogFeed blogPosts={mockBlogPosts} hasMore={false} />)
      expect(screen.getByText("You've reached the end")).toBeInTheDocument()
    })

    it('does not show end message when hasMore is true', () => {
      render(<BlogFeed blogPosts={mockBlogPosts} hasMore={true} />)
      expect(screen.queryByText("You've reached the end")).not.toBeInTheDocument()
    })

    it('does not show end message when no posts exist', () => {
      render(<BlogFeed blogPosts={[]} hasMore={false} />)
      expect(screen.queryByText("You've reached the end")).not.toBeInTheDocument()
    })
  })

  describe('Callbacks', () => {
    it('calls onViewPost with post id when card is clicked', async () => {
      const user = userEvent.setup()
      const onViewPost = vi.fn()
      render(<BlogFeed blogPosts={mockBlogPosts} onViewPost={onViewPost} />)

      // Click the first card's button area (the title is inside a button)
      const buttons = screen.getAllByRole('button', { name: undefined })
      // The first wide button in each card is the view button
      const cardButtons = buttons.filter((btn) => btn.classList.contains('w-full'))
      await user.click(cardButtons[0])

      expect(onViewPost).toHaveBeenCalledWith('post-001')
    })

    it('calls onLike with post id when like button is clicked', async () => {
      const user = userEvent.setup()
      const onLike = vi.fn()
      render(<BlogFeed blogPosts={mockBlogPosts} onLike={onLike} />)

      const likeButtons = screen.getAllByRole('button', { name: /like/i })
      await user.click(likeButtons[0])

      expect(onLike).toHaveBeenCalledWith('post-001')
    })

    it('calls onBookmark with post id when bookmark button is clicked', async () => {
      const user = userEvent.setup()
      const onBookmark = vi.fn()
      render(<BlogFeed blogPosts={mockBlogPosts} onBookmark={onBookmark} />)

      const bookmarkButtons = screen.getAllByRole('button', { name: /bookmark/i })
      await user.click(bookmarkButtons[0])

      expect(onBookmark).toHaveBeenCalledWith('post-001')
    })

    it('calls onShare with post id when share button is clicked', async () => {
      const user = userEvent.setup()
      const onShare = vi.fn()
      render(<BlogFeed blogPosts={mockBlogPosts} onShare={onShare} />)

      const shareButtons = screen.getAllByRole('button', { name: /share/i })
      await user.click(shareButtons[0])

      expect(onShare).toHaveBeenCalledWith('post-001')
    })
  })

  describe('Edge cases', () => {
    it('works correctly with 1 post', () => {
      render(<BlogFeed blogPosts={[mockBlogPosts[0]]} />)
      expect(screen.getByText(mockBlogPosts[0].title)).toBeInTheDocument()
    })

    it('handles large number of posts without breaking', () => {
      const manyPosts = Array.from({ length: 100 }, (_, i) => ({
        ...mockBlogPosts[0],
        id: `post-${i}`,
        title: `Post ${i}`,
      }))
      render(<BlogFeed blogPosts={manyPosts} />)
      expect(screen.getByText('Post 0')).toBeInTheDocument()
      expect(screen.getByText('Post 99')).toBeInTheDocument()
    })
  })
})
