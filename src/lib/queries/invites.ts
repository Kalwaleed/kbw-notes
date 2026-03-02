import { supabase } from '../supabase'

/**
 * Check if an email address is in the invited_emails table.
 * Email must be pre-normalized (lowercase, trimmed) before calling.
 */
export async function checkEmailInvited(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('invited_emails')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to check invite status: ${error.message}`)
  }

  return !!data
}
