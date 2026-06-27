import Database from 'better-sqlite3';
import type { Book, Bookmark, ReadingProgress } from '../shared/types';

let db: Database.Database | null = null;

export async function getDb(): Promise<Database.Database> {
  if (db) return db;

  // ponytail: dynamic import to allow self-check outside Electron
  const { app } = await import('electron');
  const path = await import('path');

  const dbPath = path.join(app.getPath('userData'), 'glyph.db');
  db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      path TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      author TEXT,
      publisher TEXT,
      pages INTEGER NOT NULL DEFAULT 0,
      cover_path TEXT,
      file_size INTEGER NOT NULL DEFAULT 0,
      added_at TEXT NOT NULL,
      last_opened_at TEXT,
      tags TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      page INTEGER NOT NULL,
      label TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS progress (
      book_id TEXT PRIMARY KEY REFERENCES books(id) ON DELETE CASCADE,
      current_page INTEGER NOT NULL DEFAULT 1,
      total_pages INTEGER NOT NULL DEFAULT 0,
      last_opened_at TEXT NOT NULL,
      completion_percent REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      book_ids TEXT NOT NULL DEFAULT '[]',
      is_smart INTEGER NOT NULL DEFAULT 0,
      rule TEXT
    );

    CREATE TABLE IF NOT EXISTS highlights (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      page INTEGER NOT NULL,
      text TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT 'yellow',
      note TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      page INTEGER,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_bookmarks_book ON bookmarks(book_id);
    CREATE INDEX IF NOT EXISTS idx_progress_last_opened ON progress(last_opened_at);
    CREATE INDEX IF NOT EXISTS idx_highlights_book ON highlights(book_id);
    CREATE INDEX IF NOT EXISTS idx_notes_book ON notes(book_id);
  `);

  return db;
}

// ── Generic helpers ───────────────────────────────────────────────────────

export function getAll<T = Record<string, unknown>>(db: Database.Database, query: string, params?: unknown[]): T[] {
  const stmt = db.prepare(query);
  return (params ? stmt.all(...params) : stmt.all()) as T[];
}

export function getOne<T = Record<string, unknown>>(db: Database.Database, query: string, params?: unknown[]): T | undefined {
  const stmt = db.prepare(query);
  return (params ? stmt.get(...params) : stmt.get()) as T | undefined;
}

export function run(db: Database.Database, query: string, params?: unknown[]): Database.RunResult {
  const stmt = db.prepare(query);
  return params ? stmt.run(...params) : stmt.run();
}

export function transaction<T>(db: Database.Database, fn: () => T): T {
  const tx = db.transaction(fn);
  return tx();
}

// ── Domain functions (used by IPC handlers) ───────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */

export function upsertBook(db: Database.Database, book: Book): Book {
  const existing = getOne<any>(db, 'SELECT * FROM books WHERE path = ?', [book.path]);
  if (existing) {
    run(db, `UPDATE books SET title=?, author=?, publisher=?, pages=?, file_size=?, last_opened_at=? WHERE id=?`,
      [book.title, book.author || null, book.publisher || null, book.pages, book.fileSize, new Date().toISOString(), existing.id]);
    return rowToBook({ ...existing, ...book, last_opened_at: new Date().toISOString() });
  }
  book.id = book.id || crypto.randomUUID();
  book.addedAt = book.addedAt || new Date().toISOString();
  book.tags = book.tags || [];
  run(db, `INSERT INTO books (id, path, title, author, publisher, pages, file_size, added_at, tags) VALUES (?,?,?,?,?,?,?,?,?)`,
    [book.id, book.path, book.title, book.author || null, book.publisher || null, book.pages, book.fileSize, book.addedAt, JSON.stringify(book.tags)]);
  return book;
}

export function getAllBooks(db: Database.Database): Book[] {
  const rows = getAll<any>(db, 'SELECT * FROM books ORDER BY added_at DESC');
  return rows.map(rowToBook);
}

export function getOneBook(db: Database.Database, id: string): Book | undefined {
  const row = getOne<any>(db, 'SELECT * FROM books WHERE id = ?', [id]);
  return row ? rowToBook(row) : undefined;
}

export function createBookmark(db: Database.Database, bookId: string, page: number, label?: string): Bookmark {
  const bm: Bookmark = { id: crypto.randomUUID(), bookId, page, label, createdAt: new Date().toISOString() };
  run(db, 'INSERT INTO bookmarks (id, book_id, page, label, created_at) VALUES (?,?,?,?,?)',
    [bm.id, bm.bookId, bm.page, bm.label || null, bm.createdAt]);
  return bm;
}

export function getBookmarks(db: Database.Database, bookId: string): Bookmark[] {
  const rows = getAll<any>(db, 'SELECT * FROM bookmarks WHERE book_id = ? ORDER BY page', [bookId]);
  return rows.map((r: any) => ({ id: r.id, bookId: r.book_id, page: r.page, label: r.label, createdAt: r.created_at }));
}

export function deleteBookmark(db: Database.Database, id: string): void {
  run(db, 'DELETE FROM bookmarks WHERE id = ?', [id]);
}

export function saveProgress(db: Database.Database, bookId: string, page: number, totalPages: number): void {
  const pct = totalPages > 0 ? Math.round((page / totalPages) * 100) : 0;
  run(db, `INSERT INTO progress (book_id, current_page, total_pages, last_opened_at, completion_percent)
    VALUES (?,?,?,?,?) ON CONFLICT(book_id) DO UPDATE SET current_page=?, total_pages=?, last_opened_at=?, completion_percent=?`,
    [bookId, page, totalPages, new Date().toISOString(), pct, page, totalPages, new Date().toISOString(), pct]);
  run(db, 'UPDATE books SET last_opened_at = ? WHERE id = ?', [new Date().toISOString(), bookId]);
}

export function getProgress(db: Database.Database, bookId: string): ReadingProgress | null {
  const row = getOne<any>(db, 'SELECT * FROM progress WHERE book_id = ?', [bookId]);
  if (!row) return null;
  return { bookId: row.book_id, currentPage: row.current_page, totalPages: row.total_pages, lastOpenedAt: row.last_opened_at, completionPercent: row.completion_percent };
}

export function getRecentBooks(db: Database.Database, limit: number): ReadingProgress[] {
  const rows = getAll<any>(db, `SELECT p.* FROM progress p INNER JOIN books b ON b.id = p.book_id ORDER BY p.last_opened_at DESC LIMIT ?`, [limit]);
  return rows.map((r: any) => ({ bookId: r.book_id, currentPage: r.current_page, totalPages: r.total_pages, lastOpenedAt: r.last_opened_at, completionPercent: r.completion_percent }));
}

function rowToBook(r: any): Book {
  return {
    id: r.id, path: r.path, title: r.title, author: r.author, publisher: r.publisher,
    pages: r.pages, coverPath: r.cover_path, fileSize: r.file_size, addedAt: r.added_at,
    lastOpenedAt: r.last_opened_at, tags: JSON.parse(r.tags || '[]'),
  };
}

// ── Self-check ────────────────────────────────────────────────────────────
// ponytail: guard by filename, avoids import.meta.url CJS/ESM incompat
if (process.argv[1]?.endsWith('/db.ts') || process.argv[1]?.endsWith('\\db.ts')) {
  const testDb = new Database(':memory:');
  testDb.pragma('journal_mode = WAL');
  testDb.pragma('foreign_keys = ON');

  testDb.exec(`
    CREATE TABLE books (id TEXT PRIMARY KEY, path TEXT UNIQUE NOT NULL, title TEXT NOT NULL, author TEXT, publisher TEXT, pages INTEGER NOT NULL DEFAULT 0, cover_path TEXT, file_size INTEGER NOT NULL DEFAULT 0, added_at TEXT NOT NULL, last_opened_at TEXT, tags TEXT NOT NULL DEFAULT '[]');
    CREATE TABLE bookmarks (id TEXT PRIMARY KEY, book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE, page INTEGER NOT NULL, label TEXT, created_at TEXT NOT NULL);
    CREATE TABLE progress (book_id TEXT PRIMARY KEY REFERENCES books(id) ON DELETE CASCADE, current_page INTEGER NOT NULL DEFAULT 1, total_pages INTEGER NOT NULL DEFAULT 0, last_opened_at TEXT NOT NULL, completion_percent REAL NOT NULL DEFAULT 0);
  `);

  upsertBook(testDb, { id: 'b1', path: '/t.pdf', title: 'Test', pages: 100, fileSize: 5000, addedAt: '2026-01-01', tags: [] });
  const books = getAllBooks(testDb);
  console.assert(books.length === 1 && books[0].title === 'Test', 'upsert + getAll');

  createBookmark(testDb, 'b1', 42, 'ch1');
  const bms = getBookmarks(testDb, 'b1');
  console.assert(bms.length === 1 && bms[0].page === 42, 'createBookmark + getBookmarks');

  deleteBookmark(testDb, bms[0].id);
  console.assert(getBookmarks(testDb, 'b1').length === 0, 'deleteBookmark');

  saveProgress(testDb, 'b1', 50, 100);
  const prog = getProgress(testDb, 'b1');
  console.assert(prog?.currentPage === 50 && prog?.completionPercent === 50, 'saveProgress + getProgress');

  const recent = getRecentBooks(testDb, 10);
  console.assert(recent.length === 1, 'getRecentBooks');

  testDb.close();
  console.log('PASS: src/main/db.ts');
}
