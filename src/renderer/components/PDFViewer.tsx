import React, { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, PageViewport } from 'pdfjs-dist';
import { loadPdf, renderPage, renderTextLayer } from '../engine/pdfEngine';
import { useReaderStore } from '../stores/reader';

interface Props {
  filePath: string;
  onReady?: (totalPages: number) => void;
  onError?: (err: Error) => void;
}

const PDFViewer: React.FC<Props> = ({ filePath, onReady, onError }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const viewportRef = useRef<PageViewport | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const { currentPage, scale } = useReaderStore();

  // Load PDF document
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setStatus('loading');
      try {
        const doc = await loadPdf(filePath);
        if (cancelled) return;
        docRef.current = doc;
        useReaderStore.getState().setTotalPages(doc.numPages);
        setStatus('ready');
        onReady?.(doc.numPages);
      } catch (err) {
        if (cancelled) return;
        const msg = (err as Error).message;
        setErrorMsg(msg);
        setStatus('error');
        onError?.(err as Error);
      }
    }

    init();

    return () => {
      cancelled = true;
      docRef.current = null;
    };
  }, [filePath, onReady, onError]);

  // Render current page
  useEffect(() => {
    if (!docRef.current || !canvasRef.current || status !== 'ready') return;

    const canvas = canvasRef.current;
    const existingCtx = canvas.getContext('2d');
    if (existingCtx) {
      existingCtx.clearRect(0, 0, canvas.width, canvas.height);
    }

    renderPage(docRef.current, currentPage, canvas, scale)
      .then((viewport) => {
        viewportRef.current = viewport;
        // Render text layer
        if (textLayerRef.current && viewportRef.current) {
          renderTextLayer(docRef.current!, currentPage, textLayerRef.current, viewportRef.current)
            .catch(() => {});
        }
      })
      .catch((err) => {
        console.error('Render error:', err);
      });
  }, [currentPage, scale, status]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full bg-reader-bg">
        <div className="animate-pulse text-white/30 text-sm">Loading…</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center h-full bg-reader-bg">
        <div className="text-red-400 text-sm text-center px-8">
          <p className="font-medium mb-1">Failed to open PDF</p>
          <p className="text-red-400/60 text-xs">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full bg-[#1a1a2e] overflow-auto">
      <div className="relative shadow-2xl" style={{ width: canvasRef.current?.width, height: canvasRef.current?.height }}>
        <canvas ref={canvasRef} className="block" />
        <div
          ref={textLayerRef}
          className="pdf-text-layer"
          style={{
            width: canvasRef.current?.width,
            height: canvasRef.current?.height,
          }}
        />
      </div>
    </div>
  );
};

export default PDFViewer;
