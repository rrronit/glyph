# Batch 2 — Library Store

## Status: ✅ done

## Files created
- `src/renderer/stores/library.ts` — Zustand store for library state

## Self-check
```
npx tsx src/renderer/stores/library.ts
PASS: src/renderer/stores/library.ts
```

## Store API
- `books`, `isLoading`, `viewMode`, `sortBy`, `sortDirection`, `searchQuery`, `selectedCollectionId`, `error` — state
- `loadLibrary()` — calls `window.glyphAPI.getLibrary()`
- `scanFolder(dir)` — calls `window.glyphAPI.scanLibrary(dir)` then reloads
- `setViewMode(mode)` — 'grid' | 'list'
- `setSortBy(sort)` — 'title' | 'author' | 'added' | 'lastOpened'
- `toggleSortDirection()` — flips asc/desc
- `setSearchQuery(query)` — sets search filter
- `filteredBooks()` — derived: filters by searchQuery (title/author, case-insensitive), sorts by sortBy + direction

## Notes
- Uses `(globalThis as any).process?.argv?.[1]` guard to avoid Node type dependency in renderer tsconfig
- Zustand v5 — plain `create` from `'zustand'`, no middleware wrapper
