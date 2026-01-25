# Codebase Concerns

**Analysis Date:** 2025-01-25

## Tech Debt

**Authentication Hibernated:**
- Issue: Login/authentication flow is completely disabled for testing ease. Sign-in UI removed, anonymous commenting enabled, auth checks removed from comment submission pipeline.
- Files: `src/components/shell/AppShell.tsx`, `src/components/blog-post/CommentThread.tsx`, `src/components/blog-post/CommentForm.tsx`, `src/hooks/useComments.ts`, `src/lib/moderationService.ts`, `src/pages/PostPage.tsx`, `supabase/migrations/003_allow_anonymous_comments.sql`
- Impact: Application is currently unsafe for production. All users appear anonymous. Destructive operations (comment deletion) lack user ownership verification. Review/moderation of user content cannot identify problematic users.
- Fix approach: See TODO.md for restoration steps. Need to: (1) restore auth checks in `useComments` and `moderationService`, (2) restore sign-in button and user-identifying UI in `AppShell` and `CommentThread`, (3) revert database migration 003 to require `user_id`, (4) implement isOwnComment logic for edit/delete permissions.

**Excessive Console Logging in Production Code:**
- Issue: 23 instances of `console.log`, `console.error`, `console.warn`, `console.debug` across codebase. Debug logging is scattered throughout moderation pipeline (`moderationService.ts`), hooks (`useComments.ts`), and components (`CommentForm.tsx`).
- Files: `src/lib/moderationService.ts` (5 console calls), `src/hooks/useComments.ts` (3), `src/components/blog-post/CommentForm.tsx` (8), `src/pages/PostPage.tsx` (1), `src/lib/supabase.ts` (1), `src/hooks/useSettings.ts` (2), `src/components/submissions/TagSelector.tsx` (1)
- Impact: Sensitive information (user IDs, post IDs, comment content snippets) leaks to browser console. Performance impact minimal but technical debt in code quality. Harder to debug in production without proper logging infrastructure.
- Fix approach: Remove all development console.log calls. Replace critical error logging with structured logging service once error handling strategy is formalized. Keep only legitimate error.catch blocks.

**Placeholder Supabase Credentials:**
- Issue: Supabase client initialized with fallback placeholder values when environment variables missing. `src/lib/supabase.ts` uses `'https://placeholder.supabase.co'` and `'placeholder-key'` with only console.warn warning.
- Files: `src/lib/supabase.ts` (lines 6-14)
- Impact: If `.env.local` is not present, app silently fails with cryptic API errors instead of clear configuration error. Developers debugging broken Supabase calls get no immediate feedback about missing environment variables.
- Fix approach: Throw explicit error on missing env vars instead of creating client with placeholder keys. Ensure development documentation is clear about required .env.local setup.

## Known Bugs

**Moderation Error State Not Properly Cleared on Error Resolution:**
- Symptoms: After comment rejection and user correction, moderation error message may persist if user cancels form submission mid-editing without clearing error.
- Files: `src/components/blog-post/CommentForm.tsx`, `src/hooks/useComments.ts`
- Trigger: (1) Submit comment that fails moderation, (2) Start typing in form (error clears via `onClearModerationError`), (3) Delete all text or cancel submission without sending new comment
- Workaround: User can manually dismiss error via X button in alert, or submit new comment.

**Image Upload Requires Authentication But Sign-In Disabled:**
- Symptoms: Image upload fails silently with generic "Must be logged in" error when anonymous user attempts submission image upload.
- Files: `src/hooks/useImageUpload.ts` (line 31-33)
- Trigger: Anonymous user attempts to upload image in submissions editor
- Workaround: Currently not possible - authentication is hibernated. Once auth is restored, this check will work correctly.

**Missing Slug Generation for Submissions:**
- Symptoms: Submissions created with null slug. Public view links cannot be generated without slug.
- Files: `src/types/submission.ts`, `src/lib/queries/submissions.ts`
- Trigger: User creates new submission
- Workaround: None - functionality is incomplete.

