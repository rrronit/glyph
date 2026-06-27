# Batch 2 — Library Page

## Files created

- `src/renderer/stores/library.ts` — Zustand store (books, viewMode, sortBy, searchQuery, filteredBooks, loadLibrary, scanFolder)  
- `src/renderer/components/BookCard.tsx` — Grid and list view book card component  
- `src/renderer/pages/Library.tsx` — Full library page

## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit -p tsconfig.renderer.json` | ✅ pass |
| `npx eslint` (new files) | ✅ pass |
| `npx vite build` | ✅ pass (71ms) |

## What was built

- **Library page** with top bar (title, search input with inline SVG magnifying glass, grid/list toggle buttons, sort dropdown, sort direction toggle)
- **Loading state**: 8 skeleton card placeholders with `animate-pulse`
- **Empty state**: folder icon + contextual message ("No books yet" / "No books match your search")
- **Error banner**: shown when store has an error
- **BookCard** supports both grid (card with cover area, title, author) and list (compact row with thumbnail, title, meta) modes
- Uses store's `filteredBooks()` method for search + sort — no duplicate logic
- All icons are inline SVG — zero dependencies

## Surprises

- The `library.ts` store had already been created/modified by a parallel worker with a richer API (`filteredBooks()` method, `sortDirection`, `toggleSortDirection`, `scanFolder`, `error`). Updated Library.tsx to use that API instead of reimplementing sort/filter logic.

## Unresolved decisions

None.
