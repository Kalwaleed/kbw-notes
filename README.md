# kbw-notes

Public reader app for KBW Notes. `/` redirects to `/kbw-notes/home`; the exposed app surface is the feed, public post pages, and local reader settings.

## Commands

```bash
bun install
bun run dev
bun run lint
bun run test:run
bun run build
```

## Routes

- `/` redirects to `/kbw-notes/home`
- `/kbw-notes/home` shows published posts from `submissions`
- `/kbw-notes/post/:id` shows one published post with comments
- `/kbw-notes/settings` stores local appearance and reading preferences
- `/rejected` remains for legacy invite-only auth flows

Submissions, notifications, profiles, bookmarks, likes, and admin actions are not public routes.

## Data Boundary

Published submissions and moderated comments are public reads. The folio bar reads `editions` anonymously via migration `026_public_editions_read.sql`.

Drafts, publishing, profile editing, notifications, likes/bookmarks, storage uploads, edition writes, and admin actions remain protected by existing Supabase RLS and server-side checks.

## Deployment

1. Apply Supabase migrations.
2. Build with `bun run build`.
3. Deploy the Vite output from `dist/`.
4. Roll back by reverting the app deploy and reverting `026_public_editions_read.sql` if anonymous edition reads must be closed.

What good looks like: an unauthenticated visitor lands on `/kbw-notes/home`, can open a post, comment through moderation, adjust local reader settings, and never sees sign-in, sign-out, profile, submissions, or notifications controls.
