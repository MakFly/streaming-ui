import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type FocusEvent as ReactFocusEvent, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ThreadNavigatorItem, ThreadNavigatorProps } from './types';

/* Discreet rail of one tick per user turn. The visible turn is the long tick.
 * Hover or focus opens a preview in a portal, kept inside the visual viewport.
 * The pointer can cross from the tick to the card: a bridge covers that gap,
 * and a short close delay covers the frame before the portal mounts. */

const GAP = 10;
const MARGIN = 8;
const MAX_W = 320;
const CLOSE_MS = 90;

type Frame = { top: number; left: number; width: number; height: number };

function viewport() {
  const vv = window.visualViewport;
  return {
    x: vv?.offsetLeft ?? 0,
    y: vv?.offsetTop ?? 0,
    w: vv?.width ?? document.documentElement.clientWidth,
    h: vv?.height ?? window.innerHeight,
  };
}

function placeCard(anchor: DOMRect, cardW: number, cardH: number): Frame {
  const box = viewport();
  const minL = box.x + MARGIN;
  const minT = box.y + MARGIN;
  const maxR = box.x + box.w - MARGIN;
  const maxB = box.y + box.h - MARGIN;
  const preferRight = anchor.left + anchor.width / 2 < box.x + box.w / 2;
  let left = preferRight ? anchor.right + GAP : anchor.left - GAP - cardW;
  const fits = (value: number) => value >= minL && value + cardW <= maxR;
  if (!fits(left)) {
    const flipped = preferRight ? anchor.left - GAP - cardW : anchor.right + GAP;
    if (fits(flipped)) left = flipped;
  }
  left = Math.max(minL, Math.min(left, Math.max(minL, maxR - cardW)));
  let top = anchor.top + anchor.height / 2 - cardH / 2;
  top = Math.max(minT, Math.min(top, Math.max(minT, maxB - cardH)));
  return { top, left, width: cardW, height: cardH };
}

