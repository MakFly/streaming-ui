import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/* A chat-shaped skeleton laid over a template iframe until the template has really rendered: the iframe's own
 * `load` fires before a lazy route paints, so readiness is checked inside the (same-origin) document — a chat
 * field on screen — with a time limit so the skeleton never sticks. */

const READY = 'textarea, input[aria-label="Message"], [contenteditable="true"]';

/** Wire `onLoad` to the iframe; `ready` turns true once the template is on screen. `key` restarts it. */
export function useFrameReady(key: unknown) {
  const [ready, setReady] = useState(false);
  const timer = useRef<number | null>(null);
  const clear = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => {
    setReady(false);
    return clear;
  }, [key]);
  const onLoad = useCallback((e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const frame = e.currentTarget;
    const started = Date.now();
    clear();
    timer.current = window.setInterval(() => {
      let found = false;
      try {
        const el = frame.contentDocument?.querySelector<HTMLElement>(READY);
        found = !!el && el.getBoundingClientRect().height > 0;
      } catch {
        found = true; // cross-origin: trust the load event
      }
      if (found || Date.now() - started > 4000) {
        clear();
        setReady(true);
      }
    }, 80);
  }, []);
  return { ready, onLoad };
}

const bar = 'sui-skeleton rounded-md bg-background-tertiary-default';

/** Fills its positioned parent; fades out when `ready`. Proportional, so it fits a thumbnail or a full frame. */
export function PreviewSkeleton({ ready, sidebar = true, className }: { ready: boolean; sidebar?: boolean; className?: string }) {
  return (
    <div
      aria-hidden={ready}
      role={ready ? undefined : 'status'}
      aria-label={ready ? undefined : 'Loading preview'}
      className={cn('pointer-events-none absolute inset-0 flex gap-[1.2%] bg-background-full p-[1.2%] transition-opacity duration-300 ease-out', ready ? 'opacity-0' : 'opacity-100', className)}
    >
      {sidebar && (
        <div className="hidden w-[19%] flex-col gap-[6%] rounded-[2.2cqw] bg-background-secondary-default p-[1.4%] @[480px]:flex">
          <div className="flex items-center gap-[8%]">
            <span className={cn(bar, 'aspect-square w-[14%] rounded-lg')} />
            <span className={cn(bar, 'h-[1.1cqw] w-[40%]')} />
          </div>
          <div className="flex flex-col gap-[0.9cqw]">
            {[70, 55, 82, 48, 64, 58, 76].map((w, i) => (
              <span key={i} className={cn(bar, 'h-[0.9cqw]')} style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col rounded-[2.2cqw] bg-background-secondary-default">
        <div className="flex items-center gap-[2%] border-b border-separator-border px-[2.5%] py-[1.6%]">
          <span className={cn(bar, 'h-[1.1cqw] w-[28%]')} />
          <span className={cn(bar, 'ms-auto h-[1.6cqw] w-[7%] rounded-full')} />
        </div>
        <div className="mx-auto flex w-[72%] flex-1 flex-col justify-end gap-[2.4cqw] py-[3%]">
          <span className={cn(bar, 'h-[3cqw] w-[38%] self-end rounded-[1.4cqw]')} />
          <div className="flex flex-col gap-[0.9cqw]">
            {[92, 86, 95, 60].map((w, i) => (
              <span key={i} className={cn(bar, 'h-[0.9cqw]')} style={{ width: `${w}%` }} />
            ))}
          </div>
          <span className={cn(bar, 'h-[9cqw] w-full rounded-[1.2cqw]')} />
          <span className="h-[4.2cqw] w-full rounded-full border border-border-button-default bg-background-primary-default" />
        </div>
      </div>
    </div>
  );
}
