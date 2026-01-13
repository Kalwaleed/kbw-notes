import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlogPostCard } from '../BlogPostCard'
import type { BlogPost } from '../types'

// Sample test data
const mockPost: BlogPost = {
  id: 'post-001',
  title: 'Building a Real-Time Collaborative Editor with CRDTs',
  excerpt:
    'I spent the last month diving deep into Conflict-free Replicated Data Types. Here is what I learned about building Google Docs-style collaboration from scratch.',
  publishedAt: '2026-01-06T14:30:00Z',
  author: {
    id: 'user-001',
    name: 'Khalid Waleed',
    avatarUrl: null,
  },
  tags: ['distributed-systems', 'javascript', 'deep-dive'],
  likeCount: 142,
  commentCount: 23,
  isLiked: false,
  isBookmarked: false,
}

const mockPostWithAvatar: BlogPost = {
  ...mockPost,
  id: 'post-002',
  author: {
    id: 'user-002',
    name: 'Sarah Chen',
    avatarUrl: 'https://example.com/avatar.jpg',
  },
}

const mockLikedPost: BlogPost = {
  ...mockPost,
  id: 'post-003',
  isLiked: true,
}

const mockBookmarkedPost: BlogPost = {
  ...mockPost,
  id: 'post-004',
  isBookmarked: true,
}

describe('BlogPostCard', () => {
  describe('Rendering', () => {
    it('displays post title', () => {
      render(<BlogPostCard post={mockPost} />)
      expect(screen.getByText(mockPost.title)).toBeInTheDocument()
    })

    it('displays excerpt text (truncated with ellipsis if long)', () => {
      render(<BlogPostCard post={mockPost} />)
      expect(screen.getByText(/Conflict-free Replicated Data Types/)).toBeInTheDocument()
    })

    it('displays author name', () => {
      render(<BlogPostCard post={mockPost} />)
      expect(screen.getByText(mockPost.author.name)).toBeInTheDocument()
    })

    it('displays author initials when no avatar', () => {
      render(<BlogPostCard post={mockPost} />)
      // Khalid Waleed -> KW
      expect(screen.getByText('KW')).toBeInTheDocument()
    })

    it('displays author avatar when avatarUrl is provided', () => {
      render(<BlogPostCard post={mockPostWithAvatar} />)
      const avatar = screen.getByAltText(mockPostWithAvatar.author.name)
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('src', mockPostWithAvatar.author.avatarUrl)
    })

    it('displays formatted date (e.g., "Jan 6, 2026")', () => {
      render(<BlogPostCard post={mockPost} />)
      expect(screen.getByText('Jan 6, 2026')).toBeInTheDocument()
    })

    it('displays all tags as badges', () => {
      render(<BlogPostCard post={mockPost} />)
      mockPost.tags.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument()
      })
    })

    it('displays like count', () => {
      render(<BlogPostCard post={mockPost} />)
      expect(screen.getByText('142')).toBeInTheDocument()
    })

    it('displays comment count', () => {
      render(<BlogPostCard post={mockPost} />)
      expect(screen.getByText('23')).toBeInTheDocument()
    })

    it('shows filled heart icon when isLiked is true', () => {
      render(<BlogPostCard post={mockLikedPost} />)
      const likeButton = screen.getByRole('button', { name: /unlike/i })
      expect(likeButton).toBeInTheDocument()
    })

    it('shows outline heart icon when isLiked is false', () => {
      render(<BlogPostCard post={mockPost} />)
      const likeButton = screen.getByRole('button', { name: /^like$/i })
      expect(likeButton).toBeInTheDocument()
    })

    it('shows filled bookmark icon when isBookmarked is true', () => {
      render(<BlogPostCard post={mockBookmarkedPost} />)
      const bookmarkButton = screen.getByRole('button', { name: /remove bookmark/i })
      expect(bookmarkButton).toBeInTheDocument()
    })

    it('shows outline bookmark icon when isBookmarked is false', () => {
      render(<BlogPostCard post={mockPost} />)
      const bookmarkButton = screen.getByRole('button', { name: /^bookmark$/i })
      expect(bookmarkButton).toBeInTheDocument()
    })
  })

  describe('User interactions', () => {
    it('clicking card area calls onView', async () => {
      const user = userEvent.setup()
      const onView = vi.fn()
      render(<BlogPostCard post={mockPost} onView={onView} />)

      // Click on the title area (not action buttons)
      await user.click(screen.getByText(mockPost.title))
      expect(onView).toHaveBeenCalledTimes(1)
    })

    it('clicking heart icon calls onLike (does not trigger onView)', async () => {
      const user = userEvent.setup()
      const onLike = vi.fn()
      const onView = vi.fn()
      render(<BlogPostCard post={mockPost} onLike={onLike} onView={onView} />)

      const likeButton = screen.getByRole('button', { name: /^like$/i })
      await user.click(likeButton)

      expect(onLike).toHaveBeenCalledTimes(1)
      expect(onView).not.toHaveBeenCalled()
    })

    it('clicking bookmark icon calls onBookmark (does not trigger onView)', async () => {
      const user = userEvent.setup()
      const onBookmark = vi.fn()
      const onView = vi.fn()
      render(<BlogPostCard post={mockPost} onBookmark={onBookmark} onView={onView} />)

      const bookmarkButton = screen.getByRole('button', { name: /^bookmark$/i })
      await user.click(bookmarkButton)

      expect(onBookmark).toHaveBeenCalledTimes(1)
      expect(onView).not.toHaveBeenCalled()
    })

    it('clicking share icon calls onShare (does not trigger onView)', async () => {
      const user = userEvent.setup()
      const onShare = vi.fn()
      const onView = vi.fn()
      render(<BlogPostCard post={mockPost} onShare={onShare} onView={onView} />)

      const shareButton = screen.getByRole('button', { name: /share/i })
      await user.click(shareButton)

      expect(onShare).toHaveBeenCalledTimes(1)
      expect(onView).not.toHaveBeenCalled()
    })
  })

  describe('Edge cases', () => {
    it('handles posts with no tags (no broken layout)', () => {
      const postWithNoTags = { ...mockPost, tags: [] }
      render(<BlogPostCard post={postWithNoTags} />)
      expect(screen.getByText(mockPost.title)).toBeInTheDocument()
    })

    it('handles very long titles (should render without breaking)', () => {
      const postWithLongTitle = {
        ...mockPost,
        title:
          'This is an extremely long title that should be handled gracefully by the component and ideally truncated or wrapped appropriately',
      }
      render(<BlogPostCard post={postWithLongTitle} />)
      expect(screen.getByText(postWithLongTitle.title)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('like button has aria-label', () => {
      render(<BlogPostCard post={mockPost} />)
      expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument()
    })

    it('bookmark button has aria-label', () => {
      render(<BlogPostCard post={mockPost} />)
      expect(screen.getByRole('button', { name: /bookmark/i })).toBeInTheDocument()
    })

    it('share button has aria-label', () => {
      render(<BlogPostCard post={mockPost} />)
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
    })
  })
})
