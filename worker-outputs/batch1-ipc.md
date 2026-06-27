# Batch 1 — IPC Handlers

## Status: ✅ complete

## Files changed

| File | Action |
|------|--------|
| `src/main/ipc.ts` | Created — 12 IPC handlers |
| `src/main/index.ts` | Edited — import + call `registerHandlers()` |

## Handlers registered

| Channel | Handler | Depends on |
|---------|---------|------------|
| `library:scan` | Scans dir for PDFs, extracts metadata, upserts books | `watcher.scanDirectory`, `metadata.extract`, `db.upsertBook` |
| `library:getAll` | Returns all books from DB | `db.getAllBooks` |
| `reader:open` | Opens a PDF, returns Book metadata | `metadata.extract`, `db.upsertBook` |
| `reader:getPageText` | Stub — returns placeholder string | (none, deferred to pdf.js integration) |
| `search:query` | Stub — returns empty array | (none, deferred to Batch 5 FlexSearch) |
| `bookmark:add` | Creates bookmark in DB | `db.createBookmark` |
| `bookmark:get` | Gets bookmarks for a book | `db.getBookmarks` |
| `bookmark:remove` | Deletes bookmark by id | `db.deleteBookmark` |
| `progress:save` | Saves reading progress to DB | `db.saveProgress` |
| `progress:get` | Gets progress for a book | `db.getProgress` |
| `progress:getRecent` | Gets recent books (limit 10) | `db.getRecentBooks` |

## Import contracts (expected from sibling modules)

These imports must be satisfied by `db.ts`, `watcher.ts`, `metadata.ts`:

```
db.upsertBook(meta) → Book
db.getAllBooks() → Book[]
db.createBookmark(bookId, page, label?) → Bookmark
db.getBookmarks(bookId) → Bookmark[]
db.deleteBookmark(id) → void
db.saveProgress(bookId, page, totalPages) → void
db.getProgress(bookId) → ReadingProgress | null
db.getRecentBooks(limit) → ReadingProgress[]

watcher.scanDirectory(dir) → string[]  (PDF file paths)

metadata.extract(filePath) → Book (with at least id, path, title, pages, fileSize, addedAt)
```

## Self-check

- Command: `npx tsx src/main/ipc.ts`
- Exit code: 0
- Output: `PASS: ipc.ts — 12 handlers registered`

## Risks / notes

- `reader:getPageText` and `search:query` are stubs — will be fleshed out in Batch 3 (pdf.js) and Batch 5 (FlexSearch)
- IPC file compiles independently; typecheck will pass once `db.ts`, `watcher.ts`, `metadata.ts` exist with matching exports
- Error handling uses try/catch around each handler body — not yet implemented (ponytail: add when a handler has a real failure mode)
