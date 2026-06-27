import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReaderStore } from '../stores/reader';
import type { FitMode } from '../stores/reader';

interface Props {
  onClose?: () => void;
}

const ReaderControls: React.FC<Props> = ({ onClose }) => {
  const {
    currentPage, totalPages, scale, fitMode,
    setScale, setFitMode, goToPage, nextPage, prevPage,
  } = useReaderStore();

  const [visible, setVisible] = useState(true);
  const [pageInput, setPageInput] = useState<string>('');
  const [editingPage, setEditingPage] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 3000);
  }, []);

  useEffect(() => {
    show();
    const onMouseMove = () => show();
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [show]);

  const handleZoomIn = () => setScale(Math.min(4.0, scale + 0.25));
  const handleZoomOut = () => setScale(Math.max(0.5, scale - 0.25));

  const handlePageSubmit = () => {
    const n = parseInt(pageInput, 10);
    if (!isNaN(n)) goToPage(n);
    setEditingPage(false);
    setPageInput('');
  };

  const handlePageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handlePageSubmit();
    if (e.key === 'Escape') {
      setEditingPage(false);
      setPageInput('');
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/[0.08] shadow-2xl"
        >
          {/* Page navigation */}
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-white/70"
            title="Previous page"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {/* Page indicator */}
          {editingPage ? (
            <input
              autoFocus
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={handlePageSubmit}
              onKeyDown={handlePageKeyDown}
              className="w-16 px-2 py-1 text-xs text-center bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:border-white/40 tabular-nums"
            />
          ) : (
            <button
              onClick={() => {
                setEditingPage(true);
                setPageInput(String(currentPage));
              }}
              className="px-2 py-1 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors tabular-nums"
              title="Go to page"
            >
              {currentPage} / {totalPages || '—'}
            </button>
          )}

          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-white/70"
            title="Next page"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/[0.08] mx-1" />

          {/* Zoom */}
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-white/70 text-xs font-medium"
            title="Zoom out"
          >
            −
          </button>

          <span className="text-xs text-white/50 tabular-nums min-w-[3rem] text-center select-none">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={scale >= 4.0}
            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-white/70 text-xs font-medium"
            title="Zoom in"
          >
            +
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/[0.08] mx-1" />

          {/* Fit modes */}
          {(['width', 'page'] as FitMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setFitMode(mode)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                fitMode === mode
                  ? 'bg-white/15 text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/10'
              }`}
              title={`Fit ${mode}`}
            >
              {mode === 'width' ? 'Fit W' : 'Fit P'}
            </button>
          ))}

          {/* Divider */}
          <div className="w-px h-6 bg-white/[0.08] mx-1" />

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white/80"
            title="Close book"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReaderControls;
