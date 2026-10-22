import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useNavigationType, useParams, useSearchParams } from 'react-router';
import { SiteHeader } from '@/components/site-header';
import { PageShell } from '@/components/page-shell';
import { LibraryChips } from '@/components/library-chips';
import { DemoCard } from '@/components/demo-card';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { demos, getLibrary, libraries, searchText } from '@/engine/registry';
import { STORAGE_KEYS, storage } from '@/lib/storage';
import { paths, type GalleryView } from '@/lib/paths';
import { cn } from '@/lib/utils';
import { NotFound } from '@/routes/not-found';

const LIBRARY_NAMES = libraries.map((l) => l.name);
const INTRO = `Every way a response can arrive, sorted into ${LIBRARY_NAMES.length} collections — ${LIBRARY_NAMES.slice(0, -1).join(', ')} and ${LIBRARY_NAMES.at(-1)}. Each collection is shown in its own theme. Switch between grid and list, filter by collection, and previews replay as they scroll into view.`;
const SEARCH_INDEX = new Map(demos.map((d) => [d.slug, searchText(d)]));
/** Typing settles for this long before ?q= is written to the URL (one history entry per pause, not per key). */
const URL_SYNC_DELAY = 300;
/** Cards rendered with the navigation itself: enough to fill a tall screen. The rest mount right after the first paint. */
const FIRST_BATCH = 12;

/**
 * `/responses` and `/responses/library/:library`. The library lives in the path; search (?q=) and layout (?view=)
 * live in the query string so every state is a shareable URL. The Prompt dialog is a child route
 * rendered through <Outlet />, so opening it never remounts the gallery or restarts the previews.
 */
export function GalleryPage() {
  const { library: librarySlug } = useParams();
  const [params, setParams] = useSearchParams();
  const library = getLibrary(librarySlug);
  const query = params.get('q') ?? '';
  // The field is driven by local state so every keystroke lands immediately; the URL follows after a pause.
  // Filtering reads a deferred copy, so React renders the card list at lower priority than the input.
  const [input, setInput] = useState(query);
  const synced = useRef(query);
  useEffect(() => {
    // ?q= changed from outside (back/forward, Clear filters, a shared link): mirror it in the field.
    if (query !== synced.current) {
      synced.current = query;
      setInput(query);
    }
  }, [query]);
  useEffect(() => {
    if (input === synced.current) return;
    const id = setTimeout(() => {
      synced.current = input;
      setParam('q', input || null);
    }, URL_SYNC_DELAY);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setParam is recreated each render; only the text matters
  }, [input]);
  const deferredQuery = useDeferredValue(input.trim().toLowerCase());
  const view: GalleryView = (params.get('view') ?? storage.get(STORAGE_KEYS.view, 'grid')) === 'list' ? 'list' : 'grid';

  useEffect(() => storage.set(STORAGE_KEYS.view, view), [view]);
  useEffect(() => {
    document.title = library ? `${library.name} · Streaming UI` : 'Responses · Streaming UI';
  }, [library]);

  const visible = useMemo(
    () =>
      demos.filter(
        (d) => (!library || d.library.slug === library.slug) && (!deferredQuery || SEARCH_INDEX.get(d.slug)!.includes(deferredQuery)),
      ),
    [library, deferredQuery],
  );

  // Router navigations render in a transition, so the previous page stays on screen until all 227 cards have
  // rendered (most of a second in dev). Render the first screenful with the navigation, then the rest in the
  // background once it has painted. Back/forward renders everything at once so ScrollRestoration has the full height.
  const navigationType = useNavigationType();
  const [limit, setLimit] = useState(navigationType === 'POP' ? Infinity : FIRST_BATCH);
  // A timer, not requestAnimationFrame: rAF never fires in a background tab, which would strand the list at the first batch.
  useEffect(() => {
    if (limit === Infinity) return;
    const id = setTimeout(() => startTransition(() => setLimit(Infinity)), 50);
    return () => clearTimeout(id);
  }, [limit]);
  const shown = limit < visible.length ? visible.slice(0, limit) : visible;

  const setParam = (key: string, value: string | null) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );

  if (librarySlug && !library) return <NotFound />;

  const grid = view === 'grid';
  return (
    <PageShell width={grid ? 'wide' : 'narrow'}>
      <SiteHeader crumbs={library ? [{ label: library.name }] : []}>
        <div className="flex flex-col gap-2">
          <h1 className="text-title-1-semibold text-text-primary">{library ? library.name : 'Streaming Responses'}</h1>
          <p className="text-body-regular text-text-secondary">
            {library ? `${library.count} streaming responses in the ${library.name} collection, each shown in the collection's own theme.` : INTRO}
          </p>
        </div>
      </SiteHeader>

      <div className="sticky top-14 z-30 -mx-6 mt-8 flex flex-col gap-3 border-b border-separator-border bg-background-full/85 px-6 py-3 backdrop-blur-md sm:-mx-10 sm:px-10">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative flex h-9 min-w-0 basis-full items-center gap-2 rounded-full bg-background-tertiary-default px-3 sm:max-w-[320px] sm:flex-1 sm:basis-auto">
            <Icon name="search-line" className="size-[18px] text-foreground-icon-secondary" />
            <Input
              type="search"
              placeholder="Search responses"
              autoComplete="off"
              aria-label="Search responses"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </label>
          <span className="text-body-2-medium tabular-nums text-text-tertiary" aria-live="polite">
            {visible.length} {visible.length === 1 ? 'response' : 'responses'}
          </span>
          <ToggleGroup
            type="single"
            aria-label="Layout"
            className="ms-auto"
            value={view}
            onValueChange={(v) => v && setParam('view', v === 'grid' ? null : v)}
          >
            <ToggleGroupItem value="grid" aria-label="Grid">
              <Icon name="layout-grid-line" className="size-4" />
              Grid
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List">
              <Icon name="list-unordered" className="size-4" />
              List
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <LibraryChips active={library?.slug} />
      </div>

      {visible.length > 0 ? (
        <main className={cn('w-full min-w-0', grid ? 'grid grid-cols-1 gap-x-8 lg:grid-cols-2' : 'flex flex-col')}>
          {shown.map((d) => (
            <DemoCard key={d.slug} demo={d} compact={grid} library={library?.slug} />
          ))}
        </main>
      ) : (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-body-regular text-text-secondary">No response matches this filter.</p>
          <Button asChild className="px-3">
            <Link to={{ pathname: paths.gallery(), search: grid ? '' : '?view=list' }} preventScrollReset>
              Clear filters
            </Link>
          </Button>
        </div>
      )}

      <Outlet />
    </PageShell>
  );
}
