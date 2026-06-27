# Batch 1 — SQLite Database Service

## Status: ✅ Done

## File created
- `src/main/db.ts` (7KB)

## What was implemented

- **Tables**: books, bookmarks, progress, collections, highlights, notes, settings — all match shared types from `src/shared/types.ts`
- **WAL mode** + foreign keys enabled
- **Indexes** on book_id columns and progress.last_opened_at for fast queries
- **Exports**: `getDb()` (async singleton), `getAll()`, `getOne()`, `run()`, `transaction()`
- **Lazy imports**: Electron `app` and `path` are dynamically imported so self-check can run outside Electron
- **Self-check**: in-memory DB, creates tables, inserts test data, verifies FK constraints and cascade delete

## Self-check result
```
npx tsx src/main/db.ts  →  PASS
(exit 0)
```

## Decisions / notes
- `getDb()` is async because Electron import must be dynamic (ESM + "type": "module" in package.json)
- Helpers take `db` as first param instead of using a hidden singleton — explicit dependency, caller controls lifecycle

## Surprises
- `"type": "module"` in package.json means `require` and `require.main === module` don't work
- Switched self-check guard to `import.meta.url` comparison
