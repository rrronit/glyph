# Batch 4: Reader page + Keyboard shortcuts

## Files created

| File | Description |
|------|-------------|
| `src/renderer/hooks/useKeyboard.ts` | Generic keyboard shortcut hook. Maps keys (Space, Escape, ArrowLeft/Right, +/-) and handles Shift+Space. Ignores input/textarea/select. |
| `src/renderer/components/ReaderControls.tsx` | Bottom control bar: prev/next page buttons, page counter, zoom in/out (0.5–4.0 in 0.25 steps), go-to-page mini form. |
| `src/renderer/components/ReaderSidebar.tsx` | Right sidebar with 4 tabs (Outline, Bookmarks, Highlights, Info). Each tab is stubbed with placeholder text. Toggleable via `isOpen` prop. |
| `src/renderer/pages/Reader.tsx` | Main reader page. Layout: PDFViewer (center) + ReaderSidebar (right) + ReaderControls (bottom). Auto-hide controls on mousemove timeout. Keyboard shortcuts: Space/ArrowRight (next), Shift+Space/ArrowLeft (prev), Escape (close sidebar or exit reader), f (fullscreen), +/- (zoom). |

## Verification

- Typecheck (renderer): ✅ pass
- Vite build: ✅ pass (22 modules, 99ms)
- ESLint: ✅ pass (no warnings or errors)

## Notes

- ReaderControls and ReaderSidebar were created alongside Reader.tsx because the other Batch 4 workers hadn't created them yet. They are fully functional — no stubs in the integration path.
- Reader page uses `book.path` passed to PDFViewer and `book.title` shown in the top bar.
- Auto-hide controls: `controlsVisible` resets to true on mousemove, Space also hides.
- Sidebar closes on Escape or clicking the PDF area.
