import { useEffect } from 'react';

type KeyHandler = Record<string, () => void>;

const KEY_MAP: Record<string, string> = {
  ' ': 'Space',
  Escape: 'Escape',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  f: 'f',
};

export function useKeyboard(handlers: KeyHandler): void {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't fire inside input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const key = e.key;
      const mapped = KEY_MAP[key] ?? key;

      // Shift variants
      if (e.shiftKey && key === ' ') {
        handlers['Shift+Space']?.();
        e.preventDefault();
        return;
      }

      if (e.key === '+' || e.key === '=') {
        handlers['+']?.();
        return;
      }
      if (e.key === '-') {
        handlers['-']?.();
        return;
      }

      const handler = handlers[mapped];
      if (handler) {
        handler();
        e.preventDefault();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
}
