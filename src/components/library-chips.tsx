import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { Icon } from '@/components/icon';
import { demos, libraries } from '@/engine/registry';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';

const FADE = 48;
const REDUCE = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const behavior: ScrollBehavior = REDUCE ? 'auto' : 'smooth';

const chipCls = (active: boolean) =>
  cn(
    'inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-body-2-medium whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring',
    active
      ? 'border-transparent bg-text-primary text-background-primary-default'
      : 'border-border-button-default bg-background-primary-default text-text-secondary hover:bg-background-primary-hover',
  );

const arrowCls =
  'absolute top-1/2 z-10 size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border-button-default bg-background-primary-default text-foreground-icon-secondary shadow-xs transition-colors duration-150 hover:bg-background-primary-hover hover:text-foreground-icon-primary outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring';

/**
 * One chip per collection, each a route (/library/:library). On narrow screens the row scrolls:
 * arrows page through it and the edges fade where more chips hide.
 */
export function LibraryChips({ active }: { active?: string }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ prev: false, next: false });
  const { search } = useLocation();

  const update = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const max = row.scrollWidth - row.clientWidth;
    setEdges({ prev: row.scrollLeft > 2, next: row.scrollLeft < max - 2 });
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    // Vertical wheel scrolls the row sideways when it overflows.
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && row.scrollWidth > row.clientWidth) {
        e.preventDefault();
        row.scrollLeft += e.deltaY;
      }
    };
    row.addEventListener('scroll', update, { passive: true });
    row.addEventListener('wheel', onWheel, { passive: false });
    const ro = new ResizeObserver(update);
    ro.observe(row);
    update();
    return () => {
      row.removeEventListener('scroll', update);
      row.removeEventListener('wheel', onWheel);
      ro.disconnect();
    };
  }, [update]);

  // Keep the active chip in view (on load and after picking one near an edge).
  useEffect(() => {
    const row = rowRef.current;
    const chip = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!row || !chip) return;
    const r = chip.getBoundingClientRect();
    const c = row.getBoundingClientRect();
    if (r.left < c.left + FADE) row.scrollBy({ left: r.left - c.left - FADE, behavior });
    else if (r.right > c.right - FADE) row.scrollBy({ left: r.right - c.right + FADE, behavior });
  }, [active]);

  const page = (dir: number) => rowRef.current?.scrollBy({ left: dir * rowRef.current.clientWidth * 0.7, behavior });
  const mask =
    edges.prev || edges.next
      ? `linear-gradient(to right, ${edges.prev ? `transparent 0, #000 ${FADE}px` : '#000 0'}, ${edges.next ? `#000 calc(100% - ${FADE}px), transparent 100%` : '#000 100%'})`
      : undefined;

  const chips = [{ slug: '', name: 'All', count: demos.length }, ...libraries];

  return (
    <div className="relative -mx-1 min-w-0">
      <button type="button" aria-label="Show previous collections" onClick={() => page(-1)} className={cn(arrowCls, 'start-1', edges.prev ? 'flex' : 'hidden')}>
        <Icon name="arrow-left-s-line" className="size-5" />
      </button>
      <nav
        ref={rowRef}
        aria-label="Collections"
        className="scrollbar-none flex min-w-0 items-center gap-1.5 overflow-x-auto scroll-smooth px-1 py-px"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        {chips.map((lib) => {
          const on = (active ?? '') === lib.slug;
          return (
            <NavLink
              key={lib.slug || 'all'}
              to={{ pathname: paths.gallery(lib.slug || undefined), search }}
              preventScrollReset
              aria-current={on ? 'page' : undefined}
              className={chipCls(on)}
            >
              {lib.name}
              <span className="text-caption-1-regular tabular-nums opacity-60">{lib.count}</span>
            </NavLink>
          );
        })}
      </nav>
      <button type="button" aria-label="Show more collections" onClick={() => page(1)} className={cn(arrowCls, 'end-1', edges.next ? 'flex' : 'hidden')}>
        <Icon name="arrow-right-s-line" className="size-5" />
      </button>
    </div>
  );
}
