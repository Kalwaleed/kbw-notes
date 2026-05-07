# kbw-notes Domain Context

Domain glossary. Use these terms exactly in code, docs, and conversation. If a new concept earns a name during architecture work, add it here before the PR lands.

---

## Engagement

A user's reactive interaction with a Submission or Comment. Toggleable, idempotent, atomic.

Three kinds today: **post-like**, **post-bookmark**, **comment-like**. Each is a row in its own table (`post_likes`, `post_bookmarks`, `comment_likes`) keyed by `(user_id, entity_id)` with a unique constraint that serves as the toggle's atomicity guarantee.

The `toggle_*` RPCs use `INSERT ... ON CONFLICT DO NOTHING` followed by a conditional `DELETE` to make toggles atomic per row. Concurrent toggles by the same user serialize on the unique index — no TOCTOU race, no duplicate-insert errors. The RPCs run as `SECURITY INVOKER` so existing RLS still gates writes; they only add atomicity. `auth.uid()` is read server-side, so client callers do not pass `userId`.

When a fourth engagement kind arrives, add a new RPC + a new entry in the `EngagementKind` discriminator. Do not unify into a polymorphic SQL function — strict per-kind RPCs keep the SQL reviewable and the table names statically typed.

---

## Comment lifecycle

A comment in `public.comments` exists in one of three states:

- **Pending** (`is_moderated = false`) — Edge Function queued the row when the AI moderator was unavailable (e.g., missing `ANTHROPIC_API_KEY`). Returned to the client as `202 { approved: false, pending: true }`. Awaits admin review. Not visible to readers.
- **Visible** (`is_moderated = true`) — Claude approved the content. Inserted by the `moderate-comment` Edge Function. Visible to all readers.
- **Rejected** (no row) — Claude rejected the content; the Edge Function returns `ModerationError` to the client without inserting. The comment never enters the table.

The visibility filter (`is_moderated = true` for non-admins) is enforced in RLS, not the client. `fetchVisibleCommentsForPost` returns visible comments; `fetchPendingCommentsForPost` is admin-only (RLS-gated, returns empty for non-admins).

Direct client INSERT is blocked by RLS (migration 020). All comment writes flow through the `moderate-comment` Edge Function (service role).

---

## Submission rules

A `Submission` is `'draft'` or `'published'`. Its lifecycle rules are encoded by `getSubmissionRules(submission) → SubmissionRules`:

- **`canAutoSave`** — true for drafts only. Published submissions consume the edit cap on every save, so auto-save is disabled for them.
- **`editsRemaining`** — `Infinity` for drafts, `max(0, PUBLISHED_EDIT_CAP - editCount)` for published. The cap (3) is enforced authoritatively by a Postgres BEFORE UPDATE trigger (migration 021); the TS constant is a presentation mirror tagged with the migration reference.
- **`canPublish`** — true iff status is `'draft'`.
- **`canUnpublish`** — true iff status is `'published'`.

`useSubmissionDraft` consumes a `Submission` (or its `status` + `editCount`) and resolves `autoSaveEnabled` internally via `getSubmissionRules`. Callers do not pass the auto-save flag manually.

---

## Trusted HTML

Sanitized post / preview content carries the branded type `TrustedHtml` (`string & { readonly __brand: 'TrustedHtml' }`). The brand erases at runtime so the value flows directly to React's HTML-injection boundary, but the type prevents a raw, unsanitized string from accidentally reaching that boundary.

Three named sanitizers in `src/lib/content/contentRenderer.ts`:

- `sanitizeForStorage(raw)` — applied on save (defense-in-depth). Strips user-supplied `id` attributes; the article render path re-adds them algorithmically from heading text.
- `sanitizeForArticle(raw)` — applied on render in `BlogPostView`. Allows `id` attributes (heading anchors).
- `sanitizeForPreview(raw)` — applied for the editor preview in `SubmissionDetailPage`. Same strict ruleset as storage.

`decorateAndExtractToc` consumes and returns `TrustedHtml` — its `setAttribute`/`createElement` operations preserve trust without reintroducing strings.
