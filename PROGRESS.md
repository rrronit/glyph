# Glyph — Progress

## Phase 1: MVP

**Goal**: A working Electron + React + TypeScript PDF book reader with library, single-page reader, search, bookmarks, and reading progress.

**Target**: Builds, typechecks, opens a PDF without crashing. Library, reader, search, and bookmark features all functional.

## Batch Queue

| # | Batch | Status |
|---|-------|--------|
| 0 | Scaffold — project init, configs, shell app | ✅ done |
| 1 | Main process — SQLite database service, file watcher, IPC handlers | ⬜ planned |
| 2 | Library UI — grid/list views, book card, Zustand store | ⬜ planned |
| 3 | PDF reader core — pdf.js rendering, page navigation, zoom, fit modes | ⬜ planned |
| 4 | Reader UI — controls, sidebar shell, keyboard shortcuts | ⬜ planned |
| 5 | Search — FlexSearch indexing, full-text search, search UI | ⬜ planned |
| 6 | Bookmarks — create/list/delete, bookmark sidebar, persistence | ⬜ planned |
| 7 | Reading progress — save/restore position, recently opened, continue reading | ⬜ planned |
| 8 | Polish — window restoration, empty states, loading skeletons, final verification | ⬜ planned |

## Module Status

| Module | Batch | Status | Self-check | Notes |
|--------|-------|--------|------------|-------|
| Project scaffold | 0 | ✅ done | — | TS strict, Vite+Tailwind v4, Electron shell, ESLint flat config |
| SQLite DB service | 1 | planned | — | — |
| File watcher | 1 | planned | — | — |
| IPC handlers | 1 | planned | — | — |
| Book metadata service | 1 | planned | — | — |
| Library store | 2 | planned | — | — |
| Library UI (grid/list) | 2 | planned | — | — |
| Book card component | 2 | planned | — | — |
| PDF engine (pdf.js) | 3 | planned | — | — |
| Page renderer | 3 | planned | — | — |
| Zoom/fit controls | 3 | planned | — | — |
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
| 2026-06-27 | 0 | ✅ pass | ✅ pass (16 modules, 57ms) | ✅ pass | Scaffold complete |

## Changelog

| Date | Batch | Summary |
|------|-------|---------|
| 2026-06-27 | 0 | Scaffold: Electron+React+TS+Tailwind v4+Vite. 2 tsconfigs, preload with IPC API shell, shared types, PRD.md, ESLint flat config. Build+typecheck+lint all green. |
