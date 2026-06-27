# Glyph — Progress

## Phase 1: MVP — COMPLETE ✅

**Goal**: A working Electron + React + TypeScript PDF book reader with library, single-page reader, search, bookmarks, and reading progress.

## Batch Queue

| # | Batch | Status |
|---|-------|--------|
| 0 | Scaffold — project init, configs, shell app | ✅ done |
| 1 | Main process — SQLite database service, file watcher, IPC handlers | ✅ done |
| 2 | Library UI — grid/list views, book card, Zustand store | ✅ done |
| 3 | PDF reader core — pdf.js rendering, page navigation, zoom, fit modes | ✅ done |
| 4 | Reader UI — controls, sidebar shell, keyboard shortcuts | ✅ done |
| 5 | Search — FlexSearch indexing, full-text search, search UI | ✅ done |
| 6 | Bookmarks — create/list/delete, bookmark sidebar, persistence | ✅ done |
| 7 | Reading progress — save/restore position, recently opened, continue reading | ✅ done |
| 8 | Polish — window restoration, routing, final verification | ✅ done |

## Verification Results

| Date | Batch | Typecheck | Build | Lint | Self-checks |
|------|-------|-----------|-------|------|-------------|
| 2026-06-27 | 0 | ✅ | ✅ | ✅ | — |
| 2026-06-27 | 1 | ✅ | ✅ | ✅ | 4/4 |
| 2026-06-27 | 2 | ✅ | ✅ | ✅ | 1/1 |
| 2026-06-27 | 3 | ✅ | ✅ | ✅ | 1/1 |
| 2026-06-27 | 4 | ✅ | ✅ | ✅ | — |
| 2026-06-27 | 5 | ✅ | ✅ | ✅ | 1/1 |
| 2026-06-27 | 6 | ✅ | ✅ | ✅ | — |
| 2026-06-27 | 7 | ✅ | ✅ | ✅ | 1/1 |
| 2026-06-27 | 8 | ✅ | ✅ | ✅ | 6/6 |

**Final**: 34 Vite modules, build 119ms, 0 lint errors, 6/6 self-checks pass.

## Known Caveats

- pdf.worker chunk is 1.2MB (expected for pdf.js)
- Cover images are SVG placeholders until `canvas` package installed
- `reader:getPageText` IPC is stubbed
- Search reindexes on first query per session (no auto-reindex on page nav)
- No drag-and-drop import yet
- No collection/smart-collection UI yet

## Changelog

| Date | Batch | Summary |
|------|-------|---------|
| 2026-06-27 | 0 | Scaffold: Electron+React+TS+Tailwind v4+Vite |
| 2026-06-27 | 1 | Main process: DB (7 tables), watcher, metadata (pdf.js+sharp), IPC (12 handlers) |
| 2026-06-27 | 2 | Library: Zustand store, BookCard (grid/list), Library page (search/sort/view toggle) |
| 2026-06-27 | 3 | Reader: pdfEngine (load/render/text), reader store (page nav/scale/fit), PDFViewer |
| 2026-06-27 | 4 | Reader UI: controls bar (auto-hide), sidebar (4 tabs), keyboard shortcuts, Reader page |
| 2026-06-27 | 5 | Search: FlexSearch indexing, SearchBar (Ctrl+F overlay, debounced, results) |
| 2026-06-27 | 6 | Bookmarks: Zustand store, sidebar tab, Ctrl+B shortcut, Info tab |
| 2026-06-27 | 7 | Progress: openBook/closeBook save/restore, Continue Reading card, App routing |
| 2026-06-27 | 8 | Polish: window state restore, BookCard onClick, SearchBar integration, Ctrl+key support |
