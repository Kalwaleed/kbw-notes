# The Editorial Brief

> *kbw Notes — Concept C. Newsprint Meets Terminal.*

A standalone, prescriptive design brief for the kbw Notes redesign. Every value below is exact: hex codes, font stacks, type scale, grid measurements, component dimensions, motion durations, and accessibility targets are not suggestions. Hand this document to a coding agent or a human implementer and they should be able to rebuild the look against the existing kbw-notes React + Tailwind v4 codebase without consulting any other source. Where this brief and the original HTML mockup ever disagree, **this brief wins.**

The companion concept is *The Broadsheet Brief* (`the-broadsheet-brief.md`); the two are deliberately divergent and must not be blended. Anti-patterns in this document call out points where Concept C diverges from Concept A — preserve those divergences.

---

> *Newsprint Meets Terminal.* A literary quarterly that was secretly typeset by Vim.

**File:** `02-editorial-newsprint-meets-terminal-fraunces-and-jetbrains-mono-deep-moss-green-on-warm-paper-with-ascii-rules-and-asymmetric-grid.html`
**Skill that produced it:** `design-taste-frontend` (Leonxlnx Taste Skill)
**Size:** 70.1 KB, single self-contained HTML

> **How to use this brief:** Everything below is prescriptive. Hex codes, font stacks, type scale, grid measurements, component dimensions, motion durations, and accessibility targets are all *exact values* — not suggestions. A coding agent or human implementer should be able to read this section end-to-end, open the existing kbw-notes React + Tailwind v4 codebase, and rebuild the look without consulting the original HTML mockup. Where this brief and the mockup ever disagree, **this brief wins.**

### Theme in one sentence

A literary quarterly that was secretly typeset by a terminal — Fraunces for prose, JetBrains Mono for everything operational, deep moss-green as the only accent, ASCII rules used as actual structural elements, and a typographic-gutter article layout that puts metadata in the margins rather than on top of the prose.

### The single most important sentence in this brief

The page has *exactly two voices* — a warm serif voice for **what was written** and a cool monospace voice for **what is happening** — and they never blend. If you remember nothing else from this document, remember that. Every other rule below exists to protect that two-voice system.

### Mood, reference, and what the page actually *feels* like

Picture *The Paris Review* if its production team migrated to Vim and refused to give up the warm paper stock. Or imagine *Granta* and a Linux terminal collaborated on a single magazine — the prose is set with literary care, but the chrome around it speaks in monospace and ASCII because the editors are also engineers and they refuse to pretend otherwise. The page is more restrained than mockup 01 — less broadsheet, more literary journal — but with a clear mechanical/technical undertone that makes it unmistakably *for technical readers* without resorting to dashboard tropes, neon, or any of the visual clichés of "developer tools."

The closest spiritual references are: *McSweeney's* websites circa 2008 (typographically literate, slightly playful), the original *Edge* magazine's article spreads, the *Distill.pub* research-paper aesthetic (typographic gutter with margin notes), and the early static-site generator era when programmers cared about Tufte. Anti-references are: every Vercel landing page from 2023, every "AI-native" purple-and-teal SaaS dashboard, and every product that uses a code-block-with-cursor as decoration in its hero section.

The emotional register is *quiet competence*. The page does not raise its voice. It does not animate to attract attention. It assumes the reader has chosen to be there and is going to stay. The single moss-green accent is the design equivalent of a person who speaks softly and is therefore listened to. When something on the page becomes important — an active link, a "send" button, a filled bookmark — it earns attention through *placement and type*, with the green appearing only as a final confirmation that the eye should land there.

### Typography (a two-voice system: serif for prose, mono for system)

The single most important typographic decision is that the page has *exactly two voices*, and they never blend.

- **Display / serif:** Fraunces — used dense and tracked tight for headlines, drop caps, and editorial accents. Italic words land like emphasis in a printed essay (calligraphic, hand-set feel) rather than digital italics.
- **UI / body sans:** Inter Tight — explicitly *not* Inter. The Taste Skill bans Inter as the default "premium" cliché; Inter Tight is the same designer's tighter cut and reads as more deliberate. Used for body in the chrome (cards, comments, buttons), and for any short UI text.
- **Mono / metadata / chrome:** JetBrains Mono — used heavily, not just for code. Tags, timestamps, folio bars, breathing-dot status indicators, the entire navigation row, the comment-character counter, and the "Discussion (3)" header all speak in mono. The mono voice is the *system voice* — it is anything the page is doing *to* you or *for* you, as opposed to anything an author wrote.
- **The two-voice rule:** the warm serif handles *what was written*; the cool mono handles *what is happening*. They never cross. The blog title is serif; the timestamp is mono. The article body is serif; the share button is mono. The comment author's prose is sans; the "2h ago" timestamp is mono. This separation gives the page its distinctive "literary + technical" character without either side fighting the other.
- **Type scale:** narrower and more measured than mockup 01 — 12 / 13 / 14 / 16 / 20 / 32 / 56 px. The jumps are smaller because the design relies on *measure, leading, and color* for hierarchy, not on size alone.

### Color palette (warm paper, no pure black, single desaturated accent)

- **Paper:** `#F4F0E6` — a warm, desaturated cream. Not pure white. Not gray-white. This is the single most important decision in the design and everything else flows from it. Pure white was rejected because it makes the moss-green accent look harsh; the warm cream pulls the green into harmony.
- **Ink:** `#14160F` — never pure black. Pure black is *explicitly banned* by the Taste Skill, and for good reason: pure black on cream reads as digital rather than printed.
- **Accent: deep moss green `#3F5B3A`** — desaturated below 80 %, used for links, the brand mark, the "send" CTA, the breathing live-dot, focus rings, and the article's drop cap. Selected specifically to *not* be violet, indigo, electric blue, or any LLM-favorite "AI" color. Moss green carries connotations of *patina, library leather, hand-bound journals* — it lands on the page as if the ink had aged into it.
- **Danger / liked:** dusty rose, used surgically — only on the filled-heart "liked" state and on destructive affordances (Delete). Rose pairs with moss without competing.
- **Hairlines and rules:** very low-contrast cream-on-cream (`#E8E2D2`) — borders are visible but never assertive.
- **Dark mode:** a full token swap, not a CSS inversion. Paper deepens to a charcoal that retains warmth (a touch of green underneath); the moss accent saturates slightly so it survives on the darker background; ink shifts to a warm bone-white. The dark mode reads as *the same magazine, lit by a single warm lamp* — not a separate design.

### Distinctive layout, structure, and detail

