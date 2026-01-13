# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server (Vite) at localhost:5173
npm run build        # TypeScript check + production build
npm run lint         # ESLint
npm test             # Vitest in watch mode
npm run test:run     # Single test run
npm run test:e2e     # Playwright end-to-end tests
npm run test:e2e:ui  # Playwright with UI
```

### Supabase

```bash
supabase db push     # Apply migrations to remote database
supabase functions deploy moderate-comment  # Deploy Edge Function
```

## Architecture

### Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4 (uses CSS `@theme` blocks in `src/index.css`, no tailwind.config.js)
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Testing**: Vitest + React Testing Library, Playwright (e2e)
- **Icons**: Lucide React

### Design System

- **Primary**: Violet palette (`--color-primary-*`)
- **Secondary**: Indigo palette (`--color-secondary-*`)
- **Neutral**: Slate palette
- **Fonts**: Space Grotesk (headings), Optima (body), JetBrains Mono (code)
- **Dark mode**: Class-based via `.dark` class

### Project Structure

```
src/
├── components/
│   ├── blog-feed/      # Blog listing components (BlogFeed, BlogPostCard)
│   ├── blog-post/      # Post detail + comments (BlogPostView, CommentThread, CommentForm)
│   └── shell/          # App layout (AppShell, MainNav, UserMenu)
├── hooks/              # Custom hooks (useAuth, useComments, useBlogPosts, etc.)
├── lib/
│   ├── queries/        # Supabase query functions (blog.ts, comments.ts)
│   ├── supabase.ts     # Supabase client
│   └── moderationService.ts  # Comment moderation API
├── pages/              # Route components
├── types/              # TypeScript type definitions
└── router.tsx          # React Router configuration
```

### Data Flow for Comments

1. User submits comment via `CommentForm`
2. `useComments` hook calls `moderationService.submitCommentForModeration()`
3. Request hits Supabase Edge Function `moderate-comment`
4. Edge Function uses Claude API for AI moderation
5. If approved, comment is inserted with `is_moderated: true`
6. Frontend fetches and displays the new comment

### Database Tables

- `profiles` - User profiles (extends Supabase auth.users)
- `blog_posts` - Blog content with author, tags, timestamps
- `comments` - Nested comments with `parent_id` for replies, `is_moderated` flag
- `post_likes` / `post_bookmarks` - User engagement tracking

### Hibernated Features

**Login/Authentication is temporarily disabled** for easier testing. See `TODO.md` for details on what was changed and how to restore it.

## Environment Variables

Required in `.env.local`:
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Edge Function secrets (set via Supabase dashboard):
- `ClaudeCode` - Anthropic API key for comment moderation
