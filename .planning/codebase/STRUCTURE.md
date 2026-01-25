# Codebase Structure

**Analysis Date:** 2026-01-25

## Directory Layout

```
kbw-notes/
├── src/
│   ├── components/          # Reusable UI components and page layouts
│   │   ├── blog-feed/       # Blog post listing and discovery
│   │   ├── blog-post/       # Post detail view and comment thread
│   │   ├── settings/        # User settings panels (appearance, reading, account)
│   │   ├── submissions/     # User submission/article creation workflow
│   │   ├── notifications/   # Notification list view
│   │   └── shell/           # App-wide layout (header, nav, footer)
│   ├── hooks/               # Custom React hooks for business logic
│   ├── lib/                 # Data access layer
│   │   ├── queries/         # Supabase query functions (blog, comments, submissions, notifications)
│   │   ├── supabase.ts      # Supabase client initialization
│   │   ├── moderationService.ts  # Comment moderation via Edge Function
│   │   └── database.types.ts     # Auto-generated Supabase types
│   ├── pages/               # Route page components
│   ├── types/               # Shared TypeScript types
│   ├── test/                # Test setup and utilities
│   ├── router.tsx           # React Router configuration
│   ├── App.tsx              # Root app component
│   ├── main.tsx             # React DOM entry point
│   └── index.css            # Global styles with Tailwind + CSS theme variables
├── supabase/
│   ├── migrations/          # Database schema migrations (SQL)
│   ├── functions/           # Deno Edge Functions (moderate-comment, etc.)
│   └── config.toml          # Supabase CLI config
├── tests/                   # End-to-end tests (Playwright)
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite bundler config
└── index.html               # HTML entry point
```

## Directory Purposes

**`src/components/`:**
- Purpose: UI component library organized by feature domain
- Contains: React components, local component types, test files
- Key files:
  - `blog-feed/`: `BlogFeed.tsx` (listing grid), `BlogPostCard.tsx` (individual card), `types.ts` (BlogFeedProps)
  - `blog-post/`: `BlogPostView.tsx` (full post + comments), `CommentThread.tsx` (nested comments), `CommentForm.tsx` (submit comment), `types.ts` (Comment, BlogPostCommentsProps)
  - `settings/`: Settings panels for appearance (`AppearanceSettings.tsx`), reading (`ReadingSettings.tsx`), account (`AccountSettings.tsx`), privacy (`PrivacySettings.tsx`), notifications (`NotificationSettings.tsx`)
  - `shell/`: `AppShell.tsx` (page wrapper), `MainNav.tsx` (navigation menu), `UserMenu.tsx` (user dropdown)
  - `submissions/`: `SubmissionEditor.tsx`, `SubmissionsList.tsx`, `SubmissionCard.tsx`, `ImageUploader.tsx`, `TagSelector.tsx`
  - `notifications/`: `NotificationsList.tsx`, `NotificationItem.tsx`

**`src/hooks/`:**
- Purpose: Encapsulate stateful logic and data fetching
- Contains: 12 custom hooks following `use*` convention
- Key hooks:
  - `useAuth.ts`: User session state and sign out
  - `useBlogPosts.ts`: Fetch posts with infinite scroll pagination, track cursor
  - `useComments.ts`: Fetch/add/delete comments with moderation
  - `usePostEngagement.ts`: Like/bookmark toggle with optimistic updates
  - `useSettings.ts`: Read/write appearance and reading settings to localStorage
  - `useSubmissions.ts`, `useSubmission.ts`: Fetch and manage user submissions
  - `useNotifications.ts`, `useUnreadCount`: Fetch notifications and unread count
  - `useProfile.ts`: Fetch user profile and completion status
  - `useSubmissionDraft.ts`: Manage draft state for new submissions
  - `useImageUpload.ts`: Upload images to Supabase storage
  - `useTheme.ts`: Dark/light mode toggle with localStorage persistence
- Exports: Barrel export in `index.ts`

**`src/lib/`:**
- Purpose: Core data access and configuration
- Contains:
  - `supabase.ts`: Single Supabase client instance, initialized with env vars
  - `moderationService.ts`: Submit comments for AI moderation via Edge Function, custom `ModerationError` class
  - `queries/blog.ts`: `fetchBlogPosts()`, `toggleLike()`, `toggleBookmark()` with cursor pagination
  - `queries/comments.ts`: `fetchCommentsForPost()`, `fetchCommentById()`, `deleteComment()`, tree building logic
  - `queries/submissions.ts`: Fetch submissions, create/update/delete, image upload helpers
  - `queries/notifications.ts`: Fetch notifications and mark as read
  - `database.types.ts`: Auto-generated TypeScript types from Supabase schema

