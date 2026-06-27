import React, { useState, useEffect } from 'react';
import PDFViewer from '../components/PDFViewer';
import ReaderControls from '../components/ReaderControls';
import ReaderSidebar from '../components/ReaderSidebar';
import SearchBar from '../components/SearchBar';
import { useKeyboard } from '../hooks/useKeyboard';
import { useReaderStore } from '../stores/reader';
import { useBookmarkStore } from '../stores/bookmarks';
import type { Book } from '../../shared/types';

interface Props {
  book: Book;
  onClose?: () => void;
}

const Reader: React.FC<Props> = ({ book, onClose }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  const { nextPage, prevPage, setScale, scale, openBook, closeBook, currentBook, currentPage } = useReaderStore();
  const addBookmark = useBookmarkStore((s) => s.addBookmark);

  // Sync book to store on mount / unmount
  useEffect(() => {
    openBook(book);
    return () => { closeBook(); };
  }, []);

  useKeyboard({
    ' ': () => {
      nextPage();
      setControlsVisible(false);
    },
    ArrowRight: nextPage,
    'Shift+Space': prevPage,
    ArrowLeft: prevPage,
    Escape: () => {
      if (searchOpen) {
        setSearchOpen(false);
      } else if (sidebarOpen) {
        setSidebarOpen(false);
      } else {
        onClose?.();
      }
    },
    f: () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    },
    'Ctrl+f': () => {
      setSearchOpen(true);
    },
    '+': () => {
      setScale(Math.min(4, scale + 0.25));
      setControlsVisible(true);
    },
    '-': () => {
      setScale(Math.max(0.5, scale - 0.25));
      setControlsVisible(true);
    },
    'Ctrl+b': () => {
      if (currentBook) {
        const label = prompt('Bookmark label (optional):');
        addBookmark(currentBook.id, currentPage, label || undefined);
      }
    },
  });

  return (
    <div
      className="h-full bg-[#1a1a2e] flex flex-col cursor-default"
      onMouseMove={() => {
        if (!controlsVisible) setControlsVisible(true);
      }}
      onClick={() => setSidebarOpen(false)}
    >
      {/* Search overlay */}
      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Main area: PDF + sidebar */}
      <div className="flex flex-1 min-h-0 relative">
        {/* PDF view */}
        <div className="flex-1 min-w-0">
          <PDFViewer filePath={book.path} />
        </div>

        {/* Sidebar */}
        <ReaderSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Controls bar — auto-hide */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ${
          controlsVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-full pointer-events-none'
        }`}
      >
        <ReaderControls />
      </div>

      {/* Top bar — title + search + sidebar toggle */}
      {controlsVisible && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#1a1a2e]/90 to-transparent pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3">
            <button
              onClick={() => onClose?.()}
              className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors text-white/50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span className="text-sm font-medium text-white/80 truncate max-w-[40vw]">{book.title}</span>
          </div>

          <div
            className="pointer-events-auto flex gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors text-white/50"
              title="Search (Ctrl+F)"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors text-white/50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reader;
