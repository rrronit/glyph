import React, { useState } from 'react';
import { useReaderStore } from '../stores/reader';
import ReaderSettings from './ReaderSettings';

interface Props {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onOpenSearch: () => void;
}

const ReaderControls: React.FC<Props> = ({ onToggleSidebar, sidebarOpen, onOpenSearch }) => {
  const { currentPage, totalPages, nextPage, prevPage, goToPage, laserPointerActive, setLaserPointerActive } = useReaderStore();
  const [gotoValue, setGotoValue] = useState('');

  return (
    <div className="pointer-events-auto mx-4 mb-5">
      <div className="flex items-center gap-1.5 px-2 py-2 bg-[#0f0f0f]/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50">
        <button
          onClick={onToggleSidebar}
          className={`p-2.5 rounded-xl transition-all ${sidebarOpen ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/[0.08]'}`}
          title="Highlights"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        <button
          onClick={onOpenSearch}
          className="p-2.5 rounded-xl hover:bg-white/[0.08] text-white/50 hover:text-white/90 transition-all"
          title="Search"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>

        <div className="w-px h-6 bg-white/[0.08] mx-1" />

        <button
          onClick={prevPage}
          disabled={currentPage <= 1}
          className="p-2.5 rounded-xl hover:bg-white/[0.08] disabled:opacity-20 disabled:hover:bg-transparent transition-all text-white/50 hover:text-white/90"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <span className="text-sm tabular-nums text-white/60 min-w-[5.5rem] text-center">
          {currentPage} <span className="text-white/20">/</span> {totalPages || '—'}
        </span>

        <button
          onClick={nextPage}
          disabled={currentPage >= totalPages}
          className="p-2.5 rounded-xl hover:bg-white/[0.08] disabled:opacity-20 disabled:hover:bg-transparent transition-all text-white/50 hover:text-white/90"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const p = parseInt(gotoValue, 10);
            if (p >= 1 && p <= totalPages) {
              goToPage(p);
              setGotoValue('');
            }
          }}
          className="flex items-center ml-1"
        >
          <input
            type="number"
            min={1}
            max={totalPages}
            placeholder="#"
            value={gotoValue}
            onChange={(e) => setGotoValue(e.target.value)}
            className="w-12 bg-white/[0.04] border border-white/[0.06] rounded-xl px-2 py-2 text-xs text-center text-white/50 placeholder:text-white/15 focus:outline-none focus:border-violet-500/40 focus:text-white/80 transition-all"
          />
        </form>

        <div className="w-px h-6 bg-white/[0.08] mx-1" />

        <button
          onClick={() => setLaserPointerActive(!laserPointerActive)}
          className={`p-2.5 rounded-xl transition-all ${laserPointerActive ? 'bg-red-500/20 text-red-400' : 'text-white/50 hover:text-white/90 hover:bg-white/[0.08]'}`}
          title="Laser Pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        </button>

        <div className="p-0.5">
          <ReaderSettings />
        </div>
      </div>
    </div>
  );
};

export default ReaderControls;
