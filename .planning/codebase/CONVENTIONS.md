# Coding Conventions

**Analysis Date:** 2025-01-25

## Naming Patterns

**Files:**
- Components: PascalCase with .tsx extension (e.g., `BlogPostCard.tsx`, `CommentForm.tsx`)
- Hooks: camelCase prefixed with `use` (e.g., `useBlogPosts.ts`, `useComments.ts`)
- Query/utility functions: camelCase (e.g., `blog.ts`, `comments.ts`)
- Type definition files: kebab-case or matching related component (e.g., `types.ts`, `blog.ts`)
- Test files: Component name with `.test.tsx` suffix in `__tests__` directory (e.g., `src/components/blog-feed/__tests__/BlogPostCard.test.tsx`)
- Index/barrel files: `index.ts` to re-export from directories (e.g., `src/components/shell/index.ts`, `src/hooks/index.ts`)

**Functions:**
- Camel case for all functions and methods
- Hooks start with `use` prefix (enforced by ESLint rule `react-hooks/rules-of-hooks`)
- Action callbacks follow pattern `on{Action}` (e.g., `onView`, `onLike`, `onBookmark`, `onSubmit`)
- Query functions follow pattern `fetch{Resource}` or `toggle{Resource}` (e.g., `fetchBlogPosts`, `toggleLike`)
- Helper functions are camelCase and scoped to where they're needed

Example patterns from codebase:
```typescript
// Hooks
export function useBlogPosts({ limit = 6 }: UseBlogPostsOptions = {}): UseBlogPostsReturn
export function useComments(postId: string): UseCommentsResult

// Callbacks
<BlogPostCard onView={onView} onLike={onLike} onBookmark={onBookmark} onShare={onShare} />

// Query functions
export async function fetchBlogPosts(options: FetchPostsOptions): Promise<FetchPostsResult>
export async function toggleLike(postId: string, userId: string): Promise<boolean>
```

**Variables:**
- Camel case for all variables
- State variables: camelCase (e.g., `posts`, `isLoading`, `hasMore`)
- Ref names end with `Ref` (e.g., `textareaRef`, `cursorRef`, `isLoadingRef`)
- Maps/collections are plural or descriptive (e.g., `likeCountMap`, `userLikes`, `userBookmarks`)
- Boolean variables start with `is`, `has`, `can`, or `should` (e.g., `isLiked`, `hasMore`, `isEmpty`)

**Types:**
- Interfaces in PascalCase (e.g., `BlogPost`, `BlogPostCardProps`, `UseBlogPostsResult`)
- Type imports explicitly use `type` keyword (enforced by `verbatimModuleSyntax: true`)
- Props interfaces follow component name + `Props` suffix (e.g., `CommentFormProps`, `BlogFeedProps`)
- Result/return interfaces follow hook/function name + `Result` or `Return` suffix (e.g., `UseCommentsResult`, `FetchPostsResult`)
- Options/config interfaces follow function name + `Options` or `Config` suffix (e.g., `UseBlogPostsOptions`, `FetchPostsOptions`)
- Error state types are specific (e.g., `ModerationErrorState`, not generic `Error`)

## Code Style

**Formatting:**
- Uses Prettier (implicit via ESLint setup)
- 2-space indentation
- Semicolons required
- Single quotes for strings (when not in JSX)
- Trailing commas in multi-line objects/arrays

**Linting:**
- ESLint with TypeScript support (`typescript-eslint`)
- Config: `eslint.config.js` (flat config format - ESLint v9+)
- Included rules:
  - `@eslint/js` - Recommended JavaScript rules
  - `typescript-eslint` - TypeScript-specific rules
  - `react-hooks` - React hooks best practices (`rules-of-hooks`)
  - `react-refresh` - React Fast Refresh support
- Run with: `npm run lint`
- Enforced via TypeScript: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`

## Import Organization

**Order:**
1. React and external libraries (e.g., `import { useState } from 'react'`, `import { Heart } from 'lucide-react'`)
2. Type imports (e.g., `import type { BlogPost } from './types'`)
3. Local absolute imports from lib, hooks, components (e.g., `import { fetchBlogPosts } from '../lib/queries/blog'`)
4. Local relative imports (e.g., `import type { Comment } from '../components/blog-post/types'`)

**Path Aliases:**
- No path aliases configured in `tsconfig.app.json`
- All imports use relative paths

**Example from codebase:**
```typescript
// src/components/blog-feed/BlogPostCard.tsx
import type { BlogPost } from './types'
import { Heart, Bookmark, Share2, MessageCircle } from 'lucide-react'

// src/hooks/useComments.ts
import { useState, useEffect, useCallback } from 'react'
import type { Comment } from '../components/blog-post/types'
import {
  fetchCommentsForPost,
  fetchCommentById,
  deleteComment as deleteCommentQuery,
} from '../lib/queries/comments'
import { submitCommentForModeration, ModerationError } from '../lib/moderationService'
```

## Error Handling

**Patterns:**
- Custom error classes for domain-specific errors (e.g., `ModerationError` in `src/lib/moderationService.ts`)
- Error classes extend Error and set `name` property and custom fields
- Try-catch blocks in async functions, with specific error handling for known error types
- Errors converted to user-friendly messages where appropriate

**Examples:**
```typescript
// Custom error class
export class ModerationError extends Error {
  category?: string
  constructor(message: string, category?: string) {
    super(message)
    this.name = 'ModerationError'
    this.category = category
  }
}

