# Testing Patterns

**Analysis Date:** 2025-01-25

## Test Framework

**Runner:**
- Vitest v3.1.4
- Config: `vitest.config.ts`
- Environment: jsdom (browser-like environment)
- Globals enabled (describe, it, expect available without imports)

**Assertion Library:**
- Vitest built-in assertions
- React Testing Library matchers via `@testing-library/jest-dom`

**Run Commands:**
```bash
npm test              # Run tests in watch mode
npm test -- src/components/blog-feed/__tests__/BlogPostCard.test.tsx  # Single test file
npm test -- -t "test name"                                             # By test name
npm run test:run      # Single test run (CI mode)
npm run test:ui       # UI dashboard for test results
```

## Test File Organization

**Location:**
- Tests are co-located with components in `__tests__` subdirectories
- Path: `src/components/{feature}/__tests__/{ComponentName}.test.tsx`

**Existing test files:**
- `src/components/blog-feed/__tests__/BlogPostCard.test.tsx` - Tests for BlogPostCard component
- `src/components/blog-feed/__tests__/BlogFeed.test.tsx` - Tests for BlogFeed component

**Naming:**
- Test files match component name with `.test.tsx` suffix
- No separate test directories; tests live alongside source code

**Structure:**
```
src/components/blog-feed/
├── BlogPostCard.tsx
├── BlogFeed.tsx
├── types.ts
├── index.ts
└── __tests__/
    ├── BlogPostCard.test.tsx
    └── BlogFeed.test.tsx
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlogPostCard } from '../BlogPostCard'
import type { BlogPost } from '../types'

// Test data at top
const mockPost: BlogPost = { /* ... */ }

describe('BlogPostCard', () => {
  describe('Rendering', () => {
    it('displays post title', () => {
      render(<BlogPostCard post={mockPost} />)
      expect(screen.getByText(mockPost.title)).toBeInTheDocument()
    })
  })

  describe('User interactions', () => {
    it('calls onView when card is clicked', async () => {
      const user = userEvent.setup()
      const onView = vi.fn()
      render(<BlogPostCard post={mockPost} onView={onView} />)

      await user.click(screen.getByText(mockPost.title))
      expect(onView).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge cases', () => {
    it('handles posts with no tags', () => {
      const postWithNoTags = { ...mockPost, tags: [] }
      render(<BlogPostCard post={postWithNoTags} />)
      expect(screen.getByText(mockPost.title)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('like button has aria-label', () => {
      render(<BlogPostCard post={mockPost} />)
      expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument()
    })
  })
})
```

**Patterns:**
- `describe` blocks organize tests by feature (Rendering, User interactions, Edge cases, Accessibility)
- `it` blocks test single assertions
- Mock data defined at module level, reused across tests
- Each test is independent and can run in any order
- Use `userEvent.setup()` for simulating user interactions

## Mocking

**Framework:** Vitest's built-in `vi` module

**Patterns:**
```typescript
// Function mocking
const onView = vi.fn()
const onLike = vi.fn()

// Mocking calls
expect(onView).toHaveBeenCalledTimes(1)
expect(onLike).not.toHaveBeenCalled()

// Mocking return values
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})

// Mocking implementations
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    // ...
  })),
})
```

**Global mocks in setup file (`src/test/setup.ts`):**
```typescript
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock IntersectionObserver (for infinite scroll)
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})
window.IntersectionObserver = mockIntersectionObserver

// Mock navigator.share
Object.defineProperty(navigator, 'share', {
  value: vi.fn().mockResolvedValue(undefined),
  writable: true,
})

// Mock window.matchMedia (for theme detection)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
```

**What to Mock:**
- External callbacks/props (onView, onLike, onBookmark)
- Browser APIs (IntersectionObserver, navigator.share, window.matchMedia)
- Component props that are functions
- Do not mock React or React Testing Library

**What NOT to Mock:**
- React hooks (useState, useCallback, etc.)
- Component implementations (render them for testing)
- DOM queries - use screen.getByRole, screen.getByText instead
- Component styling or CSS classes (test behavior, not appearance)

## Fixtures and Factories

**Test Data:**
Mock data objects are defined at the top of test files as constants:

```typescript
// src/components/blog-feed/__tests__/BlogPostCard.test.tsx
const mockPost: BlogPost = {
  id: 'post-001',
  title: 'Building a Real-Time Collaborative Editor with CRDTs',
  excerpt: 'I spent the last month diving deep into Conflict-free Replicated Data Types.',
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

// Create variations by spreading
const mockPostWithAvatar: BlogPost = {
  ...mockPost,
  id: 'post-002',
  author: { ...mockPost.author, avatarUrl: 'https://example.com/avatar.jpg' },
}

const mockLikedPost: BlogPost = {
  ...mockPost,
  id: 'post-003',
  isLiked: true,
}
```

