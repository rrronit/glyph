import { create } from 'zustand';
import type { Highlight } from '../../shared/types';

interface HighlightState {
  highlights: Highlight[];
  isLoading: boolean;

  loadHighlights: (bookId: string) => Promise<void>;
  addHighlight: (input: { bookId: string; page: number; text: string; color?: string; note?: string }) => Promise<Highlight | undefined>;
  removeHighlight: (id: string) => Promise<void>;
}

export const useHighlightStore = create<HighlightState>((set, get) => ({
  highlights: [],
  isLoading: false,

  loadHighlights: async (bookId: string) => {
    if (!bookId) return;
    set({ isLoading: true });
    try {
      const highlights = await window.glyphAPI.getHighlights(bookId);
      set({ highlights, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addHighlight: async ({ bookId, page, text, color, note }) => {
    const trimmed = text.trim();
    if (!trimmed || !bookId) return undefined;
    try {
      const highlight = await window.glyphAPI.addHighlight({ bookId, page, text: trimmed, color, note });
      set({ highlights: [...get().highlights, highlight] });
      return highlight;
    } catch (e) {
      console.error('Failed to add highlight:', e);
      return undefined;
    }
  },

  removeHighlight: async (id: string) => {
    try {
      await window.glyphAPI.removeHighlight(id);
      set({ highlights: get().highlights.filter((h) => h.id !== id) });
    } catch (e) {
      console.error('Failed to remove highlight:', e);
    }
  },
}));
