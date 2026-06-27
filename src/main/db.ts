import Database from 'better-sqlite3';

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

// Typed helpers — these work with the initialized db
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

// --- Self-check ---
const selfUrl = import.meta.url;
if (process.argv[1] && selfUrl.endsWith(process.argv[1].replace(/^\.?\//, ''))) {
  const testDb = new Database(':memory:');
  testDb.pragma('journal_mode = WAL');
  testDb.pragma('foreign_keys = ON');

  testDb.exec(`
    CREATE TABLE books (
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
    CREATE TABLE bookmarks (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      page INTEGER NOT NULL,
      label TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE progress (
      book_id TEXT PRIMARY KEY REFERENCES books(id) ON DELETE CASCADE,
      current_page INTEGER NOT NULL DEFAULT 1,
      total_pages INTEGER NOT NULL DEFAULT 0,
      last_opened_at TEXT NOT NULL,
      completion_percent REAL NOT NULL DEFAULT 0
    );
    CREATE TABLE collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      book_ids TEXT NOT NULL DEFAULT '[]',
      is_smart INTEGER NOT NULL DEFAULT 0,
      rule TEXT
    );
    CREATE TABLE highlights (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      page INTEGER NOT NULL,
      text TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT 'yellow',
      note TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE notes (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      page INTEGER,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]'
    );
    CREATE TABLE settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Insert test book
  testDb.prepare(`
    INSERT INTO books (id, path, title, author, pages, file_size, added_at, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('book-1', '/books/test.pdf', 'Test Book', 'Test Author', 100, 12345, '2026-06-27', '["test"]');

  // Insert bookmark
  testDb.prepare(`
    INSERT INTO bookmarks (id, book_id, page, label, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run('bm-1', 'book-1', 42, 'Important page', '2026-06-27');

  // Query book
  const book = testDb.prepare('SELECT * FROM books WHERE id = ?').get('book-1') as Record<string, unknown>;
  console.assert(book.title === 'Test Book', 'book title matches');
  console.assert(book.author === 'Test Author', 'book author matches');
  console.assert(book.pages === 100, 'book pages matches');

  // Query bookmark
  const bm = testDb.prepare('SELECT * FROM bookmarks WHERE book_id = ?').all('book-1') as Record<string, unknown>[];
  console.assert(bm.length === 1, 'one bookmark');
  console.assert(bm[0].page === 42, 'bookmark page matches');
  console.assert(bm[0].label === 'Important page', 'bookmark label matches');

  // FK constraint
  let fkCaught = false;
  try {
    testDb.prepare('INSERT INTO bookmarks (id, book_id, page, created_at) VALUES (?, ?, ?, ?)')
      .run('bm-2', 'nonexistent', 1, '2026-06-27');
  } catch {
    fkCaught = true;
  }
  console.assert(fkCaught, 'foreign key constraint enforced');

  // Cascade delete
  testDb.prepare('DELETE FROM books WHERE id = ?').run('book-1');
  const bmsAfter = testDb.prepare('SELECT * FROM bookmarks').all();
  console.assert(bmsAfter.length === 0, 'cascade delete works');

  testDb.close();
  console.log('PASS: src/main/db.ts');
}
