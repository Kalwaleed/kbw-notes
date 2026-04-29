import { useState, useEffect, useRef, useMemo } from 'react'
import { X, Plus } from 'lucide-react'
import { fetchAllTags } from '../../lib/queries/submissions'

interface TagSelectorProps {
  selectedTags: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
}

export function TagSelector({ selectedTags, onChange, maxTags = 5 }: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('')
  const [allTags, setAllTags] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAllTags().then(setAllTags).catch(console.error)
  }, [])

  const suggestions = useMemo(() => {
    if (inputValue.trim()) {
      return allTags
        .filter((tag) => tag.toLowerCase().includes(inputValue.toLowerCase()) && !selectedTags.includes(tag))
        .slice(0, 5)
    }
    return []
  }, [inputValue, allTags, selectedTags])

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
    if (normalizedTag && !selectedTags.includes(normalizedTag) && selectedTags.length < maxTags) {
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
      if (inputValue.trim()) addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div
        className="flex flex-wrap"
        style={{
          gap: 'var(--space-2)',
          padding: 'var(--space-2)',
          background: 'var(--color-paper-raised)',
          border: `1px solid ${isFocused ? 'var(--color-accent)' : 'var(--color-hair)'}`,
          transition: 'border-color 100ms ease',
        }}
      >
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center font-mono uppercase"
            style={{
              gap: 6,
              fontSize: 'var(--text-mono-xs)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: 'var(--color-ink-muted)',
              padding: '4px 8px',
              border: '1px solid var(--color-hair)',
              borderRadius: 2,
              background: 'var(--color-paper)',
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag} tag`}
              style={{
                width: 14,
                height: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                color: 'var(--color-ink-soft)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-rose)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink-soft)' }}
            >
              <X size={10} strokeWidth={1.5} />
            </button>
          </span>
        ))}

        {selectedTags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true) }}
            onFocus={() => { setShowSuggestions(true); setIsFocused(true) }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={selectedTags.length === 0 ? 'add tags…' : ''}
            style={{
              flex: 1,
              minWidth: 100,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-mono-sm)',
              color: 'var(--color-ink)',
              padding: '2px 4px',
            }}
          />
        )}
      </div>

      {showSuggestions && (suggestions.length > 0 || inputValue.trim()) && (
        <div
          className="drawer-enter"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: 'var(--color-paper-raised)',
            border: '1px solid var(--color-hair)',
            boxShadow: '6px 6px 0 0 var(--color-hair)',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="font-mono"
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                fontSize: 'var(--text-mono-sm)',
                color: 'var(--color-ink)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 100ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-accent-tint)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              {suggestion}
            </button>
          ))}
          {inputValue.trim() && !suggestions.includes(inputValue.trim().toLowerCase()) && (
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              className="font-mono uppercase flex items-center"
              style={{
                gap: 8,
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                fontSize: 'var(--text-mono-sm)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: 'var(--color-accent)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 100ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-accent-tint)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <Plus size={14} strokeWidth={1.5} />
              Create "{inputValue.trim()}"
            </button>
          )}
        </div>
      )}

      <p
        className="font-mono uppercase"
        style={{
          margin: 0,
          marginTop: 6,
          fontSize: 'var(--text-mono-xs)',
          letterSpacing: '0.04em',
          color: 'var(--color-ink-soft)',
        }}
      >
        {selectedTags.length} / {maxTags} · Enter or comma to add.
      </p>
    </div>
  )
}
