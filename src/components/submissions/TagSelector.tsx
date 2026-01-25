import { useState, useEffect, useRef, useMemo } from 'react'
import { X, Plus } from 'lucide-react'
import { fetchAllTags } from '../../lib/queries/submissions'

interface TagSelectorProps {
  selectedTags: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
}

export function TagSelector({
  selectedTags,
  onChange,
  maxTags = 5,
}: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('')
  const [allTags, setAllTags] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load all existing tags on mount
  useEffect(() => {
    fetchAllTags().then(setAllTags).catch(console.error)
  }, [])

  // Filter suggestions based on input - using useMemo for derived state
  const suggestions = useMemo(() => {
    if (inputValue.trim()) {
      return allTags
        .filter(
          (tag) =>
            tag.toLowerCase().includes(inputValue.toLowerCase()) &&
            !selectedTags.includes(tag)
        )
        .slice(0, 5)
    }
    return []
  }, [inputValue, allTags, selectedTags])

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addTag = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase()
    if (
      normalizedTag &&
      !selectedTags.includes(normalizedTag) &&
      selectedTags.length < maxTags
    ) {
      onChange([...selectedTags, normalizedTag])
    }
    setInputValue('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-violet-500">
        {/* Selected Tags */}
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 rounded-md"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="p-0.5 rounded hover:bg-violet-200 dark:hover:bg-violet-900 transition-colors"
              aria-label={`Remove ${tag} tag`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Input */}
        {selectedTags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedTags.length === 0 ? 'Add tags...' : ''}
            className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400"
            style={{ fontFamily: "'Optima', 'Segoe UI', sans-serif" }}
          />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || inputValue.trim()) && (
        <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => addTag(suggestion)}
              className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {suggestion}
            </button>
          ))}
          {inputValue.trim() && !suggestions.includes(inputValue.trim().toLowerCase()) && (
            <button
              onClick={() => addTag(inputValue)}
              className="w-full px-3 py-2 text-left text-sm text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create "{inputValue.trim()}"
            </button>
          )}
        </div>
      )}

      {/* Helper Text */}
      <p className="mt-1 text-xs text-slate-500">
        {selectedTags.length}/{maxTags} tags. Press Enter or comma to add.
      </p>
    </div>
  )
}