/** Gap between the tick and the card, including the card's box, excluding almost all of the tick. */
function bridgeBetween(anchor: DOMRect, card: Frame): Frame {
  const cardRight = card.left + card.width;
  const cardBottom = card.top + card.height;
  const anchorOnLeft = anchor.right <= card.left + 1;
  const left = anchorOnLeft ? anchor.right - 2 : card.left;
  const right = anchorOnLeft ? cardRight : anchor.left + 2;
  const top = Math.min(anchor.top, card.top);
  const bottom = Math.max(anchor.bottom, cardBottom);
  return { top, left, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
}

function near(a: Frame, b: Frame) {
  return Math.abs(a.top - b.top) < 0.5 && Math.abs(a.left - b.left) < 0.5 && Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5;
}

function slidUnder(e: ReactPointerEvent, point: { x: number; y: number; seen: boolean }) {
  return point.seen && e.clientX === point.x && e.clientY === point.y;
}

export function ThreadNavigator({ items, activeId, onNavigate, bookmarks, onBookmark, className, label = 'Turns' }: ThreadNavigatorProps) {
  const uid = useId();
  const previewDomId = `${uid}-preview`;
  const navRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const markers = useRef(new Map<string, HTMLButtonElement>());
  const closeTimer = useRef<number | undefined>(undefined);
  const point = useRef({ x: 0, y: 0, seen: false });
  const pointerKind = useRef('mouse');
  const itemsRef = useRef(items);
  const previewIdRef = useRef<string | null>(null);
  const openPreviewRef = useRef<(id: string) => void>(() => {});
  itemsRef.current = items;

  const [previewId, setPreviewId] = useState<string | null>(null);
  const [box, setBox] = useState<{ card: Frame; bridge: Frame } | null>(null);
  previewIdRef.current = previewId;

  const openItem = previewId ? items.find((item) => item.id === previewId) : undefined;
  const tabId = previewId && items.some((item) => item.id === previewId) ? previewId : (activeId ?? items[0]?.id);

  const clearClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
  };
  const openPreview = (id: string) => {
    clearClose();
    setPreviewId(id);
  };
  openPreviewRef.current = openPreview;
  const scheduleClose = () => {
    clearClose();
    closeTimer.current = window.setTimeout(() => setPreviewId(null), CLOSE_MS);
  };

  useEffect(() => () => clearClose(), []);

  useEffect(() => {
    if (previewId && !items.some((item) => item.id === previewId)) setPreviewId(null);
  }, [items, previewId]);

  useLayoutEffect(() => {
    if (!previewId) return;
    const card = cardRef.current;
    if (!card) return;
    let frame = 0;
    const update = () => {
      const anchor = markers.current.get(previewId);
      const node = cardRef.current;
      if (!anchor || !node) return;
      const view = viewport();
      const width = Math.min(MAX_W, Math.max(0, view.w - MARGIN * 2));
      node.style.width = `${width}px`;
      node.style.maxHeight = `${Math.max(120, view.h - MARGIN * 2)}px`;
      const cardBox = placeCard(anchor.getBoundingClientRect(), node.offsetWidth, node.offsetHeight);
      const bridge = bridgeBetween(anchor.getBoundingClientRect(), cardBox);
      setBox((cur) => (cur && near(cur.card, cardBox) && near(cur.bridge, bridge) ? cur : { card: cardBox, bridge }));
    };
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    update();
    const ro = new ResizeObserver(schedule);
    ro.observe(card);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', schedule);
    vv?.addEventListener('scroll', schedule);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
      vv?.removeEventListener('resize', schedule);
      vv?.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
    };
  }, [previewId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const node = e.target instanceof Node ? e.target : null;
      const inNav = !!node && !!navRef.current?.contains(node);
      const inPreview = !!node && !!layerRef.current?.contains(node);
      if (!inNav && !inPreview && e.key !== 'Escape') return;
      const list = itemsRef.current;
      if (!list.length) return;

      if (e.key === 'Escape') {
        if (!previewIdRef.current) return;
        const onBody = e.target === document.body || e.target === document.documentElement;
        if (!inNav && !inPreview && !onBody) return;
        e.preventDefault();
        if (inNav || inPreview) e.stopPropagation();
        const id = previewIdRef.current;
        setPreviewId(null);
        if (id && (inNav || inPreview)) markers.current.get(id)?.focus({ preventScroll: true });
        return;
      }

      if (!inNav && !inPreview) return;
      if (e.altKey || e.metaKey || e.ctrlKey) return;

      if (e.key === 'Tab' && previewIdRef.current) {
        const bookmark = layerRef.current?.querySelector<HTMLButtonElement>('[data-thread-bookmark]');
        const marker = markers.current.get(previewIdRef.current);
        if (!bookmark || !marker) return;
        if (!e.shiftKey && document.activeElement === marker) {
          e.preventDefault();
          bookmark.focus({ preventScroll: true });
        } else if (e.shiftKey && document.activeElement === bookmark) {
          e.preventDefault();
          marker.focus({ preventScroll: true });
        }
        return;
      }

      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();
      const focused = document.activeElement instanceof HTMLElement ? document.activeElement.closest<HTMLElement>('[data-turn-id]')?.dataset.turnId : undefined;
      const current = previewIdRef.current ?? focused;
      let index = list.findIndex((item) => item.id === current);
      if (e.key === 'Home') index = 0;
      else if (e.key === 'End') index = list.length - 1;
      else if (e.key === 'ArrowDown') index = Math.min(list.length - 1, index < 0 ? 0 : index + 1);
      else index = Math.max(0, index < 0 ? list.length - 1 : index - 1);
      const next = list[index];
      if (!next) return;
      openPreviewRef.current(next.id);
      markers.current.get(next.id)?.focus({ preventScroll: true });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (!items.length) return null;

  const remember = (e: ReactPointerEvent) => {
    if (e.clientX !== point.current.x || e.clientY !== point.current.y) point.current = { x: e.clientX, y: e.clientY, seen: true };
  };
  const inside = (node: EventTarget | null) => node instanceof Node && (!!navRef.current?.contains(node) || !!layerRef.current?.contains(node));
  const onLeave = (e: ReactPointerEvent) => {
    if (slidUnder(e, point.current)) return;
    if (inside(e.relatedTarget)) return;
    scheduleClose();
  };

  return (
    <nav
      ref={navRef}
      aria-label={label}
      data-thread-navigator=""
      onPointerMove={remember}
      onPointerLeave={onLeave}
      onBlur={(e) => {
        if (inside(e.relatedTarget)) return;
        scheduleClose();
      }}
      className={cn('flex h-full w-11 flex-col [container-type:size]', className)}
    >
      <ol className="m-0 flex h-full list-none flex-col justify-center p-0" style={{ '--marks': items.length } as CSSProperties}>
        {items.map((item) => {
          const active = item.id === activeId;
          const hot = item.id === previewId;
          // A tight stack of marks (12px apart) for a mouse; 44px targets on a touch screen. A long thread shrinks both to fit.
          return (
            <li key={item.id} className="flex h-[min(0.75rem,calc(100cqh/var(--marks)))] w-full shrink-0 [@media(pointer:coarse)]:h-[min(2.75rem,calc(100cqh/var(--marks)))]">
              <button
                type="button"
                ref={(node) => {
                  if (node) markers.current.set(item.id, node);
                  else markers.current.delete(item.id);
                }}
                data-turn-id={item.id}
                tabIndex={item.id === tabId ? 0 : -1}
                aria-current={active ? 'true' : undefined}
                aria-expanded={hot}
                aria-controls={hot ? previewDomId : undefined}
                className="group flex h-full w-full touch-manipulation items-center justify-start rounded-md ps-1.5 outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
                onPointerDown={(e) => {
                  pointerKind.current = e.pointerType;
                }}
                onPointerEnter={(e) => {
                  if (slidUnder(e, point.current)) return;
                  openPreview(item.id);
                }}
                onFocus={() => openPreview(item.id)}
                onClick={(e) => {
                  if (e.detail === 0 || pointerKind.current !== 'touch' || previewId === item.id) onNavigate(item.id);
                  else openPreview(item.id);
                }}
              >
                <span
                  aria-hidden
                  className={cn(
                    'block h-0.5 shrink-0 rounded-full transition-[width,background-color] duration-150 motion-reduce:transition-none',
                    active ? 'w-5 bg-text-primary' : hot ? 'w-3.5 bg-text-secondary' : 'w-2.5 bg-foreground-icon-secondary',
                  )}
                />
                <span className="sr-only">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {openItem &&
        createPortal(
          <PreviewLayer
            layerRef={layerRef}
            cardRef={cardRef}
            id={previewDomId}
            item={openItem}
            placed={box}
            bookmarked={!!bookmarks?.includes(openItem.id)}
            onBookmark={onBookmark}
            onNavigate={onNavigate}
            onEnter={clearClose}
            onLeave={onLeave}
            onBlur={(e) => {
              if (inside(e.relatedTarget)) return;
              scheduleClose();
            }}
          />,
          document.body,
        )}
    </nav>
  );
}

function PreviewLayer({
  layerRef,
  cardRef,
  id,
  item,
  placed,
  bookmarked,
  onBookmark,
  onNavigate,
  onEnter,
  onLeave,
  onBlur,
}: {
  layerRef: RefObject<HTMLDivElement | null>;
  cardRef: RefObject<HTMLDivElement | null>;
  id: string;
  item: ThreadNavigatorItem;
  placed: { card: Frame; bridge: Frame } | null;
  bookmarked: boolean;
  onBookmark?: (id: string) => void;
  onNavigate: (id: string) => void;
  onEnter: () => void;
  onLeave: (e: ReactPointerEvent) => void;
  onBlur: (e: ReactFocusEvent<HTMLDivElement>) => void;
}) {
  const card = placed?.card;
  const bridge = placed?.bridge;
  return (
    <div ref={layerRef} className="pointer-events-none fixed inset-0 z-50">
      {bridge && <div aria-hidden className="pointer-events-auto absolute" style={bridge} onPointerEnter={onEnter} onPointerLeave={onLeave} />}
      <div
        ref={cardRef}
        id={id}
        role="region"
        aria-label="Turn preview"
        inert={!placed}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        onBlur={onBlur}
        className="pointer-events-auto absolute overflow-y-auto overscroll-contain rounded-xl border border-border-button-default bg-dropdown-background p-3 text-text-primary shadow-dropdown"
        style={
          card
            ? { top: card.top, left: card.left, width: card.width, visibility: 'visible' }
            : { top: 0, left: 0, visibility: 'hidden' }
        }
      >
        <PreviewBody item={item} bookmarked={bookmarked} onBookmark={onBookmark} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

function PreviewBody({
  item,
  bookmarked,
  onBookmark,
  onNavigate,
}: {
  item: ThreadNavigatorItem;
  bookmarked: boolean;
  onBookmark?: (id: string) => void;
  onNavigate: (id: string) => void;
}) {
  const refs = item.references?.filter(Boolean) ?? [];
  return (
    <div className="relative">
      {onBookmark && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-thread-bookmark=""
          aria-pressed={bookmarked}
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          onClick={() => onBookmark(item.id)}
          className="absolute end-0 top-0 z-10 [@media(pointer:coarse)]:size-11"
        >
          <Bookmark className={cn('size-4', bookmarked && 'fill-current')} strokeWidth={1.75} />
        </Button>
      )}
      <button
        type="button"
        onClick={() => onNavigate(item.id)}
        className="block w-full cursor-pointer rounded-md text-start outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      >
        <span className={cn('flex flex-col gap-1.5', onBookmark && 'pe-9 [@media(pointer:coarse)]:pe-12')}>
          {refs.length > 0 && (
            <span className="flex max-h-12 flex-wrap gap-1 overflow-hidden">
              {refs.map((ref) => (
                <Badge key={ref} variant="neutral" className="max-w-full truncate font-medium tracking-normal normal-case text-caption-1-medium">
                  {ref}
                </Badge>
              ))}
            </span>
          )}
          <span className="line-clamp-2 text-body-medium break-words text-text-primary">{item.label}</span>
        </span>
        {item.preview && <span className="mt-1.5 line-clamp-4 text-body-2-regular break-words text-text-secondary">{item.preview}</span>}
      </button>
    </div>
  );
}

export type { ThreadNavigatorItem, ThreadNavigatorProps };
