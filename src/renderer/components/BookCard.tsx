import React from 'react';
import type { Book } from '../../shared/types';
import BookCover from './BookCover';

interface Props {
  book: Book;
  viewMode: 'grid' | 'list';
  onClick?: () => void;
}

const gradients = [
  'from-rose-500/20 to-orange-600/20',
  'from-emerald-500/20 to-teal-600/20',
  'from-violet-500/20 to-indigo-600/20',
  'from-amber-500/20 to-yellow-600/20',
  'from-cyan-500/20 to-blue-600/20',
  'from-fuchsia-500/20 to-pink-600/20',
];

const BookCard: React.FC<Props> = ({ book, viewMode, onClick }) => {
  const colorIdx = book.title.charCodeAt(0) % gradients.length;

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-all border border-transparent hover:border-white/[0.06]"
      >
        <div className={`w-11 h-16 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradients[colorIdx]}`}>
          <BookCover
            coverPath={book.coverPath}
            title={book.title}
            className="w-full h-full"
            fallback={
              <span className="text-white/30 text-xs font-serif font-semibold">{book.title.slice(0, 2).toUpperCase()}</span>
            }
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-white/90 group-hover:text-white transition-colors">{book.title}</p>
          <p className="text-xs text-white/30 truncate mt-0.5">
            {book.author ? `${book.author} · ${book.pages}p` : `${book.pages} pages`}
          </p>
        </div>
        <div className="text-xs text-white/15 font-mono tabular-nums">
          {book.pages}p
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer flex flex-col gap-3 p-3 rounded-2xl border border-white/[0.03] hover:border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
    >
      <div className={`relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br ${gradients[colorIdx]}`}>
        <BookCover
          coverPath={book.coverPath}
          title={book.title}
          className="absolute inset-0 w-full h-full"
          fallback={
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/10 text-4xl font-serif font-bold tracking-tight">{book.title.slice(0, 1).toUpperCase()}</span>
            </div>
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur text-[10px] text-white/70 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          {book.pages}p
        </div>
      </div>
      <div className="min-w-0 px-0.5">
        <p className="text-sm font-medium truncate leading-tight text-white/85 group-hover:text-white transition-colors">{book.title}</p>
        <p className="text-xs text-white/30 truncate mt-1">
          {book.author ?? `${book.pages} pages`}
        </p>
      </div>
    </div>
  );
};

export default BookCard;
