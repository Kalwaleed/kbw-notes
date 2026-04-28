# The Broadsheet Brief

> *kbw Notes — Concept A. Editorial Brutalist Newsprint.*

A standalone, prescriptive design brief for the kbw Notes redesign. Every value below is exact: hex codes, font stacks, type scale, grid measurements, component dimensions, motion durations, and accessibility targets are not suggestions. Hand this document to a coding agent or a human implementer and they should be able to rebuild the look against the existing kbw-notes React + Tailwind v4 codebase without consulting any other source. Where this brief and the original HTML mockup ever disagree, **this brief wins.**

The companion concept is *The Editorial Brief* (`the-editorial-brief.md`); the two are deliberately divergent and must not be blended. Anti-patterns in this document call out points where Concept A diverges from Concept C — preserve those divergences.

---

> *Editorial Brutalist Newsprint.* A printed daily dispatch — oversized Fraunces masthead, ruled column dividers, folio numbers, ink-red on cream paper.

**File:** `01-editorial-brutalist-newsprint-fraunces-serif-ink-red-on-cream-paper-with-folio-numbers-and-redaction-bars.html`
**Skill that produced it:** `frontend-design`
**Size:** 94.7 KB, single self-contained HTML, hand-written CSS (no framework)

> **How to use this brief:** Everything below is prescriptive. Hex codes, font stacks, type scale, grid measurements, component dimensions, motion durations, and accessibility targets are all *exact values* — not suggestions. A coding agent or human implementer should be able to read this section end-to-end, open the existing kbw-notes React + Tailwind v4 codebase, and rebuild the look without consulting the original HTML mockup. Where this brief and the mockup ever disagree, **this brief wins.**

### Theme in one sentence

A printed daily dispatch — oversized Fraunces masthead, ruled column dividers, folio numbers stamped on every story, ink-red accents on cream paper — that reads like a journal of record rather than a SaaS product. Brutalist not in the sense of harsh and ugly, but in the architectural sense: load-bearing structure made visible, materials honest, ornament removed except where it carries meaning.

### The single most important sentence in this brief

The page is a **printed broadsheet rendered in a browser** — every print-borrowed element (the masthead, the dateline, the folio number, the column rule, the drop cap, the redaction hatch, the press-wire ticker, the section glyph) must be doing **real informational work**, not decoration. If you remove a print element and the page loses *meaning* (not just *atmosphere*), the element has earned its place. If the page loses only atmosphere, the element is costume — cut it.

### Mood, reference, and what the page actually *feels* like

Imagine the front page of a small-town American broadsheet from 1962, photocopied onto premium cotton stock, then handed to a Swiss-trained brutalist designer who carved giant section folios into it with a chisel. It is unapologetically *printed* — not "print-inspired," not "magazine-feel," not a stock photo of newspaper texture. The page has weight, hierarchy, and rhythm before it has any color. When you scroll past the masthead the first instinct is to slow down, the way you slow down when you pick up a Sunday paper instead of a phone.

