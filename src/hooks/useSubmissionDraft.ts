import { useState, useCallback, useEffect, useRef } from 'react'
import { updateSubmission } from '../lib/queries/submissions'
import type { SubmissionFormData } from '../types/submission'

interface UseSubmissionDraftOptions {
  submissionId: string
  initialData: SubmissionFormData
  autoSaveInterval?: number // milliseconds, default 30000 (30s)
  onSave?: (data: SubmissionFormData) => void
  onError?: (error: Error) => void
}

interface UseSubmissionDraftReturn {
  formData: SubmissionFormData
  setFormData: React.Dispatch<React.SetStateAction<SubmissionFormData>>
  updateField: <K extends keyof SubmissionFormData>(field: K, value: SubmissionFormData[K]) => void
  isDirty: boolean
  isSaving: boolean
  lastSaved: Date | null
  saveNow: () => Promise<Error | null>
  error: Error | null
}

export function useSubmissionDraft({
  submissionId,
  initialData,
  autoSaveInterval = 30000,
  onSave,
  onError,
}: UseSubmissionDraftOptions): UseSubmissionDraftReturn {
  const [formData, setFormData] = useState<SubmissionFormData>(initialData)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const lastSavedDataRef = useRef<string>(JSON.stringify(initialData))
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const formDataRef = useRef<SubmissionFormData>(formData)
  const isSavingRef = useRef(false)

  // Keep formDataRef in sync
  useEffect(() => {
    formDataRef.current = formData
  }, [formData])

  // Update form data and mark as dirty
  const updateField = useCallback(<K extends keyof SubmissionFormData>(
    field: K,
    value: SubmissionFormData[K]
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }
      const currentDataStr = JSON.stringify(updated)
      setIsDirty(currentDataStr !== lastSavedDataRef.current)
      return updated
    })
  }, [])

  // Track dirty state when formData changes via setFormData
  useEffect(() => {
    const currentDataStr = JSON.stringify(formData)
    setIsDirty(currentDataStr !== lastSavedDataRef.current)
  }, [formData])

  // Save function uses refs to avoid dependency on formData
  const saveNowRef = useRef<() => Promise<Error | null>>(async () => null)
  saveNowRef.current = async (): Promise<Error | null> => {
    if (isSavingRef.current) return null

    const currentData = formDataRef.current
    const currentDataStr = JSON.stringify(currentData)
    if (currentDataStr === lastSavedDataRef.current) {
      return null
    }

    isSavingRef.current = true
    setIsSaving(true)
    setError(null)

    try {
      await updateSubmission(submissionId, currentData)
      lastSavedDataRef.current = currentDataStr
      setLastSaved(new Date())
      setIsDirty(false)
      onSave?.(currentData)
      return null
    } catch (err) {
      const saveErr = err instanceof Error ? err : new Error('Failed to save draft')
      setError(saveErr)
      onError?.(saveErr)
      return saveErr
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }

  // Stable saveNow that delegates to ref
  const saveNow = useCallback((): Promise<Error | null> => {
    return saveNowRef.current()
  }, [])

  // Auto-save effect -- only depends on isDirty and autoSaveInterval
  useEffect(() => {
    if (!isDirty || isSavingRef.current) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveNowRef.current()
    }, autoSaveInterval)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [isDirty, autoSaveInterval])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Update initial data ref when initialData changes (e.g., after loading)
  useEffect(() => {
    lastSavedDataRef.current = JSON.stringify(initialData)
    setFormData(initialData)
    setIsDirty(false)
  }, [initialData])

  return {
    formData,
    setFormData,
    updateField,
    isDirty,
    isSaving,
    lastSaved,
    saveNow,
    error,
  }
}
