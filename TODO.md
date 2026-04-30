# kbw-notes TODO

## Hibernated Features

### Login/Authentication (Hibernated)
**Status:** Disabled for the public reader app
**Reason:** `/kbw-notes` is an anonymous reading experience; write/admin surfaces are not routed
**Resume:** Will be re-implemented later

**What was changed:**
- `/` redirects to `/kbw-notes/home`
- `/kbw-notes/home`, `/kbw-notes/post/:id`, and `/kbw-notes/settings` are public
- Sign-in route, protected route wrapper, and sign-in UI were removed
- Profile, submissions, and notifications are not exposed in navigation or routing
- `editions` is anonymously readable for the folio bar
- Anonymous commenting enabled (no login required)
- Auth checks removed from comment forms
- Edge Function accepts unauthenticated requests
- Database migration `003_allow_anonymous_comments.sql` made `user_id` nullable

**To restore login requirement:**
1. Reintroduce a sign-in route and route-level auth wrapper for private surfaces
2. Restore authenticated navigation for profile/submissions/notifications only after RLS review
3. Restore auth checks in `moderate-comment` Edge Function if comments must become private
4. Update database to require `user_id` again, or keep nullable for anonymous comments

### Sign-In UI (Hibernated)
**Status:** Removed from public reader
**Reason:** Public readers should not see account controls
**Resume:** Will bring back sign-in functionality later

**What was changed:**
- Sign-in button removed from `AppShell.tsx`
- Sign-out, user menu, notifications button, and profile mobile menu entries removed
- Like/bookmark controls are hidden unless authenticated handlers are passed

**To restore sign-in UI:**
1. In `AppShell.tsx`: Restore conditional Sign In button when `!user`
2. Restore `UserMenu` rendering and notification count wiring
3. Re-add private routes to `src/router.tsx`
4. Add tests proving anonymous visitors cannot reach write/admin surfaces

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