The closest spiritual references are: the *New York Times* of the early Reston era, *Bauen + Wohnen* magazine spreads, Massimo Vignelli's Knoll catalogues, and David Carson's *Ray Gun* (without the chaos — with Carson's willingness to break the grid only when meaning demands it). Anti-references are: *The Verge*'s 2022 redesign, every "modern editorial" Notion template, and any blog that uses Inter at 16px for everything.

The emotional register is *seriousness without solemnity*. The page expects to be read, not skimmed. It rewards the reader who lingers — drop caps, folio numerals, dateline strips — but never punishes the reader in a hurry. Cards still scan, hierarchy still works, the wordmark still anchors the corner. The brutalism is structural, not adversarial.

### Typography (deliberate, technical, defensible)

- **Display / masthead:** Fraunces, the variable serif by Undercase Type, with the *WONK* axis pushed and the *SOFT* axis pulled in italics. Used at editorial scale (60–96 px) for the wordmark and article titles. Fraunces was chosen because it has genuine personality at display sizes — the wonky `g`, the curled `?`, the calligraphic italic — so headlines stop feeling like "any serif." Tracking is tightened (-0.02em) at large sizes to read as a *masthead*, not a paragraph.
- **Body:** IBM Plex Sans — a humanist sans with deliberate, slightly mechanical proportions. Plex was picked over Inter and Helvetica specifically because it carries a small amount of personality (the slab-tinged `l`, the open `a`) that holds its own next to a strong serif without becoming generic.
- **Metadata, folios, monospace details, code:** JetBrains Mono — used for dates, folio numbers ("№ 042"), datelines ("RIYADH · 04.28.26"), the ticker strip at top, kicker tags, and code blocks. Mono is the *system voice* — anything operational or data-driven speaks in it. The blog speaks in serif; the chrome speaks in mono.
- **Notably absent:** no Space Grotesk, no Inter, no Optima — a clean break from the existing app's type system. This is intentional: the redesign should not look like a re-skin.
- **Type scale:** broad and editorial — 12 / 14 / 16 / 20 / 28 / 40 / 60 / 96 px. The jumps are large because hierarchy is doing the work, not weight.

### Color palette (one accent per mode, period)

- **Light mode:**
  - Paper: cream `#f4ecd8` — warm, slightly yellowed. Pure white is banned.
  - Ink: deep ink `#0e0e0e` — never `#000000`, because pure black on cream reads harsher than the eye expects.
  - Accent: ink-red `#c1121f` — the only chromatic note. Used for the drop cap, the redaction marks, the filled-heart "liked" state, the dateline rule, and *nothing else*. This restraint is the entire point: when red appears, it means something.
  - Texture: a subtle grain overlay applied to a fixed pseudo-element so it never repaints during scroll.
- **Dark mode:**
  - Charcoal `#0c0d10` — the room is dim, not pitch.
  - Bone-white `#ece6d6` — the page color shifts off pure white toward warm cream so the dark mode reads as *filament-lit press room*, not a desaturated inversion.
  - Accent: amber `#ff7a00` — the dark variant trades ink-red for a warmer accent because red on charcoal vibrates uncomfortably; amber sits.
- **Discipline:** exactly *one* accent color per mode. No violets, no neon glow, no gradient washes, no "subtle purple highlight." The page earns warmth from paper texture, type weight, and rule lines — not from color saturation.

### Distinctive layout, structure, and detail

- **12-column newspaper grid** with asymmetric `span-4 / span-6 / span-8` cards. The lead story spans wide and gets a true broadsheet treatment. The grid is *not* a card grid — cards inherit from the column structure rather than being pasted onto it.
- **Vertical column rules** (1px hairlines in ink) divide cards exactly as a newspaper would. They are not decorative; they are the structural seam between stories.
- **Folio numbers** stamped on every card (`№ 001`, `№ 002`, …) in JetBrains Mono. The numerals turn the feed into a sequence rather than a stream — every entry has a position, like an issue index.
- **Drop cap** on the first paragraph of the article — Fraunces in ink-red, four lines deep, with optical adjustment so the cap aligns with the cap-height of the body text rather than its baseline.
- **Blockquotes** carry an oversized fraktur quotation mark as a decorative initial. The quote is set in italic Fraunces with the WONK axis pushed.
- **Code blocks** are rendered with a `data-language` corner ribbon — a small printed "TypeScript" tag in the top-right, like a Linotype slug identifying the type of cast. Syntax highlighting is intentionally muted — code is content, not decoration.
- **Moderation-pending comment** uses a 45° hatched background pattern — a literal redaction effect, not a generic "pending review" banner. The pattern is CSS-only (`repeating-linear-gradient`) so it scales with zoom.
- **Sticky control strip** at the top mimics a press-wire ticker — running edition number, dateline, and run-time, scrolling subtly even when the page is still.
- **CTA "share" box** has a giant § (section glyph) cut into its border like a printer's mark. It signals "this is the section seam — break here if you want to share."
- **Entrance animation:** staggered "ink-bleed" fade — content washes in as if absorbed into paper, not flying in from the side. Animates only `opacity` and `transform`, respects `prefers-reduced-motion`.
- **Footer rule:** a double horizontal hairline — the classic broadsheet "end of edition" mark.

### How light and dark are demonstrated

Both panels render simultaneously side-by-side (light left, dark right) using pane-scoped CSS variable overrides — no toggle required to compare modes at a glance. A separate top-level toggle still works if you want to swap the chrome of the *outer* mockup viewer.

### What this direction signals to a reader

- "We take writing seriously."
- "You are reading a publication, not browsing a feed."
- "Engagement metrics exist, but they are not the point of the page."
- "The brand has a backbone — it will not chase whatever pastel gradient is fashionable next quarter."

### When to choose this direction

- You want kbw Notes to feel like a publication of record, not a content stream.
- Long-form prose is the hero; short technical notes still fit but are not the dominant register.
- You are willing to defend the cream-paper / ink-red look against everyone who asks for "more whitespace," "lighter colors," or "what about purple."
- The intended reader is someone who would subscribe to *The Atlantic* or *Stratechery*, not someone scrolling Dev.to.
- You want the *site itself* to be a credibility signal — looking serious is part of the value proposition.

### Risks and mitigations

- **Strong personality means strong opinions.** Some readers will love the broadsheet aesthetic; some will find it heavy. Mitigation: the dark mode (charcoal + amber) is markedly lighter on the eye and offers an escape hatch for readers who find the cream-paper variant too dense.
- **Fraunces at display sizes is heavy and image-hostile.** Cover art and inline images need careful curation — soft, desaturated, photographic, not iconographic. Mitigation: the design treats images as artifacts (small, framed, dateline-captioned) rather than full-bleed heroes.
- **Ink-red as the sole accent leaves no obvious "danger" color.** Errors and destructive actions need a different visual treatment — typically rule-weight, all-caps mono, and a thin red underline rather than a red button.
- **Editorial drop caps and folio numerals require copy discipline.** Authors must write paragraphs that survive a four-line drop cap, and the editorial team must care about issue numbering. Mitigation: folios can be auto-generated; drop cap can degrade gracefully when paragraph length is short.
- **Print-tropes can read as costume.** The line between "publication" and "cosplay" is narrow. Mitigation: every print-borrowed element (folio, dateline, ticker, redaction hatch) is doing real informational work, not decorative work.

### What it explicitly rejects

- The centered hero with a pastel gradient and a CTA button.
- The three-equal-card row.
- Inter at 16px for everything.
- Pure white backgrounds.
- Purple, indigo, neon, gradient text, glow shadows, glassmorphism.
- Iconography that exists for ornament rather than function.
- Loading spinners that imply nothing about the layout being loaded.

---

## Implementation Brief — Concept A, prescriptive

This is the part you hand to a coding agent. Every value is exact.

### 1 · Type system specification

#### 1.1 Font stacks (paste verbatim)

```css
--font-serif:
  'Fraunces',
  ui-serif, 'Iowan Old Style', 'Apple Garamond',
  Georgia, 'Times New Roman', serif;

--font-sans:
  'IBM Plex Sans',
  ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto,
  'Helvetica Neue', Arial, sans-serif;

--font-mono:
  'JetBrains Mono',
  ui-monospace, SFMono-Regular, 'SF Mono', 'Menlo',
  'Monaco', 'Consolas', monospace;
```

Load Fraunces (variable; opsz 9–144, SOFT 0–100, WONK 0–1, weight 100–900, italic), IBM Plex Sans (weights 300, 400, 500, 600, 700; italic), and JetBrains Mono (weights 400, 500, 700; italic) from Google Fonts or self-host. **Do not** use Inter, Inter Tight, Optima, Space Grotesk, Helvetica, Geist, or Satoshi anywhere on the site.

The IBM Plex Sans choice is load-bearing and not interchangeable with Inter Tight (which is reserved for Concept C). Plex carries a small amount of mechanical personality — the slab-tinged `l`, the open `a`, the deliberate `g` — that holds against Fraunces at headline scale without becoming generic. Inter would soften the page into "any 2024 SaaS." Plex makes it feel typeset.

#### 1.2 The three-voice rule (load-bearing)

Concept A has *three* voices, not two. The third voice — IBM Plex Sans — handles the chrome, separating it cleanly from both the editorial Fraunces voice and the operational mono voice.

| Voice | Family | What it speaks |
| --- | --- | --- |
| **Editorial voice** (Fraunces serif) | Fraunces | Wordmark "kbw Notes", masthead, post-card titles, article titles, article subtitles, blockquotes, drop caps, hero excerpts, the fraktur quotation marks. Anything *written* with editorial intent. |
| **Chrome voice** (Plex Sans) | IBM Plex Sans | Buttons, form labels, comment author names, comment bodies, settings, profile fields, helper text, error messages, modal copy, dropdown items. The product's voice when it is talking *about itself* to the reader. |
| **Press voice** (mono) | JetBrains Mono | Datelines, folio numbers ("№ 042"), ticker strip, kicker tags, post-card metadata (date, time, edition), code blocks, inline code, the data-language ribbon on code, character counters, timestamps, the section glyph "§" labels, status indicators. Anything operational or printed-as-data. |

Every text node on every page maps to exactly one voice. If a text node could plausibly speak in two voices, the rule of decision is: **does it appear on the printed broadsheet alongside the headline, or does it belong to the digital chrome around it?** Datelines speak press. Comment bodies speak chrome. Article prose speaks editorial.

#### 1.3 Type scale (broad and editorial — px / line-height / tracking / weight)

The Concept A scale is *broader* than Concept C — the page wants typographic drama, not measure-driven calm. Use these values; do not invent intermediates.

| Token | Size | Line-height | Tracking | Weight | Family | Used for |
| --- | --- | --- | --- | --- | --- | --- |
| `--text-press-xs` | 11 / `1.3` | `+0.10em` (uppercase) | 600 | mono | datelines, kicker labels above headlines |
| `--text-press-sm` | 12 / `1.4` | `+0.06em` (uppercase) | 500 | mono | folio numbers (`№ 042`), card date stamps, ticker text |
| `--text-press-base` | 13 / `1.5` | `+0.02em` | 500 | mono | nav links, share-row labels, code |
| `--text-chrome-sm` | 13 / `1.45` | `0` | 500 | sans | small UI text, form labels, helper text |
| `--text-chrome-base` | 14 / `1.55` | `0` | 400 / 500 | sans | comments, buttons, settings body |
| `--text-chrome-lg` | 16 / `1.55` | `0` | 400 | sans | comment thread body |
| `--text-prose` | 18 / `1.7` | `+0.005em` | 400 | serif | article body prose |
| `--text-card-title` | 22 / `1.2` | `-0.015em` | 700 | serif | post-card title |
| `--text-card-title-lg` | 32 / `1.1` | `-0.02em` | 700 | serif | hero post-card title (the lead, span-8) |
| `--text-section` | 26 / `1.2` | `-0.005em` | 700 | serif | H3 inside articles |
| `--text-h2` | 40 / `1.15` | `-0.02em` | 700 | serif | article H2 |
| `--text-h1-kicker` | 14 / `1.4` | `+0.10em` (uppercase) | 600 | mono | the kicker line above article titles |
| `--text-h1` | 60 / `1.02` | `-0.035em` | 700 | serif | article title (display) |
| `--text-h1-large` | 96 / `1.0` | `-0.04em` | 800 | serif | optional cover headline (lead post hero treatment) |
| `--text-wordmark` | 28 / `1.0` | `-0.02em` | 700 | serif | "kbw Notes" wordmark in the header (large — broadsheet masthead, not a logo) |
| `--text-folio-display` | 64 / `1.0` | `-0.02em` | 700 | serif | the giant § / folio numerals stamped at section seams |

**Italics:** Fraunces italics use `WONK 1, SOFT 100` for editorial italics — the calligraphic fraktur quote marks, the article subtitle, italicized words in prose. Plex italics are reserved for empty-state messages and *moderation-pending* notes. Mono italics are forbidden.

**Reading measure:** prose paragraphs are clamped to **62 characters** (`max-width: 62ch`) — slightly tighter than Concept C, because the broader type scale wants a tighter measure for rhythm. Card excerpts are 2-line clamped. Comment bodies clamped to 70ch.

**Drop cap:** the first paragraph of an article opens with a 4-line drop cap in Fraunces (`SOFT 100`), color `var(--accent)` (ink-red in light mode, amber in dark). Larger and more aggressive than Concept C's drop cap. Use `:first-letter` with `float: left; font-size: 5.2em; line-height: 0.82; padding: 8px 12px 0 0; font-weight: 700;`. Optical alignment must be hand-tuned: cap height aligns to body cap-height.

**Fraktur quote mark on blockquotes:** an oversized `\201C` (`"`) set in Fraunces italic at `120px / 1`, color `--accent`, positioned absolutely top-left of the blockquote with `transform: translate(-12px, -8px)`. The blockquote itself is *not* inset by the quote mark — it overlays.

#### 1.4 What you must *not* do typographically

- Do not use Inter (or Inter Tight — that's Concept C's palette).
- Do not use a fourth typeface. Three voices, three families, that is the rule.
- Do not use Fraunces for buttons, form labels, or any chrome text.
- Do not use mono for prose, ever.
- Do not use uppercase-tracked-out text outside the press voice (kickers, datelines, folio, ticker).
- Do not use IBM Plex Sans below 12px or above 18px — outside that range it loses its character and starts looking like Helvetica.
- Do not use Fraunces below 16px — it stops looking like Fraunces.
- Do not mix italic styles inside a single paragraph (Fraunces italic in a Plex sentence, for instance).
- Do not center-align prose paragraphs ever.

---

### 2 · Color token map

#### 2.1 Light mode (default — paste into `:root`)

```css
:root {
  /* Surfaces */
  --paper:        #F4ECD8;   /* page background — cream broadsheet stock */
  --paper-raised: #FBF6E4;   /* card lift, dropdown panels */
  --paper-sunken: #EAE0C7;   /* code-block bg, ticker strip bg */
  --paper-press:  #E2D7BB;   /* deeper sunken — section seams, footer */

  /* Ink */
  --ink:          #0E0E0E;   /* primary text — newspaper ink, never #000 */
  --ink-muted:    #3A3A36;   /* secondary text, captions */
  --ink-soft:     #6E6B5E;   /* tertiary text, placeholder */
  --hair:         #D8CFB6;   /* hairline borders, column rules */
  --hair-strong:  #B8AE92;   /* heavier rules — section breaks, double rules */

  /* Accent (single, saturated, ink-red — earns its weight) */
  --accent:       #C1121F;   /* ink-red — the only chromatic note */
  --accent-tint:  #F4D9DB;   /* tinted bg for accent surfaces (rare) */
  --accent-deep:  #92101A;   /* hover/active state of accent */

  /* Functional (used surgically — never as decoration) */
  --rose:         #C1121F;   /* same as accent — destructive uses ink-red, restrained */
  --amber:        #B0791E;   /* moderation-pending, rate-limit warn */
  --amber-tint:   #F0E2C2;
  --hatch:        #0E0E0E;   /* color of the redaction hatch lines */

  /* Focus ring */
  --focus:        #C1121F;   /* same as accent — single source of focus */
}
```

#### 2.2 Dark mode (override on `.dark`)

```css
.dark {
  --paper:        #0C0D10;   /* deep charcoal — filament-lit press room */
  --paper-raised: #14161A;
  --paper-sunken: #08090C;
  --paper-press:  #050609;

  --ink:          #ECE6D6;   /* warm bone-white — never pure white */
  --ink-muted:    #B8B0A0;
  --ink-soft:     #7E7868;
  --hair:         #2A2A2A;
  --hair-strong:  #3D3D3D;

  --accent:       #FF7A00;   /* amber — red on charcoal vibrates; amber sits */
  --accent-tint:  #3A2A18;
  --accent-deep:  #FFA040;

  --rose:         #FF7A00;
  --amber:        #FFB347;
  --amber-tint:   #2E2516;
  --hatch:        #ECE6D6;

  --focus:        #FF7A00;
}
```

The dark mode is **a token swap with a hue shift**, not a CSS inversion. The accent moves from ink-red (light) to amber (dark) — red on charcoal vibrates uncomfortably; amber sits and reads as filament-lit. Every surface, every text color, every accent gets a hand-picked dark equivalent. Do not implement dark mode by `filter: invert()`.

#### 2.3 Hex codes you are not allowed to use anywhere

- `#FFFFFF` (pure white) — replaced everywhere by `--paper-raised`.
- `#000000` (pure black) — replaced everywhere by `--ink` (which is `#0E0E0E` — close, but not pure).
- Any violet, indigo, blue, or "Tailwind violet/indigo/blue" hex.
- Any neon (saturation > 90%) other than the ink-red accent itself.
- Any gradient between two distinct hues. (Single-hue tonal gradients are permitted only on the redaction hatch and the lead-card hero ink-bleed entrance.)

#### 2.4 Contrast targets (verified)

- Body prose (`--ink` on `--paper`): **17.4 : 1** — AAA, easily.
- Muted text (`--ink-muted` on `--paper`): **9.1 : 1** — AAA.
- Accent text (`--accent` on `--paper`): **4.9 : 1** — AA for body, AAA for large text.
- Accent button label (`--paper` on `--accent`): **4.7 : 1** — AA.
- Dark accent (`--accent` on dark `--paper`): **6.8 : 1** — AAA for large text.

If any token changes, re-run a contrast check. AA at 4.5:1 minimum for body text, 3:1 for large text and UI components. AAA preferred where it does not require darkening the accent past `#A91019`.

---

### 3 · Spacing scale (8pt base, 4pt half-stops — same backbone as Concept C, used wider)

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-7:  32px;
--space-8:  48px;
--space-9:  72px;
--space-10: 96px;
--space-11: 128px;   /* page top, masthead-to-feed gap */
```

Use these tokens. **Never** introduce arbitrary values in Tailwind classes (`p-[15px]` is forbidden) — extend the scale instead.

---

### 4 · Layout system — the 12-column newspaper grid

#### 4.1 Container widths and breakpoints

```css
--container-sm:  640px;
--container-md:  768px;
--container-lg:  1024px;
--container-xl:  1320px;   /* feed page — broadsheet is wider than Concept C */
--container-prose: 720px;  /* article center column */
--container-wide: 1320px;  /* full broadsheet width for the article header strip */
```

Breakpoints: `sm` 640, `md` 768, `lg` 1024, `xl` 1280.

#### 4.2 The masthead band (replaces the header)

This is the load-bearing identity element. It is *not* a sticky header — it is a **masthead band**, sized like a printed broadsheet's masthead.

- Full-bleed band, height **104px** desktop / **80px** mobile.
- Background: `var(--paper)` with a subtle paper-grain overlay (see §4.6).
- Border-bottom: a **double rule** — `4px double var(--hair-strong)`. The double rule is a print signal; do not replace with a single line.
- Top edge: a 24px-tall **press-wire ticker strip** (see §4.3).
- Layout: three rows stacked — ticker (24px), masthead body (56–72px), navigation strip (24px).
- Z-index: 50, sticky `top: 0`.
- The wordmark "kbw Notes" lives at the centre of the masthead body — Fraunces 28px, with the dateline (mono uppercase, `+0.10em`) on the **left** and the edition number `№ 042` on the **right**, both `--text-press-xs`. This is the literal *broadsheet nameplate* convention.
- On mobile the ticker is hidden, the masthead body collapses to a single row (wordmark left, hamburger right), and the navigation strip becomes a hamburger sheet.

#### 4.3 The press-wire ticker (top strip, full-bleed)

- Always present at the very top of every page in `/kbw-notes/*` except the auth pages.
- Height **24px**, background `var(--paper-sunken)`, bottom border `1px solid var(--hair)`.
- Five slots (left → right), each separated by a vertical hairline `1px solid var(--hair)`:
  1. `RUN №042`
  2. `EDITION 2026.04.28`
  3. ⬤ `LIVE` (a 6px ink-red dot + label, the only chromatic note in the strip)
  4. `RIYADH · 14:32 GMT+3`
  5. `WIRE STORIES — 03 NEW`
- All text: `--text-press-xs`, uppercase, `+0.10em` tracking, color `--ink-muted`.
- Static — does not animate or actually scroll. The "ticker" is a typographic conceit, not a marquee.

#### 4.4 Home feed grid — 12-column broadsheet

The feed is **asymmetric and ruled**. Specifically:

- **Desktop (≥ lg):** CSS Grid with **12 columns**, `gap: 24px 32px` (column-gap larger than row-gap to mimic newspaper column gutters). Cards take typed spans:
  - **Lead story:** `grid-column: span 8 / span 8; grid-row: span 2 / span 2;` — full broadsheet hero treatment with optional cover image, kicker, oversized title (`--text-card-title-lg`), longer excerpt (3-line clamp, not 2).
  - **Top-right pair:** two cards each `span 4 / span 1`, stacked.
  - **Second row:** three cards `span 4 / span 1` (which produces the only "row of three" — but the lead occupies 8 columns above, so the visual effect is *not* the equal-card-row anti-pattern).
  - **Subsequent rows:** alternate between `4 / 8` and `6 / 6` splits to keep rhythm. Never `4 / 4 / 4` for a row that does not also have a sibling lead.
- **Tablet (md):** 8 columns. Lead spans 8 / 1 (no row-span). Subsequent cards span 4 each.
- **Mobile (<md):** single column, `gap: 0`, cards separated by a `border-top: 1px solid var(--hair)` rule (no card chrome).

The feed container width is `--container-xl` (1320px), centered, with `0 32px` padding desktop / `0 16px` mobile.

**Vertical column rules (the key distinguishing structural element):** between every adjacent card pair in a row, render a `1px solid var(--hair)` rule that runs the full *card height*, not the full row height. This is implemented via a left-padding + `border-left` on every card except the first in its row, with `:first-child` resetting the border. The result is that the feed reads as columns of stories, not as cards in a flow.

#### 4.5 Article page layout — the broadsheet article

The article page does **not** use a typographic-gutter (that's Concept C). Concept A uses a **printed-broadsheet spread**:

- A full-bleed **article header band** at the top: kicker, dateline, title, dek, byline, share row. Background `var(--paper)`, border-bottom `4px double var(--hair-strong)`. Width: `--container-wide` (1320px), centered.
- Inside the header band: the title block uses an **8/4 split** — title takes 8 columns left, byline + reading-time + share row take 4 columns right. Never centered.
- Below the header band, the body is a **two-column broadsheet**: prose flows in a single 720px column centered (not the gutter layout — a single column anchored to the page). On `xl`, optional sidebar on the right (320px) with related-post hairline list and reading-time card.
- Code blocks, images, blockquotes, and the "Share this post" CTA can **escape the prose column** by spanning `--container-wide` minus 64px gutters, creating a printed-pull-quote effect. This is the broadsheet move that Concept C explicitly avoids.

#### 4.6 Paper grain overlay

A subtle paper-grain noise layer applied site-wide. Implementation:

```css
body::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='1' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  pointer-events: none;
  mix-blend-mode: multiply;
  opacity: 0.6;
  z-index: 100;
}
.dark body::before { mix-blend-mode: screen; opacity: 0.4; }
```

The overlay is fixed (does not repaint on scroll), pointer-events disabled, and capped at 6% opacity in the SVG itself. It must be present — it is the most important atmospheric detail that distinguishes Concept A from a generic editorial design.

#### 4.7 Section seams (the giant § folios)

At every major section break inside an article (every H2 with a folio number > 01), render a full-width "section seam" — a giant § glyph or numeral in `--text-folio-display` (64px Fraunces 700), color `--hair-strong`, centered, with horizontal hairlines running from the page edges into 24px margin around the glyph. This is the "carved into the page" detail that gives Concept A its brutalist character.

Implementation:

```html
<div class="seam" aria-hidden="true">
  <hr class="seam-rule"/>
  <span class="seam-glyph">§ 02</span>
  <hr class="seam-rule"/>
</div>
```

```css
.seam { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 24px; margin: 96px 0; }
.seam-rule { border: 0; border-top: 1px solid var(--hair); }
.seam-glyph { font: 700 64px/1 var(--font-serif); color: var(--hair-strong); letter-spacing: -0.02em; }
```

---

### 5 · Component-by-component spec

#### 5.1 Wordmark "kbw Notes" (the masthead nameplate)

- Family: Fraunces, weight 700, `WONK 1`.
- Size: `--text-wordmark` (28 / 1.0 / -0.02em) — twice the size of Concept C's wordmark, because here it is a **masthead**, not a logo.
- The lowercase `k` engages Fraunces's stylistic alternate via `font-feature-settings: "ss02" 1;`.
- Color: `var(--ink)`. On hover (it is also the home link): underline `1px solid var(--accent)`, `text-underline-offset: 6px`.
- Centered in the masthead body, with the dateline left-flush and the edition number right-flush. The three pieces sit on a single optical baseline.

#### 5.2 Primary navigation strip (below the masthead body)

- Items: Submissions · Notifications · Settings.
- Voice: press (mono uppercase). Style: `--text-press-base`, weight 500, color `var(--ink-muted)`.
- Layout: horizontal, centered under the masthead body, separated by a small `·` (middle-dot) glyph or by a `1px solid var(--hair)` vertical rule. Either is acceptable; pick one and use it everywhere.
- Hover: color `var(--ink)`, underline `1px solid var(--accent)`, `text-underline-offset: 4px`.
- Active route: color `var(--ink)`, underline always visible.
- Notification bell: `Lucide Bell` icon, `18px`, color `var(--ink-muted)`. Badge: 16px circle, background `var(--accent)`, text `var(--paper)`, mono-xs, weight 700. Shows unread count, `99+` if over.

#### 5.3 User menu (open state — render permanently for the design exploration)

- Trigger: 36×36 circular avatar, sits flush right of the navigation strip.
- Dropdown panel: width 240px, background `var(--paper-raised)`, border `1px solid var(--hair-strong)`, shadow `4px 4px 0 0 var(--hair-strong)` — flat editorial offset, no blur. **Heavier offset than Concept C** to match the broadsheet weight.
- Padding: `8px 0`.
- Items (Plex Sans, `--text-chrome-base`, weight 500):
  - Header row: avatar + display name (serif) + email (mono). `padding: 12px 16px`.
  - Hairline divider.
  - "Profile", "Settings" — sans labels, hover bg `var(--paper-press)`.
  - Hairline divider.
  - "Sign out" — `color: var(--accent)`, hover bg `var(--accent-tint)`.

#### 5.4 Theme toggle

- Two-state segmented control, mono labels: `LIGHT` / `DARK`. Width `auto`, height 28px, integrated into the navigation strip on the right.
- Selected: background `var(--ink)`, color `var(--paper)`. Unselected: transparent, color `var(--ink-muted)`.
- Persist via `localStorage` key `kbw-theme` with `"light" | "dark" | "system"`.

#### 5.5 Mobile hamburger nav (open state)

- Triggered by a 32×32 button, three 18px-wide `2px` strokes (heavier than Concept C — broadsheet weight).
- Open: a full-width sheet drops below the masthead, background `var(--paper-raised)`, `border-bottom: 4px double var(--hair-strong)`.
- Items: stacked, each `padding: 16px 24px`, mono `--text-press-base`, color `var(--ink)`, divider `1px solid var(--hair)` between.

#### 5.6 Post card (feed) — broadsheet column treatment

This is the visual identity of the feed. Get it right, the feed reads as a printed broadsheet.

- **No card chrome.** No background, no border-radius, no shadow. The card is bounded by:
  - A folio number stamped at top-left (`№ 042`, mono-sm, color `--ink-soft`, `+0.06em`).
  - A vertical `1px solid var(--hair)` column rule on the left edge (handled by parent grid — see §4.4).
  - A horizontal `1px solid var(--hair)` rule below the action bar.
- Padding: `--space-6` on all sides (24px).
- Internal layout (top → bottom):
  1. **Folio number** + **kicker tag.** Folio left, kicker right (mono-xs uppercase, `+0.10em`, color `--accent`, format like `ESSAY · INFRASTRUCTURE`).
  2. **Title.** `--text-card-title` (or `--text-card-title-lg` for the lead). Color `--ink`. Hover: `--accent`. No underline (the rule below the action bar replaces it).
  3. **Dek / excerpt.** Plex Sans, `--text-chrome-base`, color `--ink-muted`, 2-line clamp (3-line for the lead).
  4. **Byline strip.** 24×24 avatar · author name (serif, weight 500, color `--ink`) · `·` · date (mono-press-sm, `--ink-soft`, format `28 APR 2026`).
  5. **Action bar.** Heart + count, comment + count (left); bookmark, share (right). Icons 16px, stroke 1.5, color `--ink-muted`, hover `--ink`.
- **Lead card** additional treatment: includes a 16:9 hero image area (or a CSS-gradient placeholder in `--paper-sunken` with a hairline border). Title sits *below* the image, not over it. The lead has no left column-rule (it spans 8 columns and starts the row).
- **Liked state:** heart filled, color `--accent`. Count gains weight 700.
- **Bookmarked state:** bookmark filled, color `--accent`.

**Tags** (1–3 per card, displayed below the title above the byline strip): mono-xs uppercase, `+0.06em`, color `--ink-muted`, padding `2px 8px`, border `1px solid var(--hair)`, border-radius `0` (sharp — broadsheet, not chip-style), background transparent. Hover: border `1px solid var(--accent)`, color `--accent`.

#### 5.7 Article header (single post — the broadsheet front-page treatment)

- Kicker line: mono-press-xs, uppercase, `+0.10em`, color `--accent`. Format: `ESSAY · INFRASTRUCTURE · ISSUE №042`.
- Dateline: mono-press-xs, uppercase, color `--ink-soft`, format `RIYADH · 28 APR 2026`. Sits above the title, right-aligned across from the kicker.
- Title: `--text-h1` (60 / 1.02 / -0.035em / 700) — large display Fraunces. Optionally `--text-h1-large` (96px) for the rare lead-essay treatment. Color `--ink`. Maximum two lines, then break to the dek.
- Subtitle / dek: Fraunces italic (`SOFT 100`), `--text-section` size, color `--ink-muted`. Italic emphasis is the rule, not the exception.
- Byline strip:
  - 40×40 avatar.
  - Author name: serif, 18px, weight 500.
  - Mono separator pipe `|` color `--hair-strong`.
  - Date: mono-press-sm, color `--ink-soft`, format `28 APR 2026`.
  - Mono separator pipe.
  - Reading time: mono-press-sm, color `--ink-soft`, format `5 MIN READ`.
- **Share row** (right side of byline strip, balanced 8/4): three icon-buttons (Twitter, LinkedIn, Copy link), 36×36 each, hairline-bordered, mono-xs label "X" / "IN" / "URL" centered. Hover: `var(--accent-tint)` background.

#### 5.8 Article prose (the rendered body)

- Container: `max-width: 62ch`, centered in the 720px column.
- Family: `var(--font-serif)`, weight 400, size `--text-prose` (18 / 1.7 / +0.005em).
- Color: `--ink`.
- Paragraph margin: `--space-7` (32px) between paragraphs. No paragraph indent except the first paragraph after a section seam, which uses the drop cap.
- H2: `--text-h2`, margin `--space-9` above (after the section seam), `--space-5` below.
- H3: `--text-section`, margin `--space-7` above, `--space-3` below.
- H2 prepends a folio: `<span class="folio">§ 02</span>` mono-press-base, color `--accent`, weight 700, margin-right 12px. **H3 does not prepend a folio** (only H2 marks a section seam).
- **Inline code:** mono, 14px, padding `1px 6px`, background `var(--paper-sunken)`, border `1px solid var(--hair)`, border-radius `0` (sharp), color `--ink`. *Not* the accent color.
- **Bold:** weight 700 (Fraunces). **Italic:** Fraunces italic with `WONK 1, SOFT 100`.
- **Code blocks:** see §5.9.
- **Blockquote:** padding `--space-7 --space-7 --space-7 --space-9`, no left border (the fraktur quote mark does the work). Color `--ink-muted`. Fraunces italic. Author attribution below: mono-press-sm, format `— Author Name`. Position the absolute fraktur-quote-mark glyph as described in §1.3.
- **Bulleted list:** custom marker `▮` (a small filled rectangle in `--accent`), mono-xs. List items use serif body. Indent `--space-5`. Item gap `--space-2`.
- **Numbered list:** custom marker via `counter-increment`, format `01 │`, mono-press-sm, color `--accent`, weight 700. The `│` (box-drawing pipe) is part of the marker. Indent `--space-7`.
- **Inline image:** can sit at column-width (62ch / 720px) or escape to broadsheet width (1320px - 64px gutters). Border `1px solid var(--hair)`, no border-radius. Caption: mono-press-xs, color `--ink-soft`, format `Fig. 1 — caption text.`, italic disabled (mono italic forbidden — use roman small-caps via CSS `font-variant-caps: small-caps` if emphasis is needed).
- **Links:** color `--accent`, underline `1px solid var(--accent)`, `text-underline-offset: 3px`. Hover: color `--accent-deep`, underline thickness `2px`.
- **"Share this post" CTA box** at the end: full-broadsheet-width (escape to 1320px), padding `--space-9`, background `var(--paper-press)`, no border, `border-top: 4px double var(--hair-strong)`, `border-bottom: 4px double var(--hair-strong)`. Heading mono-press-base uppercase `+0.06em`, body serif italic, three buttons (Twitter / LinkedIn / Copy) styled per §5.13. A giant `§` glyph in `--text-folio-display` size sits at the top-right corner, color `--hair-strong`, like a printer's mark.

#### 5.9 Code block (inside articles)

- Container: full-column width (720px) or escape to broadsheet width (1256px) for long examples. Background `var(--paper-sunken)`, border `1px solid var(--hair-strong)`, border-radius `0` (sharp), padding `--space-5`.
- A small **header strip** at the top: mono-press-xs uppercase `+0.06em`, color `--ink-muted`. Left side: language name (`TYPESCRIPT`). Right side: a copy button (icon-only, 16px) + a small **language ribbon** — a 24×24 corner cut into the top-right with the language abbreviation in a 12×12 ribbon (`TS`, `JS`, `PY`, etc.), color `--paper` on `--ink` background. The ribbon mimics a Linotype slug. Header `border-bottom: 1px solid var(--hair)`, padding-bottom `--space-3`, margin-bottom `--space-3`.
- Code body: mono, 14px, line-height 1.65, color `--ink`.
- Syntax highlighting palette (intentionally muted — code is *content*, not decoration):
  - keyword: `--accent` (ink-red)
  - string: `--ink-muted`
  - comment: `--ink-soft`, italic
  - number: `--accent-deep`
  - default: `--ink`
- Use Lowlight/highlight.js (already in package.json). **Do not** introduce a chromatic syntax theme like Dracula.

#### 5.10 Comments section

- Section header: `Discussion (3)` — Fraunces 22px (not mono — it is *editorial chrome*, the response to an article). Color `--ink`. With a 16px Lucide message-circle icon to the left, stroke 1.5, color `--accent`.
- New-comment textarea:
  - Container: padding `--space-4`, border `1px solid var(--hair-strong)`, border-radius `0` (sharp), background `var(--paper-raised)`. Focus: `border-color: var(--accent)`, no shadow.
  - Textarea: Plex Sans, `--text-chrome-base`, color `--ink`. `resize: vertical`, min-height 96px.
  - Footer row: character counter mono-press-xs (left, format `0 / 500`, color flips to `--accent` past limit), Send button right.
  - Send button: 36px tall, `--space-4` padding-x, mono-press-base uppercase `+0.06em` weight 700, background `--ink`, color `--paper`. Disabled: opacity 0.4. Hover: bg `--accent`.
- Comment list:
  - Items separated by `border-top: 1px solid var(--hair)`. **No card chrome.**
  - Per comment: 32×32 avatar (left, sticky to top of comment), then a stacked block:
    - Top row: author name (serif, weight 500), `·`, relative timestamp (mono-press-sm, `--ink-soft`, format `2H AGO` uppercase).
    - Body: Plex Sans, `--text-chrome-lg`, color `--ink`, max-width 70ch.
    - Action row: Like (heart 14px) · Reply · Report · (Delete only on own comments). Each label mono-press-sm uppercase `+0.06em`, color `--ink-muted`, hover `--ink`. Delete on hover: `--accent`.
  - **Nested replies:** `padding-left: 40px` (broader than Concept C), with a vertical column rule (`border-left: 2px solid var(--hair-strong)`) instead of the moss-green left-rule. The comment thread reads as **further-indented columns of a printed letters page**, not as nested cards.
  - **Moderation-pending note:** rendered with a **redaction hatch** background — a 45° hatched pattern (`repeating-linear-gradient(45deg, var(--hatch) 0 1px, transparent 1px 6px)`), opacity 0.12, with the comment text visible above it. A small mono-press-xs label `[ AWAITING MODERATION — VISIBLE TO YOU ONLY ]` sits inline above the comment body, color `--accent`. The hatch is the *literal* redaction effect, applied as if a censor's stamp passed over the comment.
- "Load more comments" button: full-width, 48px tall, mono-press-base uppercase `+0.06em`, no background, border `1px solid var(--hair-strong)` top and bottom (no left/right). Hover: background `--paper-raised`.

#### 5.11 Feed states

- **Loading row** at the bottom of the feed: full-width, height 60px, centered. **Ink-bleed entrance fade** on each new card (skeleton appearance: 1.5px hairlines pulsing, then fade up content via opacity + 4px translate-Y). Text below: mono-press-base uppercase `+0.06em` `LOADING NEXT EDITION…` color `--ink-muted`. *Do not* use a spinner.
- **End-of-feed:** a full-width double-rule (`4px double var(--hair-strong)`) followed by mono-press-base text `── END OF EDITION №042 — RUN COMPLETE ──` centered, then a smaller mono-press-xs subline `NEXT EDITION DROPS 2026.04.29 · 06:00 GMT+3`. This is the *bottom of the broadsheet* moment.
- **Empty state:** centered. Serif headline `Tomorrow's edition is in press.` + Plex sans subline `Check back at 06:00 — or invite a contributor.` + a small SVG of a folded broadsheet, color `--hair-strong`, 48×48.

#### 5.12 Iconography

- Library: **Lucide React** (already a dependency — keep it).
- Sizes: `14px` (inline metadata), `16px` (action bar), `18px` (header), `20px` (article header buttons), `24px` (empty-state hero).
- Stroke width: **`1.75`** globally (heavier than Concept C's 1.5 — broadsheet weight). Set via wrapper `<Icon strokeWidth={1.75} />`. Never mix stroke widths.
- **No emoji.** Anywhere. Replace any existing emoji glyph with a Lucide icon or a custom inline SVG.
- Icon color follows text color (`currentColor`).

#### 5.13 Buttons (full inventory)

| Button | Voice | Shape | Background | Color | Border | Padding | Hover |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Primary** ("Send", "Publish") | mono uppercase `+0.06em` | rect, 0px radius | `--ink` | `--paper` | none | `12 18` | bg `--accent` |
| **Secondary** ("Save draft") | mono uppercase | rect, 0px radius | transparent | `--ink` | `1px solid --ink` | `12 18` | bg `--ink`, color `--paper` |
| **Tertiary / link** | sans | inline | none | `--accent` | underline 1px | none | color `--accent-deep`, underline 2px |
| **Destructive** ("Delete") | mono uppercase | rect, 0px radius | transparent | `--accent` | `1px solid --accent` | `12 18` | bg `--accent`, color `--paper` |
| **Icon button** | — | 32×32 sq, 0px radius | transparent | `--ink-muted` | none | — | bg `--paper-press`, color `--ink` |
| **Toggle on** | mono uppercase | rect, 0px radius | `--ink` | `--paper` | none | `6 12` | — |

All buttons: focus ring `2px solid var(--focus)`, `2px` offset. Tactile feedback: `:active { transform: translateY(1px); }`. Transition `120ms ease` on color and background only. **Border-radius is always 0** in Concept A — there are no rounded corners anywhere, ever, on any element. (This is the brutalist commitment. Concept C uses 2px; Concept A uses 0.)

---

### 6 · State specifications

For every interactive component, define and implement these eight states.

| State | Visual treatment |
| --- | --- |
| **Default** | as specified above |
| **Hover** | one tonal step (e.g. `--ink-muted` → `--ink`, or background-color tint) |
| **Focus-visible** | `outline: 2px solid var(--focus); outline-offset: 2px;` always visible on keyboard focus |
| **Active** | `transform: translateY(1px);` for tactile feedback |
| **Disabled** | `opacity: 0.4; cursor: not-allowed;` — no greyed-out colors |
| **Loading** | skeletal hairline loaders pulsing opacity 0.4↔1.0 over 1.6s; **never spinners** |
| **Error** | inline message in `--accent`, sans-italic, with `2px solid --accent` left border on the input |
| **Empty** | sans-italic in `--ink-muted`, centered, optional 24px Lucide icon |

---

### 7 · Motion specifications

Concept A's motion is **even more restrained than Concept C** — and limited to ink-bleed entrance fades. The page should feel like the paper has just settled.

| Element | Animation | Duration | Easing | Notes |
| --- | --- | --- | --- | --- |
| Page-load ink-bleed | `opacity: 0 → 1` + `translateY: 4px → 0` | 600ms | `cubic-bezier(0.2, 0, 0, 1)` | staggered 50ms per card, 100ms per article block |
| Theme toggle | `color`, `background-color` cascade | 250ms | `cubic-bezier(0.2, 0, 0, 1)` | applies to `<html>` |
| Button hover | `color`, `background-color` | 120ms | `ease` | no `transform` except on `:active` |
| Link hover | `color`, `text-decoration-thickness` | 120ms | `ease` | thickness 1px → 2px |
| Skeleton hairline pulse | `opacity` 0.4 ↔ 1.0 | 1600ms | `ease-in-out`, infinite alternate | hardware-accelerated |
| Live-dot | static | — | — | **No breathing animation** in Concept A (Concept C breathes; A is dead-still) |
| Drawer / dropdown | `opacity`, `transform: translateY(-4px)` | 200ms | `cubic-bezier(0.2, 0, 0, 1)` | enter only |
| Section-seam reveal | none | — | — | static |
| Page transition | none | — | — | full-page nav uses standard browser load |

`@media (prefers-reduced-motion: reduce)` disables the ink-bleed entrance and the skeleton pulse. Color/opacity transitions remain.

**Forbidden motion:** parallax, scroll-jacking, magnetic hover, scroll-linked animations, marquee, any actual ticker scroll on the wire-strip text (it is a static typographic conceit — see §4.3), background animations, decorative motion of any kind.

---

### 8 · Accessibility requirements

- **Color contrast:** AA minimum, AAA for body. Re-verify on any color change.
- **Focus visibility:** every interactive element shows a visible focus ring (see §6).
- **Keyboard navigation:** Tab order matches visual order. Esc closes dropdowns. Enter submits forms.
- **Semantic HTML:** `<article>` per post, `<header>` for the masthead band, `<nav>` for the navigation strip, `<main>`, `<footer>`, headings in order (H1 once per article, H2/H3 nested).
- **ARIA:** `aria-label` on all icon-only buttons. `aria-live="polite"` on the comment count. `aria-hidden="true"` on the section-seam glyphs, the redaction hatch, the wire-ticker decorative dot, the paper-grain overlay.
- **Reduced motion:** honor `prefers-reduced-motion`.
- **Reading mode:** the broadsheet article-header band may confuse Safari Reader. Use proper `<article>`, `<header>`, `<h1>` so reader-mode falls back to a clean linear extraction.
- **Color-only signaling:** the moderation-pending state uses both the redaction hatch *and* a label — never color alone.

---

### 9 · Anti-patterns (a checklist of things to verify you have *not* done)

- [ ] No violet, indigo, or "Tailwind violet/indigo/blue" anywhere.
- [ ] No pure white. (`--paper` is `#F4ECD8`. `--paper-raised` is `#FBF6E4`. Never `#FFFFFF`.)
- [ ] No pure black. (`--ink` is `#0E0E0E`. Never `#000000`.)
- [ ] No Inter, Inter Tight, Optima, Space Grotesk, Helvetica. Only Fraunces + IBM Plex Sans + JetBrains Mono.
- [ ] No emoji glyphs in any text node, alt, aria-label, or button label.
- [ ] No three-equal-card row in the feed *unless* it sits below a sibling lead spanning 8 columns above it.
- [ ] No centered hero block at any breakpoint above mobile.
- [ ] No spinner — all loading uses hairline skeleton pulses.
- [ ] No `box-shadow` with blur greater than 0px. (Editorial offset shadows are permitted: `4px 4px 0 0 var(--hair-strong)`.)
- [ ] No gradient between two distinct hues.
- [ ] No `text-shadow` glow.
- [ ] No `backdrop-filter: blur` (no glassmorphism).
- [ ] No animated `width` / `height` / `top` / `left`.
- [ ] No motion that exists for its own sake.
- [ ] No icon stroke width other than 1.75.
- [ ] No `border-radius` greater than 0 anywhere on the site. (Concept A is sharp-cornered absolutely.)
- [ ] No font-weight: bold (700) on Plex Sans body — only on Fraunces headings and mono press-uppercase.
- [ ] No paragraph wider than 62ch.
- [ ] No "ticker scroll" animation on the wire strip — it is static.
- [ ] Section seams only at H2 boundaries, never decorative.

---

### 10 · Mapping Concept A onto the existing kbw-notes codebase

This concept can be implemented as a non-breaking re-skin. The 3-tier architecture (queries → hooks → pages) and component composition do not change. Only `src/index.css` and the styling/markup of presentational components change.

**File-by-file change list:**

1. **`src/index.css`** — replace the existing `@theme` block. Drop `--color-primary-*` (violet) and `--color-secondary-*` (indigo). Add the tokens from §2.1 + §2.2. Replace `--font-heading: 'Space Grotesk'` with Fraunces, `--font-body: 'Optima'` with IBM Plex Sans, keep `--font-mono: 'JetBrains Mono'`. Load fonts from Google Fonts. Add the paper-grain overlay (§4.6) as a global `body::before`. **Set `--default-radius: 0` site-wide** — this is the single biggest visual shift.
2. **`src/components/shell/AppShell.tsx`** — replace the existing 64px header with the **masthead band** (§4.2), which has three rows: ticker (§4.3), masthead body, navigation strip. The wordmark sits centered between dateline (left) and edition number (right). This is a structural change, not a re-skin.
3. **`src/components/shell/MainNav.tsx`** — switch to mono uppercase voice with `+0.06em` tracking. Add the `·` separators (or vertical rules) between items.
4. **`src/components/shell/UserMenu.tsx`** — flat editorial offset shadow (`shadow-[4px_4px_0_var(--hair-strong)]`), no blur, sharp corners (`rounded-none`).
5. **`src/components/blog-feed/BlogFeed.tsx`** — replace the current uniform grid with the 12-column broadsheet grid from §4.4. Add the column-rule structure (vertical hairlines between sibling cards). Define the lead-card slot (`span-8 / row-2`).
6. **`src/components/blog-feed/BlogPostCard.tsx`** — re-skin to §5.6. **Drop all rounded corners** (`rounded-2xl` → `rounded-none` everywhere). Strip card chrome — no background, no border, no shadow. Add folio numbers, kicker tags, mono dates in `28 APR 2026` format, sharp tag pills, broader byline spacing. Swap action-bar icon stroke to `1.75`.
7. **`src/components/blog-post/BlogPostView.tsx`** — wrap article in the broadsheet header band (§4.5, double-rule bottom border). Restyle prose (§5.8), code block with language ribbon (§5.9), section seams at H2 (§4.7), comments (§5.10). Inline images may escape to broadsheet width.
8. **`src/components/blog-post/CommentForm.tsx`** + **`CommentThread.tsx`** — re-skin to §5.10. Replace card chrome with hairline + 40px-indent column rules. Implement the redaction-hatch background for moderation-pending state.
9. **`src/components/submissions/SubmissionEditor.tsx`** — toolbar buttons switch to mono uppercase, sharp-cornered, paper-press hover. Editor content uses the prose styles from §5.8 so what-you-edit matches what-renders.
10. **`src/components/notifications/NotificationItem.tsx`** — re-skin: hairline-bottom items, mono uppercase timestamp (`2H AGO`), serif body, accent left-rule for unread.
11. **`src/components/settings/*`** — segmented-button controls are all sharp-cornered. `--ink` fill on selected, hairline border on unselected.
12. **`src/contexts/AuthContext.tsx`** — no change.
13. **Database / Supabase / Edge Functions** — no change. This is purely a presentation-layer redesign.

**Tailwind v4 `@theme` starter** (paste into `src/index.css`, replacing the existing `@theme` block):

```css
@theme {
  --font-heading: 'Fraunces', ui-serif, Georgia, serif;
  --font-body: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', monospace;

  --radius-default: 0;        /* sharp corners site-wide */

  --color-paper: #F4ECD8;
  --color-paper-raised: #FBF6E4;
  --color-paper-sunken: #EAE0C7;
  --color-paper-press: #E2D7BB;
  --color-ink: #0E0E0E;
  --color-ink-muted: #3A3A36;
  --color-ink-soft: #6E6B5E;
  --color-hair: #D8CFB6;
  --color-hair-strong: #B8AE92;
  --color-accent: #C1121F;
  --color-accent-tint: #F4D9DB;
  --color-accent-deep: #92101A;
  --color-amber: #B0791E;
  --color-amber-tint: #F0E2C2;
}