- **Asymmetric three-column feed grid** with one hero card spanning two rows. There is *no row of three equal cards* anywhere on the page — the Taste Skill explicitly rejects that pattern as the LLM-statistical-mean of all blog feeds. The asymmetry forces hierarchy: one story is bigger, others orbit it.
- **Article body uses a `1fr 720px 1fr` typographic gutter** — a centered prose column at a strict 65-character measure, with a table-of-contents in the left margin and small metadata cards (reading time, share, related links) in the right margin. This is the *Distill.pub / Tufte* layout, not the *Medium* layout. Margin notes do not interrupt reading flow but are immediately available.
- **Title block** uses a 2.4fr / 1fr split — the title takes the wide column, the byline and reading-time take the narrow one. *Never centered.* (Centered hero blocks are banned at variance ≥ 5.)
- **ASCII rules** between sections — actual `────────────────` glyphs rendered in mono — used as structural separators, not decoration. They are the digital equivalent of the typographer's printer's-fleuron.
- **Folio bar** runs across the top with the run number, edition date, and a breathing green dot indicating "live." The folio bar is in mono and reads as system chrome — clearly not part of the article.
- **Drop cap** on the article's first paragraph in moss green, four lines deep, with the optical alignment a careful typographer would do.
- **Skeleton shimmer + breathing dot** are the *only* motion on the page. Both are perpetual but isolated, GPU-cheap (transform/opacity only), and respect `prefers-reduced-motion`. There is no scroll-jacked animation, no parallax, no magnetic hover physics. The page is calm.
- **Materiality:** cards are mostly avoided in favor of `border-t`, `divide-y`, and negative space. Where elevation *is* used (the share CTA, the user dropdown), shadows are flat editorial offsets — `6px 6px 0 var(--hair)` — not glow, not blur. The shadow is a print-style offset, not a digital lift.
- **Paper grain** is applied to a fixed `pointer-events: none` overlay so it is consistent across the viewport and never repaints during scroll. The grain is subtle — present on inspection, invisible at a glance.
- **Anti-emoji discipline:** every icon on the page is inline SVG. Zero emoji glyphs. The Taste Skill bans emojis, and the discipline pays off: the page has a consistent stroke weight, a consistent visual register, and no "OS-rendered emoji" rendering inconsistencies between Mac, Windows, and mobile.
- **Comment thread** uses indentation + a left-rule border (the moss green) instead of cards. Replies feel like nested conversation in a journal, not stacked tiles in a feed.

### Content discipline (the placeholder data is part of the design)

The placeholder content was treated as part of the design, not as filler. Author names like *Rania Al-Mutairi*, *Ezra Hahn-Iyer*, *Chiamaka Verraz*, *Jovan Demidov* — there is no "John Doe," no "Acme Corp." Numbers are organic and specific (97.3 %, 31.4 %, 9 800 jobs/sec, P99 110 ms) rather than rounded marketing figures. Article excerpts read as actual technical writing, not lorem ipsum. This matters because the design is *defined by its content density* — the layout breathes only because the content fills it correctly. Stub content collapses the design.

### How light and dark are demonstrated

Working JavaScript toggle with `localStorage` persistence; full token swap on toggle (not a single-class flip). A labeled phone vignette in the corner shows the open hamburger nav state, so reviewers don't have to imagine the mobile layout in their head.

### What this direction signals to a reader

- "We are technical — but we read."
- "You will not be sold to on this page."
- "The system voice and the author voice are different, and we respect both."
- "This brand will still look good in five years, because nothing on the page is fashionable."
- "We trust you to slow down."

### When to choose this direction

- You want kbw Notes to feel literary *and* technical — a publication that respects both prose and code without making either feel out of place.
- You want to avoid every visual cliché of "developer tools" — no terminal-with-cursor decoration, no purple gradient, no neon — without ditching the developer voice.
- You want a brand that other people *can't easily clone*. Moss green on warm paper with a strict serif/mono two-voice system is a rare, ownable combination — most teams pick a more obvious accent (blue, purple, teal, orange) and a single typeface family.
- The intended reader is someone who reads *Increment* magazine, *Stratechery*, or *Defragmented*, and who would appreciate that the design quietly does what those publications do.
- You expect the platform to mix essays, technical write-ups, and operating notes — and you need a design that handles all three without favoring one.

### Risks and mitigations

- **Restrained palette means UI states need careful, type-driven treatment.** With only one accent (moss green) and one warning color (rose), states like "loading," "error," "success," "disabled," "warning" must be communicated through type, weight, and rule color rather than chromatic differentiation. Mitigation: the design uses *italic mono*, *hairline rules in different weights*, and *opacity steps* to disambiguate states. It works but requires more design discipline than a multi-color system.
- **Mixed serif + mono is unusual.** Some readers may find Fraunces body copy too literary for short technical posts, especially "release notes" or "changelog" entries. Mitigation: the design supports a "tech note" content type that flips the body voice from Fraunces to Inter Tight — the chrome and headings stay constant, but the prose becomes more functional. This is a planned future variant, not implemented in the mockup.
- **Asymmetric grid is harder to author content into than a uniform card grid.** Editorial discipline matters: you need at least one "lead" piece per refresh, and authors need to provide a hero image or a clear hero excerpt for the lead slot. Mitigation: fall back to a balanced two-column grid when there is no clear lead.
- **The literary register can read as pretentious.** "Quiet competence" is a fine line away from "trying too hard to look serious." Mitigation: the placeholder content was written deliberately to avoid this — specific, technical, occasionally wry. The voice of the writing itself prevents the design from over-rotating.
- **Moss green is a less-tested accent in product UI.** Most accessibility tooling assumes blue/purple/red. Mitigation: the chosen `#3F5B3A` against `#F4F0E6` clears WCAG AA at 4.5:1 for body text; AAA for large text. Verified.
- **Paper grain and warm cream backgrounds can render unevenly on poorly-calibrated monitors.** Mitigation: the grain is subtle enough that uncalibrated displays will render the page as "warm cream" rather than "uneven." Tested.

### What it explicitly rejects

- Inter as the default sans (the Taste Skill bans it; we use Inter Tight instead).
- Pure white backgrounds.
- Pure black text.
- Violet, indigo, electric blue, or any "AI-aesthetic" accent.
- The centered hero with a CTA button.
- The three-equal-card grid row.
- Magnetic hover physics, parallax, scroll-jacking, or any motion that exists for its own sake.
- Glassmorphism, neon glow, gradient text, blur halos.
- Emoji as iconography.
- Loading spinners — replaced by skeletal loaders that match the layout.

---

## Implementation Brief — Concept C, prescriptive

This is the part you hand to a coding agent. Every value is exact.

### 1 · Type system specification

#### 1.1 Font stacks (paste verbatim)

