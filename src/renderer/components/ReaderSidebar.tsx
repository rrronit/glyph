import React, { useState, useEffect } from 'react';
import { useReaderStore } from '../stores/reader';
import { useBookmarkStore } from '../stores/bookmarks';

type TabId = 'outline' | 'bookmarks' | 'highlights' | 'info';

const TABS: { id: TabId; label: string }[] = [
  { id: 'outline', label: 'Outline' },
  { id: 'bookmarks', label: 'Bookmarks' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'info', label: 'Info' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ReaderSidebar: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('outline');

  const currentBook = useReaderStore((s) => s.currentBook);
  const currentPage = useReaderStore((s) => s.currentPage);
  const goToPage = useReaderStore((s) => s.goToPage);

  const { bookmarks, isLoading, loadBookmarks, addBookmark, removeBookmark } = useBookmarkStore();

  useEffect(() => {
    if (currentBook) {
      loadBookmarks(currentBook.id);
    }
  }, [currentBook, loadBookmarks]);

  if (!isOpen) return null;

  const handleAddBookmark = async () => {
    if (!currentBook) return;
    const label = prompt('Bookmark label (optional):');
    await addBookmark(currentBook.id, currentPage, label || undefined);
  };

  return (
    <aside className="w-72 h-full bg-[#0a0a14]/90 backdrop-blur-2xl border-l border-white/[0.04] flex flex-col flex-shrink-0 shadow-2xl shadow-black/30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.04]">
        <span className="text-sm font-medium text-white/60 tracking-wide">Reader</span>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/[0.06] text-white/25 hover:text-white/50 transition-all">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-3 pt-3 pb-2 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white/[0.06] text-white/80'
                : 'text-white/20 hover:text-white/40 hover:bg-white/[0.02]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookmarks tab */}
      {activeTab === 'bookmarks' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Add button */}
          <div className="px-3 py-2">
            <button
              onClick={handleAddBookmark}
              disabled={!currentBook}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.04] hover:border-white/[0.08] text-white/40 hover:text-white/70 text-xs font-medium transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              Bookmark page {currentPage}
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-2">
            {isLoading && (
              <div className="p-4 text-center text-white/10 text-xs animate-pulse">Loading…</div>
            )}

            {!isLoading && bookmarks.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-white/10 px-4 text-center">
                <svg className="w-8 h-8 mb-3 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-xs">No bookmarks yet</p>
              </div>
            )}

            {!isLoading &&
              bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-all"
                >
                  <button
                    onClick={() => goToPage(bm.page)}
                    className="flex-1 text-left min-w-0"
                  >
                    <span className="text-[11px] text-blue-400/60 font-mono font-medium">p.{bm.page}</span>
                    {bm.label && (
                      <p className="text-sm text-white/60 truncate mt-0.5">{bm.label}</p>
                    )}
                  </button>
                  <button
                    onClick={() => removeBookmark(bm.id)}
                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/[0.06] text-white/15 hover:text-red-400/80 transition-all"
                    title="Remove"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Other tabs — stubs */}
      {activeTab !== 'bookmarks' && (
        <div className="flex-1 overflow-y-auto p-4 text-sm text-white/10">
          {activeTab === 'outline' && <p>No outline available.</p>}
          {activeTab === 'highlights' && <p>No highlights yet.</p>}
          {activeTab === 'info' && currentBook && (
            <div className="space-y-4">
              <div>
                <p className="text-white/10 text-[10px] uppercase tracking-widest mb-1">Title</p>
                <p className="text-white/60 text-sm">{currentBook.title}</p>
              </div>
              {currentBook.author && (
                <div>
                  <p className="text-white/10 text-[10px] uppercase tracking-widest mb-1">Author</p>
                  <p className="text-white/60 text-sm">{currentBook.author}</p>
                </div>
              )}
              <div>
                <p className="text-white/10 text-[10px] uppercase tracking-widest mb-1">Pages</p>
                <p className="text-white/60 text-sm">{currentBook.pages}</p>
              </div>
              <div>
                <p className="text-white/10 text-[10px] uppercase tracking-widest mb-1">Path</p>
                <p className="text-white/30 text-xs truncate">{currentBook.path}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default ReaderSidebar;
