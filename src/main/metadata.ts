import { createCanvas } from '@napi-rs/canvas';
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

export function pageThumbnailPath(outputDir: string, bookId: string): string {
  return path.join(outputDir, `${bookId}_page.png`);
}

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

function titleFromFilename(filePath: string): string {
  const base = path.basename(filePath, path.extname(filePath));
  return base
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function renderFirstPageThumbnail(
  pdfPath: string,
  outputPath: string,
): Promise<void> {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data }).promise;
  const page = await doc.getPage(1);

  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.min(2, 300 / baseViewport.width);
  const viewport = page.getViewport({ scale });

  const width = Math.floor(viewport.width);
  const height = Math.floor(viewport.height);
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');

  await page.render({
    canvasContext: context as unknown as CanvasRenderingContext2D,
    viewport,
    canvas: canvas as unknown as HTMLCanvasElement,
  }).promise;

  const sharp = (await import('sharp')).default;
  await sharp(canvas.toBuffer('image/png'))
    .resize(300, undefined, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toFile(outputPath);
}

async function renderPlaceholderThumbnail(
  pdfPath: string,
  outputPath: string,
  title?: string,
): Promise<void> {
  const sharp = (await import('sharp')).default;
  const label = title || path.basename(pdfPath, path.extname(pdfPath));
  const placeholderSvg = `<svg width="300" height="420">
    <rect width="100%" height="100%" fill="#1a1a2e"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".3em"
          fill="#555" font-family="sans-serif" font-size="24px">
      ${label.replace(/[<>&"']/g, '')}
    </text>
  </svg>`;

  await sharp(Buffer.from(placeholderSvg))
    .resize(300, undefined, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toFile(outputPath);
}

export async function generateCover(
  pdfPath: string,
  outputDir: string,
  bookId: string,
  title?: string,
): Promise<string> {
  const coverPath = pageThumbnailPath(outputDir, bookId);
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    await renderFirstPageThumbnail(pdfPath, coverPath);
  } catch (err) {
    console.warn(`First-page thumbnail failed for ${pdfPath}, using placeholder:`, err);
    await renderPlaceholderThumbnail(pdfPath, coverPath, title);
  }

  const blurPath = path.join(outputDir, `${bookId}_blur.png`);
  const sharp = (await import('sharp')).default;
  await sharp(coverPath)
    .blur(20)
    .png()
    .toFile(blurPath);

  return coverPath;
}

// ── Self-check ────────────────────────────────────────────────────────────
// ponytail: guard by filename, avoids import.meta.url CJS/ESM incompat
if (process.argv[1]?.endsWith('/metadata.ts') || process.argv[1]?.endsWith('\\metadata.ts')) {
  console.log('typeof extractMetadata:', typeof extractMetadata);
  console.log('typeof generateCover:', typeof generateCover);
  console.log('metadata module loaded OK');
  process.exit(0);
}
