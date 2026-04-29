import { useEffect, useState } from 'react'
import { useCurrentEdition } from '../../hooks/useCurrentEdition'

/**
 * Folio bar — full-bleed, 28px, mono uppercase, three slots:
 *   left:   RUN №NNN · EDITION YYYY.MM.DD
 *   center: ● LIVE  (breathing dot)
 *   right:  RIYADH · HH:MM GMT+3
 *
 * Reads the current edition once on mount. The Riyadh clock updates once
 * a minute; rendered with `tabular-nums` so the digits do not jitter.
 */
function formatRunNumber(run: number): string {
  return `№${String(run).padStart(3, '0')}`
}

function formatEditionDate(iso: string): string {
  // input is YYYY-MM-DD; render as YYYY.MM.DD without TZ conversion
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${y}.${m}.${d}`
}

function formatRiyadhTime(now: Date): string {
  // Asia/Riyadh is UTC+3 (no DST). Use Intl for stability across runtimes.
  const fmt = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Riyadh',
  })
  return fmt.format(now)
}

export function FolioBar() {
  const { edition } = useCurrentEdition()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    // Tick on the minute boundary for the first update, then every 60s.
    const msToNextMinute = 60_000 - (Date.now() % 60_000)
    let interval: ReturnType<typeof setInterval> | null = null

    const initial = setTimeout(() => {
      setNow(new Date())
      interval = setInterval(() => setNow(new Date()), 60_000)
    }, msToNextMinute)

    return () => {
      clearTimeout(initial)
      if (interval) clearInterval(interval)
    }
  }, [])

  const left = edition
    ? `RUN ${formatRunNumber(edition.run_number)} · EDITION ${formatEditionDate(edition.edition_date)}`
    : 'RUN №— · EDITION ————.——.——'

  const time = formatRiyadhTime(now)

  return (
    <div
      className="w-full flex items-center justify-between border-b"
      style={{
        height: 28,
        background: 'var(--color-paper-sunken)',
        borderColor: 'var(--color-hair)',
        padding: '0 24px',
      }}
      role="contentinfo"
      aria-label="Folio bar"
    >
      <span
        className="font-mono uppercase truncate"
        style={{
          fontSize: 'var(--text-mono-xs)',
          color: 'var(--color-ink-muted)',
          letterSpacing: '0.08em',
        }}
      >
        {left}
      </span>
      <span
        className="font-mono uppercase flex items-center gap-2"
        style={{
          fontSize: 'var(--text-mono-xs)',
          color: 'var(--color-ink-muted)',
          letterSpacing: '0.08em',
        }}
      >
        <span className="live-dot" aria-hidden="true" />
        <span>LIVE</span>
      </span>
      <span
        className="font-mono uppercase tabular-nums"
        style={{
          fontSize: 'var(--text-mono-xs)',
          color: 'var(--color-ink-muted)',
          letterSpacing: '0.08em',
        }}
      >
        RIYADH · {time} GMT+3
      </span>
    </div>
  )
}
