import React, { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, PageViewport } from 'pdfjs-dist';
import { loadPdf, renderPage, renderTextLayer, renderHighlightOverlays } from '../engine/pdfEngine';
import { useReaderStore } from '../stores/reader';
import { useAIChatStore } from '../stores/aiChat';
import { useHighlightStore } from '../stores/highlights';

interface Props {
  filePath: string;
  onReady?: (totalPages: number) => void;
  onError?: (err: Error) => void;
}

interface ToolbarPos {
  left: number;
  top: number;
  visible: boolean;
}

const PDFViewer: React.FC<Props> = ({ filePath, onReady, onError }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const highlightLayerRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const prevLayerCleanup = useRef<Promise<void> | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(null);
  const [toolbar, setToolbar] = useState<ToolbarPos>({ left: 0, top: 0, visible: false });
  const isDraggingRef = useRef(false);

  const { currentPage, scale, fitMode } = useReaderStore();
  const setScale = useReaderStore((s) => s.setScale);
  const setSelectedText = useReaderStore((s) => s.setSelectedText);
  const bookId = useReaderStore((s) => s.currentBook?.id);
  const appendContext = useAIChatStore((s) => s.appendContext);
  const setChatOpen = useAIChatStore((s) => s.setOpen);
  const addHighlight = useHighlightStore((s) => s.addHighlight);
  const highlights = useHighlightStore((s) => s.highlights);
  const loadHighlights = useHighlightStore((s) => s.loadHighlights);

  useEffect(() => {
    if (bookId) loadHighlights(bookId);
  }, [bookId, loadHighlights]);

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

  // Fit page height to the available reader area until the user zooms manually.
  useEffect(() => {
    if (fitMode !== 'page' || !docRef.current || !scrollRef.current || status !== 'ready') return;

    let cancelled = false;

    async function fitPageToHeight() {
      if (!docRef.current || !scrollRef.current) return;

      const page = await docRef.current.getPage(currentPage);
      if (cancelled) return;

      const viewport = page.getViewport({ scale: 1 });
      const availableHeight = Math.max(scrollRef.current.clientHeight - 64, 320);
      const nextScale = Math.max(0.5, Math.min(3, availableHeight / viewport.height));

      setScale(Math.round(nextScale * 100) / 100, { manual: false });
    }

    fitPageToHeight().catch((err) => console.error('Fit-to-height error:', err));

    const observer = new ResizeObserver(() => {
      if (useReaderStore.getState().fitMode !== 'page') return;
      fitPageToHeight().catch((err) => console.error('Fit-to-height error:', err));
    });
    observer.observe(scrollRef.current);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [currentPage, fitMode, setScale, status]);

  // Render current page
  useEffect(() => {
    if (!docRef.current || !canvasRef.current || status !== 'ready') return;

    const canvas = canvasRef.current;
    let cancelled = false;

    (async () => {
      // 1. Get viewport synchronously or quickly to set wrapper size
      const page = await docRef.current!.getPage(currentPage);
      if (cancelled) return;
      const viewport = page.getViewport({ scale });
      setPageSize({ width: Math.floor(viewport.width), height: Math.floor(viewport.height) });

      // 2. Render page
      await renderPage(docRef.current!, currentPage, canvas, scale);
      if (cancelled) return;

      if (textLayerRef.current) {
        await prevLayerCleanup.current;
        if (cancelled) return;
        prevLayerCleanup.current = renderTextLayer(docRef.current!, currentPage, textLayerRef.current, viewport);
        await prevLayerCleanup.current;
      }
      if (cancelled) return;

      if (highlightLayerRef.current && textLayerRef.current) {
        const pageHighlights = highlights.filter((h) => h.page === currentPage);
        renderHighlightOverlays(textLayerRef.current, highlightLayerRef.current, pageHighlights);
      }
    })().catch((err) => {
      // pdf.js often throws "Rendering cancelled" if we cancel the render task by changing pages quickly
      if (err.name !== 'RenderingCancelledException') {
        console.error('Render error:', err);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentPage, scale, status, highlights]);

  // Selection handling
  useEffect(() => {
    function updateToolbar() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !wrapperRef.current || !textLayerRef.current) {
        setSelectedText('');
        setToolbar((t) => ({ ...t, visible: false }));
        return;
      }

      // Only handle selections inside our text layer
      const range = sel.getRangeAt(0);
      if (!wrapperRef.current.contains(range.commonAncestorContainer)) {
        return;
      }

      const text = sel.toString().trim();
      setSelectedText(text);

      const rect = range.getBoundingClientRect();
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      setToolbar({
        left: rect.left - wrapperRect.left + rect.width / 2,
        top: rect.top - wrapperRect.top - 48,
        visible: text.length > 0,
      });
    }

    function onSelectionChange() {
      if (!isDraggingRef.current) {
        updateToolbar();
      }
    }

    // Handle click outside selection
    function onPointerDown(e: PointerEvent) {
      if (toolbar.visible) {
        // Check if we clicked the toolbar itself
        const target = e.target as Node | null;
        const clickedToolbar = target && wrapperRef.current && wrapperRef.current.contains(target) && !textLayerRef.current?.contains(target);
        if (clickedToolbar) return;
      }
      isDraggingRef.current = true;
      setToolbar((t) => ({ ...t, visible: false }));
    }

    function onPointerUp() {
      isDraggingRef.current = false;
      // Small delay to allow the selection to finalize
      setTimeout(updateToolbar, 50);
    }

    document.addEventListener('selectionchange', onSelectionChange);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointerup', onPointerUp);
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointerup', onPointerUp);
    };
  }, [setSelectedText]);

  const handleHighlight = async (color: string) => {
    const text = window.getSelection()?.toString().trim();
    if (!text || !bookId) return;
    await addHighlight({ bookId, page: currentPage, text, color });
    window.getSelection()?.removeAllRanges();
    setToolbar((t) => ({ ...t, visible: false }));
  };

  const handleCopy = () => {
    const text = window.getSelection()?.toString().trim();
    if (text) navigator.clipboard.writeText(text);
    window.getSelection()?.removeAllRanges();
    setToolbar((t) => ({ ...t, visible: false }));
  };

  const handleAddToChat = () => {
    const text = window.getSelection()?.toString().trim();
    if (!text) return;
    appendContext(`Page ${currentPage}: "${text}"`);
    setChatOpen(true);
    window.getSelection()?.removeAllRanges();
    setToolbar((t) => ({ ...t, visible: false }));
  };

  const containerStyle: React.CSSProperties | undefined = pageSize
    ? { width: pageSize.width, height: pageSize.height }
    : undefined;

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--reader-bg)]">
        <div className="flex items-center gap-3 text-[var(--text-muted)] text-sm">
          <span className="w-4 h-4 rounded-full border-2 border-[var(--text-muted)] border-t-[var(--text-main)] opacity-50 animate-spin" />
          Loading book…
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--reader-bg)]">
        <div className="text-red-400/90 text-sm text-center px-8 py-6 rounded-2xl border border-red-500/15 bg-red-500/5">
          <p className="font-medium mb-1">Failed to open PDF</p>
          <p className="text-red-400/50 text-xs">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex h-full w-full items-center justify-center overflow-auto bg-[var(--reader-bg)] p-8">
      <div
        ref={wrapperRef}
        className="relative shadow-page rounded-md bg-paper transition-transform duration-200 ease-out"
        style={containerStyle}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
        <div
          ref={highlightLayerRef}
          className="pdf-highlight-layer"
          style={containerStyle}
        />
        <div
          ref={textLayerRef}
          className="pdf-text-layer"
          style={containerStyle}
        />

        <div
          className={`absolute z-40 flex items-center gap-1.5 bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/60 px-2 py-1.5 -translate-x-1/2 transition-all duration-200 ease-out origin-bottom ${
            toolbar.visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
          }`}
          style={{ left: toolbar.left, top: toolbar.top }}
        >
          {/* Highlight colors */}
          <div className="flex items-center gap-1.5 px-1" onPointerDown={(e) => e.stopPropagation()}>
            {[
              { id: 'yellow', bg: 'bg-yellow-400', hover: 'hover:bg-yellow-300', ring: 'focus-visible:ring-yellow-400/50' },
              { id: 'green', bg: 'bg-green-400', hover: 'hover:bg-green-300', ring: 'focus-visible:ring-green-400/50' },
              { id: 'blue', bg: 'bg-blue-400', hover: 'hover:bg-blue-300', ring: 'focus-visible:ring-blue-400/50' },
              { id: 'pink', bg: 'bg-pink-400', hover: 'hover:bg-pink-300', ring: 'focus-visible:ring-pink-400/50' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => handleHighlight(c.id)}
                className={`w-4 h-4 rounded-full ${c.bg} ${c.hover} ${c.ring} shadow-inner transition-transform hover:scale-110 active:scale-90 outline-none focus-visible:ring-2`}
                title={`Highlight ${c.id}`}
              />
            ))}
          </div>

          <div className="w-px h-5 bg-white/10 mx-0.5" />

          {/* Copy */}
          <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        title="Copy"
        onPointerDown={(e) => e.stopPropagation()}
      >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy
          </button>

          {/* Ask AI */}
        <button
          onClick={handleAddToChat}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-violet-200 hover:text-violet-100 hover:bg-violet-500/20 transition-colors"
          onPointerDown={(e) => e.stopPropagation()}
        >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Ask AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
