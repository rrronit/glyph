import type { Book, ChatMessageInput, HighlightInput, ReadingProgress, SearchResult } from '../shared/types';
import * as fs from 'fs';
import * as db from './db';
import * as watcher from './watcher';
import * as metadata from './metadata';
import * as searchService from './search';
import { chatCompletion, resolveApiKey } from './ai';

async function getCoverDir(): Promise<string> {
  const { app } = await import('electron');
  const path = await import('path');
  return path.join(app.getPath('userData'), 'covers');
}

function coverNeedsGeneration(book: Book, coverDir: string): boolean {
  const expectedPath = metadata.pageThumbnailPath(coverDir, book.id);
  if (!book.coverPath) return true;
  if (book.coverPath !== expectedPath) return true;
  return !fs.existsSync(book.coverPath);
}

async function ensureBookCover(
  dd: Awaited<ReturnType<typeof db.getDb>>,
  book: Book,
): Promise<Book> {
  const coverDir = await getCoverDir();
  if (!coverNeedsGeneration(book, coverDir)) return book;

  try {
    const coverPath = await metadata.generateCover(book.path, coverDir, book.id, book.title);
    db.setBookCover(dd, book.id, coverPath);
    return { ...book, coverPath };
  } catch (err) {
    console.warn(`Failed to generate cover for ${book.path}:`, err);
    return book;
  }
}

async function importBook(dd: Awaited<ReturnType<typeof db.getDb>>, filePath: string): Promise<Book | null> {
  try {
    const meta = await metadata.extractMetadata(filePath);
    const book = db.upsertBook(dd, {
      id: '', path: filePath, title: meta.title || '', author: meta.author,
      publisher: meta.publisher, pages: meta.pages, fileSize: meta.fileSize,
      addedAt: new Date().toISOString(), tags: [],
    });
    return ensureBookCover(dd, book);
  } catch {
    console.warn(`Skipping unreadable PDF: ${filePath}`);
    return null;
  }
}

export async function registerHandlers(): Promise<void> {
  const { ipcMain } = await import('electron');

  // ── Library ──────────────────────────────────────────────
  ipcMain.handle('library:scan', async (_event, dir: string): Promise<Book[]> => {
    const pdfPaths = await watcher.scanDirectory(dir);
    const dd = await db.getDb();
    const books: Book[] = [];
    for (const filePath of pdfPaths) {
      const book = await importBook(dd, filePath);
      if (book) books.push(book);
    }
    return books;
  });

  ipcMain.handle('library:getAll', async (_event) => {
    const dd = await db.getDb();
    const books = db.getAllBooks(dd);
    const coverDir = await getCoverDir();
    const missing = books.filter((b) => coverNeedsGeneration(b, coverDir));
    if (missing.length > 0) {
      await Promise.all(missing.map((b) => ensureBookCover(dd, b)));
      return db.getAllBooks(dd);
    }
    return books;
  });

  // ── Reader ───────────────────────────────────────────────
  ipcMain.handle('reader:open', async (_event, filePath: string): Promise<Book> => {
    try {
      const dd = await db.getDb();
      const book = await importBook(dd, filePath);
      if (!book) throw new Error('Cannot read PDF file');
      return book;
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

  // ── Library: add individual files ──────────────────────
  ipcMain.handle('library:addFiles', async (_event, paths: string[]): Promise<Book[]> => {
    const dd = await db.getDb();
    const books: Book[] = [];
    for (const filePath of paths) {
      const book = await importBook(dd, filePath);
      if (book) books.push(book);
    }
    return books;
  });

  // ── Highlights ────────────────────────────────────────
  ipcMain.handle('highlight:add', async (_event, input: HighlightInput) => {
    const dd = await db.getDb();
    return db.createHighlight(dd, input.bookId, input.page, input.text, input.color, input.note);
  });

  ipcMain.handle('highlight:get', async (_event, bookId: string) => {
    const dd = await db.getDb();
    return db.getHighlights(dd, bookId);
  });

  ipcMain.handle('highlight:remove', async (_event, id: string) => {
    const dd = await db.getDb();
    db.deleteHighlight(dd, id);
  });

  // ── Library: delete book ──────────────────────────
  ipcMain.handle('library:delete', async (_event, id: string) => {
    const dd = await db.getDb();
    db.deleteBook(dd, id);
  });

  // ── AI (OpenRouter) ───────────────────────────────────
  ipcMain.handle('ai:status', async () => ({
    hasEnvApiKey: !!process.env.OPENROUTER_API_KEY?.trim(),
  }));

  ipcMain.handle('ai:chat', async (_event, params: {
    apiKey?: string;
    model: string;
    messages: ChatMessageInput[];
  }): Promise<string> => {
    const apiKey = resolveApiKey(params.apiKey);
    if (!apiKey) {
      throw new Error('Add an OpenRouter API key in AI settings (or set OPENROUTER_API_KEY).');
    }
    return chatCompletion(apiKey, params.model, params.messages);
  });

  // ── Dialog ──────────────────────────────────────────────
  ipcMain.handle('dialog:openFiles', async () => {
    const { dialog, BrowserWindow } = await import('electron');
    const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow()!, {
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
      title: 'Add PDFs to Library',
    });
    return result.canceled ? [] : result.filePaths;
  });
}

// ── Self-check ────────────────────────────────────────────────
// ponytail: self-check only verifies module structure; electron API needs real runtime
if (process.argv[1]?.endsWith('/ipc.ts') || process.argv[1]?.endsWith('\\ipc.ts')) {
  console.log('typeof registerHandlers:', typeof registerHandlers);
  console.log('PASS: ipc.ts — module loads, registerHandlers is callable');
}