**Location:**
- Test data lives in the test file itself
- No separate factory files yet (tests are component-focused)
- Data objects follow the type being tested exactly

## Coverage

**Requirements:** No enforced minimum coverage

**View Coverage:**
Coverage configuration in `vitest.config.ts`:
```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  exclude: ['node_modules/', 'src/test/'],
}
```

To generate coverage reports:
```bash
npm test -- --coverage
```

Coverage reports generated in `coverage/` directory (HTML viewable in browser)

## Test Types

**Unit Tests:**
- Scope: Individual components and their props/callbacks
- Approach: Render component with test data, verify output and interactions
- Example: `BlogPostCard.test.tsx` - Tests rendering, user interactions, edge cases

**Integration Tests:**
- Scope: Multiple components working together
- Approach: Render parent component, verify child integration
- Example: `BlogFeed.test.tsx` - Tests BlogFeed passing props to BlogPostCard, handling empty states
- Currently minimal; can be expanded for data flow testing

**E2E Tests:**
- Framework: Playwright v1.50.0
- Location: Not yet present in codebase (available via `npm run test:e2e`)
- Config: `playwright.config.ts` likely exists but not configured for this project
- Run: `npm run test:e2e` and `npm run test:e2e:ui` for UI mode

## Common Patterns

**Rendering:**
```typescript
it('displays post title', () => {
  render(<BlogPostCard post={mockPost} />)
  expect(screen.getByText(mockPost.title)).toBeInTheDocument()
})
```

**User Interactions:**
```typescript
it('clicking heart icon calls onLike', async () => {
  const user = userEvent.setup()
  const onLike = vi.fn()
  render(<BlogPostCard post={mockPost} onLike={onLike} />)

  const likeButton = screen.getByRole('button', { name: /^like$/i })
  await user.click(likeButton)

  expect(onLike).toHaveBeenCalledTimes(1)
})
```

**Event Propagation:**
```typescript
it('clicking heart does not trigger onView', async () => {
  const user = userEvent.setup()
  const onLike = vi.fn()
  const onView = vi.fn()
  render(<BlogPostCard post={mockPost} onLike={onLike} onView={onView} />)

  const likeButton = screen.getByRole('button', { name: /like/i })
  await user.click(likeButton)

  expect(onLike).toHaveBeenCalled()
  expect(onView).not.toHaveBeenCalled() // onView should NOT be called
})
```

**Testing with arrays/lists:**
```typescript
it('renders all provided blog posts', () => {
  render(<BlogFeed blogPosts={mockBlogPosts} />)

  expect(screen.getByText(mockBlogPosts[0].title)).toBeInTheDocument()
  expect(screen.getByText(mockBlogPosts[1].title)).toBeInTheDocument()
})
```

**Empty states:**
```typescript
it('shows "No posts yet" heading when blogPosts is empty', () => {
  render(<BlogFeed blogPosts={[]} />)
  expect(screen.getByText('No posts yet')).toBeInTheDocument()
})
```

**Loading states:**
```typescript
it('shows loading indicator when isLoading is true', () => {
  render(<BlogFeed blogPosts={mockBlogPosts} isLoading={true} />)
  expect(screen.getByText('Loading more posts...')).toBeInTheDocument()
})
```

**Conditional rendering:**
```typescript
it('does not show empty state when posts exist', () => {
  render(<BlogFeed blogPosts={mockBlogPosts} />)
  expect(screen.queryByText('No posts yet')).not.toBeInTheDocument()
})
```

**Accessibility queries (preferred):**
```typescript
// Use getByRole when possible (accessible to assistive tech)
const likeButton = screen.getByRole('button', { name: /like/i })
const headings = screen.getAllByRole('heading', { level: 2 })

// Use getByText for content assertions
expect(screen.getByText(mockPost.title)).toBeInTheDocument()

// Use queryByText to verify something does NOT exist
expect(screen.queryByText('No posts yet')).not.toBeInTheDocument()
```

**Async Testing:**
Not yet heavily used; pattern when needed:
```typescript
it('loads comments async', async () => {
  // Mock async operation
  const user = userEvent.setup()
  render(<CommentSection postId="123" />)

  // Wait for loading to complete
  await screen.findByText('Comment loaded')

  // Verify result
  expect(screen.getByText('Comment text')).toBeInTheDocument()
})
```

## Setup and Teardown

**Setup File:** `src/test/setup.ts`
- Runs before all tests
- Sets up global mocks and cleanup handlers
- Imported automatically by Vitest config

**Cleanup:**
```typescript
afterEach(() => {
  cleanup() // React Testing Library cleanup
})
```

Cleanup removes rendered components from DOM after each test, preventing memory leaks.

---

*Testing analysis: 2025-01-25*
