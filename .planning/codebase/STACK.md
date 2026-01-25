# Technology Stack

**Analysis Date:** 2026-01-25

## Languages

**Primary:**
- TypeScript 5.9.3 - Used for all source code, provides static type checking and modern language features
- JavaScript - Used in configuration files and Node.js scripts

**Secondary:**
- SQL - Used for Supabase PostgreSQL migrations in `supabase/migrations/`
- Deno (TypeScript) - Used for Supabase Edge Functions in `supabase/functions/moderate-comment/`

## Runtime

**Environment:**
- Node.js (version not specified in package.json, typical >= 18.x)
- Browser (React 19 application runs in browsers with modern JS/DOM support)
- Deno - For serverless edge functions in Supabase

**Package Manager:**
- npm - Primary package manager
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.2.0 - Frontend UI framework with React Router 7.12.0 for client-side routing
- Vite 7.2.4 - Build tool with instant HMR for development

**Styling:**
- Tailwind CSS 4.1.18 - Utility-first CSS framework integrated via `@tailwindcss/vite` 4.1.18
- No `tailwind.config.js` file; uses CSS `@theme` blocks in `src/index.css` (Tailwind v4 approach)

**Rich Text Editor:**
- TipTap 3.17.1 - Headless rich text editor with extensions:
  - `@tiptap/extension-code-block-lowlight` - Syntax highlighting for code blocks
  - `@tiptap/extension-image` - Image support
  - `@tiptap/extension-placeholder` - Placeholder text display
  - `@tiptap/react` - React integration
  - `@tiptap/starter-kit` - Core editor extensions

**UI Components:**
- Lucide React 0.469.0 - Icon library with React components

**Testing:**
- Vitest 3.1.4 - Unit and component test runner
- React Testing Library 16.3.0 - React component testing utilities
- `@testing-library/jest-dom` 6.6.3 - DOM matchers
- `@testing-library/user-event` 14.6.1 - User interaction simulation
- `@vitest/ui` 3.1.4 - Visual test UI
- Playwright 1.50.0 - End-to-end testing framework
- MSW 2.8.4 - Mock Service Worker for API mocking in tests

**Build/Dev:**
- `@vitejs/plugin-react` 5.1.1 - Vite plugin for React with Babel/oxc support
- TypeScript compiler - `tsc -b` command for checking

**Linting & Code Quality:**
- ESLint 9.39.1 - Code linting with flat config
- `eslint-plugin-react-hooks` 7.0.1 - React hooks rules
- `eslint-plugin-react-refresh` 0.4.24 - Fast Refresh warnings
- typescript-eslint 8.46.4 - TypeScript ESLint integration
- `@eslint/js` 9.39.1 - Base ESLint rules

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.90.1 - Official Supabase client for PostgreSQL, Auth, and Edge Functions integration

**Infrastructure:**
- lowlight 3.3.0 - Syntax highlighting library for code blocks in TipTap editor
- globals 16.5.0 - Global variable definitions for ESLint
- jsdom 26.1.0 - DOM implementation for testing in Node.js
- `@types/node` 24.10.1 - TypeScript types for Node.js APIs
- `@types/react` 19.2.5 - TypeScript types for React
- `@types/react-dom` 19.2.3 - TypeScript types for React DOM

## Configuration

**Environment:**
- Vite environment variables via `import.meta.env` in frontend code
- Required environment variables in `.env.local`:
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Supabase anonymous API key
- Server-side environment variables in Supabase:
  - `ClaudeCode` - Anthropic API key for comment moderation (Edge Function secret)

**Build:**
- `vite.config.ts` - Vite configuration with React and Tailwind CSS plugins
- `tsconfig.json` - References `tsconfig.app.json` and `tsconfig.node.json`
- `vitest.config.ts` - Vitest configuration with jsdom, globals, and setup file at `./src/test/setup.ts`
- `eslint.config.js` - Flat ESLint config with TypeScript, React Hooks, and React Refresh rules

**Dev Server:**
- Vite dev server at `localhost:5173` (default Vite port)
- Supports Docker container via `allowedHosts: ['host.docker.internal']` in vite config

## Platform Requirements

**Development:**
- Node.js >= 18.x (inferred; npm required)
- npm 10.x or higher (for package management)
- Optional: Supabase CLI for local development and Edge Function deployment
- Optional: Playwright for E2E testing

**Production:**
- Deployment target: Vercel, Netlify, or any static hosting (SPA)
- Supabase backend (PostgreSQL, Auth, Edge Functions)
- Requires: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables

---

*Stack analysis: 2026-01-25*