## Security Considerations

**Anonymous Comments Bypass Moderation Chain:**
- Risk: While comment moderation occurs via Edge Function, there's no rate limiting or spam prevention per user. Single IP/session can post unlimited comments (though moderation may reject them).
- Files: `src/lib/moderationService.ts`, `supabase/functions/moderate-comment` (Deno Edge Function, not in src/)
- Current mitigation: AI moderation via Claude API evaluates content. Edge Function enforces `is_moderated: true` flag.
- Recommendations: (1) Implement IP-based rate limiting in Edge Function (check request IP against rate limit table), (2) Add CAPTCHA or proof-of-work for anonymous submissions once auth is restored, (3) Implement post-moderation user reputation system to flag repeat problem commenters.

**Unvalidated Image Upload URLs:**
- Risk: `useImageUpload` passes through Supabase Storage public URLs directly without HTTPS validation or content-type verification. CDN could be compromised or URLs manipulated.
- Files: `src/hooks/useImageUpload.ts` (line 74)
- Current mitigation: Supabase Storage handles HTTPS. File type validation at upload time.
- Recommendations: (1) Validate returned public URL matches expected bucket pattern, (2) Store image metadata (original filename, size, hash) for audit trail, (3) Consider CDN with image transformation/validation layer.

**No CSRF Protection on State-Changing Operations:**
- Risk: Comment deletion, submission publish/unpublish operations have no CSRF tokens or double-submit cookies.
- Files: `src/lib/queries/submissions.ts`, `src/lib/queries/comments.ts`
- Current mitigation: Supabase auth tokens required (though auth is hibernated), operations are read-only for now due to hibernation.
- Recommendations: Implement CSRF token verification once auth is restored. Use SameSite=Strict cookies for session management.

**Moderation Results Not Sanitized:**
- Risk: AI moderation rejection reasons displayed directly in UI without escaping. If Edge Function returns user-controlled text, XSS possible.
- Files: `src/components/blog-post/CommentForm.tsx` (line 130)
- Current mitigation: Rejection reason comes from Anthropic API (trusted source). React auto-escapes by default.
- Recommendations: (1) Validate moderation response schema in `moderationService`, (2) Never trust user-provided text in rejection reasons, (3) Add Content Security Policy headers.

## Performance Bottlenecks

**N+1 Query in Comment Rendering:**
- Problem: Each Comment requires separate `fetchCommentById` call after insertion. With nested replies, this multiplies queries.
- Files: `src/hooks/useComments.ts` (lines 79, 108)
- Cause: Comment is inserted via Edge Function, then re-fetched to get full record with related data. No batch loading.
- Improvement path: (1) Have Edge Function return complete comment record including nested replies, (2) Implement batch fetching if multiple comments need to be loaded, (3) Use Supabase real-time subscriptions instead of polling for comment updates.

**Inefficient Comment Tree Search:**
- Problem: `addReplyToTree` recursively traverses entire comment tree to find parent comment. With deep nesting, this is O(n) per reply.
- Files: `src/hooks/useComments.ts` (lines 112-128)
- Cause: Linear search through tree structure instead of indexed lookup.
- Improvement path: (1) Implement comment ID map for O(1) parent lookup, (2) Limit nesting depth (currently capped at 3 in `CommentThread` but no database constraint), (3) Use Supabase query with proper join for nested comments.

**LocalStorage Serialization/Deserialization on Every Settings Change:**
- Problem: `useSettings` saves entire settings object to localStorage on every single setting change. With 6+ useEffect watchers, this causes repeated JSON.stringify/parse operations.
- Files: `src/hooks/useSettings.ts` (lines 99-106)
- Cause: Independent useEffect for each setting group persists to storage. No debouncing.
- Improvement path: (1) Batch setting updates and persist once per batch, (2) Implement debounced save (300ms), (3) Use IndexedDB for larger settings objects.

## Fragile Areas

