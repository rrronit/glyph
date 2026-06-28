import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// ponytail: set worker via URL so Vite bundles it correctly
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const DPR = window.devicePixelRatio || 1;

export type OutlineItem = {
  title: string;
  page: number;
  bold: boolean;
  italic: boolean;
  color: Uint8ClampedArray;
  items: OutlineItem[];
};

/**
 * Load a PDF from a file path. Gets binary data through IPC,
 * then parses with pdf.js.
 */
export async function loadPdf(filePath: string): Promise<pdfjs.PDFDocumentProxy> {
  const arrayBuffer = await window.glyphAPI.readFile(filePath);
  const data = new Uint8Array(arrayBuffer);
  return pdfjs.getDocument({ data }).promise;
}

/**
 * Render a single page to a canvas element at device pixel ratio for crisp text.
 * Returns the logical viewport (CSS pixels) so DOM layers match.
 */
let currentRenderTask: pdfjs.RenderTask | null = null;

export async function renderPage(
  doc: pdfjs.PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  scale: number,
): Promise<pdfjs.PageViewport> {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  // Cancel any ongoing render task on this canvas
  if (currentRenderTask) {
    await currentRenderTask.cancel();
    currentRenderTask = null;
  }

  // Device-pixel render, CSS-pixel layout
  canvas.width = Math.floor(viewport.width * DPR);
  canvas.height = Math.floor(viewport.height * DPR);
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Failed to get 2d context');
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  const renderContext = { canvasContext: ctx, canvas, viewport };
  const renderTask = page.render(renderContext);
  currentRenderTask = renderTask;

  try {
    await renderTask.promise;
  } catch (err: any) {
    if (err.name === 'RenderingCancelledException') {
      // Ignored
    } else {
      throw err;
    }
  } finally {
    if (currentRenderTask === renderTask) {
      currentRenderTask = null;
    }
  }
  return viewport;
}

/**
 * Extract text content from a page as a string.
 */
export async function getPageText(
  doc: pdfjs.PDFDocumentProxy,
  pageNum: number,
): Promise<string> {
  const page = await doc.getPage(pageNum);
  const content = await page.getTextContent();
  return content.items
    .map((item: unknown) => (item as { str?: string }).str || '')
    .join(' ');
}

/**
 * Render a text layer over the canvas so text is selectable.
 * Uses pdf.js's built-in TextLayer for correct positioning.
 */
export async function renderTextLayer(
  doc: pdfjs.PDFDocumentProxy,
  pageNum: number,
  container: HTMLElement,
  viewport: pdfjs.PageViewport,
): Promise<void> {
  const page = await doc.getPage(pageNum);
  const textContent = await page.getTextContent();

  container.innerHTML = '';
  const layer = new pdfjs.TextLayer({
    textContentSource: textContent,
    container,
    viewport,
  });

  await layer.render();
}

/**
 * Get the document outline and resolve named destinations to page numbers.
 */
export async function getOutline(doc: pdfjs.PDFDocumentProxy): Promise<OutlineItem[]> {
  const raw = await doc.getOutline();
  if (!raw || !raw.length) return [];

  async function resolvePageNum(dest: string | unknown[]): Promise<number> {
    try {
      const explicit = typeof dest === 'string' ? await doc.getDestination(dest) : dest;
      if (!explicit || !Array.isArray(explicit)) return 0;
      const ref = explicit[0];
      const page = await doc.getPageIndex(ref);
      return typeof page === 'number' ? page + 1 : 0;
    } catch {
      return 0;
    }
  }

  async function walk(items: typeof raw): Promise<OutlineItem[]> {
    const out: OutlineItem[] = [];
    for (const item of items) {
      const page = item.dest ? await resolvePageNum(item.dest) : 0;
      out.push({
        title: item.title,
        page,
        bold: !!item.bold,
        italic: !!item.italic,
        color: item.color,
        items: item.items?.length ? await walk(item.items) : [],
      });
    }
    return out;
  }

  return walk(raw);
}

const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: 'rgba(250, 204, 21, 0.45)',
  green: 'rgba(74, 222, 128, 0.45)',
  blue: 'rgba(96, 165, 250, 0.45)',
  pink: 'rgba(244, 114, 182, 0.45)',
};

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function buildNormalizedMap(text: string): { normalized: string; normToOrig: number[] } {
  const normToOrig: number[] = [];
  let normalized = '';
  let i = 0;

  while (i < text.length) {
    if (/\s/.test(text[i])) {
      if (normalized.length > 0 && normalized[normalized.length - 1] !== ' ') {
        normToOrig.push(i);
        normalized += ' ';
      }
      while (i < text.length && /\s/.test(text[i])) i++;
    } else {
      normToOrig.push(i);
      normalized += text[i];
      i++;
    }
  }

  return { normalized, normToOrig };
}

