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
  saveNow: () => Promise<void>
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

  // Save function
  const saveNow = useCallback(async () => {
    if (isSaving) return

    const currentDataStr = JSON.stringify(formData)
    if (currentDataStr === lastSavedDataRef.current) {
      // No changes to save
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await updateSubmission(submissionId, formData)
      lastSavedDataRef.current = currentDataStr
      setLastSaved(new Date())
      setIsDirty(false)
      onSave?.(formData)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save draft')
      setError(error)
      onError?.(error)
    } finally {
      setIsSaving(false)
    }
  }, [submissionId, formData, isSaving, onSave, onError])

  // Auto-save effect
  useEffect(() => {
    if (!isDirty || isSaving) return

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      saveNow()
    }, autoSaveInterval)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [isDirty, isSaving, autoSaveInterval, saveNow])

  // Save on unmount if dirty
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
