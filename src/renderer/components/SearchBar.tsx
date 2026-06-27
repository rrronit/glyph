import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useReaderStore } from '../stores/reader';
import type { SearchResult } from '../../shared/types';

const SearchBar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentBook = useReaderStore((s) => s.currentBook);
  const goToPage = useReaderStore((s) => s.goToPage);

  // Ctrl+F to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
        setQuery('');
        setResults([]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await window.glyphAPI.search({
          bookId: currentBook?.id || '',
          query,
        });
        setResults(res);
        setSelectedIdx(0);
      } catch {
        setResults([]);
      }
      setSearching(false);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      goToPage(results[selectedIdx].page);
    }
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
      setResults([]);
    }
  }, [results, selectedIdx, goToPage]);

  // Floating trigger button — top-right of reader
  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}
        className="fixed top-5 right-5 z-40 p-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] backdrop-blur-xl border border-white/[0.04] hover:border-white/[0.1] text-white/40 hover:text-white/80 transition-all duration-200 shadow-lg shadow-black/20"
        title="Search (Ctrl+F)"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={() => { setOpen(false); setQuery(''); setResults([]); }}
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl mx-4 animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Input */}
        <div className="flex items-center gap-3 bg-[#0f0f1a]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 p-4">
          <svg className="w-5 h-5 text-white/20 flex-shrink-0 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search in book…"
            className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-white/15 font-medium"
            autoFocus
          />
          {searching && (
            <span className="flex items-center gap-1 text-white/15 text-xs">
              <span className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
              searching
            </span>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/15 text-[10px] font-mono">
            esc
          </kbd>
        </div>

        {/* Results */}
        {query.trim() && (
          <div className="mt-3 bg-[#0f0f1a]/95 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/50 max-h-[50vh] overflow-y-auto divide-y divide-white/[0.03]">
            {!searching && results.length === 0 && (
              <div className="px-5 py-12 text-center">
                <p className="text-white/15 text-sm">No results for "{query}"</p>
              </div>
            )}

            {results.map((r, i) => (
              <button
                key={`${r.page}-${i}`}
                onClick={() => { goToPage(r.page); setOpen(false); setQuery(''); setResults([]); }}
                className={`w-full text-left px-5 py-3.5 transition-colors hover:bg-white/[0.04] ${
                  i === selectedIdx ? 'bg-white/[0.06] ring-1 ring-inset ring-white/[0.04]' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] text-blue-400/70 font-mono font-medium bg-blue-400/[0.08] px-2 py-0.5 rounded-full">
                    p.{r.page}
                  </span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  {r.match}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
