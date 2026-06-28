import { create } from 'zustand';
import type { Book, ReadingProgress } from '../../shared/types';

export type ViewMode = 'grid' | 'list';
export type SortBy = 'title' | 'author' | 'added' | 'lastOpened';

interface LibraryState {
  books: Book[];
  recentBooks: ReadingProgress[];
  isLoading: boolean;
  viewMode: ViewMode;
  sortBy: SortBy;
  sortDirection: 'asc' | 'desc';
  searchQuery: string;
  selectedCollectionId: string | null;
  error: string | null;

  loadLibrary: () => Promise<void>;
  loadRecentBooks: () => Promise<void>;
  addFiles: (paths: string[]) => Promise<void>;
  removeBook: (id: string) => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortBy) => void;
  toggleSortDirection: () => void;
  setSearchQuery: (query: string) => void;
  filteredBooks: () => Book[];
}

const sortFns: Record<SortBy, (a: Book, b: Book) => number> = {
  title: (a, b) => a.title.localeCompare(b.title),
  author: (a, b) => (a.author || '').localeCompare(b.author || ''),
  added: (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
  lastOpened: (a, b) =>
    new Date(b.lastOpenedAt || 0).getTime() - new Date(a.lastOpenedAt || 0).getTime(),
};

export const useLibraryStore = create<LibraryState>((set, get) => ({
  books: [],
  recentBooks: [],
  isLoading: false,
  viewMode: 'grid',
  sortBy: 'added',
  sortDirection: 'desc',
  searchQuery: '',
  selectedCollectionId: null,
  error: null,

  loadLibrary: async () => {
    set({ isLoading: true, error: null });
    try {
      const books = await window.glyphAPI.getLibrary();
      set({ books, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  loadRecentBooks: async () => {
    try {
      const recent = await window.glyphAPI.getRecentBooks();
      set({ recentBooks: recent });
    } catch { /* keep old state */ }
  },

  addFiles: async (paths: string[]) => {
    if (!paths.length) return;
    set({ isLoading: true, error: null });
    try {
      await window.glyphAPI.addFiles(paths);
      const books = await window.glyphAPI.getLibrary();
      set({ books, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  removeBook: async (id: string) => {
    try {
      await window.glyphAPI.deleteBook(id);
      const books = await window.glyphAPI.getLibrary();
      set({ books });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (sort) => set({ sortBy: sort }),
  toggleSortDirection: () =>
    set((s) => ({ sortDirection: s.sortDirection === 'asc' ? 'desc' : 'asc' })),
  setSearchQuery: (query) => set({ searchQuery: query }),

  filteredBooks: () => {
    const { books, searchQuery, sortBy, sortDirection } = get();
    let result = books;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.author && b.author.toLowerCase().includes(q)),
      );
    }

    const cmp = sortFns[sortBy];
    const dir = sortDirection === 'asc' ? 1 : -1;
    return [...result].sort((a, b) => cmp(a, b) * dir);
  },
}));

// ── Self-check ────────────────────────────────────────────────────────────
// ponytail: process available at runtime via tsx, not in renderer type scope
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _argv1 = (globalThis as any).process?.argv?.[1];
if (_argv1?.endsWith('/library.ts') || _argv1?.endsWith('\\library.ts')) {
  const store = useLibraryStore;

  console.assert(store.getState().books.length === 0, 'starts empty');
  console.assert(store.getState().recentBooks.length === 0, 'recentBooks starts empty');
  console.assert(store.getState().viewMode === 'grid', 'default grid view');

  // setSearchQuery
  store.getState().setSearchQuery('test');
  console.assert(store.getState().searchQuery === 'test', 'searchQuery set');

  // filteredBooks on empty
  console.assert(store.getState().filteredBooks().length === 0, 'filteredBooks empty ok');

  // toggleSortDirection
  store.getState().toggleSortDirection();
  console.assert(store.getState().sortDirection === 'asc', 'sort toggled to asc');
  store.getState().toggleSortDirection();
  console.assert(store.getState().sortDirection === 'desc', 'sort toggled back');

  // setViewMode
  store.getState().setViewMode('list');
  console.assert(store.getState().viewMode === 'list', 'viewMode list');

  // setSortBy
  store.getState().setSortBy('title');
  console.assert(store.getState().sortBy === 'title', 'sortBy title');

  console.log('PASS: src/renderer/stores/library.ts');
}
