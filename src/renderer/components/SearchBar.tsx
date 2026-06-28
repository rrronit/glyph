import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useReaderStore } from '../stores/reader';
import type { SearchResult } from '../../shared/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SearchBar: React.FC<Props> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentBook = useReaderStore((s) => s.currentBook);
  const goToPage = useReaderStore((s) => s.goToPage);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setSelectedIdx(0);
    }
  }, [open]);

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
  }, [query, currentBook?.id]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

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
      onClose();
    }
  }, [results, selectedIdx, goToPage, onClose]);

  if (!open) return null;

  return (
    <div className="absolute top-4 right-4 w-[400px] z-50 flex flex-col animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="flex items-center gap-3 bg-[var(--reader-surface)]/95 backdrop-blur-2xl border border-[var(--border-strong)] rounded-2xl shadow-2xl shadow-black/30 p-3.5">
        <svg className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          className="flex-1 bg-transparent text-[var(--text-main)] text-sm outline-none placeholder:text-[var(--text-muted)]"
          autoFocus
        />
        {searching && (
          <span className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs">
            <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] animate-pulse" />
            searching
          </span>
        )}
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {query.trim() && (
        <div className="mt-2 bg-[var(--reader-surface)]/95 backdrop-blur-2xl border border-[var(--border-strong)] rounded-2xl shadow-2xl shadow-black/30 max-h-[60vh] overflow-y-auto smooth-scroll">
          {!searching && results.length === 0 && (
            <div className="px-5 py-8 text-center">
              <p className="text-[var(--text-muted)] text-sm">No results for "{query}"</p>
            </div>
          )}

          {results.map((r, i) => (
            <button
              key={`${r.page}-${i}`}
              onClick={() => { goToPage(r.page); onClose(); }}
              className={`w-full text-left px-4 py-3 transition-colors hover:bg-[var(--border)] ${
                i === selectedIdx ? 'bg-[var(--border)]' : ''
              } ${i !== results.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium text-[var(--accent)] bg-[var(--accent)]/10">
                  Page {r.page}
                </span>
              </div>
              <p className="text-xs text-[var(--text-main)] opacity-80 leading-relaxed line-clamp-3">
                {r.match}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
