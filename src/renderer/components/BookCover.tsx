import React from 'react';

interface BookCoverProps {
  coverPath?: string;
  title: string;
  className?: string;
}

const BookCover: React.FC<BookCoverProps> = ({ coverPath, title, className = '' }) => {
  const initial = (title || '?')[0].toUpperCase();

  if (coverPath) {
    return (
      <img
        src={`file://${coverPath}`}
        alt={title}
        className={`object-cover rounded ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-gray-700 rounded ${className}`}
      aria-label={title}
    >
      <span className="text-3xl font-serif font-bold text-gray-400 select-none">
        {initial}
      </span>
    </div>
  );
};

export default BookCover;
