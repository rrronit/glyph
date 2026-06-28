import React from 'react';
import { useHighlightStore } from '../stores/highlights';
import { useReaderStore } from '../stores/reader';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onClick?: (e: React.MouseEvent) => void;
}

const colorMap: Record<string, string> = {
  yellow: 'bg-yellow-500/20 text-yellow-500/90 border-yellow-500/20',
  green: 'bg-green-500/20 text-green-500/90 border-green-500/20',
  blue: 'bg-blue-500/20 text-blue-500/90 border-blue-500/20',
  pink: 'bg-pink-500/20 text-pink-500/90 border-pink-500/20',
};

const dotColorMap: Record<string, string> = {
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  pink: 'bg-pink-500',
};

const ReaderSidebar: React.FC<Props> = ({ isOpen, onClose, onClick }) => {
  const highlights = useHighlightStore(s => s.highlights);
  const removeHighlight = useHighlightStore(s => s.removeHighlight);
  const goToPage = useReaderStore(s => s.goToPage);

  // Group highlights by page
  const highlightsByPage = highlights.reduce((acc, hl) => {
    if (!acc[hl.page]) acc[hl.page] = [];
    acc[hl.page].push(hl);
    return acc;
  }, {} as Record<number, typeof highlights>);

  const sortedPages = Object.keys(highlightsByPage).map(Number).sort((a, b) => a - b);

  return (
    <aside
      onClick={onClick}
      aria-hidden={!isOpen}
      className={`absolute top-0 right-0 z-30 flex h-full w-80 flex-shrink-0 flex-col border-l border-[var(--border-strong)] bg-[var(--reader-surface)]/95 backdrop-blur-3xl shadow-2xl shadow-black/80 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
        isOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full'
      }`}
    >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-sm font-semibold text-[var(--text-main)]">Highlights</span>
          </div>
          <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto smooth-scroll px-4 py-5 space-y-8">
        {sortedPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-[var(--text-muted)] mb-3 flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-sm text-[var(--text-main)]">No highlights yet</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-[200px]">Select text in the book to create highlights.</p>
          </div>
        ) : (
          sortedPages.map((pageNum) => (
            <div key={pageNum} className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px bg-[var(--border)] flex-1" />
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-1">
                  Page {pageNum}
                </span>
                <div className="h-px bg-[var(--border)] flex-1" />
              </div>

              {highlightsByPage[pageNum].map((hl) => (
                <div 
                  key={hl.id} 
                  className="group relative flex flex-col gap-2 rounded-xl p-3 border border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--reader-bg)]/50 transition-all cursor-pointer"
                  onClick={() => goToPage(pageNum)}
                >
                  <div className="flex gap-2">
                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotColorMap[hl.color || 'yellow']}`} />
                    <p className="text-sm text-[var(--text-main)] leading-relaxed italic opacity-90 line-clamp-4">
                      "{hl.text}"
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHighlight(hl.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
                    title="Remove Highlight"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default ReaderSidebar;
