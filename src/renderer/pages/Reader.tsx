import React, { useCallback, useEffect, useRef, useState } from 'react';
import PDFViewer from '../components/PDFViewer';
import ReaderControls from '../components/ReaderControls';
import ReaderSidebar from '../components/ReaderSidebar';
import SearchBar from '../components/SearchBar';
import ReaderSettings from '../components/ReaderSettings';
import { useKeyboard } from '../hooks/useKeyboard';
import { useReaderStore } from '../stores/reader';
import { useBookmarkStore } from '../stores/bookmarks';
import { useAIChatStore } from '../stores/aiChat';
import type { Book } from '../../shared/types';

interface Props {
  book: Book;
  onClose?: () => void;
}

const HIDE_CONTROLS_DELAY_MS = 10_000;

const Reader: React.FC<Props> = ({ book, onClose }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { nextPage, prevPage, setScale, scale, openBook, closeBook, currentBook, currentPage, selectedText, laserPointerActive } = useReaderStore();
  const addBookmark = useBookmarkStore((s) => s.addBookmark);
  const appendContext = useAIChatStore((s) => s.appendContext);
  const setChatOpen = useAIChatStore((s) => s.setOpen);

  useEffect(() => {
    openBook(book);
    return () => { closeBook(); };
  }, []);

  useEffect(() => {
    if (sidebarOpen && searchOpen) setSearchOpen(false);
  }, [sidebarOpen, searchOpen]);

  useKeyboard({
    ' ': () => {
      nextPage();
      setControlsVisible(false);
    },
    ArrowLeft: prevPage,
    ArrowRight: nextPage,
    '<': prevPage,
    '>': nextPage,
    'Shift+Space': prevPage,
    Escape: () => {
      if (searchOpen) {
        setSearchOpen(false);
      } else if (sidebarOpen) {
        setSidebarOpen(false);
      } else {
        onClose?.();
      }
    },
    'Ctrl+f': () => setSearchOpen(true),
    'Cmd+f': () => setSearchOpen(true),
    'Ctrl+l': () => {
      if (selectedText) {
        appendContext(`Page ${currentPage}: "${selectedText}"`);
        setChatOpen(true);
      }
    },
    'Cmd+l': () => {
      if (selectedText) {
        appendContext(`Page ${currentPage}: "${selectedText}"`);
        setChatOpen(true);
      }
    },
    f: () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
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

  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    hideTimerRef.current = setTimeout(() => {
      if (!searchOpen) {
        setControlsVisible(false);
        setSidebarOpen(false);
      }
    }, HIDE_CONTROLS_DELAY_MS);
  }, [searchOpen]);

  // Auto-hide reader chrome after inactivity
  useEffect(() => {
    const handleActivity = () => showControlsTemporarily();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    showControlsTemporarily();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [showControlsTemporarily]);

  // Laser pointer trailing effect
  const [laserPos, setLaserPos] = useState({ x: -100, y: -100 });
  const [laserVisible, setLaserVisible] = useState(false);
  const laserRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!laserPointerActive) return;

    let timeout: ReturnType<typeof setTimeout>;
    
    const handlePointerMove = (e: MouseEvent) => {
      setLaserPos({ x: e.clientX, y: e.clientY });
      setLaserVisible(true);
      
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setLaserVisible(false);
      }, 2000);
    };

    window.addEventListener('mousemove', handlePointerMove);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      clearTimeout(timeout);
    };
  }, [laserPointerActive]);

  const fileName = book.path.split(/[/\\]/).pop() || book.title;

  return (
    <div className="h-full bg-[var(--reader-bg)] flex flex-col relative overflow-hidden">
      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Main: PDF + sidebar */}
      <div className={`relative flex min-h-0 flex-1 overflow-hidden ${laserPointerActive ? 'laser-pointer' : ''}`}>
        <div className="h-full min-w-0 flex-1" onClick={() => {
          setSidebarOpen(false);
          setSearchOpen(false);
        }}>
          <PDFViewer filePath={book.path} />
        </div>

        <div
          aria-hidden={!sidebarOpen}
          className={`absolute inset-0 z-20 bg-black/40 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <ReaderSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Bottom controls */}
      <div
        className={`absolute left-0 right-0 bottom-0 z-20 flex justify-center transition-all duration-300 ease-out ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        <ReaderControls 
          onToggleSidebar={() => setSidebarOpen(s => !s)}
          sidebarOpen={sidebarOpen}
          onOpenSearch={() => setSearchOpen(true)}
        />
      </div>

      {/* Laser Pointer overlay */}
      {laserPointerActive && (
        <div 
          ref={laserRef}
          className="pointer-events-none fixed z-[100] rounded-full bg-red-500 shadow-[0_0_12px_3px_rgba(239,68,68,0.8)] mix-blend-screen transition-opacity duration-300"
          style={{
            left: laserPos.x - 3,
            top: laserPos.y - 3,
            width: 6,
            height: 6,
            opacity: laserVisible ? 1 : 0,
            transform: 'translateZ(0)',
          }}
        />
      )}

      {/* Top bar — hidden while sidebar is open */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 flex items-start justify-between px-5 pt-4 transition-all duration-300 ease-out pointer-events-none ${
          controlsVisible && !sidebarOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4'
        }`}
      >
        <button
          onClick={() => {
            // Reset to page fit when going back to library
            useReaderStore.getState().setFitMode('page');
            onClose?.();
          }}
          className="pointer-events-auto group flex max-w-[58vw] items-center gap-2.5 rounded-full border border-[var(--border-strong)] bg-[var(--reader-bg)]/80 py-2 pl-2 pr-3.5 text-sm font-medium text-[var(--text-muted)] shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:border-[var(--border-strong)] hover:bg-[var(--reader-surface)]/90 hover:text-[var(--text-main)]"
          title="Back to Library"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--border)] text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-main)]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </span>
          <span className="truncate">{fileName}</span>
        </button>
      </div>
    </div>
  );
};

export default Reader;
