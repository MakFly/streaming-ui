import { useState } from 'react';
import { Popover } from 'radix-ui';
import { Icon } from './icon';
import { cn } from '@/lib/utils';

/* Agent Limits Card and the context ring that opens it, with the Composer Panel's
 * top rail. Class strings, colours (chart-1…8 per bucket) and the sample data follow the reference design. */

export type Bucket = { label: string; tokens: number; color: string };
export type Deferred = { label: string; tokens: number };
export type Group = { label: string; items: [string, number][] };
export type Limit = { label: string; resets: string; percent: number };

export interface AgentLimits {
  window: number;
  buckets: Bucket[];
  deferred: Deferred[];
  groups: Group[];
  plan: string;
  limits: Limit[];
}

/** The reference example: a 1M window at 82%. */
export const SAMPLE_LIMITS: AgentLimits = {
  window: 1_000_000,
  buckets: [
    { label: 'Messages', tokens: 520_000, color: 'var(--color-chart-6)' },
    { label: 'System tools', tokens: 96_000, color: 'var(--color-chart-5)' },
    { label: 'MCP tools', tokens: 68_000, color: 'var(--color-chart-3)' },
    { label: 'Skills', tokens: 54_000, color: 'var(--color-chart-8)' },
    { label: 'System prompt', tokens: 42_000, color: 'var(--color-chart-7)' },
    { label: 'Memory files', tokens: 24_000, color: 'var(--color-chart-4)' },
    { label: 'Custom agents', tokens: 16_000, color: 'var(--color-chart-1)' },
  ],
  deferred: [
    { label: 'MCP tools (deferred)', tokens: 69_900 },
    { label: 'System tools (deferred)', tokens: 16_100 },
  ],
  groups: [
    { label: 'MCP tools', items: [['browser', 54_200], ['figma', 41_800], ['vercel', 26_500], ['session', 15_400]] },
    { label: 'Memory files', items: [['MEMORY.md', 16_400], ['project-conventions.md', 7_600]] },
    { label: 'Custom agents', items: [['reviewer', 7_100], ['explorer', 5_200], ['planner', 3_700]] },
  ],
  plan: 'Max (5x)',
  limits: [
    { label: '5-hour limit', resets: 'Resets in 2 hr 46 min', percent: 38 },
    { label: 'Weekly · all models', resets: 'Resets Tue 3:00 PM', percent: 3 },
    { label: 'Weekly · Pro', resets: 'Resets Tue 3:00 PM', percent: 5 },
  ],
};

/** "820k", "69.9k", "1M" — the kit's token format. */
export const formatTokens = (n: number) => (n >= 1_000_000 ? `${+(n / 1_000_000).toFixed(1)}M` : `${+(n / 1000).toFixed(1)}k`);

const used = (l: AgentLimits) => l.buckets.reduce((a, b) => a + b.tokens, 0);
export const contextPercent = (l: AgentLimits) => Math.round((used(l) / l.window) * 100);

