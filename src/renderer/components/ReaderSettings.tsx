import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useReaderStore } from '../stores/reader';

const ReaderSettings: React.FC = () => {
  const { theme, scale, setTheme, setScale } = useReaderStore();

  const themes = [
    { id: 'light', label: 'Light' },
    { id: 'sepia', label: 'Sepia' },
    { id: 'charcoal', label: 'Charcoal' },
  ] as const;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="rounded-full p-2 text-(--text-muted) transition-all hover:bg-white/8 hover:text-(--text-main)"
          title="Reader Settings"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
            <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={12}
          className="w-56 rounded-2xl bg-(--reader-surface) p-2 shadow-2xl shadow-black/40 border border-(--border-strong) z-50 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="px-2 py-2 mb-1">
            <p className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-3">Theme</p>
            <div className="flex gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    theme === t.id
                      ? 'bg-(--accent) text-white shadow-md'
                      : 'bg-(--reader-bg) text-(--text-muted) hover:text-(--text-main) border border-(--border)'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-2 py-2">
            <p className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-3">Zoom Level</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-(--reader-bg) text-(--text-muted) hover:text-(--text-main) transition-colors border border-(--border)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              
              <div className="flex-1 text-center font-mono text-xs text-(--text-main)">
                {Math.round(scale * 100)}%
              </div>

              <button
                onClick={() => setScale(Math.min(4, scale + 0.1))}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-(--reader-bg) text-(--text-muted) hover:text-(--text-main) transition-colors border border-(--border)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ReaderSettings;
