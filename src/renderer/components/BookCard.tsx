import React from 'react';
import type { Book } from '../../shared/types';

interface Props {
  book: Book;
  viewMode: 'grid' | 'list';
}

const BookCard: React.FC<Props> = ({ book, viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5">
        {/* cover thumbnail */}
        <div className="w-10 h-14 rounded bg-white/10 flex-shrink-0 flex items-center justify-center text-xs text-white/30 overflow-hidden">
          {book.coverPath ? (
            <img src={book.coverPath} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px]">{book.title.slice(0, 3)}</span>
          )}
        </div>
        {/* info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{book.title}</p>
          <p className="text-xs text-white/40 truncate">
            {book.author ?? `${book.pages} pages`}
          </p>
        </div>
        {/* meta */}
        <div className="text-xs text-white/20 hidden sm:block">
          {book.pages > 0 && `${book.pages}p`}
        </div>
      </div>
    );
  }

  // Grid card
  return (
    <div className="group cursor-pointer rounded-xl p-3 pb-4 hover:bg-white/[0.06] transition-colors">
      {/* cover */}
      <div className="aspect-[3/4] rounded-lg bg-white/[0.06] mb-3 overflow-hidden flex items-center justify-center">
        {book.coverPath ? (
          <img src={book.coverPath} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white/20 text-xl font-serif">{book.title.slice(0, 1)}</span>
        )}
      </div>
      {/* info */}
      <p className="text-sm font-medium truncate leading-tight">{book.title}</p>
      <p className="text-xs text-white/40 truncate mt-0.5">
        {book.author ?? `${book.pages} pages`}
      </p>
    </div>
  );
};

export default BookCard;
