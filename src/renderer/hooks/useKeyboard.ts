import { useEffect } from 'react';

type KeyHandler = Record<string, () => void>;

const KEY_MAP: Record<string, string> = {
  ' ': 'Space',
  Escape: 'Escape',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
};

function normalize(raw: string): string {
  return raw.split('+').map((p) => p.toUpperCase()).join('+');
}

export function useKeyboard(handlers: KeyHandler): void {
  useEffect(() => {
    const normalized: Record<string, () => void> = {};
    for (const key of Object.keys(handlers)) {
      normalized[normalize(key)] = handlers[key];
    }

    function onKeyDown(e: KeyboardEvent) {
      // When a text selection is active, allow Cmd/Ctrl shortcuts like Cmd+L.
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      const baseKey = e.key;
      const hasModifier = e.ctrlKey || e.metaKey || e.altKey;
      const combo = normalize(`Ctrl+${baseKey}`);

      // Modifiers combos (Ctrl/Meta)
      if (e.ctrlKey || e.metaKey) {
        const handler = normalized[combo] || normalized[normalize(`Cmd+${baseKey}`)];
        if (handler) {
          handler();
          e.preventDefault();
        }
        return;
      }

      // Ignore non-modifier typing keys when inside input fields (except Escape)
      if (inInput && baseKey !== 'Escape') return;

      // Shift+Space
      if (e.shiftKey && baseKey === ' ') {
        normalized[normalize('Shift+Space')]?.();
        e.preventDefault();
        return;
      }

      // + and - keys
      if (baseKey === '+' || baseKey === '=') {
        normalized['+']?.();
        e.preventDefault();
        return;
      }
      if (baseKey === '-') {
        normalized['-']?.();
        e.preventDefault();
        return;
      }
      if (baseKey === '<' || baseKey === ',') {
        normalized['<']?.() ?? normalized[',']?.();
        e.preventDefault();
        return;
      }
      if (baseKey === '>' || baseKey === '.') {
        normalized['>']?.() ?? normalized['.']?.();
        e.preventDefault();
        return;
      }

      // Directional / single keys
      const mapped = KEY_MAP[baseKey] ?? baseKey;
      const handler = normalized[normalize(mapped)] || normalized[normalize(baseKey)];
      if (handler) {
        handler();
        e.preventDefault();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
}
