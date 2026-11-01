import { useId, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Icon } from '@/components/icon';
import { Logo } from '@/components/logo';
import type { Subnav } from '@/components/docs/in-docs';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';

/** Day an entry reached production, or 'pending' until it does: `make deploy-prod` writes the date (scripts/stamp-new.ts). */
type ReleaseDay = `${number}-${number}-${number}` | 'pending';
type Item = { label: string; to: string; icon: string; newSince?: ReleaseDay; active?: (p: string, hash: string) => boolean };

/** How long an entry keeps its New badge after it ships. */
const NEW_FOR_DAYS = 7;
const isNew = ({ newSince }: Item) => newSince === 'pending' || (newSince !== undefined && Date.now() - Date.parse(newSince) < NEW_FOR_DAYS * 86_400_000);

/** The sidebar tree, BoardUI's grouping: getting started, the components themselves, then the libraries to browse. */
export const DOCS_NAV: { label: string; items: Item[] }[] = [
  {
    label: 'Getting started',
    items: [
      { label: 'Introduction', to: paths.home(), icon: 'compass-3-line', active: (p) => p === '/' },
      { label: 'Playground', to: paths.playground(), icon: 'magic-line' },
    ],
  },
  {
    label: 'Components',
    items: [
      { label: 'Overview', to: paths.components(), icon: 'layout-grid-line', active: (p) => p === '/components' },
      { label: 'Composers', to: paths.composers(), icon: 'quill-pen-line', active: (p) => p.startsWith(paths.composers()) },
      { label: 'Model Picker', to: paths.modelPicker(), icon: 'cpu-line', active: (p) => p.startsWith(paths.modelPicker()) },
      { label: 'Agent Limits Card', to: paths.agentLimits(), icon: 'pie-chart-line', newSince: '2026-10-27', active: (p) => p.startsWith(paths.agentLimits()) },
      { label: 'Agent Feed', to: paths.agentFeed(), icon: 'team-line', newSince: 'pending', active: (p) => p.startsWith(paths.agentFeed()) },
      { label: 'Thread Navigator', to: paths.threadNavigator(), icon: 'git-branch-line', newSince: 'pending', active: (p) => p.startsWith(paths.threadNavigator()) },
      { label: 'Markdown', to: paths.markdown(), icon: 'file-text-line', newSince: 'pending', active: (p) => p.startsWith(paths.markdown()) },
      { label: 'Bloub', to: paths.bloub(), icon: 'user-smile-line', newSince: 'pending', active: (p) => p.startsWith(paths.bloub()) },
      { label: 'Thinking Orbs', to: paths.orbs(), icon: 'loader-4-line', active: (p) => p.startsWith(paths.orbs()) },
    ],
  },
  {
    label: 'Browse',
    items: [
      { label: 'Responses', to: paths.gallery(), icon: 'sparkling-line', active: (p) => p.startsWith('/responses') || p.startsWith('/demo/') },
      { label: 'Templates', to: paths.templates(), icon: 'robot-2-line', active: (p) => p.startsWith('/templates') },
      { label: 'Collections', to: paths.collections(), icon: 'stack-line', active: (p) => p.startsWith('/collections') },
      { label: 'Prompts', to: paths.prompts(), icon: 'markdown-line', active: (p) => p.startsWith('/prompts') },
    ],
  },
];

/** BoardUI's tree connector: a 1px rail down the group with a rounded elbow into each item. The rail bridges the 2px
 * gap to the next item, and on the last one stops where its elbow starts curving, so nothing hangs below the group. */
function TreeLine({ last, className = 'start-[12.5px]' }: { last: boolean; className?: string }) {
  return (
    <span aria-hidden="true" className={cn('pointer-events-none absolute inset-y-0 w-3 text-foreground-icon-quaternary', className)}>
      <span className={cn('absolute start-0 top-0 w-px bg-current', last ? 'bottom-[calc(50%+5px)]' : '-bottom-0.5')} />
      <svg width="12" height="6" viewBox="0 0 12 6" fill="none" className="absolute start-0 top-1/2 -translate-y-[5px] rtl:-scale-x-100">
        <path d="M0.5 0 Q0.5 5 5.5 5 H11.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    </span>
  );
}

const linkCls = (on: boolean) =>
  cn(
    'relative flex items-center gap-2 rounded-md py-1.5 pe-2.5 text-body-medium outline-none transition-colors duration-150 ease focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-inset',
    on ? 'bg-background-secondary-hover text-text-primary' : 'text-text-secondary hover:bg-background-secondary-hover hover:text-text-primary',
  );

/** An entry with sub-links: the whole row opens and closes them, as a dropdown of its own (a second tree level), with
 * "All" first since the row itself no longer navigates. Closed by default, unless one of its links is the current page. The parent rail runs on past them when the entry is
 * not the group's last. */
