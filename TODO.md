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

### Sign-In UI (Hibernated)
**Status:** Temporarily removed
**Reason:** Simplify testing; all comments display as "Anonymous"
**Resume:** Will bring back sign-in functionality later

**What was changed:**
- Sign-in button removed from `AppShell.tsx` (desktop + mobile)
- Comments display "Anonymous" with generic avatar in `CommentThread.tsx`
- "You" badge and delete button removed (no user ownership)
- Unused imports (`Trash2`, `X`, `Check`) cleaned up

**To restore sign-in UI:**
1. In `AppShell.tsx`: Restore conditional Sign In button when `!user`
2. In `CommentThread.tsx`: Restore `comment.commenter.name` and avatar display
3. In `CommentThread.tsx`: Restore "You" badge and delete button for `isOwnComment`
4. In `CommentThread.tsx`: Restore `isOwnComment` variable and `handleDelete` function

---

## Active Tasks

*(none currently)*

---

## Future Tasks

### Google OAuth Login (Future - Public Release)
- Enable Google OAuth for public access
- Keep @kbw.vc magic link as primary for internal users
- Add OAuth provider selection when both methods are available

---

## Completed

- [x] Remove sign-in UI and make all comments display as "Anonymous" (2025-01-13)
- [x] Remove login requirement for commenting (2025-01-13)
