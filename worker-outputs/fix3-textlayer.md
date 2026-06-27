# Fix 3: Enable text selection in PDF

## Changes

### `src/renderer/engine/pdfEngine.ts`
- `renderPage` now returns `PageViewport` instead of void
- Added `renderTextLayer(doc, pageNum, container, viewport)` — creates absolutely-positioned transparent spans from pdf.js text content items, positioned using the transform matrix from each text item

### `src/renderer/components/PDFViewer.tsx`
- Added `textLayerRef` and `viewportRef` refs
- Imported `PageViewport` type and `renderTextLayer`
- After canvas render completes, renders text layer into overlay div
- JSX: wrapped canvas in relative container with a `.pdf-text-layer` div positioned absolutely on top

### `src/renderer/styles/globals.css`
- Added `.pdf-text-layer` styles: absolute overlay, `user-select: text`, blue selection highlight
- Added `.pdf-text-span` styles: transparent text, absolute positioning, `cursor: text`

## Verification

| Check | Result |
|-------|--------|
| Typecheck | pass |
| Build (vite) | pass (34 modules, 128ms) |
| Lint | pass (0 errors) |