**`src/pages/`:**
- Purpose: Route-level components that compose hooks and components for entire pages
- Contains: 10 page components
- Key pages:
  - `HomePage.tsx`: Blog post listing with theme toggle and infinite scroll
  - `PostPage.tsx`: Single post detail with comments thread
  - `SubmissionsPage.tsx`: User's submitted articles list
  - `NewSubmissionPage.tsx`: Create new submission form
  - `SubmissionDetailPage.tsx`: View single submission (for moderators/authors)
  - `SettingsPage.tsx`: Settings UI with multiple tabs
  - `NotificationsPage.tsx`: Notification list
  - `ProfileSetupPage.tsx`: Guided profile completion (redirect from HomePage if incomplete)
  - `ProfilePage.tsx`: View user's public profile
  - `LoginPage.tsx`: Sign in (currently hibernated)
- Exports: Barrel export in `index.ts`

**`src/types/`:**
- Purpose: Shared TypeScript type definitions
- Contains:
  - `blog.ts`: `BlogPost`, `Author`, `Comment`, `Commenter` types
  - `submission.ts`: `Submission`, `SubmissionStatus` types for user-submitted articles
  - `notification.ts`: `Notification` types
  - `user.ts`: `UserProfile`, `User` types
  - `social.ts`: Social engagement types (likes, bookmarks, shares)
  - `index.ts`: Barrel export of all types
- Used by: All components and hooks

**`src/test/`:**
- Purpose: Test configuration and utilities
- Contains: `setup.ts` with Vitest/React Testing Library initialization
- Usage: Imported by `*.test.tsx` and `*.spec.ts` files

**`supabase/`:**
- Purpose: Backend configuration and Edge Functions
- Contains:
  - `migrations/`: SQL files for schema (004, 005, 006, 007) with versioning
  - `functions/`: Deno-based serverless functions (e.g., `moderate-comment/`)
  - `config.toml`: Supabase project reference and local dev settings
  - `seed.sql`: Optional sample data for development

