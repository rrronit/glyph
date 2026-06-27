# Batch 3 — PDF Engine Output

## Files Created

### `src/renderer/engine/pdfEngine.ts`
- `loadPdf(path)` — loads PDF through IPC `reader:readFile`, returns `PDFDocumentProxy`
- `renderPage(doc, pageNum, canvas, scale)` — renders page to canvas element
- `getPageText(doc, pageNum)` — extracts text from a page
- `createCanvas()` — creates offscreen canvas
- Worker source: `pdfjs-dist/build/pdf.worker.min.mjs?url` (Vite-bundled)

### `src/main/ipc.ts` (updated)
- Added `reader:readFile` handler — reads PDF binary from filesystem via `fs/promises.readFile`

### `src/main/preload.ts` (updated)
- Exposed `readFile` on `glyphAPI`

### `src/shared/types.ts` (updated)
- Added `readFile` to `GlyphAPI` interface

### `src/renderer/stores/reader.ts`
- Zustand store: `currentPage`, `totalPages`, `scale`, `fitMode`
- Actions: `nextPage`, `prevPage`, `goToPage` (clamped), `setFitMode`
- Self-check passes

### `src/renderer/components/PDFViewer.tsx`
- React component: loads PDF via engine, renders current page to canvas
- Handles loading/error/ready states
- Responds to `currentPage` and `scale` changes from reader store

## Verification

| Check | Result |
|-------|--------|
| `tsc --noEmit -p tsconfig.renderer.json` | ✅ |
| `tsc --noEmit -p tsconfig.main.json` | ✅ |
| `vite build` | ✅ (73ms) |
| eslint | ✅ |
| reader store self-check (`npx tsx`) | ✅ |

## Notes

- `pdf.js` v6 `PDFDocumentProxy` does not have a `destroy()` method; cleanup relies on GC
- `renderPage` passes both `canvasContext` and `canvas` (pdf.js v6 requirement)
- `reader:readFile` IPC uses `fs/promises.readFile` — fast for local files
- No zoom/fit UI controls yet (planned for Batch 4: Reader UI)
- No keyboard shortcuts wired yet (planned for Batch 4)
