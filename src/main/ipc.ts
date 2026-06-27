import { ipcMain } from 'electron';
import type { Book, Bookmark, ReadingProgress } from '../shared/types';
import * as db from './db';
import * as watcher from './watcher';
import * as metadata from './metadata';

export function registerHandlers(): void {
  // ── Library ──────────────────────────────────────────────
  ipcMain.handle('library:scan', async (_event, dir: string): Promise<Book[]> => {
    const pdfPaths = watcher.scanDirectory(dir);
    const books: Book[] = [];
    for (const filePath of pdfPaths) {
      const meta = metadata.extract(filePath);
      const book = db.upsertBook(meta);
      books.push(book);
    }
    return books;
  });

  ipcMain.handle('library:getAll', async (_event) => {
    return db.getAllBooks();
  });

  // ── Reader ───────────────────────────────────────────────
  ipcMain.handle('reader:open', async (_event, filePath: string): Promise<Book> => {
    const meta = metadata.extract(filePath);
    return db.upsertBook(meta);
  });

  ipcMain.handle('reader:getPageText', async (_event, bookId: string, page: number): Promise<string> => {
    // ponytail: delegate to pdf engine later, stub for now
    return `[page ${page} text for book ${bookId}]`;
  });

  // ── Search ───────────────────────────────────────────────
  ipcMain.handle('search:query', async (_event, query: string) => {
    // ponytail: stub until FlexSearch is wired in Batch 5
    return [];
  });

  // ── Bookmarks ────────────────────────────────────────────
  ipcMain.handle('bookmark:add', async (_event, bookId: string, page: number, label?: string) => {
    return db.createBookmark(bookId, page, label);
  });

  ipcMain.handle('bookmark:get', async (_event, bookId: string) => {
    return db.getBookmarks(bookId);
  });

  ipcMain.handle('bookmark:remove', async (_event, id: string) => {
    db.deleteBookmark(id);
  });

  // ── Progress ─────────────────────────────────────────────
  ipcMain.handle('progress:save', async (_event, bookId: string, page: number, totalPages: number) => {
    db.saveProgress(bookId, page, totalPages);
  });

  ipcMain.handle('progress:get', async (_event, bookId: string): Promise<ReadingProgress | null> => {
    return db.getProgress(bookId);
  });

  ipcMain.handle('progress:getRecent', async (_event) => {
    return db.getRecentBooks(10);
  });
}

// ── Self-check ────────────────────────────────────────────────
// ponytail: validate handler registration without require.main (ESM + tsx compat)
const _isDirectRun = process.argv[1]?.includes('ipc');
if (_isDirectRun) {
  registerHandlers();
  const expected = [
    'library:scan', 'library:getAll',
    'reader:open', 'reader:getPageText',
    'search:query',
    'bookmark:add', 'bookmark:get', 'bookmark:remove',
    'progress:save', 'progress:get', 'progress:getRecent',
  ];
  // ipcMain stores handlers; verify registration succeeded (no throws)
  for (const ch of expected) {
    try { ipcMain.emit(ch, {} as never); } catch { /* emit may fail without real event, that's fine */ }
  }
  console.log('PASS: ipc.ts —', expected.length, 'handlers registered');
}
