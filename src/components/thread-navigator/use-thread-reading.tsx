import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

/* Scroll adapter for ThreadNavigator. It does not know which model wrote the thread.
 * A turn stays active while its marker is the last one that has crossed the reading line.
 * New tokens move the scroll only when the reader is already at the end. `navigate` drops
 * that pin in the same turn, before the next paint, so a stream cannot pull them back. */

const ANCHOR = 36;
/* Only a real rest at the end counts. A jump to the previous question can stop
 * a few dozen pixels short, and a wide slack would pin the stream again. */
const BOTTOM_SLACK = 32;

export function threadTurnSelector(id: string) {
  return `[data-thread-turn="${CSS.escape(id)}"]`;
}

/** Marks the element `navigate` and the scroll spy look up. One per user turn. */
export function ThreadTurn({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <div data-thread-turn={id} data-message-id={id} className={className}>
      {children}
    </div>
  );
}

/** Last turn whose question has crossed the reading line, or the first one on screen.
 *  The measured node is the user message, so the answer sits below it. At the end of
 *  the thread the line is the bottom edge: the question on screen wins, including the
 *  one still streaming. Elsewhere the line sits just under the top, so a question
 *  peeking in at the bottom does not steal the passage being read. */
export function visibleTurnId(root: HTMLElement, ids: readonly string[], atEnd = false) {
  if (!ids.length) return undefined;
  const rootRect = root.getBoundingClientRect();
  const line = atEnd ? rootRect.bottom : rootRect.top + ANCHOR;
  let current: string | undefined;
  let firstOnScreen: string | undefined;
  const rootTop = rootRect.top;
  const rootBottom = rootRect.bottom;
  for (const id of ids) {
    const node = root.querySelector<HTMLElement>(threadTurnSelector(id));
    if (!node) continue;
    const rect = node.getBoundingClientRect();
    if (!firstOnScreen && rect.bottom > rootTop && rect.top < rootBottom) firstOnScreen = id;
    if (rect.top <= line + 0.5) current = id;
    else break;
  }
  return current ?? firstOnScreen ?? ids[0];
}

export function useThreadReading(dep: unknown, ids: readonly string[]) {
  const ref = useRef<HTMLDivElement>(null);
  const idsRef = useRef(ids);
  idsRef.current = ids;
  const idKey = ids.join('\0');
  const pin = useRef<'follow' | 'free'>('follow');
  const frame = useRef(0);
  const settling = useRef(false);
  const settleToken = useRef(0);
  const settleTimer = useRef(0);
  const [activeId, setActiveId] = useState<string | undefined>(ids[0]);
  const [following, setFollowing] = useState(true);

  const publish = useCallback((el: HTMLElement) => {
    const atEnd = el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_SLACK;
    const next = visibleTurnId(el, idsRef.current, atEnd);
    if (!next) return;
    setActiveId((cur) => (cur === next ? cur : next));
  }, []);

  const setPin = useCallback((follow: boolean) => {
    pin.current = follow ? 'follow' : 'free';
    setFollowing((cur) => (cur === follow ? cur : follow));
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (pin.current === 'follow') el.scrollTop = el.scrollHeight;
    if (!settling.current) publish(el);
  }, [dep, idKey, publish]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        if (settling.current) return;
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_SLACK;
        setPin(atBottom);
        publish(el);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(() => {
      if (!settling.current) publish(el);
    });
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      window.clearTimeout(settleTimer.current);
    };
  }, [idKey, publish, setPin]);

  const navigate = useCallback(
    (id: string) => {
      const el = ref.current;
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      const token = ++settleToken.current;
      settling.current = true;
      setPin(false);
      setActiveId(id);
      const finish = () => {
        if (settleToken.current !== token) return;
        settleToken.current += 1;
        settling.current = false;
        window.clearTimeout(settleTimer.current);
        const node = ref.current;
        if (!node) return;
        const atBottom = node.scrollHeight - node.scrollTop - node.clientHeight < BOTTOM_SLACK;
        setPin(atBottom);
        publish(node);
      };
      if (!el) {
        settling.current = false;
        return;
      }
      const target = el.querySelector<HTMLElement>(threadTurnSelector(id));
      if (!target) {
        settling.current = false;
        return;
      }
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const top = target.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - 16;
      el.addEventListener('scrollend', finish, { once: true });
      window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(finish, reduce ? 60 : 1200);
      el.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
    },
    [publish, setPin],
  );

  return { ref: ref as RefObject<HTMLDivElement>, activeId, navigate, following };
}
