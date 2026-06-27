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

  const totalPages = useReaderStore((s) => s.totalPages);
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
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, totalPages]);

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

  if (!open) {
    // Floating search trigger icon
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/60 hover:text-white/90 transition-colors"
        title="Search (Ctrl+F)"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    );
  }

  return (
    <div className="absolute inset-x-0 top-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => { setOpen(false); setQuery(''); setResults([]); }}
      />

      {/* Panel */}
      <div className="relative mx-auto mt-20 max-w-xl">
        {/* Input */}
        <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/[0.1] rounded-xl shadow-2xl p-3">
          <svg className="w-5 h-5 text-white/30 flex-shrink-0 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/20"
            autoFocus
          />
          {searching && (
            <span className="text-white/20 text-xs animate-pulse">…</span>
          )}
          <button
            onClick={() => { setOpen(false); setQuery(''); setResults([]); }}
            className="p-1 rounded-md hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Results */}
        {query.trim() && (
          <div className="mt-2 bg-[#1a1a2e]/95 backdrop-blur-sm border border-white/[0.08] rounded-xl shadow-2xl max-h-80 overflow-y-auto">
            {!searching && results.length === 0 && (
              <div className="px-4 py-8 text-center text-white/20 text-sm">
                No results found
              </div>
            )}

            {results.map((r, i) => (
              <button
                key={`${r.page}-${i}`}
                onClick={() => { goToPage(r.page); setOpen(false); setQuery(''); setResults([]); }}
                className={`w-full text-left px-4 py-3 border-b border-white/[0.04] transition-colors last:border-b-0 hover:bg-white/[0.06] ${
                  i === selectedIdx ? 'bg-white/[0.08]' : ''
                }`}
              >
                <span className="text-xs text-white/30 font-mono">p.{r.page}</span>
                <p className="text-sm text-white/80 mt-0.5 leading-relaxed">
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
