import React from 'react';
import { useReaderStore } from './stores/reader';
import Library from './pages/Library';
import Reader from './pages/Reader';

const App: React.FC = () => {
  const currentBook = useReaderStore((s) => s.currentBook);
  const closeBook = useReaderStore((s) => s.closeBook);

  if (currentBook) {
    return <Reader book={currentBook} onClose={closeBook} />;
  }

  return <Library />;
};

export default App;
