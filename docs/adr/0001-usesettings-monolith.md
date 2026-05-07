# ADR 0001 — `useSettings` is a single-file module with module-local helpers

**Status:** Accepted (2026-05-07)
**Scope:** `src/hooks/useSettings.ts`

## Context

`useSettings` owns theme (light/dark/system), system-theme resolution via `matchMedia`, persistence to localStorage, legacy-key migration, and reading preferences (sort order, posts-per-page, auto-expand comments). The persistence and validation helpers (`loadThemeFromStorage`, `loadReadingFromStorage`, `saveTheme`, `saveReading`, `validateReadingSettings`) are already module-level pure functions, but they live in the same file as the hook.

An architectural pass surfaced this as a candidate for extraction into `ThemePersistence` and `SystemThemeResolver` modules. Investigation found:

- The persistence helpers are already pure and module-local; extraction would be file shuffling, not depth.
- `matchMedia('(prefers-color-scheme: dark)')` is called in 4 places — a real but tiny DRY opportunity.
- No second consumer exists for either persistence or system-theme resolution.

## Decision

`useSettings` remains a single-file module. The module-local pure helpers stay where they are. Persistence and system-theme resolution will only be extracted into separate files when a second consumer exists.

The 4-way `matchMedia` repetition is collapsed into a `prefersDarkSystem()` helper inside the same file.

Cross-tab sync via the `storage` event is included in this module — single-tab assumption rejected.

## Consequences

- Future architecture passes should not re-suggest extracting `loadThemeFromStorage` etc. without naming a concrete second consumer.
- If/when authenticated user UI introduces server-backed preferences, that effort will reshape this module from the inside; it is not a trigger to pre-split the file.
- Multi-device pref sync remains out of scope (see ADR 0003).
