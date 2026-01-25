import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/database.types'

export interface ProfileUpdate {
  display_name: string
  bio?: string | null
  website?: string | null
}

// Use localStorage to track profile completion (workaround for schema cache)
const PROFILE_COMPLETE_KEY = 'kbw_profile_complete'

/**
 * Validate profile completion flag from localStorage
 * Only 'true' is accepted, anything else is false
 */
function validateProfileComplete(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(PROFILE_COMPLETE_KEY)
  // Strict validation: only exactly 'true' is valid
  return stored === 'true'
}

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [localProfileComplete, setLocalProfileComplete] = useState<boolean>(validateProfileComplete)

  // Fetch profile
  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setIsLoading(false)
      return
    }

    async function fetchProfile() {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError) {
        // Profile doesn't exist yet - this is expected for new users
        if (fetchError.code === 'PGRST116') {
          setProfile(null)
        } else {
          setError(fetchError.message)
        }
      } else {
        setProfile(data)
      }

      setIsLoading(false)
    }

    fetchProfile()
  }, [userId])

  // Update profile
  const updateProfile = useCallback(
    async (updates: ProfileUpdate) => {
      if (!userId) {
        return { error: 'No user ID provided' }
      }

      setError(null)

      // Use raw SQL to bypass schema cache issue with profile_complete column
      const { error: updateError } = await supabase.rpc('update_profile', {
        user_id: userId,
        new_display_name: updates.display_name,
        new_bio: updates.bio ?? null,
        new_website: updates.website ?? null,
      })

      if (updateError) {
        // Fallback to regular update without profile_complete if RPC doesn't exist
        const { error: fallbackError } = await supabase
          .from('profiles')
          .update({
            display_name: updates.display_name,
            bio: updates.bio,
            website: updates.website,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (fallbackError) {
          setError(fallbackError.message)
          return { error: fallbackError.message }
        }
      }

      // Refetch profile after update
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        setProfile(data)
      }

      // Set localStorage flag for profile completion (schema cache workaround)
      localStorage.setItem(PROFILE_COMPLETE_KEY, 'true')
      setLocalProfileComplete(true)

      return { error: null }
    },
    [userId]
  )

  // Create profile (for new users if trigger didn't fire)
  const createProfile = useCallback(
    async (profileData: ProfileUpdate & { avatar_url?: string | null }) => {
      if (!userId) {
        return { error: 'No user ID provided' }
      }

      setError(null)

      // Don't include profile_complete in insert to avoid schema cache issue
      const { error: insertError } = await supabase.from('profiles').insert({
        id: userId,
        display_name: profileData.display_name,
        avatar_url: profileData.avatar_url ?? null,
        bio: profileData.bio ?? null,
        website: profileData.website ?? null,
      })

      if (insertError) {
        setError(insertError.message)
        return { error: insertError.message }
      }

      // Refetch profile after creation
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        setProfile(data)
      }

      // Set localStorage flag for profile completion (schema cache workaround)
      localStorage.setItem(PROFILE_COMPLETE_KEY, 'true')
      setLocalProfileComplete(true)

      return { error: null }
    },
    [userId]
  )

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    createProfile,
    profileComplete: localProfileComplete || (profile?.profile_complete ?? false),
  }
}
