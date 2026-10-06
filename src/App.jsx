import { useState, useEffect, useCallback } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useAutoSave } from './hooks/useAutoSave'
import { useTheme } from './hooks/useTheme'
import { searchWithDiagnostics } from './utils/search'
import { INITIAL_CS_PAGES } from './utils/sampleData'
import { Sidebar } from './components/Sidebar'
import { PageEditor } from './components/PageEditor'
import { GraphView } from './components/GraphView'
import { SearchDiagnosticsModal } from './components/SearchDiagnosticsModal'
import { ThemeToggle } from './components/ThemeToggle'

function App() {
  const [pages, setPages] = useLocalStorage('notation-pages', INITIAL_CS_PAGES)
  const [currentPageId, setCurrentPageId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [theme, toggleTheme] = useTheme()
  const [isGraphViewOpen, setIsGraphViewOpen] = useState(false)
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Information Retrieval engine search with BM25 diagnostics
  const searchResult = searchQuery
    ? searchWithDiagnostics(searchQuery, pages)
    : { pages, diagnostics: null }

  const filteredPages = searchResult.pages
  const currentDiagnostics = searchResult.diagnostics

  const currentPage = pages.find(p => p.id === currentPageId)

  // Auto-save function
  const autoSavePage = useCallback((data) => {
    if (currentPageId && data) {
      setPages(prevPages =>
        prevPages.map(p => p.id === currentPageId ? { ...data, updatedAt: new Date().toISOString() } : p)
      )
    }
  }, [currentPageId, setPages])

  // Auto-save current page
  useAutoSave(autoSavePage, currentPage, 1000)

  useEffect(() => {
    // If pages exist and no page is selected, pick the first one
    if (pages.length > 0 && (!currentPageId || !pages.some(p => p.id === currentPageId))) {
      setCurrentPageId(pages[0].id)
    }
  }, [pages, currentPageId])

  const handleCreatePage = () => {
    const newPage = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      blocks: [],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setPages(prevPages => [newPage, ...prevPages])
    setCurrentPageId(newPage.id)
    setSearchQuery('')
    setIsGraphViewOpen(false)
    setIsMobileSidebarOpen(false)
  }

  const handleSelectPage = (pageId) => {
    setCurrentPageId(pageId)
    setSearchQuery('')
    setIsMobileSidebarOpen(false)
  }

  const handleUpdatePage = (updatedPage) => {
    setPages(prevPages =>
      prevPages.map(p => p.id === updatedPage.id ? updatedPage : p)
    )
  }

  const handleDeletePage = (pageId) => {
    setPages(prevPages => prevPages.filter(p => p.id !== pageId))
    if (currentPageId === pageId) {
      const remainingPages = pages.filter(p => p.id !== pageId)
      setCurrentPageId(remainingPages.length > 0 ? remainingPages[0].id : null)
    }
  }

  const handleTogglePin = (pageId) => {
    setPages(prevPages =>
      prevPages.map(p =>
        p.id === pageId ? { ...p, pinned: !p.pinned } : p
      )
    )
  }

  const handleLoadBenchmark = () => {
    if (window.confirm('Load pre-built Computer Science benchmark knowledge base? This will reset existing notes to the interconnected CS dataset.')) {
      setPages(INITIAL_CS_PAGES)
      setCurrentPageId(INITIAL_CS_PAGES[0].id)
      setSearchQuery('')
      setIsMobileSidebarOpen(false)
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden font-sans relative">
        <Sidebar
          pages={filteredPages}
          allPages={pages}
          currentPageId={currentPageId}
          onSelectPage={(id) => {
            handleSelectPage(id)
            setIsGraphViewOpen(false)
          }}
          onCreatePage={handleCreatePage}
          onDeletePage={handleDeletePage}
          onTogglePin={handleTogglePin}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenGraph={() => {
            setIsGraphViewOpen(true)
            setIsMobileSidebarOpen(false)
          }}
          onOpenDiagnostics={() => setShowDiagnosticsModal(true)}
          hasDiagnostics={!!currentDiagnostics}
          onLoadBenchmark={handleLoadBenchmark}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {isGraphViewOpen ? (
          <GraphView
            pages={pages}
            onSelectPage={(id) => {
              handleSelectPage(id)
              setIsGraphViewOpen(false)
            }}
            onClose={() => setIsGraphViewOpen(false)}
          />
        ) : (
          <PageEditor
            page={currentPage}
            allPages={pages}
            onUpdate={handleUpdatePage}
            onDelete={handleDeletePage}
            onSelectPage={handleSelectPage}
            onOpenGraph={() => setIsGraphViewOpen(true)}
            onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          />
        )}

        <ThemeToggle theme={theme} onToggle={toggleTheme} />

        {showDiagnosticsModal && (
          <SearchDiagnosticsModal
            diagnostics={currentDiagnostics}
            query={searchQuery}
            onClose={() => setShowDiagnosticsModal(false)}
          />
        )}
      </div>
    </DndProvider>
  )
}

export default App
