# Batch 1 — Watcher / Library Scanner

## Status: ✅ done

## Files changed
- `src/main/watcher.ts` (new, ~140 lines)

## Exports
- `startWatcher(dirPath, callbacks)` — chokidar watcher, PDF-only, ignore dotfiles, 500ms stability
- `scanDirectory(dirPath)` — recursive PDF scan
- `scanWithStats(dirPath)` — scan + stat (path + size)
- `scanLibrary(dirPath)` — scan + Book object creation (id via crypto.randomUUID, title from filename)
- `WatcherCallbacks` interface

## Self-check
```
npx tsx src/main/watcher.ts → PASS: watcher self-check (exit 0)
```

## Notes
- Chokidar v5 works, ESM import fine with tsx
- `import.meta.url` in self-check avoided — used `process.argv[1]?.includes('watcher')` instead (CJS tsconfig compatibility)
- Book IDs use `crypto.randomUUID()` (Node 19+)
- Pages set to 0 — filled later by pdf.js metadata extraction
