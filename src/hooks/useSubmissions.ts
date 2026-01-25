import { useState, useCallback, useEffect } from 'react'
import {
  fetchSubmissions,
  fetchSubmission,
  createSubmission,
  updateSubmission,
  publishSubmission,
  unpublishSubmission,
  deleteSubmission,
} from '../lib/queries/submissions'
import type { Submission, SubmissionFormData, SubmissionStatus } from '../types/submission'
import { useAuth } from './useAuth'

interface UseSubmissionsOptions {
  status?: SubmissionStatus | 'all'
}

interface UseSubmissionsReturn {
  submissions: Submission[]
  isLoading: boolean
  error: Error | null
  refresh: () => void
  create: () => Promise<Submission | null>
  update: (id: string, data: Partial<SubmissionFormData>) => Promise<Submission | null>
  publish: (id: string) => Promise<Submission | null>
  unpublish: (id: string) => Promise<Submission | null>
  remove: (id: string) => Promise<boolean>
}

export function useSubmissions({ status = 'all' }: UseSubmissionsOptions = {}): UseSubmissionsReturn {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadSubmissions = useCallback(async () => {
    if (!user) {
      setSubmissions([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchSubmissions({ authorId: user.id, status })
      setSubmissions(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load submissions'))
    } finally {
      setIsLoading(false)
    }
  }, [user, status])

  useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])

  const create = useCallback(async (): Promise<Submission | null> => {
    if (!user) return null

    try {
      const submission = await createSubmission(user.id)
      setSubmissions((prev) => [submission, ...prev])
      return submission
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create submission'))
      return null
    }
  }, [user])

  const update = useCallback(
    async (id: string, data: Partial<SubmissionFormData>): Promise<Submission | null> => {
      try {
        const updated = await updateSubmission(id, data)
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? updated : s))
        )
        return updated
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update submission'))
        return null
      }
    },
    []
  )

  const publish = useCallback(async (id: string): Promise<Submission | null> => {
    try {
      const published = await publishSubmission(id)
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? published : s))
      )
      return published
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to publish submission'))
      return null
    }
  }, [])

  const unpublish = useCallback(async (id: string): Promise<Submission | null> => {
    try {
      const unpublished = await unpublishSubmission(id)
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? unpublished : s))
      )
      return unpublished
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to unpublish submission'))
      return null
    }
  }, [])

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteSubmission(id)
      setSubmissions((prev) => prev.filter((s) => s.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete submission'))
      return false
    }
  }, [])

  return {
    submissions,
    isLoading,
    error,
    refresh: loadSubmissions,
    create,
    update,
    publish,
    unpublish,
    remove,
  }
}

// Hook for a single submission
interface UseSubmissionReturn {
  submission: Submission | null
  isLoading: boolean
  error: Error | null
  update: (data: Partial<SubmissionFormData>) => Promise<Submission | null>
  publish: () => Promise<Submission | null>
  unpublish: () => Promise<Submission | null>
  remove: () => Promise<boolean>
  refresh: () => void
}

export function useSubmission(id: string | undefined): UseSubmissionReturn {
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadSubmission = useCallback(async () => {
    if (!id) {
      setSubmission(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchSubmission(id)
      setSubmission(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load submission'))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadSubmission()
  }, [loadSubmission])

  const update = useCallback(
    async (data: Partial<SubmissionFormData>): Promise<Submission | null> => {
      if (!id) return null

      try {
        const updated = await updateSubmission(id, data)
        setSubmission(updated)
        return updated
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update submission'))
        return null
      }
    },
    [id]
  )

  const publish = useCallback(async (): Promise<Submission | null> => {
    if (!id) return null

    try {
      const published = await publishSubmission(id)
      setSubmission(published)
      return published
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to publish submission'))
      return null
    }
  }, [id])

  const unpublish = useCallback(async (): Promise<Submission | null> => {
    if (!id) return null

    try {
      const unpublished = await unpublishSubmission(id)
      setSubmission(unpublished)
      return unpublished
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to unpublish submission'))
      return null
    }
  }, [id])

  const remove = useCallback(async (): Promise<boolean> => {
    if (!id) return false

    try {
      await deleteSubmission(id)
      setSubmission(null)
      return true
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete submission'))
      return false
    }
  }, [id])

  return {
    submission,
    isLoading,
    error,
    update,
    publish,
    unpublish,
    remove,
    refresh: loadSubmission,
  }
}