```css
--font-serif:
  'Fraunces',
  ui-serif, Georgia, 'Iowan Old Style', 'Apple Garamond',
  'Times New Roman', serif;

--font-sans:
  'Inter Tight',
  ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto,
  'Helvetica Neue', Arial, sans-serif;

--font-mono:
  'JetBrains Mono',
  ui-monospace, SFMono-Regular, 'SF Mono', 'Menlo',
  'Monaco', 'Consolas', monospace;
```

Load Fraunces (variable; opsz 9–144, SOFT 0–100, WONK 0–1, weight 100–900, italic), Inter Tight (variable; weight 100–900, italic), and JetBrains Mono (weight 100–800, italic) from Google Fonts or self-host. **Do not** use Inter — only Inter Tight. **Do not** use Optima, Space Grotesk, or any other typeface anywhere on the site.

#### 1.2 The two-voice rule (load-bearing)

| Voice | Family | What it speaks |
| --- | --- | --- |
| **Author voice** (warm serif) | Fraunces | Article body prose, article titles, post-card titles, blockquotes, drop caps, hero excerpts, the wordmark "kbw Notes." Anything a human wrote with intent. |
| **System voice** (cool sans) | Inter Tight | Body copy *inside the chrome* only — buttons, form labels, comment author names, comment bodies, settings, profile fields, inline help text, error messages. Things the product is showing the user *about itself*. |
| **Operational voice** (mono) | JetBrains Mono | Anything operational: timestamps, post-card tags, folio numbers, the navigation bar, the "Discussion (3)" header, character counters, code, code blocks, datelines, the breathing live-dot label, kicker labels above section headings, status indicators, share-button labels. |

Every text node on every page maps to exactly one voice. If you cannot decide, default to Inter Tight in the chrome and Fraunces in the prose.

#### 1.3 Type scale (px / line-height / letter-spacing / weight)

The scale is narrower than a typical SaaS scale on purpose. Use these values; do not invent intermediates.

| Token | Size | Line-height | Tracking | Weight | Family | Used for |
| --- | --- | --- | --- | --- | --- | --- |
| `--text-mono-xs` | 11 / `1.3` | `+0.04em` | 500 | mono | folio numbers, datelines, kicker labels |
| `--text-mono-sm` | 12 / `1.4` | `+0.02em` | 500 | mono | tags, timestamps, character counters, nav links |
| `--text-mono-base` | 13 / `1.5` | `0` | 500 | mono | "Discussion (3)" header, share-row labels, code |
| `--text-ui-sm` | 13 / `1.45` | `0` | 500 | sans | small UI text (form labels, helper) |
| `--text-ui-base` | 14 / `1.55` | `0` | 400 / 500 | sans | UI body in chrome (comments, buttons, settings) |
| `--text-ui-lg` | 16 / `1.55` | `0` | 400 | sans | comment thread body |
| `--text-prose` | 18 / `1.7` | `+0.005em` | 400 | serif | article body prose |
| `--text-card-title` | 20 / `1.25` | `-0.01em` | 600 | serif | post-card title |
| `--text-card-title-lg` | 26 / `1.2` | `-0.015em` | 600 | serif | hero post-card title (the lead spanning two rows) |
| `--text-section` | 22 / `1.25` | `-0.005em` | 600 | serif | H3 inside articles |
| `--text-h2` | 32 / `1.2` | `-0.02em` | 700 | serif | article H2 |
| `--text-h1-meta` | 14 / `1.4` | `+0.05em` (uppercase) | 600 | mono | the kicker line above the article title |
| `--text-h1` | 56 / `1.05` | `-0.03em` | 700 | serif | article title |
| `--text-wordmark` | 20 / `1.0` | `-0.015em` | 700 | serif | "kbw Notes" wordmark in the header |

**Italics:** Fraunces italics use `WONK 1, SOFT 50` for emphasized words (bold-italic single words inside paragraphs, the drop-cap ligature, the article subtitle). Inter Tight italics are reserved for *empty-state* and *moderation-pending* messages only. Mono italics are forbidden.

**Reading measure:** prose paragraphs are clamped to **65 characters** (`max-width: 65ch`). Card excerpts are clamped to **2 lines** with `-webkit-line-clamp: 2`. Comment bodies are clamped to a **72ch** measure.

**Drop cap:** the first paragraph of an article opens with a 4-line drop cap in Fraunces (`SOFT 100`), color `var(--accent)`. Use `:first-letter` with `float: left; font-size: 4.6em; line-height: 0.85; padding: 6px 10px 0 0;`. Optical alignment must be hand-tuned: the cap height aligns with the cap-height of body text, not its baseline.

#### 1.4 What you must *not* do typographically

- Do not use Inter (only Inter Tight).
- Do not use a third sans (no Geist, no Satoshi, no Outfit).
- Do not use Fraunces for buttons, form labels, or any chrome text.
- Do not use mono for prose, ever.
- Do not use uppercase-tracked-out text outside the operational voice (kickers, datelines, folio).
- Do not use `font-weight: bold` (700) on Inter Tight body — use 500 for emphasis, 600 for headings.
- Do not use Fraunces below 16px — it stops looking like Fraunces.

---

### 2 · Color token map

#### 2.1 Light mode (default — paste into `:root`)

```css
:root {
  /* Surfaces */
  --paper:        #F4F0E6;   /* page background — warm desaturated cream */
  --paper-raised: #FBF8EE;   /* card lift, dropdown panels (1 step up) */
  --paper-sunken: #ECE7D5;   /* code-block bg, sunken sections */

  /* Ink */
  --ink:          #14160F;   /* primary text — never #000 */
  --ink-muted:    #4A4D42;   /* secondary text, captions */
  --ink-soft:     #7A7D6F;   /* tertiary text, placeholder, helper */
  --hair:         #E0DAC6;   /* hairline borders, divider rules */
  --hair-strong:  #C9C2AB;   /* stronger rules — section breaks */

  /* Accent (single, desaturated, < 80% saturation) */
  --accent:       #3F5B3A;   /* deep moss green — the only chromatic note */
  --accent-tint:  #E5EBDF;   /* tinted background for accent surfaces */
  --accent-deep:  #2C4129;   /* hover/active state of accent */

  /* Functional (used surgically — never as decoration) */
  --rose:         #B34A4A;   /* dusty rose: liked-heart fill, destructive */
  --rose-tint:    #F2E2E0;
  --amber:        #8A6E1F;   /* amber: moderation-pending, rate-limit warn */
  --amber-tint:   #EFE7CE;

  /* Focus ring */
  --focus:        #3F5B3A;   /* same as accent — single source of focus */
}
```

