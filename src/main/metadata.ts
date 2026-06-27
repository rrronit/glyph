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

export async function generateCover(
  pdfPath: string,
  outputDir: string,
): Promise<string> {
  const bookId = path.basename(pdfPath, path.extname(pdfPath));
  const coverPath = path.join(outputDir, `${bookId}_cover.png`);

  fs.mkdirSync(outputDir, { recursive: true });

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });

  // ponytail: pdf.js page.render() needs `canvas` pkg for Node.js Canvas2D.
  // SVG placeholder cover until canvas is installed.
  const sharp = (await import('sharp')).default;
  const width = Math.floor(viewport.width);
  const height = Math.floor(viewport.height);

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

  const blurPath = path.join(outputDir, `${bookId}_blur.png`);
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
