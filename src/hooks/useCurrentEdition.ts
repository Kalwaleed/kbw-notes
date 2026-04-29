import { useEffect, useState } from 'react'
import { fetchCurrentEdition } from '../lib/queries/editions'
import type { EditionRow } from '../lib/database.types'

interface UseCurrentEditionResult {
  edition: EditionRow | null
  loading: boolean
  error: Error | null
}

/**
 * Loads the single current edition (the row whose is_current = true).
 * The folio bar reads from this hook on every authenticated page.
 *
 * Editions advance rarely — manual `advance_edition()` RPC by an admin —
 * so we don't poll. A page reload picks up the new edition.
 */
export function useCurrentEdition(): UseCurrentEditionResult {
  const [edition, setEdition] = useState<EditionRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchCurrentEdition()
      .then((row) => {
        if (cancelled) return
        setEdition(row)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { edition, loading, error }
}