**Root Configuration Files:**
- `package.json`: npm scripts (`npm run dev`, `npm run build`, `npm test`, `npm run test:e2e`)
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`: TypeScript configurations
- `vite.config.ts`: Vite bundler with React plugin
- `index.html`: HTML shell, loads React app at `<div id="root">`
- `.env.local`: Environment variables (Supabase URL and anon key)

## Key File Locations

**Entry Points:**
- `src/main.tsx`: Bootstrap React app by mounting to DOM
- `src/App.tsx`: Wraps RouterProvider
- `src/router.tsx`: Routes to page components (createBrowserRouter config)

**Configuration:**
- `src/lib/supabase.ts`: Supabase client (import in every query file)
- `src/index.css`: Global styles, Tailwind directives, CSS theme variables
- `.env.local`: Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

**Core Logic:**
- `src/lib/queries/blog.ts`: Blog post fetching, like/bookmark toggles
- `src/lib/queries/comments.ts`: Comment fetching and tree building
- `src/lib/moderationService.ts`: AI comment moderation integration
- `src/hooks/useComments.ts`: Hook managing comment state and submission
- `src/hooks/useBlogPosts.ts`: Hook managing infinite scroll pagination

**UI Layout:**
- `src/components/shell/AppShell.tsx`: App-wide header, nav, footer wrapper
- `src/components/blog-feed/BlogFeed.tsx`: Main blog listing with infinite scroll
- `src/components/blog-post/BlogPostView.tsx`: Post detail + comments

**Settings & Persistence:**
- `src/hooks/useSettings.ts`: Settings state management
- `src/hooks/useTheme.ts`: Theme (dark/light) toggle
- Storage keys in `localStorage`:
  - `kbw-appearance-settings`: Theme, font size, UI density
  - `kbw-reading-settings`: Post sort order, posts per page

**Testing:**
- `src/test/setup.ts`: Vitest/RTL configuration
- `src/components/blog-feed/__tests__/`: Unit tests for components
- `tests/`: Playwright e2e tests (not in src/)

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `BlogPostCard.tsx`, `CommentThread.tsx`)
- Hooks: `use*.ts` (e.g., `useBlogPosts.ts`, `useComments.ts`)
- Query modules: Lowercase plural (e.g., `comments.ts`, `submissions.ts`)
- Type files: `types.ts` (colocated in component directories)
- Tests: `*.test.tsx` or `*.spec.ts` suffix (in `__tests__/` directory)

**Directories:**
- Feature domains: kebab-case (e.g., `blog-feed`, `blog-post`, `form-fields`)
- Plural for collections: `components/`, `hooks/`, `pages/`, `types/`
- Logical grouping: `lib/queries/` for all Supabase query functions

**TypeScript Types:**
- Interface names: PascalCase, `I` prefix not used (e.g., `BlogPost`, `Comment`, `UseBlogPostsReturn`)
- Props types: `ComponentNameProps` (e.g., `BlogFeedProps`, `BlogPostCardProps`)
- Return types from hooks: `Use*Return` or `Use*Result` (e.g., `UseBlogPostsReturn`, `UseCommentsResult`)

**Functions:**
- camelCase (e.g., `fetchBlogPosts`, `toggleLike`, `submitCommentForModeration`)
- Query functions: Verb-first (e.g., `fetch*`, `delete*`, `toggle*`)
- Hooks: Always start with `use` (e.g., `useAuth`, `useBlogPosts`)

**Variables:**
- camelCase (e.g., `postId`, `isLoading`, `commentCount`)
- Constants: UPPER_SNAKE_CASE (not common in this codebase)
- Boolean properties: Prefix with `is` or `has` (e.g., `isLoading`, `isModerated`, `hasMore`)

## Where to Add New Code

**New Page/Route:**
1. Create component in `src/pages/PageNamePage.tsx`
2. Import in `src/router.tsx` and add route entry
3. If needs data fetching, create or use existing hook from `src/hooks/`
4. Compose existing components or create new ones in `src/components/`

**New Component (UI Element):**
1. Create file in `src/components/feature-name/ComponentName.tsx`
2. Create `types.ts` in same directory for component props if needed
3. Export from directory `index.ts` barrel file
4. Import in pages or other components as needed

**New Feature with Data Fetching:**
1. Create query functions in `src/lib/queries/feature-name.ts`
2. Create hook in `src/hooks/useFeatureName.ts` that:
   - Imports query functions
   - Manages state with `useState`
   - Loads data with `useEffect` and `useCallback`
   - Exports typed return object
3. Create or use existing components for UI
4. Compose in page component, pass hook data as props to components

**Moderation/Backend Processing:**
1. Create or update Deno function in `supabase/functions/function-name/`
2. Call via `supabase.functions.invoke('function-name', { body: {...} })` in `lib/` service
3. Handle errors and wrap in try-catch in hook

**Utilities/Helpers:**
- Small utility functions: `src/lib/utils.ts` (create if doesn't exist)
- API client wrappers: `src/lib/services/serviceName.ts`
- Type helpers: `src/types/index.ts` or feature-specific `src/types/feature.ts`

**Tests:**
- Unit tests for components: `src/components/feature/__tests__/Component.test.tsx`
- Hook tests: `src/hooks/__tests__/useHookName.test.ts`
- E2E tests: `tests/feature.spec.ts` (Playwright)

## Special Directories

**`src/components/shell/`:**
- Purpose: Application shell components (layout, navigation, global UI)
- Generated: No
- Committed: Yes
- Usage: Wrapped around all pages via `AppShell` component

**`src/lib/queries/`:**
- Purpose: Supabase query abstractions
- Generated: `database.types.ts` is auto-generated from Supabase schema (via `supabase gen types typescript --local`)
- Committed: Hand-written queries and generated types are committed

**`supabase/migrations/`:**
- Purpose: Database schema version control
- Generated: No (manually written SQL)
- Committed: Yes (applied via `supabase db push`)
- Naming: `NNN_description.sql` (e.g., `004_relax_comment_post_fk.sql`)

**`supabase/functions/`:**
- Purpose: Serverless backend (Deno runtime)
- Generated: No
- Committed: Yes
- Deployed: Via `supabase functions deploy function-name`
- Example: `moderate-comment/` invokes Claude API for AI moderation

**`node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes (from `package.json` and `package-lock.json`)
- Committed: No (included via lockfile)

**`dist/` or `.next/`:**
- Purpose: Build output
- Generated: Yes (from `npm run build`)
- Committed: No

---

*Structure analysis: 2026-01-25*
