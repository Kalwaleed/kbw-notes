import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Undo,
  Redo,
} from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { MiniImageUploader } from './ImageUploader'

const lowlight = createLowlight(common)

interface SubmissionEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function SubmissionEditor({
  content,
  onChange,
  placeholder = 'Write your post here.',
}: SubmissionEditorProps) {
  const isUpdatingRef = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Image.configure({
        HTMLAttributes: { class: '' }, // no rounded corners — matches prose-article
      }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content,
    onUpdate: ({ editor }) => {
      if (!isUpdatingRef.current) onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        // Use the same prose-article style so what-you-edit ≈ what-renders.
        class: 'tiptap focus:outline-none',
        style: 'min-height: 320px; padding: 16px 20px;',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      isUpdatingRef.current = true
      editor.commands.setContent(content)
      isUpdatingRef.current = false
    }
  }, [content, editor])

  const handleImageInsert = useCallback(
    (url: string) => {
      editor?.chain().focus().setImage({ src: url }).run()
    },
    [editor]
  )

  if (!editor) {
    return (
      <div
        className="skeleton"
        style={{ height: 400, background: 'var(--color-paper-raised)', border: '1px solid var(--color-hair)' }}
      />
    )
  }

  return (
    <div
      style={{
        border: '1px solid var(--color-hair)',
        background: 'var(--color-paper-raised)',
      }}
    >
      <div
        className="flex flex-wrap items-center"
        style={{
          gap: 4,
          padding: 8,
          borderBottom: '1px solid var(--color-hair)',
          background: 'var(--color-paper-sunken)',
        }}
      >
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 size={14} strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 size={14} strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 size={14} strokeWidth={1.5} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Cmd+B)">
          <Bold size={14} strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Cmd+I)">
          <Italic size={14} strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline code">
          <Code size={14} strokeWidth={1.5} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bulleted list">
          <List size={14} strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered list">
          <ListOrdered size={14} strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
          <Quote size={14} strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code block">
          <Code size={14} strokeWidth={1.5} />
        </ToolbarButton>

        <ToolbarDivider />

        <MiniImageUploader onImageUploaded={handleImageInsert} />

        <div style={{ flex: 1 }} />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Cmd+Z)">
          <Undo size={14} strokeWidth={1.5} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Cmd+Shift+Z)">
          <Redo size={14} strokeWidth={1.5} />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      style={{
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isActive ? 'var(--color-accent-tint)' : 'transparent',
        color: isActive ? 'var(--color-ink)' : 'var(--color-ink-muted)',
        border: 'none',
        borderRadius: 2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'background-color 100ms ease, color 100ms ease',
      }}
      onMouseEnter={(e) => {
        if (disabled || isActive) return
        e.currentTarget.style.background = 'var(--color-accent-tint)'
        e.currentTarget.style.color = 'var(--color-ink)'
      }}
      onMouseLeave={(e) => {
        if (disabled || isActive) return
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'var(--color-ink-muted)'
      }}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div style={{ width: 1, height: 20, background: 'var(--color-hair)', margin: '0 4px' }} />
}
