# Batch 1 — Metadata Service

## Result: ✅ Done

## Files changed
- `src/main/metadata.ts` — new file (97 lines)

## What was implemented

### `extractMetadata(pdfPath: string): Promise<BookMetadata>`
- Opens PDF via `pdfjs-dist/legacy/build/pdf.mjs` (Node-compatible build)
- Reads document info dict: Title, Author, Publisher
- Counts pages via `doc.numPages`
- Falls back to filename-derived title when PDF has no Title metadata
- Returns `{ title, author, publisher, pages, fileSize }`

### `generateCover(pdfPath: string, outputDir: string): Promise<string>`
- Opens PDF, gets page 1 viewport dimensions
- **Partially stubbed**: pdf.js `page.render()` requires the `canvas` package (node-canvas) for Canvas2D context in Node.js. Without it, rendering to pixels is not possible.
- Currently generates an SVG-based placeholder cover with book name, then processes it through `sharp` for resize (300px wide) and `blur` (20px) — the sharp pipeline is fully functional.
- To enable real rendering, install `canvas` (`npm install canvas`) and uncomment the render call documented inline.

## Self-check
```
$ npx tsx src/main/metadata.ts
typeof extractMetadata: function
typeof generateCover: function
metadata module loaded OK
```
Exit code: 0 ✅

## Shared types used
- `BookMetadata` interface defined locally (subset of `Book` from `src/shared/types.ts`)

## Dependencies used
- `pdfjs-dist` (legacy build) — already installed
- `sharp` — already installed

## Missing dependency (documented)
- `canvas` (node-canvas) — needed for `page.render()` to produce pixel data. The cover generation is stubbed with a clear upgrade path.

## Surprises / Notes
- pdfjs-dist v6 requires the legacy build (`pdfjs-dist/legacy/build/pdf.mjs`) for Node.js. The main build uses `DOMMatrix` which is browser-only.
- The project has `"type": "module"` in package.json, so `require.main === module` doesn't work. Used `import.meta.url` check instead.
- Sharp works fine for the post-render pipeline (resize, blur, PNG output).
