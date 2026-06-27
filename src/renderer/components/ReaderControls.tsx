import React from 'react';
import { useReaderStore } from '../stores/reader';

const ReaderControls: React.FC = () => {
  const { currentPage, totalPages, scale, nextPage, prevPage, goToPage, setScale } =
    useReaderStore();

  return (
    <div className="flex items-center justify-center gap-4 px-4 py-3 bg-[#12121f] border-t border-white/[0.06]">
      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={prevPage}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] disabled:opacity-20 transition-colors text-white/60"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <span className="text-sm text-white/60 tabular-nums min-w-[5rem] text-center">
          {currentPage} / {totalPages || '—'}
        </span>

        <button
          onClick={nextPage}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] disabled:opacity-20 transition-colors text-white/60"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setScale(Math.max(0.5, scale - 0.25))}
          disabled={scale <= 0.5}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] disabled:opacity-20 transition-colors text-white/60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <span className="text-xs text-white/40 tabular-nums min-w-[3rem] text-center">
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={() => setScale(Math.min(4, scale + 0.25))}
          disabled={scale >= 4}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] disabled:opacity-20 transition-colors text-white/60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

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
          className="w-14 bg-white/[0.05] border border-white/[0.06] rounded-lg px-2 py-1 text-sm text-center text-white/60 placeholder:text-white/20 focus:outline-none focus:border-white/20"
        />
      </form>
    </div>
  );
};

export default ReaderControls;
