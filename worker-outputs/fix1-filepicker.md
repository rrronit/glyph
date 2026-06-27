# Fix 1: File Picker — Complete

## What was changed

Replaced the "Scan Folder" (folder picker → recursive scan) flow with a direct "Add PDFs" file picker that only imports selected PDFs.

### Files modified

| File | Change |
|------|--------|
| `src/main/ipc.ts` | Added `library:addFiles` (takes paths[], per-file try/catch, metadata extraction, upsert). Added `dialog:openFiles` (multi-select file dialog, PDF filter). Removed `dialog:openFolder`. |
| `src/main/preload.ts` | Exposed `openFiles()` and `addFiles(paths[])`, removed `openFolder()`. |
| `src/shared/types.ts` | Added `openFiles` and `addFiles` to `GlyphAPI` interface. |
| `src/renderer/stores/library.ts` | Replaced `scanFolder(dir)` with `addFiles(paths[])` action. |
| `src/renderer/pages/Library.tsx` | "Scan Folder" → "Add PDFs" button. Calls `openFiles()` then `addFiles(paths)`. |

### Verification

- Typecheck (main + renderer): ✅ pass
- Build (main + Vite): ✅ pass (121ms, 34 modules)
- ESLint: ✅ pass (0 errors, 1 pre-existing warning in SearchBar unrelated to this change)
