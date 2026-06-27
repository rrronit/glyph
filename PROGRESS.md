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
| 4 | Reader UI — controls, sidebar shell, keyboard shortcuts | 🔄 running |
| 5 | Search — FlexSearch indexing, full-text search, search UI | 🔄 running |
| 6 | Bookmarks — create/list/delete, bookmark sidebar, persistence | ⬜ planned |
| 7 | Reading progress — save/restore position, recently opened, continue reading | ⬜ planned |
| 8 | Polish — window restoration, empty states, loading skeletons, final verification | ⬜ planned |

## Module Status

| Module | Batch | Status | Self-check | Notes |
|--------|-------|--------|------------|-------|
| Project scaffold | 0 | ✅ done | — | TS strict, Vite+Tailwind v4, Electron shell, ESLint flat config |
| SQLite DB service | 1 | ✅ done | ✅ | WAL, FK, 7 tables, domain functions |
| File watcher | 1 | ✅ done | ✅ | chokidar, recursive scan, Book creation |
| Book metadata service | 1 | ✅ done | ✅ | pdf.js extract, sharp covers |
| IPC handlers | 1 | ✅ done | ✅ | 12 handlers (incl. readFile) |
| Library store | 2 | ✅ done | ✅ | Zustand, search/filter/sort |
| Book card component | 2 | ✅ done | — | grid + list modes |
| Library UI page | 2 | ✅ done | — | search bar, view toggle, sort, skeletons |
| PDF engine (pdf.js) | 3 | ✅ done | — | load, render, text extract, readFile IPC |
| Reader store | 3 | ✅ done | ✅ | page nav, scale, fit modes |
| PDFViewer component | 3 | ✅ done | — | loading/error/ready states |
| Reader controls | 4 | planned | — | — |
| Reader sidebar | 4 | planned | — | — |
| Keyboard shortcuts | 4 | planned | — | — |
| FlexSearch index | 5 | planned | — | — |
| Search UI | 5 | planned | — | — |
| Bookmark CRUD | 6 | planned | — | — |
| Bookmark sidebar | 6 | planned | — | — |
| Progress persistence | 7 | planned | — | — |
| Continue reading | 7 | planned | — | — |
| Window restoration | 8 | planned | — | — |
| Empty states | 8 | planned | — | — |
| Loading skeletons | 8 | planned | — | — |

## Blockers

None.

## Verification Results

| Date | Batch | Typecheck | Build | Lint | Notes |
|------|-------|-----------|-------|------|-------|
| 2026-06-27 | 0 | ✅ pass | ✅ pass | ✅ pass | Scaffold complete |
| 2026-06-27 | 1 | ✅ pass | ✅ pass | ✅ pass | DB, watcher, metadata, IPC integrated |
| 2026-06-27 | 2 | ✅ pass | ✅ pass | ✅ pass | Library store + UI |
| 2026-06-27 | 3 | ✅ pass | ✅ pass | ✅ pass | pdfEngine + reader store + PDFViewer |

## Changelog

| Date | Batch | Summary |
|------|-------|---------|
| 2026-06-27 | 0 | Scaffold: Electron+React+TS+Tailwind v4+Vite |
| 2026-06-27 | 1 | Main process: DB (7 tables), watcher, metadata (pdf.js+sharp), IPC (12 handlers) |
| 2026-06-27 | 2 | Library: Zustand store, BookCard (grid/list), Library page (search/sort/view toggle) |
| 2026-06-27 | 3 | Reader: pdfEngine (load/render/text), reader store (page nav/scale/fit), PDFViewer component |
