import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { Logo } from '@/components/logo';
import { PalettePicker } from '@/components/palette-picker';
import { useTheme } from '@/providers/theme-provider';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';

// `active` marks the section the current page belongs to (gallery and single demos are both "Responses").
// `wide` links (anchors on the home page, also in the search palette) only show from xl, where the bar has room.
const NAV: { label: string; to: string; active?: (p: string) => boolean; wide?: true }[] = [
  { label: 'Responses', to: paths.gallery(), active: (p: string) => p.startsWith('/responses') || p.startsWith('/demo/') },
  { label: 'Templates', to: paths.templates(), active: (p: string) => p.startsWith('/templates') },
  { label: 'Composers', to: paths.composers(), active: (p: string) => p.startsWith('/composers') },
  { label: 'Orbs', to: paths.orbs(), active: (p: string) => p.startsWith('/orbs') },
  { label: 'Models', to: paths.modelPicker(), active: (p: string) => p.startsWith('/model-picker') },
  { label: 'Playground', to: paths.playground(), active: (p: string) => p.startsWith('/playground') },
  { label: 'Collections', to: '/#libraries', wide: true },
  { label: 'Prompts', to: '/#prompts', wide: true },
];

// The palette pulls in the whole response registry: load it on first use (or hover), never with the page.
const loadPalette = () => import('@/components/command-palette');
const CommandPalette = lazy(loadPalette);

/** Site navbar on every page: logo, section links, search palette (⌘K), theme toggle and the main CTA. */
export function SiteNav() {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const [search, setSearch] = useState(false);
  // Stays mounted after the first open so the close animation can play.
  const [paletteUsed, setPaletteUsed] = useState(false);
  const openSearch = () => {
    setPaletteUsed(true);
    setSearch(true);
  };

  // ⌘K / Ctrl+K toggles the palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteUsed(true);
        setSearch((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-separator-border bg-background-full/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1320px] items-center gap-6 px-6 sm:px-10">
        <Link to="/" className="flex shrink-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring" aria-label="Streaming UI home">
          <Logo />
          <span className="text-headline-semibold text-text-primary">Streaming UI</span>
        </Link>
        {/* Below lg the links do not fit beside the tools: tablets get the CTA and the search palette instead, like phones. */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const on = n.active?.(pathname) ?? false;
            return (
            <Link
              key={n.label}
              to={n.to}
              aria-current={on ? 'page' : undefined}
              className={cn(
                'rounded-md px-2.5 py-1.5 text-body-medium whitespace-nowrap transition-colors hover:bg-background-tertiary-default hover:text-text-primary',
                on ? 'text-text-primary' : 'text-text-secondary',
                n.wide && 'max-xl:hidden',
              )}
            >
              {n.label}
            </Link>
            );
          })}
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <button
            type="button"
            onClick={openSearch}
            onPointerEnter={() => void loadPalette()}
            onFocus={() => void loadPalette()}
            aria-haspopup="dialog"
            className="hidden h-8 w-[220px] cursor-pointer items-center gap-2 rounded-lg bg-background-tertiary-default px-2.5 text-body-regular text-text-tertiary transition-colors outline-none hover:text-text-secondary focus-visible:ring-2 focus-visible:ring-border-focus-ring xl:flex"
          >
            <Icon name="search-line" className="size-4" />
            Search responses
            <kbd className="ms-auto rounded-md border border-border-button-default bg-background-primary-default px-1.5 font-sans text-caption-1-medium text-text-secondary">⌘K</kbd>
          </button>
          <Button size="icon" className="rounded-2lg xl:hidden" onClick={openSearch} aria-label="Search" aria-haspopup="dialog">
            <Icon name="search-line" className="size-5 text-foreground-icon-secondary" />
          </Button>
          <PalettePicker />
          <Button size="icon" className="rounded-2lg" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Use light mode' : 'Use dark mode'}>
            <Icon name={theme === 'dark' ? 'sun-line' : 'moon-line'} className="size-5 text-foreground-icon-secondary" />
          </Button>
          {/* Phones have the search palette (every page is in it) instead of this CTA: both don't fit beside the logo.
              From lg the nav's first link is Responses, so the CTA would only repeat it and push the bar off screen. */}
          <Button asChild variant="primary" className="px-3 max-sm:hidden lg:hidden">
            <Link to={paths.gallery()}>Browse responses</Link>
          </Button>
        </div>
      </div>
      {paletteUsed && (
        <Suspense fallback={null}>
          <CommandPalette open={search} onOpenChange={setSearch} />
        </Suspense>
      )}
    </header>
  );
}
