import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STORAGE_KEYS, storage } from '@/lib/storage';

type Theme = 'light' | 'dark';

/** Colour palettes (styles/palettes.css): each swaps the neutral and accent scales the whole theme is built from. */
export const PALETTES = [
  { id: 'graphite', name: 'Graphite', hint: 'True greys, blue accent', swatches: ['#121212', '#262626', '#3392ff'] },
  { id: 'dusk', name: 'Dusk', hint: 'Deep flat greys, emerald accent', swatches: ['#101010', '#1f1f1f', '#10b981'] },
  { id: 'slate', name: 'Slate', hint: 'Cool blue-grey, indigo accent', swatches: ['#0f172a', '#1e293b', '#6366f1'] },
  { id: 'sand', name: 'Sand', hint: 'Warm stone, amber accent', swatches: ['#1c1917', '#292524', '#f59e0b'] },
] as const;
export type Palette = (typeof PALETTES)[number]['id'];
const isPalette = (v: string | null): v is Palette => PALETTES.some((p) => p.id === v);

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void; palette: Palette; setPalette: (p: Palette) => void } | null>(null);

const systemTheme = (): Theme => (typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
const savedTheme = (): Theme | null => {
  const v = storage.get(STORAGE_KEYS.theme, '');
  return v === 'dark' || v === 'light' ? v : null;
};

/** Applies a theme and palette to <html> without letting every `transition-colors` animate the swap. */
function applyTheme(theme: Theme, palette: Palette) {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  if (palette === 'graphite') root.removeAttribute('data-palette');
  else root.setAttribute('data-palette', palette);
  // Flush styles now, with transitions off, then turn them back on. A timer rather than animation frames:
  // frames never run in a background tab, which left the class (and every transition) stuck off.
  void root.offsetWidth;
  window.setTimeout(() => root.classList.remove('theme-switching'), 0);
}

/**
 * Streaming UI themes through a `.dark` class on <html> (index.html sets it before paint).
 * The saved choice wins; without one the OS setting is followed live. Same-origin documents
 * (the template preview iframes, other tabs) follow a change made in any of them.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => savedTheme() ?? systemTheme());
  const [palette, setPaletteState] = useState<Palette>(() => {
    const v = storage.get(STORAGE_KEYS.palette, 'graphite');
    return isPalette(v) ? v : 'graphite';
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.palette) setPaletteState(isPalette(e.newValue) ? e.newValue : 'graphite');
      if (e.key !== STORAGE_KEYS.theme) return;
      setTheme(e.newValue === 'dark' || e.newValue === 'light' ? e.newValue : systemTheme());
    };
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onSystem = () => savedTheme() === null && setTheme(systemTheme());
    window.addEventListener('storage', onStorage);
    mq.addEventListener('change', onSystem);
    return () => {
      window.removeEventListener('storage', onStorage);
      mq.removeEventListener('change', onSystem);
    };
  }, []);

  useEffect(() => {
    applyTheme(theme, palette);
  }, [theme, palette]);

  // Persist only on an explicit toggle: if every document wrote its theme on mount, a preview iframe that
  // mounts late would overwrite the choice just made in another tab or frame.
  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      storage.set(STORAGE_KEYS.theme, next);
      return next;
    });
  }, []);
  const setPalette = useCallback((p: Palette) => {
    setPaletteState(p);
    storage.set(STORAGE_KEYS.palette, p);
  }, []);
  const value = useMemo(() => ({ theme, toggleTheme, palette, setPalette }), [theme, toggleTheme, palette, setPalette]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