**Comment Moderation Pipeline Missing Null Checks:**
- Files: `src/lib/moderationService.ts`, `src/hooks/useComments.ts`
- Why fragile: Multiple assumptions about response structure without validation. If Edge Function returns unexpected shape, errors propagate without context.
- Safe modification: (1) Add Zod or TypeScript validation for ModerationResult response, (2) Add explicit null check before accessing `result.commentId` (line 76 has check but implicit), (3) Test Edge Function response with malformed inputs.
- Test coverage: No unit tests for `moderationService.ts`. Response validation relies on runtime error handling.

**Comment Tree State Mutations:**
- Files: `src/hooks/useComments.ts` (lines 112-128, 151-164)
- Why fragile: Helper functions create new objects but deeply nested replies may have references to old comment objects. If component re-renders during mutation, tree can become inconsistent.
- Safe modification: (1) Use immutable data structure library (Immer.js), (2) Add type guards for Comment structure, (3) Write integration tests for reply nesting up to maxDepth.
- Test coverage: `useComments` hook tested via parent component tests only, not isolated.

**Environment Variable Fallback Pattern:**
- Files: `src/lib/supabase.ts`
- Why fragile: Placeholder values allow code to run without configuration. Problems surface only when API calls fail, not at startup.
- Safe modification: (1) Validate env vars at application bootstrap time, (2) Throw error immediately if required vars missing, (3) Export bootstrap validation function to be called before React render.
- Test coverage: No test for missing environment variables scenario.

## Scaling Limits

**Anonymous Comment Moderation Without Rate Limiting:**
- Current capacity: Unlimited submissions until Edge Function quota exhausted (Anthropic API rate limits, Supabase function invocation limits).
- Limit: Single user/IP can spam comment form, exhausting Anthropic API quota ($0.04/1K tokens, default 40K tokens/minute = ~$1600/day at max tokens).
- Scaling path: (1) Implement rate limiting per IP/session (Redis-backed counter), (2) Add admin dashboard to monitor moderation costs, (3) Implement sliding-window rate limit with exponential backoff, (4) Cache common rejection patterns to avoid re-moderation.

**Comment Tree Rendering Performance with Deep Nesting:**
- Current capacity: React rendering slows when comments exceed ~100 items with 3+ levels of nesting.
- Limit: Recursive component rendering of 5+ levels deep causes React reconciliation overhead.
- Scaling path: (1) Implement pagination/virtualization for comments (100 per page), (2) Collapse deeply nested threads by default, (3) Use react-window or react-virtualized for comment lists, (4) Implement server-side comment aggregation.

**Supabase Query Performance Without Indexes:**
- Current capacity: Small dataset (< 10K comments) performs acceptably. After 50K comments, queries slow without proper indexes.
- Limit: Queries fetch all comments, then filter/sort in application. No database query optimization.
- Scaling path: (1) Add indexes on `blog_posts.id`, `comments.post_id`, `comments.parent_id`, (2) Implement cursor-based pagination, (3) Add materialized view for comment counts per post, (4) Archive old comments to separate cold storage.

## Dependencies at Risk

**Tiptap Editor Dependencies:**
- Risk: Tiptap 3.17.1 + StartKit has 15+ peer dependencies. LowLight 3.3.0 for syntax highlighting adds code-block complexity.
- Impact: Breaking changes in lowlight or @types could require version bumps across editor pipeline. Custom extensions may break.
- Migration plan: (1) Monitor Tiptap releases in security advisories, (2) Test editor updates in isolated branch before shipping, (3) Consider replacing Tiptap with simpler markdown editor (e.g., react-markdown + remark) if complexity becomes maintenance burden.

**Supabase JS Client Version Gap:**
- Risk: Using `@supabase/supabase-js` 2.90.1 (5+ minor versions behind latest). May miss security fixes.
- Impact: Auth vulnerabilities, storage API breaking changes, realtime subscription bugs.
- Migration plan: (1) Update to latest 2.x release (2.95+), (2) Test all Supabase operations (auth, storage, queries) after upgrade, (3) Set up Dependabot to auto-track Supabase updates.

