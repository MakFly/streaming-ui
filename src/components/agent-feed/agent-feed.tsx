import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Globe, Link2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentFeedAgent, AgentFeedItem, AgentFeedLabels, AgentFeedSource } from './types';

/* A rolling window on what a group of agents is doing: the last `max` items show, a new one blurs in below,
 * the others slide up into place (FLIP) and the oldest leaves upward. The window empties once the run stops,
 * so the header can fold it into "Thought for Ns". The engine is generic over the item type; rows are yours,
 * or AgentFeedRow for the default look. */

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function AgentFeed<T extends { id: string }>({
  items,
  renderItem,
  running = true,
  max = 3,
  enterClassName = 'tpl-feed-in',
  exitClassName = 'tpl-feed-out',
  exitMs = 420,
  moveMs = 380,
  easing = EASE,
  className,
}: {
  items: readonly T[];
  renderItem: (item: T) => ReactNode;
  /** While false the window is empty: every visible row leaves. */
  running?: boolean;
  /** Rows on screen at once. */
  max?: number;
  /** Class a row mounts with, and the one its leaving copy plays before it unmounts after `exitMs`. */
  enterClassName?: string;
  exitClassName?: string;
  exitMs?: number;
  /** Duration of the slide up and of the height change. */
  moveMs?: number;
  easing?: string;
  className?: string;
}) {
  const visible = running ? items.slice(-max) : [];
  const [leaving, setLeaving] = useState<T[]>([]);
  const prev = useRef<readonly T[]>([]);
  const nodes = useRef(new Map<string, HTMLDivElement>());
  const tops = useRef(new Map<string, number>());
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const ids = new Set(visible.map((v) => v.id));
    const gone = prev.current.filter((p) => !ids.has(p.id));
    prev.current = visible;
    if (gone.length) {
      setLeaving((l) => [...l, ...gone]);
      setTimeout(() => setLeaving((l) => l.filter((x) => !gone.includes(x))), exitMs);
    }
    const still = reducedMotion();
    for (const [id, el] of nodes.current) {
      const top = el.offsetTop;
      const was = tops.current.get(id);
      if (!still && was !== undefined && was !== top) el.animate([{ transform: `translateY(${was - top}px)` }, { transform: 'none' }], { duration: moveMs, easing });
      tops.current.set(id, top);
    }
  });

  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={cn('relative transition-[height] motion-reduce:transition-none', className)} style={{ height, transitionDuration: `${moveMs}ms`, transitionTimingFunction: easing }}>
      <div ref={inner} className={cn('relative flex flex-col gap-[3px]', visible.length > 0 && 'pt-[4px]')}>
        {leaving.map((it) => (
          <div key={`out-${it.id}`} aria-hidden="true" className={cn('pointer-events-none absolute inset-x-0 top-[4px]', exitClassName)}>
            {renderItem(it)}
          </div>
        ))}
        {visible.map((it) => (
          <div
            key={it.id}
            ref={(el) => {
              if (el) nodes.current.set(it.id, el);
              else {
                nodes.current.delete(it.id);
                tops.current.delete(it.id);
              }
            }}
          >
            <div className={enterClassName}>{renderItem(it)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Whole seconds since `started` (at least 1), ticking while `running`. */
export function useElapsed(started: number, running: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [running]);
  return Math.max(1, Math.floor((now - started) / 1000));
}

/* ---------- Default look ---------- */

const LABELS: AgentFeedLabels = {
  searching: 'Searching the web',
  searched: 'Searched the web',
  visited: 'Visited',
  results: (n) => `${n} result${n === 1 ? '' : 's'}`,
};

export function SourceIcon({ source, size = 16 }: { source: AgentFeedSource; size?: number }) {
  if (source.icon) return <img src={source.icon} alt="" width={size} height={size} className="shrink-0 rounded-full" />;
  return (
    <span className="grid shrink-0 place-items-center rounded-full leading-none font-semibold text-white" style={{ width: size, height: size, background: source.color ?? '#6b7280', fontSize: size * 0.55 }}>
      {source.name.charAt(0).toUpperCase()}
    </span>
  );
}

/** Overlapping source icons, each ringed in the page color so the overlap reads. */
export function SourceStack({ sources, className }: { sources: AgentFeedSource[]; className?: string }) {
  return (
    <span className={cn('flex', className)} title={sources.map((s) => s.name).join(', ')}>
      {sources.map((s, i) => (
        <span key={i} className="grid size-[18px] place-items-center rounded-full bg-background-tertiary-default ring-1 ring-background-primary-default" style={{ marginInlineStart: i ? -10 : 0 }}>
          <SourceIcon source={s} />
        </span>
      ))}
    </span>
  );
}

/**
 * The default row: searches and visits as a two-line tool row, status lines as plain text, messages as a named
 * bubble. `full` lifts the two-line clamp on messages, for a log that lists the whole run.
 */
export function AgentFeedRow({ item, agents, full, labels }: { item: AgentFeedItem; agents: readonly AgentFeedAgent[]; full?: boolean; labels?: Partial<AgentFeedLabels> }) {
  const l = { ...LABELS, ...labels };
  if (item.kind === 'search' || item.kind === 'visit') {
    const pending = item.kind === 'search' && !full && item.pending;
    const Glyph = item.kind === 'search' ? Search : Link2;
    return (
      <div className="flex items-center gap-2.5 py-[3px] ps-0.5">
        <Glyph className={cn('size-4 shrink-0 text-foreground-icon-tertiary', pending && 'animate-pulse')} strokeWidth={2} />
        <div className={cn('min-w-0 flex-1', pending && 'animate-pulse')}>
          <div className="truncate text-caption-1-regular text-text-tertiary">{item.kind === 'visit' ? l.visited : pending ? l.searching : l.searched}</div>
          <div className="truncate font-mono text-caption-1-regular text-text-primary">{item.kind === 'search' ? item.query : item.url}</div>
        </div>
        {item.kind === 'search' && (
          <span className={cn('flex shrink-0 items-center gap-2 text-body-2-regular text-text-tertiary tabular-nums transition-opacity duration-150', pending && 'opacity-0')}>
            {item.results !== undefined && <span className="max-sm:hidden">{l.results(item.results)}</span>}
            {!pending && item.sources && item.sources.length > 0 && <SourceStack sources={item.sources} />}
          </span>
        )}
      </div>
    );
  }
  if (item.kind === 'status') return <p className="py-0.5 text-body-regular text-text-secondary">{item.text}</p>;
  const a = agents.find((x) => x.id === item.agent);
  return (
    <div className="flex gap-2.5 py-[3px] ps-0.5">
      <div className="size-4 shrink-0 pt-0.5">{a?.avatar ?? <Globe className="size-4 text-foreground-icon-tertiary" />}</div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-caption-1-medium text-text-secondary">
          {a?.name ?? item.agent}
          {a?.role && <span className="ms-1.5 font-normal text-text-tertiary">{a.role}</span>}
        </div>
        <div className="rounded-[4px_16px_16px_16px] bg-background-secondary-default px-2.5 py-[7px]">
          <p className={cn('text-body-2-regular whitespace-pre-line text-text-primary', !full && 'line-clamp-2')}>{item.text}</p>
        </div>
      </div>
    </div>
  );
}

/** Avatars overlapping left to right; each one springs in as it joins. The first sits on top. */
export function AgentStack({ agents, size = 22, overlap = 10, className }: { agents: readonly AgentFeedAgent[]; size?: number; overlap?: number; className?: string }) {
  const step = size - overlap;
  return (
    <span className={cn('relative flex shrink-0 transition-[width] duration-300', className)} style={{ width: size + Math.max(0, agents.length - 1) * step, height: size }}>
      {agents.map((a, i) => (
        <span key={a.id} title={a.name} className="tpl-spring absolute top-0 grid place-items-center overflow-hidden rounded-full bg-background-primary-default" style={{ left: i * step, width: size, height: size, zIndex: agents.length - i }}>
          {a.avatar}
        </span>
      ))}
    </span>
  );
}

/** 3x3 dots waving while the agents are being called. */
function DotsLoader() {
  const xs = [5.6, 12, 18.4];
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[22px] text-text-primary" fill="currentColor">
      {xs.flatMap((y, r) => xs.map((x, c) => <circle key={`${r}${c}`} cx={x} cy={y} r={1.6} className="tpl-dot" style={{ animationDelay: `${(r + c) * 150}ms` }} />))}
    </svg>
  );
}

/**
 * The line above the feed. Running: the dot loader until the first agent joins, then their stack, a label and a
 * live timer. Done: "Thought for Ns", a button when `onOpen` is given (to open the full log).
 */
export function AgentFeedHeader({
  agents,
  running,
  started,
  seconds,
  onOpen,
  label = 'Agents are thinking',
  doneLabel = (s) => `Thought for ${s}s`,
  className,
}: {
  /** Agents that have joined so far, in order. */
  agents: readonly AgentFeedAgent[];
  running: boolean;
  /** Epoch ms the run began, for the live timer. */
  started: number;
  /** Final duration once done; the live count otherwise. */
  seconds?: number;
  onOpen?: () => void;
  label?: string;
  doneLabel?: (seconds: number) => string;
  className?: string;
}) {
  const secs = useElapsed(started, running);
  const body = running ? (
    <>
      {agents.length ? <AgentStack agents={agents} /> : <DotsLoader />}
      <span>{label}</span>
      <span aria-hidden="true">•</span>
      <span className="tabular-nums">{secs}s</span>
    </>
  ) : (
    <span>{doneLabel(seconds ?? secs)}</span>
  );
  const cls = cn('flex h-[23px] items-center gap-1.5 text-body-regular text-text-secondary', className);
  return !running && onOpen ? (
    <button type="button" onClick={onOpen} className={cn(cls, 'cursor-pointer rounded-md transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:outline-none')}>
      {body}
    </button>
  ) : (
    <div className={cls} role="status">
      {body}
    </div>
  );
}
