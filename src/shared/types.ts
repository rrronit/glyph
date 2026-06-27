export interface Book {
  id: string;
  path: string;
  title: string;
  author?: string;
  publisher?: string;
  pages: number;
  coverPath?: string;
  fileSize: number;
  addedAt: string;
  lastOpenedAt?: string;
  tags: string[];
}

export interface Bookmark {
  id: string;
  bookId: string;
  page: number;
  label?: string;
  createdAt: string;
}

export interface Highlight {
  id: string;
  bookId: string;
  page: number;
  text: string;
  color: string;
  note?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  bookId: string;
  page?: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface Collection {
  id: string;
  name: string;
  bookIds: string[];
  isSmart: boolean;
  rule?: string;
}

export interface ReadingProgress {
  bookId: string;
  currentPage: number;
  totalPages: number;
  lastOpenedAt: string;
  completionPercent: number;
}

export interface Settings {
  theme: 'light' | 'dark' | 'sepia' | 'black';
  fontSize: number;
  margin: number;
  zoom: number;
  fitMode: 'width' | 'page' | 'auto';
  pageMode: 'single' | 'double' | 'scroll';
  defaultLibraryPath?: string;
}

export interface GlyphAPI {
  ping: () => Promise<string>;
  scanLibrary: (dir: string) => Promise<Book[]>;
  getLibrary: () => Promise<Book[]>;
  openBook: (path: string) => Promise<Book>;
  readFile: (path: string) => Promise<ArrayBuffer>;
  getPageText: (bookId: string, page: number) => Promise<string>;
  search: (query: string) => Promise<unknown[]>;
  addBookmark: (bookId: string, page: number, label?: string) => Promise<Bookmark>;
  getBookmarks: (bookId: string) => Promise<Bookmark[]>;
  removeBookmark: (id: string) => Promise<void>;
  saveProgress: (bookId: string, page: number, totalPages: number) => Promise<void>;
  getProgress: (bookId: string) => Promise<ReadingProgress | null>;
  getRecentBooks: () => Promise<ReadingProgress[]>;
}

declare global {
  interface Window {
    glyphAPI: GlyphAPI;
  }
}
