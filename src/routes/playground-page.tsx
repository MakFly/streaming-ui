import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Moon, Sun } from 'lucide-react';
import { Logo } from '@/components/logo';
import { PlaygroundCanvas } from '@/components/playground/canvas';
import { PlaygroundSidebar } from '@/components/playground/sidebar';
import { shuffle, usePlaygroundState, type PlaygroundView } from '@/components/playground/state';
import { PALETTES, useTheme, type Palette } from '@/providers/theme-provider';
import { paths } from '@/lib/paths';
import { PLAYGROUND, applyHead } from '@/seo/routes';
import { cn } from '@/lib/utils';

/* `/playground`: every piece of the site in one full-screen builder, laid out like assistant-ui's playground
 * (UI Builder): a 48px header, the settings sidebar, and the canvas with its toolbar. The canvas shows the chat,
 * a template or a streaming response (the header switch). The combination lives in the URL
 * (components/playground/state.ts); see docs/features/playground/. Outside the site layout, like /preview. */

const VIEWS: { id: PlaygroundView; label: string }[] = [
  { id: 'chat', label: 'Chat' },
  { id: 'template', label: 'Template' },
  { id: 'response', label: 'Response' },
];

/** Typing in a field (the composer, a search) must never trigger the page's single-key shortcut. */
const isTyping = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
const isPalette = (v: string | null): v is Palette => PALETTES.some((p) => p.id === v);

export function PlaygroundPage() {
  const [state, set] = usePlaygroundState();
  const [, setQuery] = useSearchParams();
  const { theme, toggleTheme, palette, setPalette } = useTheme();
  const [customizing, setCustomizing] = useState(false);

  useEffect(() => {
    applyHead(PLAYGROUND);
    // A shared link carries its palette and theme: apply them once, then drop them from the address so a reload
    // does not bring them back over one picked since.
    const q = new URLSearchParams(window.location.search);
    const p = q.get('palette');
    if (isPalette(p)) setPalette(p);
    const t = q.get('theme');
    if ((t === 'light' || t === 'dark') && t !== theme) toggleTheme();
    if (q.has('palette') || q.has('theme'))
      setQuery(
        (prev) => {
          prev.delete('palette');
          prev.delete('theme');
          return prev;
        },
        { replace: true },
      );
    // Mount only: later changes of the site theme must not be undone by the link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // R shuffles composer, picker, thinking style, response, palette and theme (never while typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'r' || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      e.preventDefault();
      set(shuffle(state));
      const others = PALETTES.filter((x) => x.id !== palette);
      setPalette(others[Math.floor(Math.random() * others.length)].id);
      if (Math.random() < 0.5) toggleTheme();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background-full text-text-primary">
      <header className="z-50 w-full shrink-0">
        <div className="relative flex h-12 w-full items-center justify-between px-4">
          <div className="flex min-w-0 items-center">
            <Link to={paths.home()} aria-label="Streaming UI home" className="flex shrink-0 items-center gap-2">
              <Logo className="size-[18px] rounded-[5px] [&_svg]:size-3" />
            </Link>
            {/* Phones keep the logo only: the canvas switch needs the room. */}
            <span className="mx-3 hidden text-text-tertiary/40 sm:inline">/</span>
            <span className="hidden truncate text-sm text-text-primary sm:inline">Playground</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div role="radiogroup" aria-label="Canvas" className="grid min-w-max grid-cols-3 rounded-lg bg-background-tertiary-default/70 p-1 text-xs">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={state.view === v.id}
                  onClick={() => set({ view: v.id })}
                  className={cn('cursor-pointer rounded-sm px-2 py-1 font-medium whitespace-nowrap transition-colors sm:px-2.5', state.view === v.id ? 'bg-background-full text-text-primary' : 'text-text-primary/45 hover:text-text-primary/90')}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Use light mode' : 'Use dark mode'} className="flex size-7 cursor-pointer items-center justify-center text-text-tertiary transition-colors hover:text-text-primary">
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 w-full flex-1 overflow-hidden">
        <aside aria-label="Customize" className="hidden w-72 shrink-0 overflow-hidden border-r border-text-primary/10 md:block lg:w-80">
          <div className="scrollbar-none h-full overflow-y-auto px-4 py-4">
            <PlaygroundSidebar state={state} set={set} />
          </div>
        </aside>
        <PlaygroundCanvas state={state} set={set} customizing={customizing} onCustomize={() => setCustomizing((c) => !c)} />
      </div>

      {/* Phones: Customize opens the same settings over the canvas, under the header and the toolbar. */}
      {customizing && (
        <div className="scrollbar-none fixed inset-x-0 top-24 bottom-0 z-40 overflow-y-auto bg-background-full px-4 py-4 md:hidden">
          <PlaygroundSidebar state={state} set={set} />
        </div>
      )}
    </div>
  );
}
