import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigationType, useParams, useSearchParams } from 'react-router';
import { SiteHeader } from '@/components/site-header';
import { PageShell } from '@/components/page-shell';
import { LibraryChips } from '@/components/library-chips';
import { DemoCard } from '@/components/demo-card';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { ScrollToTop } from '@/components/scroll-to-top';
import { demos, getLibrary, libraries, searchText } from '@/engine/registry';
import { STORAGE_KEYS, storage } from '@/lib/storage';
import { paths, type GalleryView } from '@/lib/paths';
import { RESPONSES, applyHead, isPromptPath } from '@/seo/routes';
import { cn } from '@/lib/utils';
import { NotFound } from '@/routes/not-found';

const LIBRARY_NAMES = libraries.map((l) => l.name);
const INTRO = `Every way a response can arrive, sorted into ${LIBRARY_NAMES.length} collections — ${LIBRARY_NAMES.slice(0, -1).join(', ')} and ${LIBRARY_NAMES.at(-1)}. Each collection is shown in its own theme. Switch between grid and list, filter by collection, and previews replay as they scroll into view.`;
const SEARCH_INDEX = new Map(demos.map((d) => [d.slug, searchText(d)]));
/** Typing settles for this long before ?q= is written to the URL (one history entry per pause, not per key). */
const URL_SYNC_DELAY = 300;
/** Cards rendered with the navigation itself: enough to fill a tall screen. The rest mount right after the first paint. */
const FIRST_BATCH = 12;
/** All: cards per infinite-scroll page (an even count, so the two-column grid ends on a full row). */
const PAGE = 24;

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
  const { pathname, key: locationKey } = useLocation();
  useEffect(() => {
    if (librarySlug && !library) return;
    applyHead({
      title: library ? `${library.name} · Streaming UI` : RESPONSES.title,
      description: library
        ? `${library.count} streaming responses in the ${library.name} collection, each playing live in its own theme.`
        : RESPONSES.description,
      path: library ? `/responses/library/${library.slug}` : '/responses',
      robots: isPromptPath(pathname) ? 'noindex, follow' : 'index, follow',
    });
  }, [library, librarySlug, pathname]);

  const visible = useMemo(
    () =>
      demos.filter(
        (d) => (!library || d.library.slug === library.slug) && (!deferredQuery || SEARCH_INDEX.get(d.slug)!.includes(deferredQuery)),
      ),
    [library, deferredQuery],
  );

  // All (no collection): infinite scroll, PAGE cards at a time, the next page mounting as the end comes near.
  // A collection is short: its first screenful renders with the navigation (router navigations render in a
  // transition, so the previous page would otherwise stay up until every card has rendered), the rest right after.
  // Back/forward renders everything at once so ScrollRestoration has the full height.
  const paged = !library;
  const navigationType = useNavigationType();
  // A first visit is a POP too (key 'default'): only a return through history, with a scroll to restore, takes them all.
  const restoring = navigationType === 'POP' && locationKey !== 'default';
  const [limit, setLimit] = useState(restoring ? Infinity : paged ? PAGE : FIRST_BATCH);
  // A new filter starts over from the first page (not on mount: that is the state above).
  const filter = `${librarySlug ?? ''}|${deferredQuery}`;
  const lastFilter = useRef(filter);
  useEffect(() => {
    if (filter === lastFilter.current) return;
    lastFilter.current = filter;
    setLimit(paged ? PAGE : FIRST_BATCH);
  }, [filter, paged]);
  // A timer, not requestAnimationFrame: rAF never fires in a background tab, which would strand the list at the first batch.
  useEffect(() => {
    if (paged || limit === Infinity) return;
    const id = setTimeout(() => startTransition(() => setLimit(Infinity)), 50);
    return () => clearTimeout(id);
  }, [limit, paged]);
  const shown = limit < visible.length ? visible.slice(0, limit) : visible;
  const more = shown.length < visible.length;
  // The sentinel under the grid asks for the next page well before it scrolls into view. Re-observed after each
  // page, so a sentinel still in range (a fast scroll, a tall screen) asks again instead of waiting for a change.
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!paged || !more || !el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && startTransition(() => setLimit((l) => l + PAGE)), { rootMargin: '0px 0px 1600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [paged, more, shown.length]);

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

      {/* Near-opaque, no blur: the nav above already frosts, and a second backdrop-filter over 249 live demos is
          re-blurred on every scroll frame. */}
      <div className="sticky top-14 z-30 lg:top-0 -mx-6 mt-8 flex flex-col gap-3 border-b border-separator-border bg-background-full/95 px-6 py-3 sm:-mx-10 sm:px-10">
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

      {/* Infinite scroll's end of list: the trigger for the next page, and where the reader is in the 249. */}
      {paged && visible.length > 0 && (
        <div ref={sentinel} className="flex items-center justify-center gap-2 py-12 text-body-2-medium text-text-tertiary tabular-nums" aria-live="polite">
          {more && <Icon name="loader-4-line" className="size-4 animate-spin motion-reduce:animate-none" />}
          {more ? `${shown.length} of ${visible.length}` : `All ${visible.length} responses`}
        </div>
      )}

      <ScrollToTop />
      <Outlet />
    </PageShell>
  );
}
