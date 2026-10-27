import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Icon } from '@/components/icon';
import { Logo } from '@/components/logo';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';

type Item = { label: string; to: string; icon: string; isNew?: true; active?: (p: string, hash: string) => boolean };

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
      { label: 'Composers', to: paths.composers(), icon: 'quill-pen-line', active: (p) => p.startsWith('/composers') },
      { label: 'Model Picker', to: paths.modelPicker(), icon: 'cpu-line', active: (p) => p.startsWith('/model-picker') },
      { label: 'Agent Limits Card', to: paths.agentLimits(), icon: 'pie-chart-line', isNew: true, active: (p) => p.startsWith(paths.agentLimits()) },
      { label: 'Thinking Orbs', to: paths.orbs(), icon: 'loader-4-line', active: (p) => p.startsWith('/orbs') },
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
function TreeLine({ last }: { last: boolean }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-[12.5px] w-3 text-foreground-icon-quaternary">
      <span className={cn('absolute start-0 top-0 w-px bg-current', last ? 'bottom-[calc(50%+5px)]' : '-bottom-0.5')} />
      <svg width="12" height="6" viewBox="0 0 12 6" fill="none" className="absolute start-0 top-1/2 -translate-y-[5px] rtl:-scale-x-100">
        <path d="M0.5 0 Q0.5 5 5.5 5 H11.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    </span>
  );
}

function Group({ label, items, pathname, hash, onNavigate }: { label: string; items: Item[]; pathname: string; hash: string; onNavigate?: () => void }) {
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
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  tabIndex={open ? undefined : -1}
                  onClick={onNavigate}
                  aria-current={on ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center gap-2 rounded-md py-1.5 ps-8 pe-2.5 text-body-medium outline-none transition-colors duration-150 ease focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-inset',
                    on ? 'bg-background-secondary-hover text-text-primary' : 'text-text-secondary hover:bg-background-secondary-hover hover:text-text-primary',
                  )}
                >
                  <TreeLine last={i === items.length - 1} />
                  <Icon name={item.icon} className="size-4 text-foreground-icon-secondary" />
                  {item.label}
                  {item.isNew && <span className="ms-auto rounded-full bg-blue-500/10 px-1.5 py-px text-[10px] leading-[14px] font-semibold tracking-wide text-blue-500 uppercase">New</span>}
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
export function DocsSidebar({ onSearch, onWarmSearch, onNavigate, className }: { onSearch: () => void; onWarmSearch?: () => void; onNavigate?: () => void; className?: string }) {
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
          <Group key={g.label} label={g.label} items={g.items} pathname={pathname} hash={hash} onNavigate={onNavigate} />
        ))}
      </nav>
    </aside>
  );
}
