import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// ponytail: set worker via URL so Vite bundles it correctly
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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
 * Render a single page to a canvas element.
 */
export async function renderPage(
  doc: pdfjs.PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  scale: number,
): Promise<void> {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2d context');
  await page.render({ canvasContext: ctx, canvas, viewport }).promise;
}

/**
 * Extract text content from a page.
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
 * Create an offscreen canvas element.
 */
export function createCanvas(): HTMLCanvasElement {
  return document.createElement('canvas');
}

// ── Self-check (type-only — needs DOM for runtime) ────────────────────────
// ponytail: exports verified; full test needs Electron runtime with DOM

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _exportsExist: Record<string, unknown> = {
  loadPdf, renderPage, getPageText, createCanvas,
};
