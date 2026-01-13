# kbw-notes TODO

## Hibernated Features

### Login/Authentication (Hibernated)
**Status:** Temporarily disabled for testing ease
**Reason:** Easier to test features without repeated login/logout cycles
**Resume:** Will be re-implemented later

**What was changed:**
- Anonymous commenting enabled (no login required)
- Auth checks removed from comment forms
- Edge Function accepts unauthenticated requests
- Database migration `003_allow_anonymous_comments.sql` made `user_id` nullable

**To restore login requirement:**
1. Revert changes to `CommentForm.tsx`, `useComments.ts`, `moderationService.ts`
2. Restore auth checks in `moderate-comment` Edge Function
3. Update database to require `user_id` again (or keep nullable for anonymous option)
4. Re-add `isAuthenticated` prop flow through components

---

## Active Tasks

*(none currently)*

---

## Completed

- [x] Remove login requirement for commenting (2025-01-13)
