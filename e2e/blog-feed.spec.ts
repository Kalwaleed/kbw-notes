// The previous contents of this file targeted a public blog feed at "/" and
// an OAuth-based /login screen. Neither exists anymore — "/" is the magic-link
// LoginPage and the feed at /kbw-notes/home requires authentication.
//
// The replacement coverage now lives in:
//   - login.spec.ts             public sign-in surface
//   - protected-routes.spec.ts  auth-required redirects
//   - security-rls.spec.ts      RLS boundary (anon key)
//
// Authenticated-flow specs (edit cap, admin-only delete/unpublish, comment
// submission via moderate-comment) are deferred — they need a seeded local
// Supabase or a session-injection fixture to avoid polluting production.

export {}
