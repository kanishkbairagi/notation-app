# Notation - Notion-Style Web App

A modern, feature-rich note-taking application inspired by Notion, built with React, Tailwind CSS, and localStorage.

## Features

- ✨ **Create/Edit/Delete Pages** - Full page management system
- 📝 **Rich Text Editor** - Format text with bold, italic, underline, headings, and lists
- 🎯 **Drag-and-Drop Blocks** - Reorder content blocks by dragging
- 🔍 **Smart Search** - Intelligent search with ranking based on title, content, and recency
- 📌 **Pin Important Notes** - Pin your most important pages to the top
- 🌓 **Dark/Light Mode** - Toggle between themes with system preference detection
- 💾 **Auto-Save** - Automatic saving to localStorage every second

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

## Usage

- **Create a Page**: Click the "+ New Page" button in the sidebar
- **Edit Title**: Click on the title at the top of the page editor
- **Add Blocks**: Click the "+ Add a block" button at the bottom
- **Format Text**: Use the toolbar in each block for rich text formatting
- **Reorder Blocks**: Drag blocks by the handle (≡) icon on the left
- **Delete Blocks**: Hover over a block and click the trash icon
- **Pin Pages**: Hover over a page in the sidebar and click the pin icon
- **Search**: Type in the search box to find pages
- **Toggle Theme**: Click the theme toggle button in the bottom-right corner

## Tech Stack

- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **React DnD** - Drag and drop functionality
- **date-fns** - Date formatting
- **localStorage** - Data persistence
- **Vite** - Build tool

## Project Structure

```
src/
├── components/       # React components
│   ├── Block.jsx           # Draggable block component
│   ├── PageEditor.jsx      # Main page editor
│   ├── RichTextEditor.jsx  # Rich text editing component
│   ├── Sidebar.jsx         # Sidebar with page list
│   └── ThemeToggle.jsx     # Theme switcher
├── hooks/           # Custom React hooks
│   ├── useAutoSave.js      # Auto-save functionality
│   ├── useLocalStorage.js  # localStorage management
│   └── useTheme.js         # Theme management
├── utils/           # Utility functions
│   ├── dateUtils.js        # Date formatting
│   └── search.js           # Search algorithm
├── App.jsx          # Main app component
├── main.jsx         # Entry point
└── index.css        # Global styles
```

## Data Storage

All data is stored in the browser's localStorage under the key `notation-pages`. Your notes persist across browser sessions automatically.

## License

MIT

