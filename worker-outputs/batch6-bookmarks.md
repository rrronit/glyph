# Batch 6: Bookmarks — Integration Complete

## Changes

| File | Action | Summary |
|------|--------|---------|
| `src/renderer/stores/bookmarks.ts` | Created | Zustand store: `bookmarks[]`, `isLoading`, `loadBookmarks`, `addBookmark`, `removeBookmark` |
| `src/renderer/stores/reader.ts` | Updated | Already had `currentBook: Book \| null` + `openBook`/`closeBook` (from progress worker) — no changes needed |
| `src/renderer/components/ReaderSidebar.tsx` | Rewritten | Bookmarks tab: list with page+label, clickable → goToPage, remove button, add bookmark via prompt(), empty state with Ctrl+B hint |
| `src/renderer/pages/Reader.tsx` | Updated | Added `openBook(book)` on mount, `closeBook()` on unmount, Ctrl+B shortcut with prompt for label |
| `src/renderer/pages/Library.tsx` | Updated | Removed unused `Book` import (side fix) |

## Verification

- Typecheck (renderer + main): ✅ pass
- Build (Vite): ✅ pass (22 modules, 145ms)
- Lint: ✅ 0 errors, 0 warnings

## Commits

```
fa46854 bookmarkStore: Zustand store with load/add/remove bookmarks
e213361 ReaderSidebar: fill bookmarks tab — list, add, remove, empty state
3a94a0f Reader: Ctrl+B bookmark shortcut + openBook/closeBook lifecycle
```

## Notes

- ReaderSidebar also fills the Info tab with book metadata (title, author, pages) when `currentBook` is available.
- Bookmark label prompt uses native `prompt()` — simple, no dependency needed.
- `openBook`/`closeBook` on mount/unmount ensures progress is auto-saved when leaving the reader.
- IPC handlers for bookmarks were already wired in Batch 1 via `preload.ts` and `ipc.ts`.
