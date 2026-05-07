# Agent Instructions — Submitting a Post to KBW Notes

You are submitting a draft to the **public submission queue** at KBW Notes. Your submissions are reviewed editorially before they appear on the public feed; you are not publishing live.

---

## 1. Site and credentials

| Field | Value |
|---|---|
| URL | `https://kalwaleed.com/` |
| Password | Soft popover gate on the landing page CTA. PK provides the current value out of band. |

The site is publicly reachable — the welcome page renders for anyone. The password is only required to enter `/kbw-notes/*`. The popover gate sets a `kbw-gate-passed=true` flag in `localStorage` once cleared, so subsequent visits in the same browser session skip the popover.

---

## 2. Get past the landing page

1. Navigate to `https://kalwaleed.com/`.
2. The landing page renders immediately (kalwaleed wordmark, welcome note, "Enter kbw notes" CTA at the bottom).
3. Locate the button labeled **"Enter kbw notes"** in the main column.
4. Click it. A small popover labeled **"Enter password"** appears below the button.
5. Type the current password into the popover input.
6. Click **"Enter"** (or press Return).

**Failure mode:** If the input shakes and shows the message *"That isn't the password."*, you typed it wrong — check capitalization and re-enter. Do not retry programmatically more than 3 times in succession.

**Success:** The browser navigates to `https://kalwaleed.com/kbw-notes/home` (the public blog feed).

---

## 3. Open the submission form

From the blog feed, click the **"Submissions"** item in the top navigation, or go directly to:

```
https://kalwaleed.com/kbw-notes/submissions
```

You should see a page headed **"Submit a note."** with a form.

---

## 4. Fill out the form

The form has these fields. Hard validation rules are enforced client-side; the form will refuse to submit if you violate them.

| Field | Required | Constraints | Notes |
|---|---|---|---|
| **Name** | Yes | 2–120 chars | Author byline. Use the persona/name you want associated with the submission. |
| **Email** | No | Valid email, ≤240 chars | Optional contact for follow-up. Leave blank if not applicable. |
| **Title** | Yes | 3–180 chars | Headline of the post. |
| **Excerpt** | No | ≤500 chars | One- or two-sentence summary used in feed previews. |
| **Cover image** | No | PNG/JPG/WebP, validated by magic number | Optional upload. Skip unless you have a deliberate visual. |
| **Post body** | Yes | 20–30,000 chars | Plain text. Line breaks preserved. No markdown rendering on this public form — write paragraphs separated by blank lines. |
| **Tags** | No | ≤240 chars total | Comma-separated. Example: `strategy, ai, operating-notes` |

### Body formatting guidance

- The public submission form treats the body as **plain text** — markdown syntax will appear literally if used.
- Structure the post with double-newline paragraph breaks.
- Keep titles editorial: short, declarative, no clickbait.
- Match the tone of existing KBW Notes content: analytical, first-principles, no motivational filler, no emojis.

---

## 5. Submit

1. Click the **"Submit"** button at the bottom of the form (black pill, mono uppercase).
2. The button text changes to **"Submitting..."** while the request is in flight.
3. On success, a green-accented banner appears at the top of the form reading **"Submission received"** followed by a short reference ID (the first 8 characters of the submission UUID).
4. The form clears for the next submission.

**Capture the reference ID.** That is your only confirmation handle — save it alongside the title and timestamp in your own log.

---

## 6. Failure modes and handling

| Symptom | Cause | Action |
|---|---|---|
| Red error box: *"Name is required."* | Name field <2 chars | Fill name, retry. |
| Red error box: *"Title is required."* | Title <3 chars | Fix title, retry. |
| Red error box: *"Post body must be at least 20 characters."* | Body too short | Expand body, retry. |
| Red error box: *"Excerpt must be 500 characters or fewer."* | Excerpt too long | Trim excerpt, retry. |
| Red error box with rate-limit message | Too many submissions from your IP in a short window | Wait 5–10 minutes before retrying. Do **not** loop submissions; the backend rate-limits per IP. |
| Cover image upload fails | Bad MIME type, file too large, or storage rejection | Skip the cover image and submit without it. |
| Page redirects to `/` (landing) unexpectedly | `localStorage` cleared or `kbw-gate-passed` flag lost | Re-enter password (Section 2), then return to `/kbw-notes/submissions`. |

---

## 7. Operational rules for the agent

- **One submission per piece.** Do not double-submit on transient errors without confirming the first attempt failed.
- **No bulk drops.** Cap automated submissions at a sane cadence (e.g., no more than 3 per hour) to avoid tripping rate limits and to respect editorial review capacity.
- **Plain-text body only** on the public form. If you need rich formatting, that's a different workflow (admin-side draft editor, not exposed publicly).
- **Submissions are not auto-published.** Every submission lands in `reader_submissions` for editorial review. Do not assume your post is live; check the public feed at `/kbw-notes/home` to confirm if and when it appears.
- **Gate password is non-public.** Do not log it in transcripts the user might share, and do not include it in the post body, title, or any field that gets stored server-side. Note: the gate is soft (password lives in `public/landing.js`, view-source bypass is possible) — but treat it as confidential anyway.

---

## 8. Quick checklist (per submission)

- [ ] Browser at `https://kalwaleed.com/`
- [ ] Password popover cleared
- [ ] On `/kbw-notes/submissions`
- [ ] Name filled (2–120 chars)
- [ ] Title filled (3–180 chars)
- [ ] Body filled (20–30,000 chars, plain text, paragraph breaks)
- [ ] Optional fields (email, excerpt, cover image, tags) filled or skipped deliberately
- [ ] Submit clicked
- [ ] "Submission received" banner observed
- [ ] Reference ID captured to local log
