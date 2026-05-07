// Content sanitization for user-authored HTML.
//
// Three named sanitizers, one branded type. The brand erases at runtime so
// values flow directly to React's HTML-injection prop, but the type prevents
// raw, unsanitized strings from reaching that boundary.
//
// See CONTEXT.md "Trusted HTML" for the contract.

import DOMPurify from 'dompurify'

declare const trustedHtmlBrand: unique symbol
export type TrustedHtml = string & { readonly [trustedHtmlBrand]: true }

function brand(html: string): TrustedHtml {
  return html as TrustedHtml
}

/**
 * Sanitize on save (defense-in-depth). Strips user-supplied id attributes;
 * the article render path re-adds them algorithmically from heading text.
 */
export function sanitizeForStorage(rawHtml: string): TrustedHtml {
  return brand(DOMPurify.sanitize(rawHtml, { FORBID_ATTR: ['id'] }))
}

/**
 * Sanitize on article render. Allows id attributes so heading anchors set
 * by `decorateAndExtractToc` survive the pass.
 */
export function sanitizeForArticle(rawHtml: string): TrustedHtml {
  return brand(DOMPurify.sanitize(rawHtml, { ADD_ATTR: ['id'] }))
}

/**
 * Sanitize for the editor preview. Same strict ruleset as storage.
 */
export function sanitizeForPreview(rawHtml: string): TrustedHtml {
  return brand(DOMPurify.sanitize(rawHtml, { FORBID_ATTR: ['id'] }))
}

/**
 * Re-brand HTML produced by a transformation that operates on already-trusted
 * input via DOM APIs (setAttribute / createElement), without serializing back
 * through a string concatenation that could reintroduce risk.
 *
 * Used by `decorateAndExtractToc`. Do not use to launder raw user input.
 */
export function trustTransformedHtml(html: string): TrustedHtml {
  return brand(html)
}
