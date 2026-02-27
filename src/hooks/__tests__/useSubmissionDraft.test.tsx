import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSubmissionDraft } from '../useSubmissionDraft'
import type { SubmissionFormData } from '../../types/submission'

const mockUpdateSubmission = vi.fn()
vi.mock('../../lib/queries/submissions', () => ({
  updateSubmission: (...args: unknown[]) => mockUpdateSubmission(...args),
}))

const initialData: SubmissionFormData = {
  title: 'Test Title',
  excerpt: 'Test excerpt',
  content: '<p>Hello</p>',
  coverImageUrl: null,
  tags: ['testing'],
}

describe('useSubmissionDraft', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mockUpdateSubmission.mockResolvedValue({})
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with provided data', () => {
    const { result } = renderHook(() =>
      useSubmissionDraft({ submissionId: 's-1', initialData })
    )
    expect(result.current.formData).toEqual(initialData)
    expect(result.current.isDirty).toBe(false)
    expect(result.current.isSaving).toBe(false)
  })

  it('updateField sets dirty flag', () => {
    const { result } = renderHook(() =>
      useSubmissionDraft({ submissionId: 's-1', initialData })
    )

    act(() => {
      result.current.updateField('title', 'New Title')
    })

    expect(result.current.formData.title).toBe('New Title')
    expect(result.current.isDirty).toBe(true)
  })

  it('saveNow calls updateSubmission', async () => {
    const { result } = renderHook(() =>
      useSubmissionDraft({ submissionId: 's-1', initialData })
    )

    act(() => {
      result.current.updateField('title', 'Updated')
    })

    await act(async () => {
      const err = await result.current.saveNow()
      expect(err).toBeNull()
    })

    expect(mockUpdateSubmission).toHaveBeenCalledWith('s-1', expect.objectContaining({ title: 'Updated' }))
    expect(result.current.isDirty).toBe(false)
    expect(result.current.lastSaved).toBeInstanceOf(Date)
  })

  it('auto-saves after 30s when dirty', async () => {
    const { result } = renderHook(() =>
      useSubmissionDraft({ submissionId: 's-1', initialData, autoSaveInterval: 30000 })
    )

    act(() => {
      result.current.updateField('title', 'Auto-saved')
    })

    expect(mockUpdateSubmission).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(30000)
    })

    expect(mockUpdateSubmission).toHaveBeenCalledWith('s-1', expect.objectContaining({ title: 'Auto-saved' }))
  })

  it('skips save when data is clean', async () => {
    const { result } = renderHook(() =>
      useSubmissionDraft({ submissionId: 's-1', initialData })
    )

    await act(async () => {
      const err = await result.current.saveNow()
      expect(err).toBeNull()
    })

    expect(mockUpdateSubmission).not.toHaveBeenCalled()
  })

  it('calls onSave callback after successful save', async () => {
    const onSave = vi.fn()
    const { result } = renderHook(() =>
      useSubmissionDraft({ submissionId: 's-1', initialData, onSave })
    )

    act(() => {
      result.current.updateField('title', 'Callback test')
    })

    await act(async () => {
      await result.current.saveNow()
    })

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Callback test' }))
  })

  it('calls onError callback on save failure', async () => {
    const onError = vi.fn()
    mockUpdateSubmission.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() =>
      useSubmissionDraft({ submissionId: 's-1', initialData, onError })
    )

    act(() => {
      result.current.updateField('title', 'Will fail')
    })

    await act(async () => {
      const err = await result.current.saveNow()
      expect(err).toBeInstanceOf(Error)
      expect(err?.message).toBe('Network error')
    })

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Network error' }))
    expect(result.current.error?.message).toBe('Network error')
  })

  it('returns error from saveNow on failure', async () => {
    mockUpdateSubmission.mockRejectedValue(new Error('Save failed'))

    const { result } = renderHook(() =>
      useSubmissionDraft({ submissionId: 's-1', initialData })
    )

    act(() => {
      result.current.updateField('excerpt', 'changed')
    })

    await act(async () => {
      const err = await result.current.saveNow()
      expect(err).toBeInstanceOf(Error)
    })
  })

  it('clears timer on unmount', async () => {
    const { result, unmount } = renderHook(() =>
      useSubmissionDraft({ submissionId: 's-1', initialData })
    )

    act(() => {
      result.current.updateField('title', 'Before unmount')
    })

    unmount()

    await act(async () => {
      vi.advanceTimersByTime(30000)
    })

    expect(mockUpdateSubmission).not.toHaveBeenCalled()
  })

  it('setFormData marks dirty when different from saved', () => {
    const { result } = renderHook(() =>
      useSubmissionDraft({ submissionId: 's-1', initialData })
    )

    act(() => {
      result.current.setFormData({ ...initialData, title: 'Direct set' })
    })

    expect(result.current.isDirty).toBe(true)
  })

  it('uses custom autoSaveInterval', async () => {
    const { result } = renderHook(() =>
      useSubmissionDraft({ submissionId: 's-1', initialData, autoSaveInterval: 5000 })
    )

    act(() => {
      result.current.updateField('title', 'Quick save')
    })

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    expect(mockUpdateSubmission).toHaveBeenCalled()
  })

  it('resets state when initialData changes', () => {
    const { result, rerender } = renderHook(
      ({ data }) => useSubmissionDraft({ submissionId: 's-1', initialData: data }),
      { initialProps: { data: initialData } }
    )

    act(() => {
      result.current.updateField('title', 'Modified')
    })

    expect(result.current.isDirty).toBe(true)

    const newData: SubmissionFormData = { ...initialData, title: 'Fresh' }
    rerender({ data: newData })

    expect(result.current.formData.title).toBe('Fresh')
    expect(result.current.isDirty).toBe(false)
  })

  it('does not double-save when already saving', async () => {
    let resolveFirst: () => void
    mockUpdateSubmission.mockImplementationOnce(() => new Promise<void>((r) => { resolveFirst = r }))
    mockUpdateSubmission.mockResolvedValue({})

    const { result } = renderHook(() =>
      useSubmissionDraft({ submissionId: 's-1', initialData })
    )

    act(() => {
      result.current.updateField('title', 'Concurrent')
    })

    let p1: Promise<Error | null>
    let p2: Promise<Error | null>
    await act(async () => {
      p1 = result.current.saveNow()
      p2 = result.current.saveNow()
    })

    await act(async () => {
      resolveFirst!()
      await p1!
      await p2!
    })

    // Only called once because second saveNow sees isSavingRef = true
    expect(mockUpdateSubmission).toHaveBeenCalledTimes(1)
  })
})
