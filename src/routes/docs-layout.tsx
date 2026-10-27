import { Fragment, lazy, Suspense, useEffect, useState } from 'react';
import { Link, Outlet, ScrollRestoration, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { Logo } from '@/components/logo';
import { PalettePicker } from '@/components/palette-picker';
import { DOCS_NAV, DocsSidebar } from '@/components/docs/docs-sidebar';
import { DocsCrumbs, InDocs, type Crumb } from '@/components/docs/in-docs';
import { useTheme } from '@/providers/theme-provider';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';

// The palette pulls in the whole response registry: load it on first use (or hover), never with the page.
const loadPalette = () => import('@/components/command-palette');
const CommandPalette = lazy(loadPalette);

/** "Streaming UI › Components › Composers" or "Streaming UI › Responses › Agent", from the sidebar entry the page
 * belongs to, then whatever the page adds (useDocsCrumbs). */
function Breadcrumb({ extra }: { extra: Crumb[] }) {
  const { pathname } = useLocation();
  const group = DOCS_NAV.find((g) => g.items.some((i) => i.active?.(pathname, '')));
  const item = group?.items.find((i) => i.active?.(pathname, ''));
  const trail: Crumb[] = [{ label: 'Streaming UI', to: paths.home() }];
  if (group?.label === 'Components') trail.push({ label: 'Components', to: paths.components() });
  if (item && item.to !== paths.components()) trail.push({ label: item.label, to: item.to });
  trail.push(...extra);
  const link =
    '-mx-1 flex items-center gap-1.5 rounded-md px-1 py-0.5 text-caption-1-medium whitespace-nowrap text-text-tertiary outline-none transition-colors duration-150 ease hover:bg-background-primary-hover hover:text-text-secondary focus-visible:ring-2 focus-visible:ring-border-focus-ring';
  return (
    <nav aria-label="Breadcrumb" className="flex w-full min-w-0 flex-1 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ol className="flex items-center gap-2.5 px-1">
        {trail.map((t, i) => (
          <Fragment key={`${t.label}-${i}`}>
            {i > 0 && <Icon name="arrow-right-s-line" className="size-3 text-text-tertiary rtl:rotate-180" />}
            {i === trail.length - 1 || !t.to ? (
              <li aria-current={i === trail.length - 1 ? 'page' : undefined} className="flex items-center gap-1.5 text-caption-1-medium whitespace-nowrap text-text-secondary">
                {t.label}
              </li>
            ) : (
              <li className="flex items-center">
                <Link to={t.to} className={link}>
                  {i === 0 && <Logo className="size-4 rounded-[5px] [&>svg]:size-3" />}
                  {t.label}
                </Link>
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Every library page (BoardUI's /components): a floating sidebar instead of the site navbar from lg, and a breadcrumb
 * bar with the theme tools above each page. Below lg the sidebar opens as a drawer from a compact bar.
 */
export function DocsLayout() {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const [search, setSearch] = useState(false);
  const [paletteUsed, setPaletteUsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  const openSearch = () => {
    setPaletteUsed(true);
    setSearch(true);
  };

  // ⌘K / Ctrl+K toggles the palette, as in the site navbar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteUsed(true);
        setSearch((open) => !open);
      }
      if (e.key === 'Escape') setDrawer(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => setDrawer(false), [pathname]);

  const tools = (
    <div className="flex shrink-0 items-center gap-2">
      <PalettePicker />
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-2lg text-foreground-icon-secondary outline-none transition-colors duration-150 ease hover:bg-background-secondary-hover hover:text-foreground-icon-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      >
        <Icon name={theme === 'dark' ? 'sun-line' : 'moon-line'} className="size-5" />
      </button>
    </div>
  );

  return (
    <InDocs.Provider value={true}>
      <DocsCrumbs.Provider value={setCrumbs}>
        <div className="flex min-h-screen w-full bg-background-full">
          <DocsSidebar onSearch={openSearch} onWarmSearch={() => void loadPalette()} className="sticky top-3 m-3 hidden h-[calc(100vh-24px)] lg:flex" />

          {/* Below lg: a compact bar, the sidebar as a drawer. */}
          <div className={cn('fixed inset-0 z-50 lg:hidden', drawer ? 'pointer-events-auto' : 'pointer-events-none')}>
            <div aria-hidden="true" onClick={() => setDrawer(false)} className={cn('absolute inset-0 bg-black/30 transition-opacity duration-200', drawer ? 'opacity-100' : 'opacity-0')} />
            <DocsSidebar
              onSearch={() => {
                setDrawer(false);
                openSearch();
              }}
              onNavigate={() => setDrawer(false)}
              className={cn('absolute inset-y-3 start-3 max-w-[calc(100vw-24px)] transition-transform duration-300 ease-out', drawer ? 'translate-x-0' : '-translate-x-[calc(100%+24px)] rtl:translate-x-[calc(100%+24px)]')}
            />
          </div>

          <div className="min-w-0 flex-1">
            <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-separator-border bg-background-full/80 px-4 backdrop-blur-md lg:hidden">
              <Button size="icon" className="rounded-2lg" onClick={() => setDrawer(true)} aria-label="Open navigation" aria-expanded={drawer}>
                <Icon name="list-unordered" className="size-5 text-foreground-icon-secondary" />
              </Button>
              <Link to="/" className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring" aria-label="Streaming UI home">
                <Logo />
                <span className="text-headline-semibold text-text-primary">Streaming UI</span>
              </Link>
              <Button size="icon" className="ms-auto rounded-2lg" onClick={openSearch} onPointerEnter={() => void loadPalette()} aria-label="Search" aria-haspopup="dialog">
                <Icon name="search-line" className="size-5 text-foreground-icon-secondary" />
              </Button>
            </header>
            <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 pt-10 pb-14 sm:px-10">
              <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Breadcrumb extra={crumbs} />
                {tools}
              </div>
              <Outlet />
            </main>
          </div>
        </div>
        {paletteUsed && (
          <Suspense fallback={null}>
            <CommandPalette open={search} onOpenChange={setSearch} />
          </Suspense>
        )}
        <ScrollRestoration />
      </DocsCrumbs.Provider>
    </InDocs.Provider>
  );
}
