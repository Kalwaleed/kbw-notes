// Reporting-week math for the weekly AI-adoption self-report.
//
// A reporting week runs Friday 00:00 → Thursday, with the submission deadline
// Thursday 17:00, all in Asia/Riyadh. Riyadh is a fixed UTC+3 offset with no
// DST, so the math is plain offset arithmetic — deliberately NOT the user's
// browser timezone (the mandate fixes the deadline to Riyadh).

const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000
const FRIDAY = 5 // Date#getUTCDay()
const DEADLINE_HOUR_RIYADH = 17

export interface ReportingWeek {
  /** Friday anchor date (YYYY-MM-DD, Riyadh calendar) — the DB key. */
  weekStart: string
  /** Thursday end date (YYYY-MM-DD, Riyadh calendar). */
  weekEnd: string
  /** Submission deadline as a UTC instant (Thursday 17:00 Riyadh). */
  deadline: Date
}

function toIsoDate(utcMs: number): string {
  return new Date(utcMs).toISOString().slice(0, 10)
}

/** The reporting week containing `now` (Fri 00:00 Riyadh → next Fri 00:00 Riyadh). */
export function getReportingWeek(now: Date): ReportingWeek {
  // Shift so getUTC* accessors read Riyadh wall-clock values.
  const riyadh = new Date(now.getTime() + RIYADH_OFFSET_MS)
  const daysSinceFriday = (riyadh.getUTCDay() - FRIDAY + 7) % 7
  const riyadhMidnight = Date.UTC(
    riyadh.getUTCFullYear(),
    riyadh.getUTCMonth(),
    riyadh.getUTCDate()
  )
  const weekStartMs = riyadhMidnight - daysSinceFriday * DAY_MS
  return {
    weekStart: toIsoDate(weekStartMs),
    weekEnd: toIsoDate(weekStartMs + 6 * DAY_MS),
    deadline: deadlineFor(toIsoDate(weekStartMs)),
  }
}

/** UTC instant of Thursday 17:00 Riyadh for the week anchored at `weekStart` (a Friday). */
export function deadlineFor(weekStart: string): Date {
  const fridayMidnightRiyadhAsUtc = Date.parse(`${weekStart}T00:00:00Z`)
  const thursdayDeadlineRiyadhAsUtc =
    fridayMidnightRiyadhAsUtc + 6 * DAY_MS + DEADLINE_HOUR_RIYADH * 60 * 60 * 1000
  return new Date(thursdayDeadlineRiyadhAsUtc - RIYADH_OFFSET_MS)
}

/** Whether a submission instant missed the week's Thursday 17:00 Riyadh deadline. */
export function isLate(submittedAt: Date, weekStart: string): boolean {
  return submittedAt.getTime() > deadlineFor(weekStart).getTime()
}
