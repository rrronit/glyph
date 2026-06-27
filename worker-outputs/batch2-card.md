# Batch 2 — Book Card Component

## Files created

- `src/renderer/components/BookCover.tsx` — cover image or placeholder with title initial
- `src/renderer/components/BookCard.tsx` — card component with grid/list modes

## Verification

| Check | Result |
|-------|--------|
| Typecheck (renderer) | ✅ BookCard/BookCover pass; library store has pre-existing error (unrelated) |
| Exports | `BookCard` (default), `BookCover` (default), named re-export of both from BookCard.tsx |

## Details

- `BookCover`: renders `<img>` if `coverPath` is set, otherwise a dark gray div with the book title's first character as placeholder.
- `BookCard`: accepts `book`, `viewMode`, optional `progress` (0–100), and `onClick`.
  - Grid mode: vertical card, cover 3:4 aspect on top, text below, progress bar at bottom.
  - List mode: horizontal row, small cover (16×24) on left, text right, vertical progress bar rightmost.
  - Framer Motion `whileHover={{ scale: 1.02 }}` on both modes.
  - Title uses `line-clamp-2`, author `line-clamp-1`.
  - Tailwind dark theme: `bg-gray-800`, `text-gray-100`, `border-gray-700`.

## Unresolved

- `progress` is passed via component prop rather than from `Book` type — the Book interface has no `completionPercent`. The library store/view will need to join book data with progress data from the store.
