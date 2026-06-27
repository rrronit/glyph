import React from 'react';
import type { Book } from '../../shared/types';

interface Props {
  book: Book;
  viewMode: 'grid' | 'list';
  onClick?: () => void;
}

const BookCard: React.FC<Props> = ({ book, viewMode, onClick }) => {
  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-all duration-200 border border-transparent hover:border-white/[0.06]"
      >
        {/* cover thumbnail */}
        <div className="w-11 h-16 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-white/[0.08] to-white/[0.02]">
          {book.coverPath ? (
            <img src={book.coverPath} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white/30 text-xs font-serif font-semibold">{book.title.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        {/* info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-white/90">{book.title}</p>
          <p className="text-xs text-white/30 truncate mt-0.5">
            {book.author ? `${book.author} · ${book.pages}p` : `${book.pages} pages`}
          </p>
        </div>
        {/* meta */}
        <div className="text-xs text-white/15 hidden sm:block font-mono tabular-nums">
          {book.pages > 0 && `${book.pages}p`}
        </div>
        {/* chevron */}
        <svg className="w-4 h-4 text-white/10 group-hover:text-white/25 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </div>
    );
  }

  // Grid card
  const coverColors = [
    'from-blue-600/20 to-purple-600/20',
    'from-emerald-600/20 to-teal-600/20',
    'from-orange-600/20 to-rose-600/20',
    'from-violet-600/20 to-fuchsia-600/20',
    'from-cyan-600/20 to-blue-600/20',
  ];
  const colorIdx = book.title.charCodeAt(0) % coverColors.length;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl p-3 pb-4 border border-white/[0.04] hover:border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
    >
      {/* cover */}
      <div className={`aspect-[3/4] rounded-xl mb-3 overflow-hidden flex items-center justify-center bg-gradient-to-br ${coverColors[colorIdx]}`}>
        {book.coverPath ? (
          <img src={book.coverPath} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white/15 text-3xl font-serif font-bold tracking-tight">{book.title.slice(0, 1).toUpperCase()}</span>
        )}
        {/* hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />
      </div>
      {/* info */}
      <p className="text-sm font-medium truncate leading-tight text-white/80 group-hover:text-white/95 transition-colors">{book.title}</p>
      <p className="text-xs text-white/25 truncate mt-1">
        {book.author ?? `${book.pages} pages`}
      </p>
    </div>
  );
};

export default BookCard;
