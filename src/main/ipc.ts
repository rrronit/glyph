import type { Book, ReadingProgress, SearchResult } from '../shared/types';
import * as db from './db';
import * as watcher from './watcher';
import * as metadata from './metadata';
import * as searchService from './search';

export async function registerHandlers(): Promise<void> {
  const { ipcMain } = await import('electron');

  // ── Library ──────────────────────────────────────────────
  ipcMain.handle('library:scan', async (_event, dir: string): Promise<Book[]> => {
    const pdfPaths = await watcher.scanDirectory(dir);
    const dd = await db.getDb();
    const books: Book[] = [];
    for (const filePath of pdfPaths) {
      try {
        const meta = await metadata.extractMetadata(filePath);
        const book = db.upsertBook(dd, {
          id: '', path: filePath, title: meta.title || '', author: meta.author,
          publisher: meta.publisher, pages: meta.pages, fileSize: meta.fileSize,
          addedAt: new Date().toISOString(), tags: [],
        });
        books.push(book);
      } catch {
        // ponytail: skip corrupted/unreadable PDFs
        console.warn(`Skipping unreadable PDF: ${filePath}`);
      }
    }
    return books;
  });

  ipcMain.handle('library:getAll', async (_event) => {
    const dd = await db.getDb();
    return db.getAllBooks(dd);
  });

  // ── Reader ───────────────────────────────────────────────
  ipcMain.handle('reader:open', async (_event, filePath: string): Promise<Book> => {
    try {
      const meta = await metadata.extractMetadata(filePath);
      const dd = await db.getDb();
      return db.upsertBook(dd, {
        id: '', path: filePath, title: meta.title || '', author: meta.author,
        publisher: meta.publisher, pages: meta.pages, fileSize: meta.fileSize,
        addedAt: new Date().toISOString(), tags: [],
      });
    } catch (err) {
      throw new Error(`Cannot open file: ${(err as Error).message}`);
    }
  });

  ipcMain.handle('reader:readFile', async (_event, filePath: string): Promise<ArrayBuffer> => {
    const { readFile } = await import('fs/promises');
    const buf = await readFile(filePath);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  });

  ipcMain.handle('reader:getPageText', async (_event, bookId: string, page: number): Promise<string> => {
    // ponytail: delegate to pdf engine later, stub for now
    return `[page ${page} text for book ${bookId}]`;
  });

  // ── Search ───────────────────────────────────────────────
  ipcMain.handle('search:query', async (_event, params: { bookId: string; query: string }): Promise<SearchResult[]> => {
    const { bookId, query } = params;
    if (!query?.trim()) return [];

    // Lazy-index: if no index exists yet, load the PDF and index it
    if (!searchService.hasIndex(bookId)) {
      // Get the book path from DB
      const dd = await db.getDb();
      const book = db.getOneBook(dd, bookId);
      if (!book) return [];

      // Load PDF and index
      const fs = await import('fs/promises');
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const data = new Uint8Array(await fs.readFile(book.path));
      const doc = await pdfjs.getDocument({ data }).promise;
      await searchService.indexBookPages(doc, bookId);
    }

    return searchService.searchBook(query, bookId);
  });

  // ── Bookmarks ────────────────────────────────────────────
  ipcMain.handle('bookmark:add', async (_event, bookId: string, page: number, label?: string) => {
    const dd = await db.getDb();
    return db.createBookmark(dd, bookId, page, label);
  });

  ipcMain.handle('bookmark:get', async (_event, bookId: string) => {
    const dd = await db.getDb();
    return db.getBookmarks(dd, bookId);
  });

  ipcMain.handle('bookmark:remove', async (_event, id: string) => {
    const dd = await db.getDb();
    db.deleteBookmark(dd, id);
  });

  // ── Progress ─────────────────────────────────────────────
  ipcMain.handle('progress:save', async (_event, bookId: string, page: number, totalPages: number) => {
    const dd = await db.getDb();
    db.saveProgress(dd, bookId, page, totalPages);
  });

  ipcMain.handle('progress:get', async (_event, bookId: string): Promise<ReadingProgress | null> => {
    const dd = await db.getDb();
    return db.getProgress(dd, bookId);
  });

  ipcMain.handle('progress:getRecent', async (_event) => {
    const dd = await db.getDb();
    return db.getRecentBooks(dd, 10);
  });

  // ── Dialog ──────────────────────────────────────────────
  ipcMain.handle('dialog:openFolder', async () => {
    const { dialog, BrowserWindow } = await import('electron');
    const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow()!, {
      properties: ['openDirectory'],
      title: 'Select a folder with PDFs',
    });
    return result.canceled ? null : result.filePaths[0];
  });
}

// ── Self-check ────────────────────────────────────────────────
// ponytail: self-check only verifies module structure; electron API needs real runtime
if (process.argv[1]?.endsWith('/ipc.ts') || process.argv[1]?.endsWith('\\ipc.ts')) {
  console.log('typeof registerHandlers:', typeof registerHandlers);
  console.log('PASS: ipc.ts — module loads, registerHandlers is callable');
}