/** Height-and-fade disclosure, standing in for a motion `height: auto` reveal. */
function Reveal({ open, children, className }: { open: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('grid transition-[grid-template-rows,opacity] duration-300 ease-out', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0', className)}>
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

function GroupRow({ g }: { g: Group }) {
  const [open, setOpen] = useState(false);
  const total = g.items.reduce((a, [, n]) => a + n, 0);
  return (
    <div className="flex flex-col">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="-mx-2 flex cursor-pointer items-center gap-1.5 rounded-2lg px-2 py-[7px] text-start outline-none transition-colors duration-150 hover:bg-background-secondary-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring">
        <Icon name="arrow-right-s-line" className={cn('size-4 text-text-tertiary transition-transform duration-200 ease-out', open ? 'rotate-90' : 'rtl:rotate-180')} />
        <span className="min-w-0 flex-1 truncate text-body-regular text-text-secondary">{g.label}</span>
        <span className="text-body-regular text-text-tertiary tabular-nums">{formatTokens(total)}</span>
        <span className="w-14 text-end text-body-regular text-text-tertiary tabular-nums">{g.items.length}</span>
      </button>
      <Reveal open={open}>
        <div className="flex flex-col ps-[22px] pb-1">
          {g.items.map(([name, n]) => (
            <div key={name} className="flex items-center gap-2 py-1">
              <span className="min-w-0 flex-1 truncate text-body-2-regular text-text-secondary">{name}</span>
              <span className="text-body-2-regular text-text-tertiary tabular-nums">{formatTokens(n)}</span>
              <span className="w-14" />
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

/**
 * The agent budget widget: a context-window bar segmented by token bucket, used / max, then plan usage limits
 * with reset times. Expanding the context window reveals the per-bucket breakdown, free space, deferred buckets
 * and collapsible member lists.
 */
export function AgentLimitsCard({ limits = SAMPLE_LIMITS, defaultOpen = false, className }: { limits?: AgentLimits; defaultOpen?: boolean; className?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  const total = used(limits);
  const free = limits.window - total;
  const pct = (n: number) => `${((n / limits.window) * 100).toFixed(1)}%`;
  return (
    <section className={cn('flex w-full min-w-0 flex-col rounded-2xl bg-background-secondary-default px-4 pt-2.5 pb-4', className)}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="group -mx-2 flex cursor-pointer items-center justify-between gap-3 rounded-2lg px-2 py-1 text-start outline-none transition-colors duration-150 hover:bg-background-secondary-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring">
        <span className="text-body-medium text-text-secondary">Context window</span>
        <span className="flex items-center gap-2">
          <span className="text-body-medium whitespace-nowrap text-text-secondary tabular-nums">
            {formatTokens(total)} / {formatTokens(limits.window)} <span className="text-text-primary">({contextPercent(limits)}%)</span>
          </span>
          <Icon name="arrow-down-s-line" className={cn('size-4 text-text-tertiary transition-transform duration-200 ease-out group-hover:text-text-secondary', open && 'rotate-180')} />
        </span>
      </button>
      <div className="mt-1.5 flex h-1.5 w-full gap-px overflow-hidden rounded-full bg-chart-track">
        {limits.buckets.map((b) => (
          <div key={b.label} title={`${b.label} · ${formatTokens(b.tokens)}`} className="h-full shrink-0 transition-[width] duration-500 ease-out" style={{ width: `${(b.tokens / limits.window) * 100}%`, backgroundColor: b.color }} />
        ))}
      </div>
      {/* The padding sits inside the clipping box, so the rows' -mx-2 hover keeps its rounded corners. */}
      <Reveal open={open} className="-mx-2">
        <div className="flex flex-col px-2 pt-3">
          {[...limits.buckets.map((b) => ({ ...b, share: pct(b.tokens) })), ...limits.deferred.map((d) => ({ ...d, color: 'var(--color-chart-cursor)', share: '—' }))].map((b) => (
            <div key={b.label} className="flex items-center gap-2 py-[5px]">
              <span className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: b.color }} />
              <span className="min-w-0 flex-1 truncate text-body-regular text-text-primary">{b.label}</span>
              <span className="text-body-regular text-text-tertiary tabular-nums">{formatTokens(b.tokens)}</span>
              <span className="w-14 text-end text-body-medium text-text-primary tabular-nums">{b.share}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 py-[5px]">
            <span className="size-2.5 shrink-0 rounded-[3px] bg-chart-track" />
            <span className="min-w-0 flex-1 truncate text-body-regular text-text-primary">Free space</span>
            <span className="text-body-regular text-text-tertiary tabular-nums">{formatTokens(free)}</span>
            <span className="w-14 text-end text-body-medium text-text-primary tabular-nums">{pct(free)}</span>
          </div>
          <div className="mt-1.5 flex flex-col">
            {limits.groups.map((g) => (
              <GroupRow key={g.label} g={g} />
            ))}
          </div>
        </div>
      </Reveal>
      <div className="my-3 h-px w-full bg-separator-border-strong" />
      <div className="flex items-center justify-between gap-3 py-1">
        <span className="text-body-medium text-text-secondary">Plan usage limits · {limits.plan}</span>
        <a href="#" onClick={(e) => e.preventDefault()} aria-label="Manage plan" className="flex size-6 items-center justify-center rounded-md text-text-tertiary outline-none transition-colors duration-150 hover:bg-background-secondary-hover hover:text-text-secondary focus-visible:ring-2 focus-visible:ring-border-focus-ring">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" className="remixicon size-4 rtl:rotate-180">
            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
          </svg>
        </a>
      </div>
      <div className="flex flex-col gap-3 pt-1">
        {limits.limits.map((l) => (
          <div key={l.label} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-body-medium text-text-primary">{l.label}</span>
              <span className="flex shrink-0 items-baseline gap-2">
                <span className="text-body-regular text-text-tertiary">{l.resets}</span>
                <span className="w-9 text-end text-body-medium text-text-primary tabular-nums">{l.percent}%</span>
              </span>
            </div>
            <div className="flex h-1.5 w-full gap-px overflow-hidden rounded-full bg-chart-track">
              <div className="h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${l.percent}%`, backgroundColor: 'var(--color-chart-6)' }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** The 16px ring + percentage from the Composer Panel rail (r 6, stroke 2.5, neutral-300 track, neutral-500 arc). */
export function ContextRing({ percent }: { percent: number }) {
  const c = 2 * Math.PI * 6;
  return (
    <>
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" className="shrink-0 -rotate-90">
        <circle cx="8" cy="8" r="6" fill="none" stroke="var(--color-neutral-300)" strokeWidth="2.5" />
        <circle cx="8" cy="8" r="6" fill="none" stroke="var(--color-neutral-500)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${(Math.min(100, Math.max(0, percent)) / 100) * c} ${c}`} className="transition-[stroke-dasharray] duration-500 ease-out" />
      </svg>
      <span className="text-body-2-medium whitespace-nowrap text-text-secondary tabular-nums">{percent}%</span>
    </>
  );
}

/** The ring as a button that opens the Agent Limits Card above it. */
export function ContextMeter({ percent, limits, className }: { percent: number; limits?: AgentLimits; className?: string }) {
  return (
    <Popover.Root>
      <Popover.Trigger aria-label={`Context ${percent}% used`} className={cn('flex shrink-0 cursor-pointer items-center gap-1 rounded-[40px] py-1 ps-1.5 pe-2 outline-none transition-colors duration-150 hover:bg-background-tertiary-default/60 focus-visible:ring-2 focus-visible:ring-border-focus-ring', className)}>
        <ContextRing percent={percent} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className="z-50 w-[448px] max-w-[calc(100vw-32px)] rounded-[20px] border border-border-button-default bg-dropdown-background p-1 shadow-dropdown outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="scrollbar-thin max-h-[min(70vh,640px)] overflow-y-auto rounded-2xl">
            <AgentLimitsCard limits={limits ?? { ...SAMPLE_LIMITS, buckets: scaleBuckets(SAMPLE_LIMITS, percent) }} />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** The sample buckets rescaled so the card agrees with the ring's percentage. */
function scaleBuckets(l: AgentLimits, percent: number): Bucket[] {
  const k = (percent / 100) * l.window / used(l);
  return l.buckets.map((b) => ({ ...b, tokens: Math.round((b.tokens * k) / 100) * 100 }));
}
