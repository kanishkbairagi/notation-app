import { useState, useEffect, useCallback } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useAutoSave } from './hooks/useAutoSave'
import { useTheme } from './hooks/useTheme'
import { smartSearch } from './utils/search'
import { Sidebar } from './components/Sidebar'
import { PageEditor } from './components/PageEditor'
import { ThemeToggle } from './components/ThemeToggle'

function App() {
  const [pages, setPages] = useLocalStorage('notation-pages', [])
  const [currentPageId, setCurrentPageId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [theme, toggleTheme] = useTheme()

  const currentPage = pages.find(p => p.id === currentPageId)
  const filteredPages = searchQuery ? smartSearch(searchQuery, pages) : pages

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
    if (pages.length > 0 && !currentPageId) {
      setCurrentPageId(pages[0].id)
    }
  }, [pages.length])

  const handleCreatePage = () => {
    const newPage = {
      id: Date.now().toString(),
      title: 'Untitled',
      blocks: [],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setPages(prevPages => [newPage, ...prevPages])
    setCurrentPageId(newPage.id)
    setSearchQuery('')
  }

  const handleSelectPage = (pageId) => {
    setCurrentPageId(pageId)
    setSearchQuery('')
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Sidebar
          pages={filteredPages}
          allPages={pages}
          currentPageId={currentPageId}
          onSelectPage={handleSelectPage}
          onCreatePage={handleCreatePage}
          onDeletePage={handleDeletePage}
          onTogglePin={handleTogglePin}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <PageEditor
          page={currentPage}
          onUpdate={handleUpdatePage}
          onDelete={handleDeletePage}
        />
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>
    </DndProvider>
  )
}

export default App

