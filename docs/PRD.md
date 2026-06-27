# Glyph — Product Requirements Document

## Overview

Glyph is a premium desktop PDF reading application built for people who read books, not documents. It transforms PDFs into a distraction-free, immersive reading experience inspired by Kindle, Apple Books, and modern native desktop applications.

## Core Principles

- Reading first — the UI disappears while reading
- Minimal interface — nothing unnecessary on screen
- Instant performance — open books instantly, lazy rendering
- Beautiful typography — margins, contrast, themes
- Local-first — books stay where users store them
- Privacy focused — no telemetry by default
- Native-feeling desktop app — keyboard-driven, smooth animations
- Keyboard-driven workflow — every action accessible from keyboard

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop | Electron |
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS + Framer Motion + Radix UI |
| PDF Rendering | pdf.js |
| Database | SQLite (better-sqlite3) |
| Search | FlexSearch |
| File Watching | chokidar |
| State | Zustand |
| Image Processing | sharp |
| Build | Vite + electron-builder |

## Folder Structure

```
src/
  main/       — Electron main process, database, filesystem, IPC handlers
  renderer/   — React UI, components, stores
  shared/     — Types, constants, utilities
```

## Phase 1 Features (MVP)

### Library
- Grid and list view bookshelf
- Auto-watch folder for PDFs (chokidar)
- Book cards with cover thumbnails (sharp-generated)
- Recently opened, continue reading

### Reader
- Single-page PDF rendering with pdf.js
- Page navigation (next/prev, go-to-page)
- Zoom (in/out, fit-width, fit-page)
- Keyboard shortcuts (Space, arrows, Escape)

### Search
- Full-text search across open PDF (FlexSearch)
- Match highlighting
- Search history

### Bookmarks
- Create/delete bookmarks per book
- Bookmark sidebar
- Persist to SQLite

### Reading Progress
- Save/restore current page per book
- Track last opened
- Continue reading from where you left off
