import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fail fast if credentials are missing - don't silently use placeholders
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'FATAL: Supabase credentials not configured. ' +
    'Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
    'See .env.example for template.'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