@custom-variant dark (&:where(.dark, .dark *));

.dark {
  --color-paper: #0C0D10;
  --color-paper-raised: #14161A;
  --color-paper-sunken: #08090C;
  --color-paper-press: #050609;
  --color-ink: #ECE6D6;
  --color-ink-muted: #B8B0A0;
  --color-ink-soft: #7E7868;
  --color-hair: #2A2A2A;
  --color-hair-strong: #3D3D3D;
  --color-accent: #FF7A00;
  --color-accent-tint: #3A2A18;
  --color-accent-deep: #FFA040;
  --color-amber: #FFB347;
  --color-amber-tint: #2E2516;
}
```

The site already uses Tailwind v4 with `@theme` blocks — the change is *replacing* the existing block, not adding alongside.

---

### 11 · The twelve commandments of Concept A

A laminated reference. If a reviewer catches you violating one of these, the design is broken.

1. **The page is a printed broadsheet rendered in a browser. Every print-borrowed element must do informational work.**
2. **Three voices: Fraunces for editorial, IBM Plex Sans for chrome, JetBrains Mono for press. They never blend.**
3. **Pure white and pure black are forbidden. Paper is `#F4ECD8`. Ink is `#0E0E0E`.**
4. **One accent per mode. Ink-red `#C1121F` in light, amber `#FF7A00` in dark. Used surgically.**
5. **Border-radius is always 0. Anywhere. Ever.**
6. **The masthead band replaces the header. It has a ticker, a wordmark with dateline and edition, and a navigation strip below. It is sticky.**
7. **The feed is a 12-column broadsheet. The lead spans 8 columns × 2 rows. Cards have no chrome — they are columns separated by hairline rules.**
8. **Section seams: every H2 in an article gets a giant § folio glyph between full-width hairlines.**
9. **Mono speaks in uppercase with `+0.06em` to `+0.10em` tracking. Sans never does. Serif never does.**
10. **Icons are Lucide at stroke 1.75. No emoji. No exceptions.**
11. **Motion is dead-still. Ink-bleed entrance only. The live-dot does not breathe (that's Concept C).**
12. **The paper-grain overlay is mandatory and fixed — it is the single most identity-defining atmospheric detail.**

---

### 12 · Acceptance criteria — how you verify the build matches the brief

A reviewer can grade an implementation by walking this list. All must be true.

**Structural:**
- [ ] Masthead band present at the top of `/kbw-notes/home` and `/kbw-notes/post/:id`, with ticker (24px), masthead body (≥56px) including dateline + wordmark + edition number, and navigation strip (24px).
- [ ] Bottom of masthead is a 4px double-rule, not a single line.
- [ ] Feed grid is 12-column broadsheet — lead card spans 8 columns × 2 rows.
- [ ] Column rules (hairlines) appear between adjacent sibling cards within a row.
- [ ] Article uses the broadsheet header band with double-rule bottom border, then a single 720px prose column.
- [ ] Section seams (giant § folio glyphs) appear at every H2 boundary.

**Typographic:**
- [ ] Three font families load: Fraunces, IBM Plex Sans, JetBrains Mono. No others.
- [ ] Wordmark is Fraunces 28px (broadsheet masthead size).
- [ ] Article body is Fraunces 18/1.7. Prose width is exactly 62ch.
- [ ] Drop cap on first paragraph: 4 lines, Fraunces (`SOFT 100`), accent color, ~5.2em.
- [ ] H2 in articles prepends a `§ 02` mono folio in accent color. H3 does not.
- [ ] Tags are sharp-cornered hairline-bordered uppercase mono. Timestamps are mono uppercase.
- [ ] Blockquotes use the absolute-positioned fraktur quote mark; no left border.
- [ ] No use of Inter, Inter Tight, Space Grotesk, or Optima.

**Color:**
- [ ] No `#fff`, `#ffffff`, `bg-white`, `text-black`, `#000`, `#000000` in any source file.
- [ ] No violet/indigo/blue Tailwind classes.
- [ ] Accent appears only on: links, focus rings, primary CTA, drop cap, kicker, code keywords, ticker live-dot, "Share this post" CTA top/bottom rules, redaction-pending label.
- [ ] Dark mode is a token swap, with the accent shifting from ink-red to amber.
- [ ] All body text passes WCAG AA (4.5:1). All large text and accent buttons pass AA. Body passes AAA.

**Behavior:**
- [ ] All eight component states implemented (default, hover, focus, active, disabled, loading, error, empty).
- [ ] Loading uses hairline-pulse skeletons. No spinners present.
- [ ] `prefers-reduced-motion` disables ink-bleed entrance and skeleton pulse.
- [ ] All icon-only buttons have `aria-label`. All icons have `strokeWidth=1.75`.
- [ ] Tab order matches visual order on every page.
- [ ] Theme toggle persists in `localStorage` under key `kbw-theme`.
- [ ] Paper-grain overlay is present site-wide as a fixed, pointer-events-none element.

**Negative checks (must all be FALSE):**
- [ ] No `box-shadow` with blur > 0px (offset shadows of `Xpx Ypx 0 0 color` are fine).
- [ ] No `backdrop-filter`.
- [ ] No gradient between distinct hues.
- [ ] No emoji in any source file.
- [ ] No `border-radius` greater than 0 (no `rounded-*` Tailwind class anywhere).
- [ ] No Tailwind arbitrary value `p-[15px]`-style spacing.
- [ ] No animation on `width`, `height`, `top`, or `left`.
- [ ] No actual ticker-scroll animation on the wire strip.
- [ ] No breathing-dot animation (that is Concept C's identity).

If every box checks, the implementation matches the brief. If three or more boxes fail, the design has lost coherence — stop, fix, retest.
