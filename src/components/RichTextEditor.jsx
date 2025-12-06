import { useState, useRef, useEffect } from 'react'

export function RichTextEditor({ content, onChange, placeholder = 'Start writing...' }) {
  const [isFocused, setIsFocused] = useState(false)
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || ''
    }
  }, [content])

  const handleInput = (e) => {
    const html = e.target.innerHTML
    onChange(html)
  }

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const Toolbar = () => (
    <div className="flex gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
      <button
        type="button"
        onClick={() => applyFormat('bold')}
        className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm font-bold"
        title="Bold"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => applyFormat('italic')}
        className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm italic"
        title="Italic"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => applyFormat('underline')}
        className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm underline"
        title="Underline"
      >
        U
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <button
        type="button"
        onClick={() => applyFormat('formatBlock', '<h1>')}
        className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm"
        title="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => applyFormat('formatBlock', '<h2>')}
        className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm"
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => applyFormat('formatBlock', '<p>')}
        className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm"
        title="Paragraph"
      >
        P
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <button
        type="button"
        onClick={() => applyFormat('insertUnorderedList')}
        className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm"
        title="Bullet List"
      >
        •
      </button>
      <button
        type="button"
        onClick={() => applyFormat('insertOrderedList')}
        className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm"
        title="Numbered List"
      >
        1.
      </button>
    </div>
  )

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg ${isFocused ? 'ring-2 ring-blue-500' : ''}`}>
      <Toolbar />
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="min-h-[200px] p-4 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-b-lg"
        style={{ whiteSpace: 'pre-wrap' }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