function SubnavEntry({ item, on, pathname, subnav, last, focusable, onNavigate }: { item: Item; on: boolean; pathname: string; subnav: Subnav; last: boolean; focusable: boolean; onNavigate?: () => void }) {
  const counts = subnav.links.map((l) => l.count);
  const all = { label: 'All', to: item.to, on: pathname === item.to, count: counts.every((c) => c !== undefined) ? counts.reduce((a, c) => a + c, 0) : undefined };
  const links = [all, ...subnav.links];
  const [open, setOpen] = useState(() => links.some((l) => l.on));
  const id = useId();
  const tab = focusable && open ? undefined : -1;
  return (
    <div className="relative flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        tabIndex={focusable ? undefined : -1}
        onClick={() => setOpen((o) => !o)}
        // The highlight goes to the current sub-link; the entry only keeps its text colour.
        className={cn(linkCls(false), 'w-full cursor-pointer ps-8 text-start', on && 'text-text-primary')}
      >
        <TreeLine last={last} />
        <Icon name={item.icon} className="size-4 text-foreground-icon-secondary" />
        {item.label}
        <Icon name="arrow-down-s-line" className={cn('ms-auto size-4 text-foreground-icon-secondary transition-transform duration-300 ease-in-out', !open && '-rotate-90')} />
      </button>
      <div id={id} aria-hidden={!open} className={cn('relative grid transition-[grid-template-rows,opacity] duration-300 ease-in-out', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
        {!last && <span aria-hidden="true" className="pointer-events-none absolute start-[12.5px] top-0 -bottom-0.5 w-px bg-foreground-icon-quaternary" />}
        <div className="overflow-hidden">
          <div className="relative flex flex-col gap-0.5 pt-0.5">
            {links.map((l, i) => (
              <Link key={l.to} to={l.to} tabIndex={tab} onClick={onNavigate} aria-current={l.on ? 'page' : undefined} className={cn(linkCls(l.on), 'ps-[60px]')}>
                <TreeLine last={i === links.length - 1} className="start-[39.5px]" />
                <span className="truncate">{l.label}</span>
                {l.count !== undefined && <span className="ms-auto text-caption-1-regular tabular-nums text-text-tertiary">{l.count}</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Group({ label, items, pathname, hash, subnavs, onNavigate }: { label: string; items: Item[]; pathname: string; hash: string; subnavs: Subnav[]; onNavigate?: () => void }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 pt-2 pb-1 text-caption-1-semibold tracking-wide text-text-tertiary uppercase outline-none transition-colors duration-150 ease hover:bg-background-secondary-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-inset"
      >
        <span className="-translate-y-px">{label}</span>
        <Icon name="arrow-down-s-line" className={cn('size-4 -translate-y-px transition-transform duration-300 ease-in-out', !open && '-rotate-90')} />
      </button>
      <div aria-hidden={!open} className={cn('grid transition-[grid-template-rows,opacity] duration-300 ease-in-out', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
        <div className="overflow-hidden">
          <div className="relative flex flex-col gap-0.5">
            {items.map((item, i) => {
              const on = item.active?.(pathname, hash) ?? false;
              const last = i === items.length - 1;
              const sub = subnavs.find((s) => s.item === item.label) ?? null;
              if (sub) return <SubnavEntry key={item.label} item={item} on={on} pathname={pathname} subnav={sub} last={last} focusable={open} onNavigate={onNavigate} />;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  tabIndex={open ? undefined : -1}
                  onClick={onNavigate}
                  aria-current={on ? 'page' : undefined}
                  className={cn(linkCls(on), 'ps-8')}
                >
                  <TreeLine last={last} />
                  <Icon name={item.icon} className="size-4 text-foreground-icon-secondary" />
                  {item.label}
                  {isNew(item) && <span className="ms-auto rounded-full bg-blue-500/10 px-1.5 py-px text-[10px] leading-[14px] font-semibold tracking-wide text-blue-500 uppercase">New</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * BoardUI's floating sidebar: logo, Quick Search (⌘K), then the collapsible groups with their tree connectors.
 * `className` places it: sticky beside the page from lg, or inside the mobile drawer.
 */
export function DocsSidebar({ subnavs = [], onSearch, onWarmSearch, onNavigate, className }: { subnavs?: Subnav[]; onSearch: () => void; onWarmSearch?: () => void; onNavigate?: () => void; className?: string }) {
  const { pathname, hash } = useLocation();
  return (
    <aside className={cn('flex w-[260px] shrink-0 flex-col gap-3 overflow-hidden rounded-3xl border border-border-button-white bg-background-secondary-default p-3 shadow-sidebar', className)}>
      <Link to="/" onClick={onNavigate} className="flex w-full items-center gap-2 rounded-md px-1 outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring" aria-label="Streaming UI home">
        <Logo className="size-6 rounded-md [&>svg]:size-3.5" />
        <span className="text-title-3-semibold text-text-primary">Streaming UI</span>
      </Link>
      <button
        type="button"
        aria-label="Quick Search"
        aria-haspopup="dialog"
        onClick={onSearch}
        onPointerEnter={onWarmSearch}
        onFocus={onWarmSearch}
        className="flex w-full cursor-pointer items-center gap-2 rounded-full bg-background-tertiary-default p-2 outline-none transition-colors duration-150 hover:bg-background-tertiary-hover/55 focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      >
        <span className="flex flex-1 items-center gap-2">
          <Icon name="search-line" className="size-5 text-foreground-icon-secondary" />
          <span className="text-body-medium text-text-secondary">Quick Search</span>
        </span>
        <kbd className="inline-flex items-center justify-center rounded-full bg-kbd-background px-1 py-0.5 font-sans text-caption-1-semibold tracking-normal whitespace-nowrap text-kbd-foreground">⌘K</kbd>
      </button>
      <nav aria-label="Component library" className="scrollbar-thin -me-1 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pe-1">
        {DOCS_NAV.map((g) => (
          <Group key={g.label} label={g.label} items={g.items} pathname={pathname} hash={hash} subnavs={subnavs} onNavigate={onNavigate} />
        ))}
      </nav>
    </aside>
  );
}