// Error handling with type narrowing
try {
  const commentId = await submitCommentForModeration(postId, content, null)
} catch (err) {
  if (err instanceof ModerationError) {
    setModerationError({
      message: err.message,
      category: err.category
    })
  }
  throw err
}

// Generic error handling
catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load comments')
} finally {
  setIsLoading(false)
}
```

## Logging

**Framework:** `console` (browser console)

**Patterns:**
- Logged at function entry/exit for debugging
- Use prefixed messages for context: `console.log('[ModuleName] Action description', { data })`
- Error logging uses `console.error` with context
- Development-only logging acceptable for debugging async operations
- No production log aggregation configured

**Examples from codebase:**
```typescript
console.log('[useComments] addComment called', { postId, content: content.substring(0, 20) })
console.log('[useComments] Calling submitCommentForModeration...')
console.error('[moderationService] Edge Function error:', error)
```

## Comments

**When to Comment:**
- JSDoc/TSDoc for exported functions, interfaces, and complex logic
- Inline comments for non-obvious algorithmic decisions or workarounds
- Section headers for organizing logic within large functions
- Avoid stating the obvious

**JSDoc/TSDoc:**
- Used on hook functions and public API functions
- Parameter types documented when helpful
- Return types documented for clarity
- `@throws` and `@returns` tags used for important functions

**Example:**
```typescript
/**
 * Hook to manage comments for a blog post
 * Uses AI moderation via Edge Function for new comments
 * Anonymous users can comment without authentication
 */
export function useComments(postId: string): UseCommentsResult

/**
 * Submit a comment for AI moderation and insertion
 * Anonymous users can comment without authentication
 * @throws ModerationError if content is rejected
 * @throws Error for other failures
 * @returns commentId if approved
 */
export async function submitCommentForModeration(
  postId: string,
  content: string,
  parentId?: string | null
): Promise<string>
```

## Function Design

**Size:** Functions aim for single responsibility; hooks typically 50-180 lines, components 100-350 lines

**Parameters:**
- Minimal required parameters; group related options into objects
- Props interfaces for component parameters (required)
- Options objects with defaults for hook/function parameters

**Example:**
```typescript
// Hook with options object
export function useBlogPosts({ limit = 6 }: UseBlogPostsOptions = {}): UseBlogPostsReturn

// Component with props interface
export function BlogPostCard({ post, onView, onLike, onBookmark, onShare }: BlogPostCardProps)

// Query function with options
export async function fetchBlogPosts({
  limit = 6,
  cursor,
  userId,
}: FetchPostsOptions = {}): Promise<FetchPostsResult>
```

**Return Values:**
- Hooks return objects with clearly named properties (not arrays or tuples)
- Query functions return typed result objects or single values
- Async functions return Promises with explicit types

**Example:**
```typescript
// Hook return object
return {
  posts,
  isLoading: isLoading && posts.length === 0,
  hasMore,
  error,
  loadMore,
  refresh,
  updatePost,
}
```

## Module Design

**Exports:**
- Components: default export for the component, named exports for types
- Hooks: named export (no default exports)
- Utilities/queries: named exports for functions, type exports
- Barrel files: use `export * from` to re-export all from submodules

**Barrel Files:**
- Used in `src/types/index.ts`, `src/hooks/index.ts`, `src/components/*/index.ts`
- Re-export all types and components from subdirectory

**Example:**
```typescript
// src/types/index.ts - Barrel export
export * from './user'
export * from './blog'
export * from './submission'

// src/components/shell/index.ts - Barrel export
export { MainNav } from './MainNav'
export { UserMenu } from './UserMenu'
```

## Type Safety

**Strict Mode:** Enabled in tsconfig.app.json
- `strict: true` - All strict type checking enabled
- `noUnusedLocals: true` - Unused variables flagged
- `noUnusedParameters: true` - Unused parameters flagged
- `noFallthroughCasesInSwitch: true` - Switch statements must be exhaustive
- `verbatimModuleSyntax: true` - Explicit `type` keyword required for type imports

**Type Import Syntax:**
All type imports must use explicit `type` keyword:
```typescript
// Correct
import type { BlogPost } from './types'
import { Heart } from 'lucide-react'

// Not allowed
import { BlogPost } from './types' // BlogPost is a type, must use 'type' keyword
```

## Async Patterns

**Promise handling:**
- Use async/await over `.then()` chains
- useCallback wraps async functions in hooks
- Dependencies in useCallback match what's used in the function

**Example:**
```typescript
const loadMore = useCallback(async () => {
  if (isLoadingRef.current || !hasMore) return
  isLoadingRef.current = true
  setIsLoading(true)

  try {
    const result = await fetchBlogPosts({ limit, cursor, userId })
    setPosts((prev) => [...prev, ...result.posts])
  } catch (err) {
    setError(err instanceof Error ? err : new Error('Failed to load'))
  } finally {
    setIsLoading(false)
    isLoadingRef.current = false
  }
}, [limit, hasMore, userId])
```

---

*Convention analysis: 2025-01-25*
