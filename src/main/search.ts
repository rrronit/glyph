/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as pdfjs from 'pdfjs-dist';
import type { SearchResult } from '../shared/types';

// FlexSearch v0.8 CJS; dynamic import for ESM compat
let FlexSearch: any = null;
async function loadFS(): Promise<any> {
  if (!FlexSearch) {
    FlexSearch = await import('flexsearch');
  }
  return FlexSearch;
}

const indexes = new Map<string, any>();

export function hasIndex(bookId: string): boolean {
  return indexes.has(bookId);
}

async function getOrCreateIndex(bookId: string) {
  const existing = indexes.get(bookId);
  if (existing) return existing;

  const FS = await loadFS();
  const idx = new FS.Document({
    document: {
      id: 'page',
      index: ['text'],
      store: ['text'],
    },
    tokenize: 'forward',
  });
  indexes.set(bookId, idx);
  return idx;
}

export async function indexBookPages(
  doc: pdfjs.PDFDocumentProxy,
  bookId: string,
): Promise<void> {
  const idx = await getOrCreateIndex(bookId);
  const numPages = doc.numPages;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: unknown) => (item as { str?: string }).str || '')
      .join(' ');

    if (text.trim()) {
      idx.add({ page: pageNum, text });
    }
  }
}

export function searchBook(
  query: string,
  bookId: string,
): SearchResult[] {
  const idx = indexes.get(bookId);
  if (!idx) return [];

  const raw = idx.search(query, { enrich: true }) as Array<{
    field: string;
    result: Array<{ id: number; doc: { text: string } }>;
  }>;

  if (!raw.length) return [];

  const seen = new Set<number>();
  const results: SearchResult[] = [];

  for (const field of raw) {
    for (const item of field.result) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);

      const snippet = snippetAround(item.doc.text, query, 80);
      results.push({
        page: item.id,
        text: item.doc.text,
        match: snippet,
      });
    }
  }

  return results.sort((a, b) => a.page - b.page);
}

function snippetAround(text: string, query: string, chars: number): string {
  const lower = text.toLowerCase();
  const qLower = query.toLowerCase();
  const idx = lower.indexOf(qLower);

  if (idx === -1) return text.slice(0, chars);

  const start = Math.max(0, idx - Math.floor(chars / 2));
  const slice = text.slice(start, start + chars);
  return (start > 0 ? '…' : '') + slice + (start + chars < text.length ? '…' : '');
}

// ── Self-check ────────────────────────────────────────────────────────────
if (process.argv[1]?.endsWith('/search.ts') || process.argv[1]?.endsWith('\\search.ts')) {
  const mockDoc = {
    numPages: 2,
    getPage: async (n: number) => ({
      getTextContent: async () => ({
        items: n === 1
          ? [{ str: 'The quick brown fox jumps over the lazy dog' }]
          : [{ str: 'Hello world, this is a test page' }],
      }),
    }),
  };

  (async () => {
    await indexBookPages(mockDoc as never, 'test-book');
    const results = searchBook('fox', 'test-book');
    console.assert(results.length === 1, 'found fox');
    console.assert(results[0].page === 1, 'fox on page 1');
    console.assert(results[0].match.includes('fox'), 'snippet contains fox');

    const results2 = searchBook('world', 'test-book');
    console.assert(results2.length === 1, 'found world');
    console.assert(results2[0].page === 2, 'world on page 2');

    const results3 = searchBook('nonexistent', 'test-book');
    console.assert(results3.length === 0, 'no results for missing term');

    console.log('PASS: src/main/search.ts');
  })();
}
