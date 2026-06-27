import { watch, FSWatcher } from 'chokidar';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import crypto from 'crypto';
import type { Book } from '../shared/types';

// ── Types ──────────────────────────────────────────────────────────────────

export interface WatcherCallbacks {
  onAdd(path: string): void;
  onRemove(path: string): void;
  onChange(path: string): void;
  onReady(): void;
}

interface ScanEntry {
  path: string;
  size: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function isPdf(filePath: string): boolean {
  return extname(filePath).toLowerCase() === '.pdf';
}

function isDotfile(filePath: string): boolean {
  return basename(filePath).startsWith('.');
}

function makeBookId(): string {
  return crypto.randomUUID();
}

function pathToTitle(filePath: string): string {
  return basename(filePath, '.pdf');
}

// ── Scanner ────────────────────────────────────────────────────────────────

/** Recursively find all .pdf files under `dirPath`. */
export async function scanDirectory(dirPath: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && isPdf(full)) {
        results.push(full);
      }
    }
  }

  await walk(dirPath);
  return results;
}

/** Scan + stat every file, returning {path, size} pairs. */
export async function scanWithStats(dirPath: string): Promise<ScanEntry[]> {
  const paths = await scanDirectory(dirPath);
  const entries: ScanEntry[] = [];
  for (const p of paths) {
    const s = await stat(p);
    entries.push({ path: p, size: s.size });
  }
  return entries;
}

/** Full scan: returns Book objects ready for the library. */
export async function scanLibrary(dirPath: string): Promise<Book[]> {
  const entries = await scanWithStats(dirPath);
  const now = new Date().toISOString();
  return entries.map((e) => ({
    id: makeBookId(),
    path: e.path,
    title: pathToTitle(e.path),
    pages: 0, // filled later by pdf.js
    fileSize: e.size,
    addedAt: now,
    tags: [],
  }));
}

// ── Watcher ────────────────────────────────────────────────────────────────

export function startWatcher(
  dirPath: string,
  callbacks: WatcherCallbacks,
): FSWatcher {
  const watcher = watch(dirPath, {
    ignored: (p: string) => {
      const b = basename(p);
      return !isPdf(p) || b.startsWith('.');
    },
    depth: 99,
    ignoreInitial: true, // scanDirectory handles initial scan
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100,
    },
  });

  watcher.on('add', callbacks.onAdd);
  watcher.on('unlink', callbacks.onRemove);
  watcher.on('change', callbacks.onChange);
  watcher.on('ready', callbacks.onReady);

  return watcher;
}

// ── Self-check ─────────────────────────────────────────────────────────────

// ponytail: self-check guard by filename, avoids import.meta.url breakage in CJS tsconfig
if (process.argv[1]?.includes('watcher')) {
  void (async () => {
    const { mkdtemp, writeFile, rm } = await import('fs/promises');
    const { join: pjoin } = await import('path');
    const { tmpdir } = await import('os');

    const dir = await mkdtemp(pjoin(tmpdir(), 'glyph-watcher-test-'));

    await writeFile(pjoin(dir, 'book1.pdf'), 'fake pdf content');
    await writeFile(pjoin(dir, 'book2.pdf'), 'fake pdf content');
    await writeFile(pjoin(dir, 'readme.txt'), 'not a pdf');

    const results = await scanDirectory(dir);
    console.assert(
      results.length === 2,
      `Expected 2 PDFs, got ${results.length}`,
    );
    console.assert(results.every((p) => p.endsWith('.pdf')), 'All should be PDFs');

    const books = await scanLibrary(dir);
    console.assert(books.length === 2, `Expected 2 books, got ${books.length}`);
    console.assert(
      books.every((b) => b.id.length > 0 && b.title.length > 0),
      'Every book needs id and title',
    );

    console.log('PASS: watcher self-check');
    await rm(dir, { recursive: true });
  })();
}
