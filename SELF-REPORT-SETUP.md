# Weekly AI-Adoption Self-Report — Account Setup Guide

**For:** PK / Donya (whoever provisions accounts)
**System:** kalwaleed.com self-report (live since 2026-07-04)
**Time required:** ~15 minutes for all accounts, one time.

---

## What this is

Staff file the mandate's weekly self-report at a login-protected page. Accounts are
created by hand in the Supabase dashboard — there is **no signup page** on the site,
by design. One account per person, roughly 15 total.

| Who | URL | Access |
|---|---|---|
| All staff | `https://kalwaleed.com/kbw-notes/report` | Own reports only |
| Donya | `https://kalwaleed.com/kbw-notes/report/review` | All reports + review form |
| PK | Both URLs | Everything (admin) |

Staff **cannot** see Donya's reviews — enforced in the database, not just the UI.

---

## Step 1 — Create the staff accounts (dashboard)

Do this for each staff member, including Donya:

1. Open <https://supabase.com/dashboard/project/eifxhmgesuafsdbinvno/auth/users>
2. Click **Add user** → **Create new user**.
3. Enter their **work email** and a **strong, unique password** (use a password
   generator; 16+ characters; different for every person).
4. Enable **Auto Confirm User** so they can sign in immediately.
5. Click create. **Do not** fill in any name/metadata fields — leave everything
   except email + password empty. (Names typed here would appear on the public
   blog. The report form asks for their name separately.)

> **Why not email invites?** The site intentionally has no "set your password"
> page yet, so invite links from Supabase would lead nowhere. Creating accounts
> with passwords directly avoids that and needs no email configuration at all.

## Step 2 — Give Donya the reviewer role

1. In the same Users list, click **Donya's user**.
2. Find **App Metadata** (not User Metadata) and edit it to:
   ```json
   { "role": "reviewer" }
   ```
3. Save. That's the entire role system — staff get no role, PK (k@kbw.vc) is
   already admin.

⚠️ App Metadata only — "User Metadata" is editable by the user themselves and
grants nothing.

## Step 3 — Distribute credentials

Send each person their password **privately and individually** (not a group
email/chat). Suggested message to staff:

> Weekly AI self-reports now happen on the site instead of the email template.
> Go to **kalwaleed.com/kbw-notes/report**, sign in with your work email and the
> password I sent you separately, fill the report, hit Submit. Due every
> **Thursday 5:00 PM (Riyadh)**, covering Friday–Thursday. Your entries save as
> a draft on your device as you type; you can resubmit until the deadline — the
> last submission counts.

Ask everyone to sign in once on day one so lockouts surface early.

## Step 4 — Verify (5 minutes, once)

1. Sign in as one staff account → submit a test report.
2. Sign in as Donya → open `/kbw-notes/report/review` → confirm the test report
   is visible → save a review.
3. Back as the staff account → confirm the review is **not** visible anywhere.
4. Delete nothing — just tell the developer/agent to clear the test row, or
   leave it; Donya can ignore it.

---

## Forgotten passwords / lockouts

There is no self-service reset (no reset page + no outbound email configured).
Process: the person messages Donya/PK → open their user in the dashboard →
**Reset password** / set a new one → send it to them privately. For ~15 people
this is a few times a year.

## Optional later upgrade — email invites & self-service resets

Needs two things (in this order):

1. **SMTP provider** — Dashboard → Project Settings → Auth → SMTP. Any
   transactional provider works (Resend and Postmark are the usual picks; free
   tiers cover 15 users trivially). Without this, Supabase's built-in mailer
   sends at most a couple of emails per hour and often lands in spam.
2. **A set/reset-password page on the site** — small dev task, not built yet
   (deliberately cut from v1). Ask for it once week-1 reports are flowing.

Until both exist, stick with Step 1's create-with-password flow.

## Security rules (non-negotiable)

- Unique password per person; never reuse or share accounts — reports feed the
  Day 30 / Day 60 comp review, so identity integrity matters.
- No names in dashboard metadata (public-site leak vector).
- Only Donya gets `{"role":"reviewer"}`; nobody else gets any role.
- Never delete users with submitted reports — ban/disable instead (deleting is
  blocked by the database on purpose, but don't try).
