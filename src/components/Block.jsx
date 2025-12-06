import { useDrag, useDrop } from 'react-dnd'
import { RichTextEditor } from './RichTextEditor'

export function Block({ block, index, onUpdate, onDelete, onMove }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'block',
    item: { id: block.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [{ isOver }, drop] = useDrop({
    accept: 'block',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        onMove(draggedItem.index, index)
        draggedItem.index = index
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  const handleContentChange = (content) => {
    onUpdate(block.id, { ...block, content })
  }

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`group relative mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-600 transition-all ${
        isDragging ? 'opacity-50' : ''
      } ${isOver ? 'border-blue-500 dark:border-blue-400' : ''}`}
    >
      <div className="flex items-start gap-2">
        <div className="mt-2 cursor-move text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        <div className="flex-1">
          <RichTextEditor
            content={block.content || ''}
            onChange={handleContentChange}
            placeholder="Type '/' for commands or start writing..."
          />
        </div>
        <button
          onClick={() => onDelete(block.id)}
          className="opacity-0 group-hover:opacity-100 mt-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-opacity"
          title="Delete block"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

