import { create } from 'zustand';

export type FitMode = 'width' | 'page' | 'auto';

interface ReaderState {
  currentPage: number;
  totalPages: number;
  scale: number;
  fitMode: FitMode;

  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setScale: (scale: number) => void;
  setFitMode: (mode: FitMode) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  currentPage: 1,
  totalPages: 0,
  scale: 1.0,
  fitMode: 'auto',

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

// ── Self-check ────────────────────────────────────────────────────────────
// ponytail: process available at runtime via tsx, not in renderer type scope
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _argv1 = (globalThis as any).process?.argv?.[1];
if (_argv1?.endsWith('/reader.ts') || _argv1?.endsWith('\\reader.ts')) {
  const store = useReaderStore;

  console.assert(store.getState().currentPage === 1, 'starts at page 1');
  console.assert(store.getState().totalPages === 0, 'starts empty');
  console.assert(store.getState().fitMode === 'auto', 'default fit auto');

  store.getState().setTotalPages(10);
  console.assert(store.getState().totalPages === 10, 'setTotalPages works');

  store.getState().nextPage();
  console.assert(store.getState().currentPage === 2, 'nextPage goes to 2');

  store.getState().nextPage();
  store.getState().nextPage();
  console.assert(store.getState().currentPage === 4, 'nextPage x3');

  store.getState().prevPage();
  console.assert(store.getState().currentPage === 3, 'prevPage goes back');

  // clamp at 10
  store.getState().goToPage(99);
  console.assert(store.getState().currentPage === 10, 'goToPage clamps at max');

  store.getState().goToPage(0);
  console.assert(store.getState().currentPage === 1, 'goToPage clamps at min');

  store.getState().setFitMode('width');
  console.assert(store.getState().fitMode === 'width', 'fitMode width');

  store.getState().setScale(1.5);
  console.assert(store.getState().scale === 1.5, 'scale set');

  console.log('PASS: src/renderer/stores/reader.ts');
}
