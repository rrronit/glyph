# Batch 4 — Reader Sidebar Shell

**Status**: ✅ done

**Files changed**:
- `src/renderer/components/ReaderSidebar.tsx` (new)

**Self-check**: `npx tsc --noEmit -p tsconfig.renderer.json` — exit 0

**What was built**:
- Collapsible sidebar, 320px, right side
- Framer Motion spring slide animation + backdrop overlay
- Escape key closes sidebar (listener only when open)
- Tab bar: Bookmarks, Highlights, Notes, Outline
- Placeholder content per tab
- Close button (top-right X)
- `bg-[#0f0f1a]/95 backdrop-blur` with border separator

**Surprises**: None.
**Unresolved decisions**: None.
