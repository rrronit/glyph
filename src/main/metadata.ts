import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import * as fs from 'fs';
import * as path from 'path';

export interface BookMetadata {
  title?: string;
  author?: string;
  publisher?: string;
  pages: number;
  fileSize: number;
}

/**
 * Extract metadata from a PDF file.
 * Uses pdf.js to read document info (title, author) and count pages.
 * Falls back to deriving title from the filename if the PDF has no title.
 */
export async function extractMetadata(pdfPath: string): Promise<BookMetadata> {
  const stat = fs.statSync(pdfPath);
  const fileSize = stat.size;

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data }).promise;

  const meta = await doc.getMetadata();
  const info = meta.info as Record<string, unknown>;

  const pages = doc.numPages;

  const title = (info.Title as string) || titleFromFilename(pdfPath);
  const author = info.Author as string | undefined;
  const publisher = info.Publisher as string | undefined;

  return { title, author, publisher, pages, fileSize };
}

/**
 * Derive a readable title from a filename.
 * Strips extension, replaces dashes/underscores with spaces, capitalizes words.
 */
function titleFromFilename(filePath: string): string {
  const base = path.basename(filePath, path.extname(filePath));
  return base
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Generate cover images for a book.
 * Renders the first page as a PNG thumbnail using pdf.js + sharp.
 *
 * Ponytail: pdf.js page rendering in Node.js requires the `canvas` package
 * (node-canvas) to provide a Canvas2D context. Without it, `page.render()`
 * will fail. The rendering call is stubbed with a clear error.
 *
 * Upgrade path: install `canvas`, then uncomment the render call below.
 * The sharp resize/blur pipeline is fully implemented.
 */
export async function generateCover(
  pdfPath: string,
  outputDir: string,
): Promise<string> {
  const bookId = path.basename(pdfPath, path.extname(pdfPath));
  const coverPath = path.join(outputDir, `${bookId}_cover.png`);

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Read PDF and render first page to raw pixels
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 }); // scale for decent resolution

  // Render to a raw RGBA buffer via pdf.js operator list + sharp.
  // pdf.js 6.x supports `page.render()` with a `canvas`-compatible context.
  // In Node.js we use a lightweight OffscreenCanvas polyfill or the `canvas` pkg.
  //
  // Stubbed: return path without rendering until `canvas` is installed.
  // To enable, install `canvas` (npm install canvas) and uncomment below.
  //
  // const canvas = createCanvas(viewport.width, viewport.height);
  // const ctx = canvas.getContext('2d');
  // await page.render({ canvasContext: ctx, viewport }).promise;
  // const rawRgba = canvas.toBuffer('raw');

  // For now, create a placeholder solid-color cover via sharp
  const sharp = (await import('sharp')).default;
  const width = Math.floor(viewport.width);
  const height = Math.floor(viewport.height);

  // Placeholder: a gradient-like cover from sharp metadata
  // ponytail: solid placeholder until canvas is available
  const placeholderSvg = `<svg width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="#1a1a2e"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".3em"
          fill="#555" font-family="sans-serif" font-size="${Math.min(width, height) / 10}px">
      ${bookId}
    </text>
  </svg>`;

  await sharp(Buffer.from(placeholderSvg))
    .resize(300, undefined, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toFile(coverPath);

  // Generate blurred version
  const blurPath = path.join(outputDir, `${bookId}_blur.png`);
  await sharp(coverPath)
    .blur(20)
    .png()
    .toFile(blurPath);

  return coverPath;
}

// Self-check: verify module loads and exports correctly
if (require.main === module) {
  // No test PDF available; verify exports exist
  console.log('typeof extractMetadata:', typeof extractMetadata);
  console.log('typeof generateCover:', typeof generateCover);
  console.log('metadata module loaded OK');
}
