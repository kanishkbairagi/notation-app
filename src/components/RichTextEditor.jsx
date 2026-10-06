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

  const insertCustomHTML = (htmlSnippet) => {
    document.execCommand('insertHTML', false, htmlSnippet)
    editorRef.current?.focus()
  }

  const handleInsertWikiLink = () => {
    const linkTitle = window.prompt('Enter Page Title to Link to (e.g., CAP Theorem):')
    if (linkTitle && linkTitle.trim()) {
      insertCustomHTML(`&nbsp;<span class="bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-mono font-semibold text-xs border border-blue-300 dark:border-blue-700">[[${linkTitle.trim()}]]</span>&nbsp;`)
    }
  }

  const handleInsertCodeSnippet = () => {
    insertCustomHTML('<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-xs my-2 text-indigo-600 dark:text-indigo-400 overflow-x-auto border border-gray-300 dark:border-gray-700"><code>// Algorithm snippet\nfunction bfs(graph, start) {\n  const queue = [start];\n  // ...\n}</code></pre>')
  }

  const handleInsertMath = () => {
    insertCustomHTML('&nbsp;<code class="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-mono text-xs font-semibold">$O(|V| + |E|)$</code>&nbsp;')
  }

  const Toolbar = () => (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg items-center">
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
        className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm font-semibold"
        title="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => applyFormat('formatBlock', '<h2>')}
        className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm font-semibold"
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
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <button
        type="button"
        onClick={handleInsertWikiLink}
        className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700/60 rounded text-xs font-mono font-medium"
        title="Insert [[WikiLink]] cross-reference"
      >
        [[Link]]
      </button>
      <button
        type="button"
        onClick={handleInsertCodeSnippet}
        className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60 rounded text-xs font-mono font-medium"
        title="Insert Code Snippet"
      >
        &lt;/&gt; Code
      </button>
      <button
        type="button"
        onClick={handleInsertMath}
        className="px-2 py-1 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-800/50 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-700/60 rounded text-xs font-mono font-medium"
        title="Insert Math notation"
      >
        fx Math
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
        className="min-h-[200px] p-4 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-b-lg font-normal"
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
