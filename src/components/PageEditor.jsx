import { useState, useEffect } from 'react'
import { Block } from './Block'
import { formatRelativeTime } from '../utils/dateUtils'

export function PageEditor({ page, onUpdate, onDelete }) {
  const [title, setTitle] = useState(page?.title || '')
  const [blocks, setBlocks] = useState(page?.blocks || [])

  useEffect(() => {
    if (page) {
      setTitle(page.title || '')
      setBlocks(page.blocks || [])
    }
  }, [page])

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

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-xl mb-2">No page selected</p>
          <p className="text-sm">Create a new page or select an existing one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="w-full text-3xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Last updated {formatRelativeTime(page.updatedAt)}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
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
            className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            + Add a block
          </button>
        </div>
      </div>
    </div>
  )
}

