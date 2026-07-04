// Tests for the Deno-side reader-submission sanitizer. The helper lives under
// supabase/functions/_shared/ (it runs in the edge function), but Vitest only
// collects tests from src/**, so the test lives here and imports across.
import { describe, it, expect } from 'vitest'
import { sanitizeSubmissionText } from '../../../supabase/functions/_shared/sanitize.ts'

describe('sanitizeSubmissionText', () => {
  it('passes plain text through unchanged', () => {
    expect(sanitizeSubmissionText('A perfectly normal note about markets.')).toBe(
      'A perfectly normal note about markets.'
    )
  })

  it('removes script elements including their content', () => {
    expect(sanitizeSubmissionText('before<script>alert(1)</script>after')).toBe('beforeafter')
  })

  it('removes style elements including their content', () => {
    expect(sanitizeSubmissionText('a<style>body{display:none}</style>b')).toBe('ab')
  })

  it('strips ordinary HTML tags but keeps their text', () => {
    expect(sanitizeSubmissionText('<b>bold</b> and <i>italic</i>')).toBe('bold and italic')
  })

  it('survives nested-tag stripping bypass attempts', () => {
    // Single-pass strippers turn this into <script>alert(1)</script>.
    expect(sanitizeSubmissionText('<scr<b></b>ipt>alert(1)</scr<b></b>ipt>')).not.toContain('<')
  })

  it('escapes an unclosed tag so it cannot form markup later', () => {
    expect(sanitizeSubmissionText('<img src=x onerror=alert(1)')).toBe(
      '&lt;img src=x onerror=alert(1)'
    )
  })

  it('entity-encodes stray specials in prose', () => {
    expect(sanitizeSubmissionText('5 < 10 & "quotes" fit')).toBe(
      '5 &lt; 10 &amp; &quot;quotes&quot; fit'
    )
  })

  it('handles event-handler attributes inside tags', () => {
    expect(sanitizeSubmissionText('<div onmouseover="alert(1)">hi</div>')).toBe('hi')
  })

  it('returns empty string for tag-only input', () => {
    expect(sanitizeSubmissionText('<script src="https://evil.example/x.js"></script>')).toBe('')
  })

  it('stays fast on pathological input at the 30k zod cap', () => {
    // Guards the strip loop against quadratic blowup if the regexes change.
    const cases = [
      '<'.repeat(15000) + '>'.repeat(15000),
      '<a'.repeat(10000) + '>'.repeat(10000),
      '<scr<b></b>ipt>'.repeat(2000),
    ]
    const start = performance.now()
    for (const c of cases) sanitizeSubmissionText(c)
    expect(performance.now() - start).toBeLessThan(500)
  })
})
