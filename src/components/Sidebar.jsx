import { useState } from 'react'
import { formatRelativeTime } from '../utils/dateUtils'

export function Sidebar({
  pages,
  currentPageId,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onTogglePin,
  searchQuery,
  onSearchChange,
  allPages,
  onOpenGraph,
  onOpenDiagnostics,
  hasDiagnostics,
  onLoadBenchmark
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const pinnedPages = pages.filter(p => p.pinned).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  const unpinnedPages = pages.filter(p => !p.pinned).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  const isSearching = searchQuery && searchQuery.trim().length > 0

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed left-0 top-0 h-full w-8 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
        title="Expand Sidebar"
      >
        <svg className="w-5 h-5 mx-auto text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    )
  }

  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen">
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              N
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Notation</h1>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500"
            title="Collapse Sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onCreatePage}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-1.5 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Page
          </button>

          {/* Interactive Knowledge Graph View Button */}
          <button
            onClick={onOpenGraph}
            className="w-full px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60 rounded-lg font-medium transition-colors text-xs flex items-center justify-between"
            title="Open Force-Directed Knowledge Graph Visualizer"
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Knowledge Graph
            </span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-200 dark:bg-indigo-800 text-[10px] font-mono">
              G=(V,E)
            </span>
          </button>
        </div>
      </div>

      {/* Search Input with IR Diagnostic trigger */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes (BM25)..."
            className="w-full px-3 py-1.5 pl-8 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* IR Diagnostics Badge when searching */}
        {isSearching && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {pages.length} results found
            </span>
            <button
              onClick={onOpenDiagnostics}
              className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800"
            >
              <span>IR Metrics</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto">
        {pinnedPages.length > 0 && (
          <div className="p-2">
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Pinned
            </div>
            {pinnedPages.map(page => (
              <PageItem
                key={page.id}
                page={page}
                isActive={currentPageId === page.id}
                onSelect={() => onSelectPage(page.id)}
                onDelete={() => onDeletePage(page.id)}
                onTogglePin={() => onTogglePin(page.id)}
              />
            ))}
          </div>
        )}

        {unpinnedPages.length > 0 && (
          <div className="p-2">
            {pinnedPages.length > 0 && (
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pages
              </div>
            )}
            {unpinnedPages.map(page => (
              <PageItem
                key={page.id}
                page={page}
                isActive={currentPageId === page.id}
                onSelect={() => onSelectPage(page.id)}
                onDelete={() => onDeletePage(page.id)}
                onTogglePin={() => onTogglePin(page.id)}
              />
            ))}
          </div>
        )}

        {isSearching && pages.length === 0 && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">No results found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        )}

        {!isSearching && allPages && allPages.length === 0 && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">No pages yet</p>
            <p className="text-xs mt-1">Create your first page!</p>
          </div>
        )}
      </div>

      {/* Sidebar Footer: Benchmark Reset Button */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-900/50">
        <button
          onClick={onLoadBenchmark}
          className="w-full py-1.5 px-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-[11px] font-mono transition-colors flex items-center justify-center gap-1.5"
          title="Load pre-built Computer Science knowledge graph for benchmarking"
        >
          <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Load CS Benchmark Notes
        </button>
      </div>
    </div>
  )
}

function PageItem({ page, isActive, onSelect, onDelete, onTogglePin }) {
  return (
    <div
      className={`group relative px-2.5 py-2 rounded-lg cursor-pointer mb-1 transition-colors ${
        isActive
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-medium'
          : 'hover:bg-gray-200/80 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-1">
          <div className="text-xs truncate font-medium">{page.title || 'Untitled'}</div>
          <div className="text-[10px] opacity-60 mt-0.5 flex items-center gap-2">
            <span>{formatRelativeTime(page.updatedAt)}</span>
            {page._irScore && (
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                BM25: {page._irScore}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTogglePin()
            }}
            className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
            title={page.pinned ? 'Unpin' : 'Pin'}
          >
            <svg
              className={`w-3.5 h-3.5 ${page.pinned ? 'text-yellow-500' : 'text-gray-400'}`}
              fill={page.pinned ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (window.confirm('Are you sure you want to delete this page?')) {
                onDelete()
              }
            }}
            className="p-1 hover:bg-red-200 dark:hover:bg-red-900 rounded text-red-500"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
