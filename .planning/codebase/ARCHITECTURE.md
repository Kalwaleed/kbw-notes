# Architecture

**Analysis Date:** 2026-01-25

## Pattern Overview

**Overall:** Layered three-tier React application with separation between presentation (pages/components), business logic (hooks), and data access (lib/queries).

**Key Characteristics:**
- Custom React hooks encapsulate all business logic and data fetching
- Supabase as single source of truth for all backend operations
- Component-driven UI with prop-based communication
- Optimistic updates for user engagement features (likes, bookmarks)
- Moderated comments via AI (Edge Function integration)

## Layers

**Presentation Layer (Pages & Components):**
- Purpose: Render UI and handle user interaction events
- Location: `src/pages/`, `src/components/`
- Contains: Page components, reusable UI components, styled with Tailwind CSS
- Depends on: Custom hooks, router, types
- Used by: Router (App.tsx → router.tsx)
- Pattern: React Router pages call hooks and pass data to components via props

**Business Logic Layer (Custom Hooks):**
- Purpose: Manage application state, data fetching, and side effects
- Location: `src/hooks/`
- Contains: Hook implementations like `useBlogPosts`, `useComments`, `useAuth`, `useSettings`
- Depends on: Query functions (lib/queries), supabase client
- Used by: Page components exclusively
- Pattern: Each hook exports a function following `use*` naming convention, manages internal state with useState/useCallback/useEffect

**Data Access Layer (Queries & Services):**
- Purpose: Execute Supabase queries and manage API communication
- Location: `src/lib/queries/`, `src/lib/moderationService.ts`
- Contains: Direct Supabase client calls, query builders, data transformations
- Depends on: Supabase client (`lib/supabase.ts`)
- Used by: Hooks exclusively
- Pattern: Async functions that accept parameters and return transformed data, error throwing for error handling

**Configuration Layer:**
- Purpose: Environment and client setup
- Location: `src/lib/supabase.ts`, `src/index.css`
- Contains: Supabase client initialization with environment variables
- Provides: Single `supabase` client instance exported to all query functions

## Data Flow

**Blog Post Loading Flow:**

1. `HomePage` component mounts
2. `HomePage` calls `useBlogPosts()` hook which:
   - Calls `fetchBlogPosts()` from `lib/queries/blog.ts`
   - `fetchBlogPosts` executes Supabase queries for posts, likes, bookmarks, comments
   - Transforms database rows into `BlogPost` type objects
   - Returns paginated posts with `nextCursor` for infinite scroll
3. Hook state updated with posts
4. `HomePage` passes posts to `BlogFeed` component
5. `BlogFeed` renders posts via `BlogPostCard` components

**Comment Submission Flow:**

1. User submits comment via `CommentForm` component
2. `CommentForm` calls `addComment()` from `useComments` hook
3. Hook calls `submitCommentForModeration()` from `lib/moderationService.ts`
4. Service invokes Supabase Edge Function `moderate-comment` with comment content
5. Edge Function uses Claude API for AI moderation
6. If approved, comment is inserted and comment ID returned
7. Hook fetches the new comment via `fetchCommentById()` query
8. Component state updated with new comment in tree structure
9. If rejected, `ModerationError` thrown and caught, displaying reason to user

**Post Engagement Flow (Like/Bookmark):**

1. User clicks like/bookmark on `BlogPostCard`
2. `HomePage` handler calls hook's `toggleLike()` or `toggleBookmark()`
3. **Optimistic update**: Post state immediately updated in `useState`
4. Toggle function executes async Supabase query in background
5. If server response differs from optimistic state, state resynced
6. No error handling to user in happy path (silent sync)

**State Management:**

- **Local component state:** React `useState` for UI state (mobile menu, theme toggle)
- **Hook state:** useState within custom hooks for domain data (posts, comments, user settings)
- **Browser storage:** localStorage for appearance and reading settings (keys: `kbw-appearance-settings`, `kbw-reading-settings`)
- **Server state:** Supabase as source of truth; hooks fetch on mount and keep state in sync
- **Realtime:** Not currently used, but Supabase Realtime available for future like count syncing

## Key Abstractions

**BlogPost Type:**
- Purpose: Represents a published blog post with metadata and engagement counts
- Examples: `src/types/blog.ts`, `src/components/blog-feed/types.ts`
- Pattern: TypeScript interface with computed properties like `isLiked`, `isBookmarked` added by queries for current user context

