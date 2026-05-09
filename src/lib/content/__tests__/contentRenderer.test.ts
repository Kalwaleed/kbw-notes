import { describe, it, expect } from 'vitest'
import {
  sanitizeForStorage,
  sanitizeForArticle,
  sanitizeForPreview,
} from '../contentRenderer'

const XSS_PAYLOADS: { name: string; html: string; mustNotInclude: string[] }[] = [
  {
    name: 'inline script tag',
    html: '<p>hi</p><script>alert(1)</script>',
    mustNotInclude: ['<script', 'alert(1)'],
  },
  {
    name: 'image with onerror handler',
    html: '<img src=x onerror="alert(1)">',
    mustNotInclude: ['onerror', 'alert(1)'],
  },
  {
    name: 'svg with onload handler',
    html: '<svg onload="alert(1)"><circle /></svg>',
    mustNotInclude: ['onload', 'alert(1)'],
  },
  {
    name: 'anchor with javascript: href',
    html: '<a href="javascript:alert(1)">click</a>',
    mustNotInclude: ['javascript:'],
  },
  {
    name: 'iframe',
    html: '<iframe src="evil.com"></iframe>',
    mustNotInclude: ['<iframe'],
  },
  {
    name: 'event handler attribute on div',
    html: '<div onclick="alert(1)">x</div>',
    mustNotInclude: ['onclick', 'alert(1)'],
  },
  {
    name: 'object embed',
    html: '<object data="evil.swf"></object>',
    mustNotInclude: ['<object'],
  },
  {
    name: 'data URI script',
    html: '<a href="data:text/html,<script>alert(1)</script>">x</a>',
    mustNotInclude: ['<script', 'alert(1)'],
  },
]

describe.each([
  ['sanitizeForStorage', sanitizeForStorage],
  ['sanitizeForArticle', sanitizeForArticle],
  ['sanitizeForPreview', sanitizeForPreview],
] as const)('%s — XSS battery', (_name, fn) => {
  it.each(XSS_PAYLOADS)(`strips $name`, ({ html, mustNotInclude }) => {
    const result = fn(html)
    for (const forbidden of mustNotInclude) {
      expect(result.toLowerCase()).not.toContain(forbidden.toLowerCase())
    }
  })

  it('preserves benign tags and text', () => {
    const result = fn('<p>Hello <strong>world</strong>.</p>')
    expect(result).toContain('<p>')
    expect(result).toContain('<strong>')
    expect(result).toContain('Hello')
    expect(result).toContain('world')
  })
})

describe('sanitizeForArticle — id attribute handling', () => {
  it('keeps id attributes (heading anchors are needed)', () => {
    const result = sanitizeForArticle('<h2 id="intro">Intro</h2>')
    expect(result).toContain('id="intro"')
  })
})

describe('sanitizeForStorage — id attribute handling', () => {
  it('strips user-supplied id attributes (article path re-adds them)', () => {
    const result = sanitizeForStorage('<h2 id="evil">x</h2>')
    expect(result).not.toContain('id="evil"')
  })
})

describe('sanitizeForPreview — id attribute handling', () => {
  it('strips user-supplied id attributes', () => {
    const result = sanitizeForPreview('<h2 id="evil">x</h2>')
    expect(result).not.toContain('id="evil"')
  })
})