**React Router 7.12.0 Early Adoption:**
- Risk: React Router v7 released November 2024. Ecosystem tooling may lag (MSW v2.8.4 just released mocking support).
- Impact: Potential bugs in route loader/action patterns. Integration tests may fail with MSW mocking.
- Migration plan: (1) Pin to 7.x minor releases to avoid breaking changes, (2) Monitor React Router issues/PRs for stability, (3) Consider staying on v6 if v7 adoption remains slow.

## Missing Critical Features

**No Slug Generation for Submissions:**
- Problem: Submissions table has `slug` column but submissions are created with NULL. No migration to generate slugs or auto-slug logic.
- Blocks: Cannot generate public URLs for submission detail pages. Publishing is orphaned.
- Files: `src/lib/queries/submissions.ts` (createSubmission doesn't generate slug), `src/types/submission.ts`

**No Reactions/Likes System:**
- Problem: Comment reaction button is hard-coded to log and do nothing. No `post_reactions` or `comment_reactions` table.
- Blocks: User engagement tracking, community interaction signals.
- Files: `src/pages/PostPage.tsx` (line 59: TODO: Implement reactions table)

**No Reports/Moderation Queue:**
- Problem: Report button is hard-coded to log and do nothing. No admin dashboard to review reported comments.
- Blocks: Community moderation, user trust & safety.
- Files: `src/pages/PostPage.tsx` (line 64: TODO: Implement reports table)

**No Pagination for Comments:**
- Problem: All comments for a post loaded at once. Load more button scaffolded but not implemented.
- Blocks: Performance degrades as post comment count grows. UX suffers with 100+ comments on one page.
- Files: `src/pages/PostPage.tsx` (line 68: TODO: Implement pagination if needed)

**No Full-Text Search:**
- Problem: No search functionality across posts or comments. No search UI.
- Blocks: Users cannot discover content by keyword.

## Test Coverage Gaps

**Comment Moderation Pipeline Untested:**
- What's not tested: `submitCommentForModeration()` function, error handling for API failures, malformed responses, rate limit errors.
- Files: `src/lib/moderationService.ts` (no test file exists)
- Risk: Moderation failures in production go unnoticed. Edge Function integration assumes correct behavior.
- Priority: **High** - Moderation is critical path for user-generated content safety.

**Settings Persistence Untested:**
- What's not tested: LocalStorage read/write failures, JSON parsing errors, missing storage key fallback, media query listener cleanup.
- Files: `src/hooks/useSettings.ts` (no unit tests)
- Risk: Settings lost if localStorage corrupted. Theme not applied if window.matchMedia unavailable (SSR edge case).
- Priority: **Medium** - User experience degradation but not data loss.

**Image Upload Error Handling Untested:**
- What's not tested: File type validation, file size validation, upload cancellation, network timeouts, Supabase auth failure.
- Files: `src/hooks/useImageUpload.ts` (no test file exists)
- Risk: Silent failures. User doesn't know why image didn't upload.
- Priority: **Medium** - Currently only used for submissions, which is hibernated feature.

**Comment Tree Manipulation Untested:**
- What's not tested: Reply insertion into nested comments, deeply nested tree corruption scenarios, circular reference prevention.
- Files: `src/hooks/useComments.ts` `addReplyToTree` helper (lines 112-128) has no isolated tests.
- Risk: Subtle state corruption with deep nesting. Tree becomes unmappable if logic breaks.
- Priority: **High** - Core UX feature, critical for comment threading.

**Blog Post Page Integration Untested:**
- What's not tested: Comment loading, moderation error display, share button URLs, back navigation.
- Files: `src/pages/PostPage.tsx` (no e2e tests in `tests/` directory)
- Risk: User-facing bugs in comment workflow go undetected.
- Priority: **High** - Main user interaction path.

---

*Concerns audit: 2025-01-25*
