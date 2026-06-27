# Batch 3 — Reader Store

## Files changed
- `src/renderer/stores/reader.ts` (created)

## Self-check
```
PASS: src/renderer/stores/reader.ts
```
Command: `npx tsx src/renderer/stores/reader.ts`
Exit code: 0

Tests run:
- Initial state (null book, page 1, scale 1.0, fitMode auto)
- openBook (sets book, totalPages, resets page to 1, attempts progress restore)
- setPage clamping (0 → 1, 999 → totalPages, valid page)
- nextPage/prevPage (advance, go back, boundary stays)
- zoomIn/zoomOut (0.25 steps, clamp [0.5, 4.0])
- setFitMode (width/page/auto)
- closeBook (resets all state)

## Validation
- Typecheck: no errors from reader.ts (pdfEngine.ts has unrelated errors)
- Follows existing store pattern (Zustand v5, globalThis guard, same import style)

## Surprises
- `pdfEngine.ts` has type errors (likely another batch 3 worker) — out of scope for this module
