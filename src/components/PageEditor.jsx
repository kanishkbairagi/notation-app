import { useState, useEffect, useMemo } from 'react'
import { Block } from './Block'
import { formatRelativeTime } from '../utils/dateUtils'

export function PageEditor({ page, allPages = [], onUpdate, onDelete, onSelectPage, onOpenGraph }) {
  const [title, setTitle] = useState(page?.title || '')
  const [blocks, setBlocks] = useState(page?.blocks || [])
  const [showAstModal, setShowAstModal] = useState(false)
  const [copiedAst, setCopiedAst] = useState(false)

  useEffect(() => {
    if (page) {
      setTitle(page.title || '')
      setBlocks(page.blocks || [])
    }
  }, [page])

  // Compute Inbound Backlinks from other notes (Graph In-Degree references)
  const backlinks = useMemo(() => {
    if (!page || !allPages) return []
    const currentTitleLower = (page.title || '').trim().toLowerCase()
    if (!currentTitleLower || currentTitleLower === 'untitled') return []

    return allPages.filter(otherPage => {
      if (otherPage.id === page.id) return false
      const content = (otherPage.blocks || [])
        .map(b => (b.content || '').replace(/<[^>]*>/g, ' '))
        .join(' ')
        .toLowerCase()
      return content.includes(`[[${currentTitleLower}]]`) || content.includes(currentTitleLower)
    })
  }, [page, allPages])

  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    onUpdate({ ...page, title: newTitle, updatedAt: new Date().toISOString() })
  }

  const handleBlockUpdate = (blockId, updatedBlock) => {
    const newBlocks = blocks.map(block =>
      block.id === blockId ? updatedBlock : block
    )
    setBlocks(newBlocks)
    onUpdate({ ...page, blocks: newBlocks, updatedAt: new Date().toISOString() })
  }

  const handleBlockDelete = (blockId) => {
    const newBlocks = blocks.filter(block => block.id !== blockId)
    setBlocks(newBlocks)
    onUpdate({ ...page, blocks: newBlocks, updatedAt: new Date().toISOString() })
  }

  const handleAddBlock = () => {
    const newBlock = {
      id: Date.now().toString(),
      type: 'text',
      content: '',
      createdAt: new Date().toISOString(),
    }
    const newBlocks = [...blocks, newBlock]
    setBlocks(newBlocks)
    onUpdate({ ...page, blocks: newBlocks, updatedAt: new Date().toISOString() })
  }

  const handleMoveBlock = (fromIndex, toIndex) => {
    const newBlocks = [...blocks]
    const [movedBlock] = newBlocks.splice(fromIndex, 1)
    newBlocks.splice(toIndex, 0, movedBlock)
    setBlocks(newBlocks)
    onUpdate({ ...page, blocks: newBlocks, updatedAt: new Date().toISOString() })
  }

  // Generate Abstract Syntax Tree (AST) serialization
  const documentAst = useMemo(() => {
    if (!page) return null
    return {
      type: 'DocumentRootNode',
      documentId: page.id,
      title: page.title || 'Untitled',
      timestamps: {
        createdAt: page.createdAt,
        updatedAt: page.updatedAt
      },
      treeMetadata: {
        totalBlocks: (page.blocks || []).length,
        inboundDegree: backlinks.length
      },
      children: (page.blocks || []).map((b, idx) => ({
        type: 'BlockNode',
        nodeId: b.id,
        index: idx,
        contentType: b.type || 'text',
        rawContent: b.content || '',
        plainText: (b.content || '').replace(/<[^>]*>/g, '').trim()
      }))
    }
  }, [page, backlinks])

  const handleCopyAst = () => {
    if (!documentAst) return
    navigator.clipboard.writeText(JSON.stringify(documentAst, null, 2))
    setCopiedAst(true)
    setTimeout(() => setCopiedAst(false), 2000)
  }

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-xl mb-2 font-medium">No page selected</p>
          <p className="text-sm">Create a new page or select an existing one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
      {/* Editor Header Bar */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto flex items-start justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled"
              className="w-full text-3xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
              <span>Last updated {formatRelativeTime(page.updatedAt)}</span>
              <span>•</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                {backlinks.length} Inbound Link{backlinks.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAstModal(true)}
              className="px-2.5 py-1.5 text-xs font-mono rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 transition-colors flex items-center gap-1.5"
              title="View Serialized Document Abstract Syntax Tree (AST)"
            >
              <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Document AST
            </button>
            {onOpenGraph && (
              <button
                onClick={onOpenGraph}
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60 transition-colors flex items-center gap-1.5"
                title="View in Topological Knowledge Graph"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Graph View
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Blocks List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {blocks.map((block, index) => (
            <Block
              key={block.id}
              block={block}
              index={index}
              onUpdate={handleBlockUpdate}
              onDelete={handleBlockDelete}
              onMove={handleMoveBlock}
            />
          ))}

          <button
            onClick={handleAddBlock}
            className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add a block
          </button>

          {/* Bi-directional Linked References (Backlinks) */}
          {backlinks.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
              <h4 className="text-xs uppercase font-mono tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-3 flex items-center gap-2">
                <span>Linked References (Graph Backlinks)</span>
                <span className="px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px]">
                  {backlinks.length}
                </span>
              </h4>
              <div className="space-y-2">
                {backlinks.map(refPage => (
                  <div
                    key={refPage.id}
                    onClick={() => onSelectPage && onSelectPage(refPage.id)}
                    className="p-3 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                      <span>{refPage.title}</span>
                      <span className="text-[10px] text-gray-400 font-normal">Click to navigate →</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {(refPage.blocks || [])
                        .map(b => (b.content || '').replace(/<[^>]*>/g, ' '))
                        .join(' ')
                        .trim() || 'No preview available'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document AST Inspector Modal */}
      {showAstModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col">
            <div className="p-4 border-b border-gray-800 bg-gray-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  AST Serialization
                </span>
                <h3 className="font-bold text-sm text-gray-100">Document Tree Architecture</h3>
              </div>
              <button
                onClick={() => setShowAstModal(false)}
                className="text-gray-400 hover:text-gray-200 text-sm p-1 rounded"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <p className="text-xs text-gray-400 mb-3">
                Hierarchical Abstract Syntax Tree (AST) node schema with recursive children deserialization:
              </p>
              <pre className="bg-gray-950 p-4 rounded-xl border border-gray-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
                {JSON.stringify(documentAst, null, 2)}
              </pre>
            </div>
            <div className="p-3 bg-gray-950 border-t border-gray-800 flex justify-between items-center">
              <span className="text-[11px] text-gray-400 font-mono">
                {documentAst?.treeMetadata.totalBlocks} Block Nodes
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyAst}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-mono transition-colors"
                >
                  {copiedAst ? '✓ Copied to Clipboard' : 'Copy JSON AST'}
                </button>
                <button
                  onClick={() => setShowAstModal(false)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
