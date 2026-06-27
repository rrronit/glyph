import { create } from 'zustand';
import type { Book } from '../../shared/types';

export type FitMode = 'width' | 'page' | 'auto';

interface ReaderState {
  currentBook: Book | null;
  currentPage: number;
  totalPages: number;
  scale: number;
  fitMode: FitMode;

  openBook: (book: Book) => Promise<void>;
  closeBook: () => Promise<void>;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setScale: (scale: number) => void;
  setFitMode: (mode: FitMode) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  currentBook: null,
  currentPage: 1,
  totalPages: 0,
  scale: 1.0,
  fitMode: 'auto',

  openBook: async (book: Book) => {
    console.log('[reader] openBook called:', book.path);
    set({ currentBook: book, currentPage: 1, totalPages: 0 });
    try {
      const prog = await window.glyphAPI.getProgress(book.id);
      if (prog) {
        set({
          currentPage: prog.currentPage,
          totalPages: prog.totalPages || book.pages,
        });
      }
    } catch {
      // progress not available yet
    }
  },

  closeBook: async () => {
    console.log('[reader] closeBook called');
    const { currentBook, currentPage, totalPages } = get();
    if (currentBook) {
      try {
        await window.glyphAPI.saveProgress(currentBook.id, currentPage, totalPages);
      } catch { /* best-effort */ }
    }
    set({ currentBook: null, currentPage: 1, totalPages: 0 });
  },

  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (total) => set({ totalPages: total }),
  setScale: (scale) => set({ scale }),
  setFitMode: (mode) => set({ fitMode: mode }),

  nextPage: () => {
    const { currentPage, totalPages } = get();
    if (currentPage < totalPages) set({ currentPage: currentPage + 1 });
  },
  prevPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) set({ currentPage: currentPage - 1 });
  },
  goToPage: (page) => {
    const { totalPages } = get();
    if (totalPages === 0) return;
    set({ currentPage: Math.max(1, Math.min(page, totalPages)) });
  },
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
// ── Self-check ────────────────────────────────────────────────────────────
const _argv1: string | undefined = (globalThis as any).process?.argv?.[1];
if (_argv1?.endsWith('/reader.ts') || _argv1?.endsWith('\\reader.ts')) {
  (globalThis as any).window = {
    glyphAPI: {
      getProgress: async () => null,
      saveProgress: async () => {},
    },
  };

  (async () => {
    const store = useReaderStore;

    console.assert(store.getState().currentPage === 1, 'starts at page 1');
    console.assert(store.getState().currentBook === null, 'starts with no book');

    store.getState().setTotalPages(10);
    store.getState().nextPage();
    console.assert(store.getState().currentPage === 2, 'nextPage goes to 2');

    store.getState().goToPage(99);
    console.assert(store.getState().currentPage === 10, 'goToPage clamps at max');

    store.getState().goToPage(0);
    console.assert(store.getState().currentPage === 1, 'goToPage clamps at min');

    store.getState().setFitMode('width');
    console.assert(store.getState().fitMode === 'width', 'fitMode width');

    store.getState().setScale(1.5);
    console.assert(store.getState().scale === 1.5, 'scale set');

    const mockBook = { id: 'b1', path: '/t.pdf', title: 'Test', pages: 50, fileSize: 100, addedAt: '', tags: [] };
    await store.getState().openBook(mockBook as never);
    console.assert(store.getState().currentBook?.id === 'b1', 'openBook sets currentBook');

    await store.getState().closeBook();
    console.assert(store.getState().currentBook === null, 'closeBook clears currentBook');
    console.assert(store.getState().currentPage === 1, 'closeBook resets page to 1');

    console.log('PASS: src/renderer/stores/reader.ts');
  })();
}
/* eslint-enable @typescript-eslint/no-explicit-any */
