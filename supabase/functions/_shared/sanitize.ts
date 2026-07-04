// Plain-text sanitizer for public intake (reader_submissions).
//
// The intake form is a plain <textarea>, so legitimate submissions contain no
// HTML. Anything tag-shaped is therefore hostile or accidental — we remove it
// at the storage boundary so the rows are inert even if a future admin UI
// renders them carelessly. Any admin/review UI MUST still route
// reader_submissions.* through src/lib/content/contentRenderer.ts
// (sanitizeForStorage/sanitizeForArticle) before any dangerouslySetInnerHTML;
// this helper is defense-in-depth, not permission to skip that.
//
// Kept dependency-free on purpose: it runs under Deno (edge function) and is
// unit-tested from Vitest (src/lib/__tests__/readerSubmissionSanitize.test.ts).

const SCRIPT_STYLE_BLOCK_RE = /<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi
const TAG_RE = /<[^>]*>/g

const ENTITY_BY_CHAR: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/**
 * Strip HTML from plain-text intake, then entity-encode what remains.
 * Stripping loops until stable so nested fragments ("<scr<b></b>ipt>") cannot
 * reassemble into tags after one pass; leftover specials (unclosed tags,
 * legitimate "5 < 10" prose) are neutralized by the encode step.
 */
export function sanitizeSubmissionText(input: string): string {
  let text = input
  let previous: string
  do {
    previous = text
    text = text.replace(SCRIPT_STYLE_BLOCK_RE, '').replace(TAG_RE, '')
  } while (text !== previous)

  return text.replace(/[&<>"']/g, (char) => ENTITY_BY_CHAR[char])
}
