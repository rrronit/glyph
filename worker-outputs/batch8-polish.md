# Batch 8: Polish — Final Integration & Verification

## Summary

All issues fixed. Phase 1 complete. Typecheck, build, lint, and 7 self-checks pass.

## Fixes Applied

### 1. Window State Restoration (`src/main/index.ts`)
- Added `loadWindowState()` / `saveWindowState()` reading/writing `window-state.json` from `app.getPath('userData')`
- Window created with saved bounds (x, y, width, height, isMaximized)
- `saveWindowState()` called on `close` event
- Falls back to 1200×800 defaults if state file missing or corrupted

### 2. BookCard onClick (`src/renderer/components/BookCard.tsx`)
- Added optional `onClick?: () => void` prop
- Both grid and list mode divs call `onClick` when clicked

### 3. Library page wiring (`src/renderer/pages/Library.tsx`)
- BookCard now receives `onClick={() => openBook(book)}` to open the selected book

### 4. SearchBar bookId fix (`src/renderer/components/SearchBar.tsx`)
- Changed from `bookId: totalPages.toString()` (bogus sentinel) to `bookId: currentBook?.id || ''`
- Now reads `currentBook` from reader store

### 5. Reader page — SearchBar integration (`src/renderer/pages/Reader.tsx`)
- Added `import SearchBar from '../components/SearchBar'`
- Renders `<SearchBar />` inside the PDF view container
- Made PDF area `relative` for absolute positioning of SearchBar overlay

### 6. useKeyboard Ctrl+key support (`src/renderer/hooks/useKeyboard.ts`)
- Added `Ctrl+key` combo detection: `e.ctrlKey || e.metaKey` → `Ctrl+${key.toUpperCase()}`
- Non-Ctrl single-key combos pass through as before
- Escape still works inside inputs
- Removed hardcoded `f` key mapping (now handled generically)

## Verification Results

| Check | Result |
|-------|--------|
| `npx tsc --noEmit -p tsconfig.main.json` | PASS |
| `npx tsc --noEmit -p tsconfig.renderer.json` | PASS |
| `npx vite build` | PASS (33 modules, 118ms) |
| `npx eslint src/ --ext .ts,.tsx` | PASS (0 errors, 0 warnings) |
| `npx tsx src/main/db.ts` | PASS |
| `npx tsx src/main/watcher.ts` | PASS |
| `npx tsx src/main/metadata.ts` | PASS |
| `npx tsx src/main/search.ts` | PASS |
| `npx tsx src/renderer/stores/library.ts` | PASS |
| `npx tsx src/renderer/stores/reader.ts` | PASS |

## Commits

```
ba9565a Batch 8: all fixes applied, Phase 1 complete
0bde019 Reader: integrate SearchBar, add Ctrl+key support to useKeyboard
8313040 SearchBar: use real bookId from reader store
57f2459 BookCard: onClick prop + wired to openBook in Library
4fdd7bd window state: save/restore bounds on close/launch
```

## Known Caveats

- pdf.worker chunk is 1.2MB (expected for pdf.js)
- Cover images are SVG placeholders until `canvas` package is installed
- `reader:getPageText` IPC is stubbed (returns placeholder string)
- Search has no auto-reindex on page navigation yet (reindexes on first search per session)
