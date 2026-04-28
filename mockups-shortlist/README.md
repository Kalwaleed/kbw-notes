# kbw Notes — Mockup Shortlist

Two design directions kept from the three-way exploration. Mockup B (Swiss Modernism × editorial pink) was discarded.

Each concept has a standalone, prescriptive design brief — detailed enough to be handed to a coding agent as a build prompt.

| Concept | Theme name | Mockup HTML | Design brief |
| --- | --- | --- | --- |
| **A** | The Broadsheet Brief — *Editorial Brutalist Newsprint* | [`01-…-folio-numbers-and-redaction-bars.html`](./01-editorial-brutalist-newsprint-fraunces-serif-ink-red-on-cream-paper-with-folio-numbers-and-redaction-bars.html) | [`the-broadsheet-brief.md`](./the-broadsheet-brief.md) |
| **C** | The Editorial Brief — *Newsprint Meets Terminal* | [`02-…-asymmetric-grid.html`](./02-editorial-newsprint-meets-terminal-fraunces-and-jetbrains-mono-deep-moss-green-on-warm-paper-with-ascii-rules-and-asymmetric-grid.html) | [`the-editorial-brief.md`](./the-editorial-brief.md) |

---

## How the two directions compare

| Dimension | A — The Broadsheet Brief | C — The Editorial Brief |
| --- | --- | --- |
| **Energy** | Loud, broadsheet, opinionated | Quiet, literary, deliberate |
| **Tonal reference** | *NYT* 1962 × Massimo Vignelli | *Paris Review* × Vim |
| **Accent (light)** | Ink-red `#C1121F` | Deep moss green `#3F5B3A` |
| **Accent (dark)** | Amber `#FF7A00` | Moss green (saturation +5 %) |
| **Paper color** | Cream `#F4ECD8` | Warm cream `#F4F0E6` |
| **Type system** | Fraunces + IBM Plex Sans + JetBrains Mono | Fraunces + Inter Tight + JetBrains Mono |
| **Type scale** | Broad (12 → 96 px) | Narrow (12 → 56 px) |
| **Layout system** | 12-column newspaper grid, broadsheet hero | Asymmetric 3-column feed; typographic-gutter article |
| **Voice cue** | "Journal of record" — datelines, folio numbers, tickers | "Literary quarterly with system chrome" — ASCII rules, mono metadata |
| **Hierarchy mechanism** | Type size + rule weight | Measure + leading + accent placement |
| **Materiality** | Hairlines, paper grain, vertical column rules, sharp 0px corners | `border-t` + `divide-y` + negative space, 2px corners |
| **Motion** | Ink-bleed entrance fade only (live-dot is static) | Skeleton shimmer + breathing live-dot only |
| **Voice count** | Three — editorial / chrome / press | Two — author / system |
| **Dominant risk** | Strong opinion, may feel heavy | Subtle palette, less immediate "wow" |
| **Failure mode if content is weak** | Looks like a costume of a newspaper | Looks like a generic minimalist blog |
| **Best for** | Long-form thought leadership, essay-length pieces | Mix of essays, technical write-ups, and operating notes |
| **Reader it imagines** | An *Atlantic* / *Stratechery* subscriber | An *Increment* / *Distill.pub* reader |
| **Brand promise it makes** | "We take writing seriously" | "We are technical, but we read" |

### Shared values (what both directions agree on)

Both directions reject:
- The existing violet/indigo SaaS palette.
- Pure white backgrounds and pure black text.
- The centered-hero / generic-card-grid pattern.
- Inter at 16px for everything.
- Iconography drawn from emoji.
- Motion that exists for its own sake.
- Loading spinners over skeletal loaders.

Both directions agree on:
- Fraunces as the serif voice.
- JetBrains Mono as the system / metadata voice.
- A single accent color, used with restraint.
- Warm cream paper rather than cool white.
- Print-borrowed structure (datelines, folios, drop caps, rules) used for *informational* purposes, not decoration.
- A meaningful, content-aware dark mode — not a CSS inversion.

### Strategic difference (one paragraph)

Both directions move kbw Notes from *"another tech blog"* to *"a publication."* The difference is volume. **Concept A** walks into the room and announces itself — it has a masthead, a folio, a dateline, and an opinion about what news matters this week. **Concept C** enters the room quietly and is the smartest person there once it starts speaking — it does not posture, does not announce, but rewards close reading and signals competence through restraint. Either is a step-change from the current design; the choice is between *credibility through assertion* and *credibility through quietness*.

---

## How to use this folder

1. Open both HTML mockups side-by-side in a browser to compare visually.
2. Read the corresponding design brief (`the-broadsheet-brief.md` or `the-editorial-brief.md`) for the chosen direction.
3. Hand the brief to a coding agent (or human implementer) as the source of truth for the redesign — the briefs are written to be self-contained build prompts.
4. The mockup HTML files are reference artifacts; if the brief and the mockup ever disagree, the brief wins.
