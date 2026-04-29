import { supabase } from '../supabase'
import type { EditionRow } from '../database.types'

/**
 * Fetch the single current edition. Returns null if none is marked current
 * (the migration seeds Run №001, so this should only happen in misconfigured
 * databases).
 */
export async function fetchCurrentEdition(): Promise<EditionRow | null> {
  const { data, error } = await supabase
    .from('editions')
    .select('*')
    .eq('is_current', true)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Admin-only RPC. Retires the current edition and creates a new one with
 * run_number = max + 1, edition_date = today.
 */
export async function advanceEdition(): Promise<EditionRow> {
  const { data, error } = await supabase.rpc('advance_edition')
  if (error) throw error
  if (!data) throw new Error('advance_edition returned no row')
  return data as EditionRow
}
