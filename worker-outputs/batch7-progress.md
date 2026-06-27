# Batch 7: Reading Progress + Continue Reading

## Changes Made

### 1. `src/renderer/stores/reader.ts`
- Added `currentBook: Book | null` state
- Added `openBook(book)`: calls `window.glyphAPI.getProgress(bookId)` and restores `currentPage`/`totalPages`
- Added `closeBook()`: calls `window.glyphAPI.saveProgress()` before clearing state
- Updated self-check with mock `window.glyphAPI` and async test of open/close

### 2. `src/renderer/stores/library.ts`
- Added `recentBooks: ReadingProgress[]` state
- Added `loadRecentBooks()` action: calls `window.glyphAPI.getRecentBooks()`

### 3. `src/renderer/pages/Library.tsx`
- Added `loadRecentBooks()` to mount effect
- Added "Continue Reading" section at top when `recentBooks` has data
- Hero card: cover (first letter fallback), title, "Page X of Y", progress bar
- Click opens the book via reader store `openBook()`
- Matches recentBooks to library's books list for cover/title

### 4. `src/renderer/App.tsx`
- Imports `useReaderStore` to check `currentBook`
- If `currentBook !== null`, renders `<Reader book={currentBook} onClose={closeBook} />`
- Otherwise renders `<Library />`

## Verification

- Typecheck (renderer + main): PASS
- Vite build (33 modules): PASS
- ESLint: PASS
- Self-checks: reader store, library store both pass

## Commits

- `533110f` — reader store: add openBook/closeBook with progress restore/save
- `48c574e` — library store: add recentBooks + loadRecentBooks action
- `60a5ee7` — library page: Continue Reading section from recent progress
- `e93da3b` — App: route between Library and Reader; reader store self-check fix
