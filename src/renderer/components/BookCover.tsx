import React, { useState } from 'react';

interface BookCoverProps {
  coverPath?: string;
  title: string;
  className?: string;
  fallback?: React.ReactNode;
}

function coverSrc(coverPath: string): string {
  if (coverPath.startsWith('glyph-cover://') || coverPath.startsWith('file://')) {
    return coverPath;
  }
  // Encode the absolute path into our custom protocol so Electron can serve it.
  const encoded = encodeURI(coverPath.replace(/^\/+/, '/'));
  return `glyph-cover://${encoded}`;
}

const BookCover: React.FC<BookCoverProps> = ({ coverPath, title, className = '', fallback }) => {
  const [failed, setFailed] = useState(false);
  const initial = (title || '?')[0].toUpperCase();

  if (coverPath && !failed) {
    return (
      <img
        src={coverSrc(coverPath)}
        alt={title}
        className={`object-cover ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  if (fallback) return <>{fallback}</>;

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