**Comment Tree:**
- Purpose: Represents nested comment structure (top-level + replies)
- Examples: `src/components/blog-post/types.ts`
- Pattern: `Comment[]` with `replies: Comment[]` property; flat database rows transformed to tree in `lib/queries/comments.ts` via `buildCommentTree()`

**Query Functions:**
- Purpose: Encapsulate Supabase operations and data transformation
- Examples: `fetchBlogPosts()`, `fetchCommentsForPost()`, `toggleLike()`
- Pattern: Async functions with typed parameters and return values, throw errors on failure, perform data shape transformation

**Hook Contracts:**
- Purpose: Define what data and methods components expect from hooks
- Pattern: Named exports (e.g., `useComments`, `useBlogPosts`) that return typed objects with state properties and callback functions
- Example return types:
  ```typescript
  interface UseBlogPostsReturn {
    posts: BlogPost[]
    isLoading: boolean
    hasMore: boolean
    loadMore: () => void
    updatePost: (postId: string, updates: Partial<BlogPost>) => void
  }
  ```

## Entry Points

**Application Bootstrap (`src/main.tsx`):**
- Location: `src/main.tsx`
- Triggers: Page load
- Responsibilities: React DOM mount, render App component
- Code: `createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)`

**App Component (`src/App.tsx`):**
- Location: `src/App.tsx`
- Triggers: Bootstrap
- Responsibilities: Render RouterProvider with router configuration
- Code: Wraps router and passes to React Router

**Router Configuration (`src/router.tsx`):**
- Location: `src/router.tsx`
- Triggers: App render
- Responsibilities: Define routes and map paths to page components
- Routes: `HomePage`, `PostPage`, `LoginPage`, `ProfileSetupPage`, `SettingsPage`, `SubmissionsPage`, `NewSubmissionPage`, `SubmissionDetailPage`, `NotificationsPage`

**Page Components:**
- Location: `src/pages/*.tsx`
- Triggers: Route match
- Responsibilities: Compose hooks, manage page-level state, coordinate child components
- Pattern: Each page imports hooks and components, orchestrates data flow for that route

## Error Handling

**Strategy:** Try-catch in hooks with error state, thrown errors propagate to caller for UI display.

**Patterns:**

- **Query Errors:** `lib/queries/*` functions throw errors; hooks catch and store in state (e.g., `error: string | null`)
- **Moderation Errors:** `ModerationError` custom error type with `category` property; caught separately in hook to distinguish from network errors
- **Hook Error State:** Hooks maintain `error` state, cleared on retry; components read and display via conditional rendering
- **Unhandled Errors:** Logged to console (via `console.error` in services); no global error boundary currently
- **Network Failures:** Supabase client errors wrapped with context (e.g., "Failed to fetch posts: [error message]")

**Example Error Flow:**
```typescript
// In hook
try {
  const data = await fetchBlogPosts()
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unknown error')
}

// In component
{error && <div className="text-red-500">{error}</div>}
```

## Cross-Cutting Concerns

**Logging:**
- Approach: `console.log()` and `console.error()` for debugging; no structured logging
- Usage: Comments service logs to track moderation flow (`[moderationService]`, `[useComments]` prefixes)
- No log aggregation or persistent logs in production

**Validation:**
- Approach: TypeScript types for compile-time safety; minimal runtime validation
- Pattern: Supabase queries return typed data via auto-generated `database.types.ts`
- Comment content validated by Claude API (via Edge Function) for appropriateness, not format validation

**Authentication:**
- Approach: Supabase Auth built-in; currently hibernated for easier testing
- Provider: Supabase Auth with anonymous mode enabled for comments
- State: `useAuth()` hook manages user session, fetches via `supabase.auth.getUser()`
- Guards: Profile setup redirect in `HomePage` if user lacks profile
- Fallback: Anonymous users can comment without login; redirected to login for like/bookmark

**Theme Management:**
- Approach: localStorage + DOM class manipulation
- Implementation: `useTheme()` hook reads/writes to localStorage and applies `.dark` class to `document.documentElement`
- Coordinates with: Tailwind CSS dark mode via `dark:` prefixes

**Settings Persistence:**
- Appearance Settings: Stored in `localStorage` key `kbw-appearance-settings`, managed by `useSettings()` hook
- Reading Settings: Stored in `localStorage` key `kbw-reading-settings`
- Both applied on component mount via `useEffect`

---

*Architecture analysis: 2026-01-25*
