import React from 'react';
import { useReaderStore } from '../stores/reader';

const ReaderControls: React.FC = () => {
  const { currentPage, totalPages, scale, nextPage, prevPage, goToPage, setScale } =
    useReaderStore();

  return (
    <div className="flex justify-center px-4 py-3">
      <div className="flex items-center gap-6 px-6 py-2.5 bg-black/60 backdrop-blur-2xl border border-white/[0.06] rounded-full shadow-2xl shadow-black/40">
        {/* Page navigation */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-full hover:bg-white/[0.08] disabled:opacity-20 disabled:hover:bg-transparent transition-all text-white/50 hover:text-white/80"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div className="flex items-baseline gap-1.5 text-sm tabular-nums min-w-[5rem] justify-center">
            <span className="text-white/80 font-medium">{currentPage}</span>
            <span className="text-white/20">/</span>
            <span className="text-white/30">{totalPages || '—'}</span>
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-full hover:bg-white/[0.08] disabled:opacity-20 disabled:hover:bg-transparent transition-all text-white/50 hover:text-white/80"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/[0.06]" />

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.25))}
            disabled={scale <= 0.5}
            className="p-1.5 rounded-full hover:bg-white/[0.08] disabled:opacity-20 disabled:hover:bg-transparent transition-all text-white/50 hover:text-white/80"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <span className="text-xs text-white/40 tabular-nums min-w-[3rem] text-center font-mono">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={() => setScale(Math.min(4, scale + 0.25))}
            disabled={scale >= 4}
            className="p-1.5 rounded-full hover:bg-white/[0.08] disabled:opacity-20 disabled:hover:bg-transparent transition-all text-white/50 hover:text-white/80"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/[0.06]" />

        {/* Go to page */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = (e.target as HTMLFormElement).querySelector('input');
            if (input) {
              const p = parseInt(input.value, 10);
              if (p >= 1 && p <= totalPages) {
                goToPage(p);
                input.value = '';
              }
            }
          }}
        >
          <input
            type="number"
            min={1}
            max={totalPages}
            placeholder="Go"
            className="w-12 bg-white/[0.04] border border-white/[0.06] rounded-full px-3 py-1.5 text-xs text-center text-white/50 placeholder:text-white/15 focus:outline-none focus:border-white/20 focus:text-white/80 transition-all"
          />
        </form>
      </div>
    </div>
  );
};

export default ReaderControls;
