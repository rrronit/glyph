import { create } from 'zustand';
import type { Bookmark } from '../../shared/types';

interface BookmarkState {
  bookmarks: Bookmark[];
  isLoading: boolean;

  loadBookmarks: (bookId: string) => Promise<void>;
  addBookmark: (bookId: string, page: number, label?: string) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  isLoading: false,

  loadBookmarks: async (bookId: string) => {
    set({ isLoading: true });
    try {
      const bookmarks = await window.glyphAPI.getBookmarks(bookId);
      set({ bookmarks, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addBookmark: async (bookId: string, page: number, label?: string) => {
    const bm = await window.glyphAPI.addBookmark(bookId, page, label);
    set({ bookmarks: [...get().bookmarks, bm] });
  },

  removeBookmark: async (id: string) => {
    await window.glyphAPI.removeBookmark(id);
    set({ bookmarks: get().bookmarks.filter((b) => b.id !== id) });
  },
}));