interface TextSegment {
  node: Text;
  start: number;
  end: number;
}

function resolveTextPosition(
  segments: TextSegment[],
  rawIndex: number,
  preferEnd: boolean,
): { node: Text; offset: number } | null {
  if (segments.length === 0) return null;

  for (const segment of segments) {
    if (rawIndex >= segment.start && rawIndex <= segment.end) {
      return {
        node: segment.node,
        offset: Math.max(0, Math.min(rawIndex - segment.start, segment.node.data.length)),
      };
    }
  }

  if (preferEnd) {
    const previous = [...segments].reverse().find((segment) => segment.end <= rawIndex);
    if (previous) return { node: previous.node, offset: previous.node.data.length };
  }

  const next = segments.find((segment) => segment.start >= rawIndex);
  if (next) return { node: next.node, offset: 0 };

  const last = segments[segments.length - 1];
  return { node: last.node, offset: last.node.data.length };
}

function appendHighlightRect(container: HTMLElement, rect: DOMRect, color: string): void {
  const layerRect = container.getBoundingClientRect();
  const div = document.createElement('div');
  div.className = 'pdf-highlight-overlay';
  div.style.left = `${rect.left - layerRect.left}px`;
  div.style.top = `${rect.top - layerRect.top}px`;
  div.style.width = `${rect.width}px`;
  div.style.height = `${rect.height}px`;
  div.style.backgroundColor = color;
  container.appendChild(div);
}

/**
 * Draw saved highlight overlays from the actual pdf.js text layer layout.
 */
export function renderHighlightOverlays(
  textLayer: HTMLElement,
  container: HTMLElement,
  highlights: { text: string; color: string }[],
): void {
  container.innerHTML = '';
  if (!highlights.length) return;

  let fullText = '';
  const segments: TextSegment[] = [];
  const spans = Array.from(textLayer.querySelectorAll('span'));

  for (const span of spans) {
    const textNode = Array.from(span.childNodes).find((node): node is Text => node.nodeType === Node.TEXT_NODE);
    if (!textNode || !textNode.data) continue;

    const start = fullText.length;
    fullText += textNode.data;
    segments.push({ node: textNode, start, end: fullText.length });

    // pdf.js often splits words/runs into separate spans without preserving spaces.
    fullText += ' ';
  }

  const { normalized, normToOrig } = buildNormalizedMap(fullText);
  if (!normalized || segments.length === 0) return;

  for (const hl of highlights) {
    const search = normalizeWhitespace(hl.text);
    if (!search) continue;

    const color = HIGHLIGHT_COLORS[hl.color] ?? HIGHLIGHT_COLORS.yellow;
    let from = 0;
    while (from < normalized.length) {
      const idx = normalized.indexOf(search, from);
      if (idx === -1) break;

      const origStart = normToOrig[idx];
      const lastNormIdx = idx + search.length - 1;
      const origEnd = lastNormIdx < normToOrig.length
        ? normToOrig[lastNormIdx] + 1
        : fullText.length;

      const startPosition = resolveTextPosition(segments, origStart, false);
      const endPosition = resolveTextPosition(segments, origEnd, true);
      if (startPosition && endPosition) {
        const range = document.createRange();
        try {
          range.setStart(startPosition.node, startPosition.offset);
          range.setEnd(endPosition.node, endPosition.offset);
          for (const rect of Array.from(range.getClientRects())) {
            if (rect.width > 0 && rect.height > 0) appendHighlightRect(container, rect, color);
          }
        } finally {
          range.detach();
        }
      }
      from = idx + 1;
    }
  }
}

/**
 * Create an offscreen canvas element.
 */
export function createCanvas(): HTMLCanvasElement {
  return document.createElement('canvas');
}

// ── Self-check (type-only — needs DOM for runtime) ────────────────────────
// ponytail: exports verified; full test needs Electron runtime with DOM

const _exportsExist: Record<string, unknown> = {
  loadPdf, renderPage, getPageText, createCanvas, renderTextLayer, getOutline, renderHighlightOverlays,
};
void _exportsExist;
