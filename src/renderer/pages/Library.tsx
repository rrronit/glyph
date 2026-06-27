import React, { useEffect, useMemo } from 'react';
import { useLibraryStore, type SortBy } from '../stores/library';
import { useReaderStore } from '../stores/reader';
import BookCard from '../components/BookCard';

const Library: React.FC = () => {
  const {
    books, recentBooks, isLoading, searchQuery, viewMode, sortBy, sortDirection, error,
    loadLibrary, loadRecentBooks, setSearchQuery, setViewMode, setSortBy, toggleSortDirection,
    filteredBooks,
  } = useLibraryStore();
  const openBook = useReaderStore((s) => s.openBook);

  useEffect(() => { loadLibrary(); loadRecentBooks(); }, [loadLibrary, loadRecentBooks]);

  // Map recentBooks to actual Book objects for cover/title display
  const continueReading = useMemo(() => {
    const bookMap = new Map(books.map((b) => [b.id, b]));
    return recentBooks
      .filter((r) => bookMap.has(r.bookId))
      .map((r) => ({ progress: r, book: bookMap.get(r.bookId)! }));
  }, [books, recentBooks]);

  const displayed = filteredBooks();

  const gridClass = viewMode === 'grid'
    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
    : 'flex flex-col';

  return (
    <div className="h-full bg-[#0f0f1a] text-white flex flex-col">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
        <h1 className="text-lg font-semibold tracking-tight mr-2">Library</h1>

        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books…"
            className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* View toggles */}
        <div className="flex rounded-lg bg-white/[0.05] p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/[0.12] text-white' : 'text-white/30 hover:text-white/60'}`}
            title="Grid view"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white/[0.12] text-white' : 'text-white/30 hover:text-white/60'}`}
            title="List view"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none cursor-pointer"
        >
          <option value="added">Recently added</option>
          <option value="lastOpened">Last opened</option>
          <option value="title">Title</option>
          <option value="author">Author</option>
        </select>

        {/* Sort direction toggle */}
        <button
          onClick={toggleSortDirection}
          className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-colors"
          title={`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
        >
          <svg className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </header>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-3 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 py-4">
              {/* Continue Reading */}
        {continueReading.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-white/40 mb-3 ml-1">Continue Reading</h2>
            <div
              className="group cursor-pointer rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.1] transition-all p-4 flex items-center gap-4"
              onClick={() => {
                const item = continueReading[0];
                openBook(item.book);
              }}
            >
              {/* Cover */}
              <div className="w-14 h-20 rounded-lg bg-white/[0.06] flex-shrink-0 overflow-hidden flex items-center justify-center">
                {continueReading[0].book.coverPath ? (
                  <img src={continueReading[0].book.coverPath} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white/20 text-lg font-serif">{continueReading[0].book.title.slice(0, 1)}</span>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{continueReading[0].book.title}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  Page {continueReading[0].progress.currentPage} of {continueReading[0].progress.totalPages}
                </p>
                {/* Mini progress bar */}
                <div className="mt-1.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-white/20 rounded-full transition-all"
                    style={{ width: `${continueReading[0].progress.completionPercent}%` }}
                  />
                </div>
              </div>
              {/* Arrow */}
              <svg className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        )}
        {isLoading && (
          <div className={gridClass}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] rounded-lg bg-white/[0.04] mb-3" />
                <div className="h-3 bg-white/[0.04] rounded w-3/4 mb-1.5" />
                <div className="h-2.5 bg-white/[0.03] rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-white/20 -mt-12">
            <svg className="w-16 h-16 mb-4 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-sm">
              {books.length === 0
                ? 'No books yet. Add a PDF to get started.'
                : 'No books match your search.'}
            </p>
          </div>
        )}

        {/* Books */}
        {!isLoading && displayed.length > 0 && (
          <div className={gridClass}>
            {displayed.map((book) => (
              <BookCard key={book.id} book={book} viewMode={viewMode} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Library;
