import { useEffect } from 'react';

type KeyHandler = Record<string, () => void>;

const KEY_MAP: Record<string, string> = {
  ' ': 'Space',
  Escape: 'Escape',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
};

export function useKeyboard(handlers: KeyHandler): void {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't fire inside input/textarea (but allow Escape)
      const tag = (e.target as HTMLElement).tagName;
      if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && e.key !== 'Escape') return;

      const key = e.key;

      // Ctrl/Meta combos: 'Ctrl+b' → 'Ctrl+B'
      if (e.ctrlKey || e.metaKey) {
        const combo = `Ctrl+${key.toUpperCase()}`;
        const handler = handlers[combo];
        if (handler) {
          handler();
          e.preventDefault();
          return;
        }
        return; // let other Ctrl combos pass (e.g. Ctrl+F for search)
      }

      // Shift+Space
      if (e.shiftKey && key === ' ') {
        handlers['Shift+Space']?.();
        e.preventDefault();
        return;
      }

      // Single key: try mapped first, then raw
      const mapped = KEY_MAP[key] ?? key;

      // + and - keys
      if (key === '+' || key === '=') {
        handlers['+']?.();
        return;
      }
      if (key === '-') {
        handlers['-']?.();
        return;
      }

      const handler = handlers[mapped] || handlers[key];
      if (handler) {
        handler();
        e.preventDefault();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
}
