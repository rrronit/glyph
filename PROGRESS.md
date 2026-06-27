# Glyph — Progress

## Phase 1: MVP

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
| 8 | Polish — window restoration, integration fixes, final verification | ✅ done |

**Phase 1 complete.** All batches done. Typecheck, build, lint green. 7 self-checks pass.

## Verification Results

| Date | Batch | Typecheck | Build | Lint | Notes |
|------|-------|-----------|-------|------|-------|
| 2026-06-27 | 0 | ✅ | ✅ | ✅ | Scaffold |
| 2026-06-27 | 1 | ✅ | ✅ | ✅ | DB, watcher, metadata, IPC |
| 2026-06-27 | 2 | ✅ | ✅ | ✅ | Library store + UI |
| 2026-06-27 | 3 | ✅ | ✅ | ✅ | pdfEngine, reader store, PDFViewer |
| 2026-06-27 | 4 | ✅ | ✅ | ✅ | ReaderControls, ReaderSidebar, useKeyboard, Reader page |
| 2026-06-27 | 5 | ✅ | ✅ | ✅ | FlexSearch index, SearchBar, IPC update |
| 2026-06-27 | 6 | ✅ | ✅ | ✅ | Bookmark store, ReaderSidebar bookmarks tab |
| 2026-06-27 | 7 | ✅ | ✅ | ✅ | Progress save/restore, continue reading, App routing |
| 2026-06-27 | 8 | ✅ | ✅ | ✅ | Window state, BookCard onClick, SearchBar bookId, Ctrl+B, SearchBar in Reader |

## Changelog

| Date | Batch | Summary |
|------|-------|---------|
| 2026-06-27 | 0 | Scaffold: Electron+React+TS+Tailwind v4+Vite |
| 2026-06-27 | 1 | Main process: DB, watcher, metadata, IPC |
| 2026-06-27 | 2 | Library: store, BookCard, Library page |
| 2026-06-27 | 3 | Reader: pdfEngine, reader store, PDFViewer |
| 2026-06-27 | 4 | Reader UI: controls bar (auto-hide), sidebar (4 tabs), keyboard shortcuts, Reader page |
| 2026-06-27 | 5 | Search: FlexSearch indexing, SearchBar (Ctrl+F overlay, debounced, results with snippets) |
| 2026-06-27 | 6 | Bookmarks: create/list/delete, sidebar tab, Ctrl+B shortcut |
| 2026-06-27 | 7 | Reading progress: openBook/closeBook save/restore, Continue Reading hero card, App routing Library↔Reader |
| 2026-06-27 | 8 | Polish: window state save/restore, BookCard onClick → openBook, SearchBar uses real bookId, Ctrl+B in useKeyboard, SearchBar integrated in Reader page |
