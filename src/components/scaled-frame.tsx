import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { PreviewSkeleton, useFrameReady } from '@/components/preview-skeleton';

/* Each thumbnail is a whole app booting on the page's own main thread, so they start two at a time: a frame
 * near the viewport waits for a slot, holds it until its template is on screen (or a few seconds), then hands
 * it on. Ten frames booting together froze the page for seconds. */
const SLOTS = 2;
let busy = 0;
const waiting: (() => void)[] = [];
function acquire(start: () => void) {
  if (busy < SLOTS) {
    busy++;
    start();
  } else waiting.push(start);
  return () => {
    const i = waiting.indexOf(start);
    if (i >= 0) waiting.splice(i, 1);
  };
}
function release() {
  const next = waiting.shift();
  if (next) next();
  else busy = Math.max(0, busy - 1);
}

/**
 * An iframe rendered at a fixed virtual size (1440×900 by default) and scaled down to fit its
 * container's width, so a live template thumbnail lays out exactly like the full page.
 */
export function ScaledFrame({ src, title, width = 1440, height = 900, className, interactive = false }: { src: string; title: string; width?: number; height?: number; className?: string; interactive?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [started, setStarted] = useState(false);
  const { ready, onLoad } = useFrameReady(src);
  const holding = useRef(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  // Queue for a slot once the frame comes near the viewport.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let cancel: (() => void) | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        cancel = acquire(() => {
          holding.current = true;
          setStarted(true);
        });
      },
      { rootMargin: '300px 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancel?.();
      if (holding.current) {
        holding.current = false;
        release();
      }
    };
  }, [src]);

  // Hand the slot on once the template is up, or after a few seconds whatever happens.
  useEffect(() => {
    if (!started) return;
    const done = () => {
      if (!holding.current) return;
      holding.current = false;
      release();
    };
    if (ready) return done();
    const id = window.setTimeout(done, 5000);
    return () => window.clearTimeout(id);
  }, [started, ready]);

  return (
    <div ref={box} className={cn('@container relative w-full overflow-hidden', className)} style={{ aspectRatio: `${width} / ${height}` }}>
      {scale > 0 && started && (
        <iframe
          src={src}
          title={title}
          tabIndex={interactive ? 0 : -1}
          aria-hidden={interactive ? undefined : true}
          onLoad={onLoad}
          className={cn('absolute top-0 left-0 origin-top-left border-0', !interactive && 'pointer-events-none')}
          style={{ width, height, transform: `scale(${scale})` }}
        />
      )}
      <PreviewSkeleton ready={ready} />
    </div>
  );
}