#### 2.2 Dark mode (override on `.dark`)

```css
.dark {
  --paper:        #1A1C16;   /* deep warm charcoal — green underneath */
  --paper-raised: #22251D;
  --paper-sunken: #14160F;

  --ink:          #ECE6D2;   /* warm bone-white — never pure white */
  --ink-muted:    #B0AB97;
  --ink-soft:     #7E7B6C;
  --hair:         #2E3027;
  --hair-strong:  #3F4136;

  --accent:       #6B8A60;   /* moss saturates +5% to survive dark bg */
  --accent-tint:  #2A3325;
  --accent-deep:  #8DA982;

  --rose:         #D88282;
  --rose-tint:    #3E2B2B;
  --amber:        #C9A75A;
  --amber-tint:   #3A311E;

  --focus:        #8DA982;
}
```

The dark mode is **a token swap, not a CSS inversion.** Every surface, every text color, every accent gets a hand-picked dark equivalent that maintains the warm, lamp-lit register. Do not implement dark mode by inverting hue or applying `filter: invert()`.

#### 2.3 Hex codes you are not allowed to use anywhere

- `#FFFFFF` (pure white) — replaced everywhere by `--paper-raised`.
- `#000000` (pure black) — replaced everywhere by `--ink`.
- Any violet, indigo, or "Tailwind violet/indigo/blue" hex.
- Any neon (saturation > 85%).
- Any gradient between two distinct hues. (Single-hue tonal gradients are permitted only for the breathing-dot's halo.)

#### 2.4 Contrast targets (verified, must be re-verified on any change)

- Body prose (`--ink` on `--paper`): **15.8 : 1** — AAA, easily.
- Muted text (`--ink-muted` on `--paper`): **7.2 : 1** — AAA.
- Accent text (`--accent` on `--paper`): **4.8 : 1** — AA for body, AAA for large text.
- Accent button label (`--paper` on `--accent`): **4.6 : 1** — AA.
- Focus ring (`--focus`, 2px solid, 2px offset): visible against both `--paper` and `--paper-raised`.

If any token changes, re-run a contrast check. AA at 4.5:1 minimum for body text, 3:1 for large text and UI components. AAA preferred where it does not require darkening the accent past `#3A5536`.

---

### 3 · Spacing scale (8pt base, 4pt half-stops)

```css
--space-1:  4px;   /* hairline gap, icon-to-label tight */
--space-2:  8px;   /* tag pill padding-x, comment indent unit */
--space-3:  12px;  /* button padding-y, card inner gap */
--space-4:  16px;  /* card padding-x, default gap */
--space-5:  20px;  /* between feed cards */
--space-6:  24px;  /* card padding-y, section vertical rhythm */
--space-7:  32px;  /* article paragraph gap */
--space-8:  48px;  /* between major sections */
--space-9:  72px;  /* article header to first paragraph */
--space-10: 96px;  /* page top padding, between feed and post sections */
```

Use these tokens. **Never** introduce arbitrary values in Tailwind classes (`p-[15px]` is forbidden) — extend the scale instead.

---

### 4 · Layout system

#### 4.1 Container widths and breakpoints

```css
--container-sm:  640px;
--container-md:  768px;
--container-lg:  1024px;
--container-xl:  1200px;   /* feed page */
--container-prose: 720px;  /* article center column */
--container-wide: 1320px;  /* article with margin gutters */
```

Breakpoints:
- `sm` ≥ 640px (mobile landscape, small tablet)
- `md` ≥ 768px (tablet)
- `lg` ≥ 1024px (small laptop)
- `xl` ≥ 1280px (desktop)

#### 4.2 Page chrome (header) — exact spec

- Height: **64px** desktop, **56px** mobile.
- Background: `var(--paper)`. No fill — the header sits on the page.
- Bottom border: `1px solid var(--hair)`. Not a shadow.
- Padding: `0 24px` desktop, `0 16px` mobile.
- Layout (desktop, left → right): wordmark · spacer · primary nav (Submissions / Notifications / Settings) · notification bell · user menu trigger · theme toggle.
- Z-index: 50. Sticky `top: 0`.
- Mobile: collapses primary nav into a hamburger; user menu and theme toggle stay visible.
- The folio bar (see §4.3) sits *above* the header, full-bleed, 28px tall.

#### 4.3 Folio bar (the thing that signals "publication")

- Full-bleed, height **28px**, background `var(--paper-sunken)`, bottom border `1px solid var(--hair)`.
- Three slots: left (`RUN №042 · EDITION 2026.04.28`), center (a 6px breathing green dot + label `LIVE`), right (`RIYADH · 14:32 GMT+3`).
- All text: `--text-mono-xs`, uppercase, `+0.08em` tracking.
- Always rendered at the very top of the page on `/kbw-notes/home` and `/kbw-notes/post/:id`. Hidden on auth pages.

#### 4.4 Home feed grid

The feed is **asymmetric**. Specifically:

- **Desktop (≥ lg):** CSS Grid with 12 columns, gap `24px`. The lead post spans **8 columns × 2 rows**. The next two posts each span **4 columns × 1 row** (to the right of the lead). The remaining cards each span **4 columns × 1 row**, flowing in document order.
- **Tablet (md):** 6 columns. Lead spans 6 columns × 1 row. Subsequent cards span 3 columns each.
- **Mobile (<md):** single column, 16px gap.

There is **no row of three equal cards** anywhere on the page. The lead must always exist; if there is no lead-quality post, fall back to `repeat(auto-fill, minmax(280px, 1fr))` with the *first* card spanning two columns.

The feed container width is `--container-xl` (1200px), centered, with `0 24px` padding.

#### 4.5 Article page layout — the typographic gutter

Three-column CSS Grid: `1fr 720px 1fr` with `gap: 48px`. Container max-width `--container-wide` (1320px), centered.

- **Left margin column (1fr):** sticky table of contents, `top: 96px`. Each TOC link in mono-sm, current section in `var(--accent)`. Anchor jumps respect `scroll-margin-top: 80px`.
- **Center column (720px):** the prose, the title block, the byline, the share row, and the comments section all live here.
- **Right margin column (1fr):** sticky metadata cards, `top: 96px`. Three cards: (1) reading-time + word-count, (2) share row vertical (Twitter, LinkedIn, Copy link), (3) related-posts list (3 items, hairline-divided).

On `<lg`, both margin columns collapse. The TOC becomes a `<details>` accordion above the article; the share row becomes inline above the prose; related posts move below the comments.

The article title block is itself a **2.4fr / 1fr split** inside the center column — title left, byline + reading-time right. Never centered.

#### 4.6 ASCII rules (the literal `─` glyphs)

Used as section separators **inside articles** and between **comments**. Implementation:

```html
<hr class="ascii" aria-hidden="true">
```

```css
.ascii {
  border: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-soft);
  text-align: center;
  margin: 32px 0;
}
.ascii::before {
  content: "──────────────────────";
  letter-spacing: 0;
}
```

Variants: `.ascii.long` for full-bleed (`content: "─" repeated 64 times`), `.ascii.short` for inline (`content: "── ◇ ──"`).

---

### 5 · Component-by-component spec

#### 5.1 Wordmark "kbw Notes"

- Family: Fraunces, weight 700, `WONK 1`.
- Size: `--text-wordmark` (20 / 1.0 / -0.015em).
- The lowercase `k` is rendered with `font-feature-settings: "ss02" 1;` to engage Fraunces's stylistic `k` alternate.
- Color: `var(--ink)`. On hover: `var(--accent)`. Transition: `color 200ms ease`.
- The "kbw" lowercase + "Notes" with capital N is a single word — no extra weight on "Notes." It is one wordmark, not a logo + product name.

#### 5.2 Primary navigation (desktop)

- Items: Submissions · Notifications · Settings.
- Voice: mono. Style: `--text-mono-sm`, weight 500, color `var(--ink-muted)`.
- Hover: color `var(--ink)`, underline `1px solid var(--accent)`, `text-underline-offset: 4px`.
- Active route: color `var(--ink)`, underline always visible.
- Spacing: `gap: 28px` between items.
- Notification bell: `Lucide Bell` icon, `18px`, color `var(--ink-muted)`. Badge: 16px circle, background `var(--accent)`, text `var(--paper)`, mono-xs, weight 600. Shows unread count, `99+` if over.

#### 5.3 User menu (open state — render permanently for the design exploration)

- Trigger: 32×32 circular avatar (image or initials gradient on `var(--accent-tint)`). On click: dropdown.
- Dropdown panel: width 240px, background `var(--paper-raised)`, border `1px solid var(--hair)`, shadow `0 6px 0 0 var(--hair)` (flat editorial offset, no blur).
- Padding: `8px 0`.
- Items (Inter Tight, `--text-ui-base`, weight 500):
  - Avatar + display name + email (header row, `padding: 12px 16px`, mono email below sans name)
  - Hairline divider
  - "Profile" — link to `/kbw-notes/profile`
  - "Settings" — link to `/kbw-notes/settings`
  - Hairline divider
  - "Sign out" — destructive, `color: var(--rose)`
- Item hover: background `var(--accent-tint)` (or `var(--rose-tint)` for sign out).

#### 5.4 Theme toggle

- Two-state segmented control, mono labels: `LIGHT` / `DARK`. Width `auto`, height 28px.
- Selected: background `var(--ink)`, color `var(--paper)`. Unselected: transparent, color `var(--ink-muted)`.
- Persist via `localStorage` key `kbw-theme` with values `"light" | "dark" | "system"`. (System is honored but not exposed in this header control — surface it in `/settings`.)

#### 5.5 Mobile hamburger nav (open state)

- Triggered by a 32×32 button with three 16px-wide `1.5px` strokes.
- Open: a full-width sheet drops below the header, background `var(--paper)`, border-bottom `1px solid var(--hair)`.
- Items: stacked, each `padding: 14px 24px`, mono `--text-mono-base`, color `var(--ink)`, divider hairline between.
- Close on route change or outside click.

#### 5.6 Post card (feed)

- Background: `var(--paper)`. Cards are **not** boxed by default — they are separated by a top hairline rule (`border-top: 1px solid var(--hair)`) and 24px internal padding. The lead card has `border: 1px solid var(--hair)` and a `var(--paper-raised)` background to lift.
- Layout per card:
  - Folio number, mono-xs, color `--ink-soft`, `+0.08em` tracking. Format: `№ 042`.
  - Tags row: 1–3 tags. Each tag: mono-xs, uppercase, `+0.04em` tracking, color `--ink-muted`, padding `2px 8px`, border `1px solid var(--hair)`, border-radius `2px` (just enough to soften), background transparent. Tags do *not* use the accent color.
  - Title: `--text-card-title` (or `--text-card-title-lg` for the lead). Color `--ink`. Hover: `--accent`.
  - Excerpt: Inter Tight, `--text-ui-base`, color `--ink-muted`, 2-line clamp.
  - Byline row: 24×24 avatar (circular) · author name (sans, `--text-ui-sm`, weight 500, `--ink`) · `·` · date (mono-sm, `--ink-soft`, format `28 APR 2026`).
  - Action bar (bottom): heart + count, comment + count (left); bookmark, share (right). Icons 16px, color `--ink-muted`, hover `--ink`.
- "Liked" state: heart icon filled, color `--rose`. Count gains weight 600.
- "Bookmarked" state: bookmark icon filled, color `--accent`.
- The lead card includes a hero image area (16:9 aspect ratio, `var(--paper-sunken)` placeholder when no image, hairline border).

#### 5.7 Article header (single post)

- Kicker line: mono-xs, uppercase, `+0.08em`, color `--accent`. Format: `ESSAY · INFRASTRUCTURE` (category · sub-category).
- Tags row: same tag style as post cards.
- Title: `--text-h1` (56 / 1.05 / -0.03em / 700). Color `--ink`. Max-width 14ch is not enforced — the title can run wider; the typographic-gutter layout absorbs it.
- Subtitle / dek: Fraunces italic (`SOFT 50`), 22 / 1.4, color `--ink-muted`.
- Byline strip:
  - 36×36 avatar.
  - Author name: sans, `--text-ui-base`, weight 500.
  - Date: mono-sm, `--ink-soft`, format `28 APR 2026`.
  - Reading time: mono-sm, `--ink-soft`, format `5 MIN READ`.
- Share row: three icon-buttons (Twitter, LinkedIn, Copy link), 32×32, hairline-bordered, mono-xs label "X" / "IN" / "URL" centered. Hover: `var(--accent-tint)` background.

#### 5.8 Article prose (the rendered body)

The prose is the heart of the design — get this right, the rest follows.

- Container: `max-width: 65ch`, centered in the 720px column.
- Family: `var(--font-serif)`, weight 400, size `--text-prose` (18 / 1.7 / +0.005em).
- Color: `--ink`.
- Paragraph margin: `--space-7` (32px) between paragraphs. No paragraph indent. No `<br>` for spacing.
- H2: `--text-h2`, margin `--space-9` above, `--space-5` below.
- H3: `--text-section`, margin `--space-7` above, `--space-3` below.
- H2 and H3 prepend a folio: `<span class="folio">§ 02</span> Heading text`. The folio is mono-xs, color `--accent`, margin-right 12px, weight 600, and **does not** count toward the heading's font-size or line-height.
- **Inline code:** mono-base, padding `1px 6px`, background `var(--paper-sunken)`, border-radius `2px`, color `--ink`. *Not* the accent color.
- **Bold:** weight 600 (Fraunces). **Italic:** Fraunces italic with `WONK 1`.
- **Code blocks:** see §5.9.
- **Blockquote:** left border `2px solid var(--accent)`, padding-left `--space-5`, color `--ink-muted`, Fraunces italic, no quotation marks (the rule is the mark). A small mono attribution line below: `— Author Name`, mono-sm.
- **Bulleted list:** custom marker `"—"` (em-dash), color `--accent`, mono. List items use serif body. Indent `--space-5`. Item gap `--space-2`.
- **Numbered list:** custom marker via `counter-increment`, format `01.`, mono-sm, color `--accent`. Indent `--space-6`.
- **Inline image:** full-column width (720px), border `1px solid var(--hair)`, padding `0`, no border-radius. Caption directly below: mono-xs, color `--ink-soft`, format `Fig. 1 — caption text.`, italic.
- **Links:** color `--accent`, underline `1px solid var(--accent)`, `text-underline-offset: 3px`. Hover: color `--accent-deep`.
- **"Share this post" CTA box** at the end of the article: full-column width, padding `--space-7`, background `var(--accent-tint)`, no border, `border-top: 2px solid var(--accent)`. Heading mono-base uppercase `+0.06em`, body sans `--text-ui-base`, three buttons (Twitter / LinkedIn / Copy) styled as in §5.7.

#### 5.9 Code block (inside articles)

- Container: full-column width (720px), background `var(--paper-sunken)`, border `1px solid var(--hair)`, border-radius `2px`, padding `--space-5`.
- A small header strip: mono-xs, uppercase, `+0.04em`, color `--ink-muted`, with the language name on the left (`TYPESCRIPT`) and a copy button (icon-only, 16px) on the right. Header has `border-bottom: 1px solid var(--hair)`, padding-bottom `--space-3`, margin-bottom `--space-3`.
- Code: `var(--font-mono)`, 13px, line-height 1.6, color `--ink`.
- Syntax highlighting palette (intentionally muted — code is *content*, not decoration):
  - keyword: `--accent`
  - string: `--amber`
  - comment: `--ink-soft`, italic
  - number: `--rose`
  - default: `--ink`
- Use Lowlight/highlight.js (already in package.json) for tokenization. **Do not** introduce a chromatic syntax theme like Dracula or One Dark.

#### 5.10 Comments section

- Section header: `Discussion (3)` — mono-base, uppercase `+0.04em`, weight 600, color `--ink`. 16px Lucide message-circle icon to the left.
- New-comment textarea:
  - Container: padding `--space-4`, border `1px solid var(--hair)`, background `var(--paper-raised)`. Focus: `border-color: var(--accent)`, no shadow.
  - Textarea inside: sans, `--text-ui-base`, color `--ink`. `resize: vertical`. min-height 96px.
  - Footer row: character counter mono-xs (left, format `0 / 500`, color flips to `--rose` past limit), Send button (right).
  - Send button: 36px tall, `--space-4` padding-x, mono-sm uppercase `+0.04em` weight 600, background `--ink`, color `--paper`. Disabled: opacity 0.4. Hover: `--accent`.
- Comment list:
  - Items separated by `border-top: 1px solid var(--hair)`. No cards.
  - Per comment: 28×28 avatar (left, sticky to top of comment), then a stacked block:
    - Top row: author name (sans, weight 500), `·`, relative timestamp (mono-sm, `--ink-soft`, format `2h ago`).
    - Body: sans, `--text-ui-lg`, color `--ink`, max-width 72ch.
    - Action row: Like (heart 14px) · Reply · Report · (Delete only on own comments). Each label mono-sm, color `--ink-muted`, hover `--ink`. Delete on hover: `--rose`.
  - **Nested replies:** `padding-left: 32px`, `border-left: 2px solid var(--accent)` (the moss-green left rule replaces card chrome). Reply form (when active) appears inline below the parent comment, identical styling to the new-comment form but with a "Cancel" mono link to the right of Send.
  - **Moderation-pending note:** rendered inline as a sans-italic line, color `--amber`, padding `--space-2 --space-3`, background `--amber-tint`, border-left `2px solid var(--amber)`. Text: `*Awaiting moderation — visible only to you.*`
- "Load more comments" button: full-width, 44px tall, mono-sm uppercase `+0.04em`, no background, border `1px solid var(--hair)`. Hover: background `--paper-raised`.

#### 5.11 Feed states

- **Loading row** at the bottom of the feed: full-width, height 60px, centered. Skeletal loaders (three 1px hairlines pulsing in opacity) plus mono-xs text `LOADING MORE POSTS…`. *Do not* use a spinner.
- **End-of-feed:** ASCII rule short variant + mono-xs text `── END OF FEED — RUN №042 ──`. Centered.
- **Empty state:** centered card with serif headline `No posts yet.` + sans subline `Check back soon for new editions.` + optional small SVG of a folded paper. Color `--ink-muted`.

#### 5.12 Iconography

- Library: **Lucide React** (already a dependency — keep it).
- Sizes: `14px` (inline metadata), `16px` (action bar), `18px` (header), `20px` (article header buttons), `24px` (empty-state hero only).
- Stroke width: **`1.5`** globally — set in a wrapper `<Icon strokeWidth={1.5} />`. Never mix stroke widths. The current code uses default `2` in places — change all icons to 1.5.
- **No emoji.** Anywhere. Replace any existing emoji glyph with a Lucide icon or a custom inline SVG.
- Icon color follows text color (`currentColor`).

#### 5.13 Buttons (full inventory)

| Button | Voice | Shape | Background | Color | Border | Padding | Hover |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Primary** ("Send", "Publish") | mono uppercase | rect, 2px radius | `--ink` | `--paper` | none | `10 16` | bg `--accent` |
| **Secondary** ("Save draft") | mono uppercase | rect, 2px radius | transparent | `--ink` | `1px solid --ink` | `10 16` | bg `--ink`, color `--paper` |
| **Tertiary / link** | sans | inline | none | `--accent` | underline 1px | none | color `--accent-deep` |
| **Destructive** ("Delete") | mono uppercase | rect, 2px radius | transparent | `--rose` | `1px solid --rose` | `10 16` | bg `--rose`, color `--paper` |
| **Icon button** | — | 32×32 sq, 2px radius | transparent | `--ink-muted` | none | — | bg `--accent-tint`, color `--ink` |
| **Toggle on** | mono uppercase | rect, 2px radius | `--ink` | `--paper` | none | `6 12` | — |

All buttons: focus ring `2px solid var(--focus)`, `2px` offset. Tactile feedback: `:active { transform: translateY(1px); }`. Transition `100ms ease` on color and background only.

---

### 6 · State specifications

For every interactive component, define and implement these eight states. The mockup has examples; the production app must be exhaustive.

| State | Visual treatment |
| --- | --- |
| **Default** | as specified above |
| **Hover** | one tonal step (e.g. `--ink` → `--accent` for nav, `--ink-muted` → `--ink` for icons) |
| **Focus-visible** | `outline: 2px solid var(--focus); outline-offset: 2px;` always visible on keyboard focus |
| **Active** | `transform: translateY(1px);` for tactile feedback |
| **Disabled** | `opacity: 0.4; cursor: not-allowed;` — no greyed-out colors |
| **Loading** | skeletal loaders (1.5px hairlines pulsing opacity 0.4↔1.0 over 1.6s) — never spinners |
| **Error** | inline message in `--rose`, sans-italic, with `1.5px solid --rose` left border on the input |
| **Empty** | sans-italic in `--ink-muted`, centered, optional 24px Lucide icon |

---

### 7 · Motion specifications

Motion is *intentionally minimal*. The page should feel calm.

| Element | Animation | Duration | Easing | Notes |
| --- | --- | --- | --- | --- |
| Theme toggle | `color`, `background-color` swap | 250ms | `cubic-bezier(0.2, 0, 0, 1)` | applies to `<html>` + cascade |
| Button hover | `color`, `background-color` | 100ms | `ease` | no `transform` except on `:active` |
| Link hover | `color`, `text-decoration-color` | 100ms | `ease` | |
| Skeleton shimmer | `opacity` 0.4 ↔ 1.0 | 1600ms | `ease-in-out`, infinite alternate | hardware-accelerated (opacity only) |
| Live-dot breathing | `box-shadow` + `transform: scale(1)→1.15` | 2000ms | `ease-in-out`, infinite | only on the folio-bar dot |
| Drawer / dropdown | `opacity`, `transform: translateY(-4px)` | 180ms | `cubic-bezier(0.2, 0, 0, 1)` | enter only |
| Page transition | none | — | — | full-page nav uses standard browser load |

`@media (prefers-reduced-motion: reduce)` disables: skeleton shimmer, live-dot breathing, drawer transform. Color/opacity transitions remain.

**Forbidden motion:** parallax, scroll-jacking, magnetic hover, scroll-linked animations, page-load fade-ins on every element, marquee, ticker scroll on actual content (the folio bar's text is static).

---

### 8 · Accessibility requirements

- **Color contrast:** AA minimum, AAA for body. Re-verify on any color change.
- **Focus visibility:** every interactive element shows a visible focus ring (see §6). Never use `outline: none` without a replacement.
- **Keyboard navigation:** Tab order matches visual order. Esc closes dropdowns and modals. Enter submits forms.
- **Semantic HTML:** `<article>` per post, `<header>`/`<main>`/`<footer>`/`<nav>`, headings in order (H1 once per article, H2/H3 nested correctly).
- **ARIA:** `aria-label` on all icon-only buttons. `aria-live="polite"` on the comment count. `aria-hidden="true"` on the ASCII rule glyphs and the live-dot.
- **Reduced motion:** honor `prefers-reduced-motion`.
- **Reduced data:** the only image dependency on the article page is the cover image. Skeleton loaders prevent layout shift.
- **Reading mode:** the typographic-gutter layout is friendly to Safari Reader and Firefox Reader View — H1, byline, prose all in standard tags.

---

### 9 · Anti-patterns (a checklist of things to verify you have *not* done)

- [ ] No violet, indigo, or "Tailwind violet/indigo/blue" anywhere in the site.
- [ ] No pure white (`#fff`, `bg-white`) backgrounds.
- [ ] No pure black (`#000`, `text-black`) text.
- [ ] No Inter (only Inter Tight). No Space Grotesk. No Optima. No third sans.
- [ ] No emoji glyphs in any text node, alt, aria-label, or button label.
- [ ] No three-equal-card row anywhere on the feed.
- [ ] No centered hero block at any breakpoint above mobile.
- [ ] No spinner — all loading states are skeletal.
- [ ] No `box-shadow` with blur greater than 2px and color other than tinted background.
- [ ] No gradient between two distinct hues.
- [ ] No `text-shadow` glow.
- [ ] No `backdrop-filter: blur` (no glassmorphism).
- [ ] No animated `width` / `height` / `top` / `left`. Animations use `transform` and `opacity` only.
- [ ] No motion that exists for its own sake.
- [ ] No icon stroke width other than 1.5.
- [ ] No font-weight: bold (700) on Inter Tight body — only on Fraunces headings.
- [ ] No paragraph wider than 65ch.

---

### 10 · Mapping Concept C onto the existing kbw-notes codebase

This concept can be implemented as a non-breaking re-skin. The 3-tier architecture (queries → hooks → pages) and component composition do not change. Only `src/index.css` and the styling/markup of presentational components change.

**File-by-file change list:**

1. **`src/index.css`** — replace the existing `@theme` block. Drop `--color-primary-*` (violet) and `--color-secondary-*` (indigo). Add the tokens from §2.1 + §2.2. Replace `--font-heading: 'Space Grotesk'` with Fraunces, `--font-body: 'Optima'` with Inter Tight, keep `--font-mono: 'JetBrains Mono'`. Load fonts from Google Fonts at the top of the file.
2. **`src/components/shell/AppShell.tsx`** — add the folio bar above the existing header. Update header to the spec in §4.2. Convert wordmark to Fraunces. Replace `text-violet-*` and `text-indigo-*` classes with `text-[var(--ink)]`, `text-[var(--accent)]`, etc.
3. **`src/components/shell/MainNav.tsx`** — switch to mono voice. Underline-on-hover with the accent.
4. **`src/components/shell/UserMenu.tsx`** — flat editorial offset shadow (`shadow-[6px_6px_0_var(--hair)]`), no blur. Permanently render in the design exploration; conditional in production.
5. **`src/components/blog-feed/BlogFeed.tsx`** — replace the current uniform grid with the asymmetric grid from §4.4.
6. **`src/components/blog-feed/BlogPostCard.tsx`** — re-skin to §5.6. Drop the rounded `rounded-2xl` corners. Add folio numbers. Switch tag pills to hairline-bordered rectangles. Switch action-bar icon stroke to 1.5. Switch dates to mono format `28 APR 2026`.
7. **`src/components/blog-post/BlogPostView.tsx`** — wrap in the typographic-gutter grid from §4.5. Restyle the article header (§5.7), prose (§5.8), code block (§5.9), comments (§5.10).
8. **`src/components/blog-post/CommentForm.tsx`** + **`CommentThread.tsx`** — re-skin to §5.10. Replace card chrome with hairline + left-rule indentation.
9. **`src/components/submissions/SubmissionEditor.tsx`** — toolbar buttons switch to mono uppercase, accent-tinted hover. Editor content uses the prose styles from §5.8 so what-you-edit matches what-renders.
10. **`src/components/notifications/NotificationItem.tsx`** — re-skin: hairline-bottom items, mono timestamp, sans body, accent left-rule for unread.
11. **`src/components/settings/*`** — segmented-button controls: `--ink` fill on selected, hairline border on unselected.
12. **`src/contexts/AuthContext.tsx`** — no change.
13. **Database / Supabase / Edge Functions** — no change. This is purely a presentation-layer redesign.

**Tailwind v4 `@theme` starter** (paste into `src/index.css`, replacing the existing `@theme` block):

```css
@theme {
  --font-heading: 'Fraunces', ui-serif, Georgia, serif;
  --font-body: 'Inter Tight', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', monospace;

  --color-paper: #F4F0E6;
  --color-paper-raised: #FBF8EE;
  --color-paper-sunken: #ECE7D5;
  --color-ink: #14160F;
  --color-ink-muted: #4A4D42;
  --color-ink-soft: #7A7D6F;
  --color-hair: #E0DAC6;
  --color-hair-strong: #C9C2AB;
  --color-accent: #3F5B3A;
  --color-accent-tint: #E5EBDF;
  --color-accent-deep: #2C4129;
  --color-rose: #B34A4A;
  --color-rose-tint: #F2E2E0;
  --color-amber: #8A6E1F;
  --color-amber-tint: #EFE7CE;
}

@custom-variant dark (&:where(.dark, .dark *));

.dark {
  --color-paper: #1A1C16;
  --color-paper-raised: #22251D;
  --color-paper-sunken: #14160F;
  --color-ink: #ECE6D2;
  --color-ink-muted: #B0AB97;
  --color-ink-soft: #7E7B6C;
  --color-hair: #2E3027;
  --color-hair-strong: #3F4136;
  --color-accent: #6B8A60;
  --color-accent-tint: #2A3325;
  --color-accent-deep: #8DA982;
  --color-rose: #D88282;
  --color-rose-tint: #3E2B2B;
  --color-amber: #C9A75A;
  --color-amber-tint: #3A311E;
}
```

The site already uses Tailwind v4 with `@theme` blocks — the change is *replacing* the existing block, not adding alongside.

---

### 11 · The twelve commandments of Concept C

A laminated reference. If a reviewer catches you violating one of these, the design is broken.

1. **The page has two voices: serif for prose, mono for system. They never blend.**
2. **Pure white and pure black are forbidden.** Paper is `#F4F0E6`. Ink is `#14160F`.
3. **One accent. Moss green `#3F5B3A`. Below 80% saturation. Used surgically.**
4. **Inter is banned. Use Inter Tight.**
5. **No three-equal-card row, ever. The lead is always larger than the rest.**
6. **No centered hero. Article titles are 2.4fr / 1fr split; the gutter is 1fr / 720px / 1fr.**
7. **Cards are hairlines + indentation, not boxes. Where boxes appear, shadows are flat editorial offsets, not blur.**
8. **Icons are Lucide at stroke 1.5. No emoji.**
9. **Motion is calm. Skeleton shimmer, breathing dot, button hover. Nothing else.**
10. **Drop cap, folios, datelines, ASCII rules — all serve information. None are decoration.**
11. **Mono speaks in uppercase with `+0.04em` to `+0.08em` tracking. Sans never does.**
12. **Reading measure is 65 characters. The 720px column exists for that reason.**

---

### 12 · Acceptance criteria — how you verify the build matches the brief

A reviewer can grade an implementation by walking this list. All must be true.

**Structural:**
- [ ] Folio bar present above the header on `/kbw-notes/home` and `/kbw-notes/post/:id`, with run number, live dot, and timezone.
- [ ] Header is 64px desktop / 56px mobile, with hairline bottom border, no shadow.
- [ ] Feed grid is asymmetric — lead card spans 2× the width of subsequent cards.
- [ ] Article uses the 1fr / 720px / 1fr typographic-gutter layout on ≥lg.

**Typographic:**
- [ ] Three font families load: Fraunces, Inter Tight, JetBrains Mono. No others.
- [ ] Article body is Fraunces 18/1.7. Prose width is exactly 65ch.
- [ ] Drop cap on the first paragraph: 4 lines, Fraunces, accent color.
- [ ] H2 / H3 in articles prepend a `§ 02` folio in mono, accent color.
- [ ] Tags are hairline-bordered uppercase mono. Timestamps are mono.
- [ ] No use of Inter (only Inter Tight). No use of Space Grotesk or Optima.

**Color:**
- [ ] No `#fff`, `#ffffff`, `bg-white`, `text-black`, `#000`, `#000000` anywhere in CSS or Tailwind classes.
- [ ] No violet/indigo/blue Tailwind classes.
- [ ] Accent appears only on: links, focus rings, active nav state, primary CTA, drop cap, breathing dot, code keywords, comment thread left rule, "Share this post" CTA top-border.
- [ ] Dark mode is a token swap, not an inversion. Tested: every component is verified in both modes.
- [ ] All body text passes WCAG AA (4.5:1). All large text and accent buttons pass AA. Body passes AAA.

**Behavior:**
- [ ] All eight component states implemented (default, hover, focus, active, disabled, loading, error, empty).
- [ ] Loading uses skeletal loaders. No spinners present anywhere.
- [ ] `prefers-reduced-motion` disables shimmer, breathing dot, and drawer transforms.
- [ ] All icon-only buttons have `aria-label`. All icons have `strokeWidth=1.5`.
- [ ] Tab order matches visual order on every page.
- [ ] Theme toggle persists in `localStorage` under key `kbw-theme`.

**Negative checks (must all be FALSE):**
- [ ] No `box-shadow` with blur > 2px.
- [ ] No `backdrop-filter`.
- [ ] No gradient between distinct hues.
- [ ] No emoji in any source file.
- [ ] No Tailwind arbitrary value `p-[15px]`-style spacing — every spacing value is from the §3 scale.
- [ ] No animation on `width`, `height`, `top`, or `left`.

If every box checks, the implementation matches the brief. If three or more boxes fail, the design has lost coherence — stop, fix, retest.

