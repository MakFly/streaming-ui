import { Fragment, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { defaultFilter } from 'cmdk';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { Icon } from '@/components/icon';
import { demos, libraries } from '@/engine/registry';
import { templates } from '@/templates/registry';
import { useTheme } from '@/providers/theme-provider';
import { paths } from '@/lib/paths';

const PAGES = [
  { label: 'Home', to: paths.home(), icon: 'compass-3-line' },
  { label: 'Components', to: paths.components(), icon: 'layout-grid-line' },
  { label: 'Responses', to: paths.gallery(), icon: 'sparkling-line' },
  { label: 'Agent Limits Card', to: paths.agentLimits(), icon: 'pie-chart-line' },
  { label: 'Templates', to: paths.templates(), icon: 'robot-2-line' },
  { label: 'Composers', to: paths.composers(), icon: 'quill-pen-line' },
  { label: 'Orbs', to: paths.orbs(), icon: 'loader-4-line' },
  { label: 'Model picker', to: paths.modelPicker(), icon: 'cpu-line' },
  { label: 'Playground', to: paths.playground(), icon: 'magic-line' },
  { label: 'Collections', to: paths.collections(), icon: 'stack-line' },
  { label: 'Prompts', to: paths.prompts(), icon: 'markdown-line' },
];
/** The "search in Responses" fallback always shows, ranked last so Enter opens the best match. */
const IN_GALLERY = 'search-in-gallery';
const filter = (value: string, search: string, keywords?: string[]) => (value === IN_GALLERY ? 1e-6 : defaultFilter(value, search, keywords));

// What cmdk scores each item on: the title first, so a title match beats a keyword match.
type Entry = { value: string; keywords?: string[] };
const THEME_KEYWORDS = ['dark', 'light', 'appearance'];
const COLLECTIONS: Entry[] = libraries.map((l) => ({ value: `${l.name} collection` }));
const TEMPLATES: Entry[] = templates.map((t) => ({ value: `${t.name} template`, keywords: [t.tagline, ...t.tags] }));
const RESPONSES: Entry[] = demos.map((d) => ({ value: `${d.title} ${d.slug}`, keywords: [d.group, d.library.name] }));

/** cmdk sorts the items inside a group but not the groups themselves (1.1.1): order them by their best match. */
function rank(query: string, sections: { key: string; entries: Entry[]; node: ReactNode }[]) {
  const q = query.trim();
  const ranked = q
    ? sections
        .map((s) => ({ ...s, score: Math.max(0, ...s.entries.map((e) => defaultFilter(e.value, q, e.keywords))) }))
        .sort((a, b) => b.score - a.score)
    : sections;
  return ranked.map((s, i) => (
    <Fragment key={s.key}>
      {i > 0 && <CommandSeparator />}
      {s.node}
    </Fragment>
  ));
}

/**
 * ⌘K palette, centered: pages, collections, templates and every response, filtered by cmdk as you type.
 * Loaded on demand by the navbar, so the response registry never ships with pages that don't need it.
 */
export default function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');

  const run = (action: () => void) => {
    onOpenChange(false);
    action();
  };
  const go = (to: string) => run(() => navigate(to));
  const themeValue = `${theme === 'dark' ? 'Light' : 'Dark'} mode theme`;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setQuery('');
      }}
    >
      {/* Fixed height: the box stays put in the middle of the screen while the results change. */}
      <DialogContent
        showCloseButton={false}
        className="h-[min(520px,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-[640px] rounded-2xl border border-border-button-default"
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">Jump to a page, a collection, a template or a response.</DialogDescription>
        <Command loop filter={filter}>
          <CommandInput value={query} onValueChange={setQuery} placeholder="Search responses, templates, pages…" />
          <CommandList className="flex-1">
            <CommandEmpty>No result for “{query}”.</CommandEmpty>
            {rank(query, [
              {
                key: 'pages',
                entries: [...PAGES.map((p) => ({ value: p.label })), { value: themeValue, keywords: THEME_KEYWORDS }],
                node: (
                  <CommandGroup heading="Pages">
                    {PAGES.map((p) => (
                      <CommandItem key={p.label} value={p.label} onSelect={() => go(p.to)}>
                        <Icon name={p.icon} className="size-[18px]" />
                        {p.label}
                      </CommandItem>
                    ))}
                    <CommandItem value={themeValue} keywords={THEME_KEYWORDS} onSelect={() => run(toggleTheme)}>
                      <Icon name={theme === 'dark' ? 'sun-line' : 'moon-line'} className="size-[18px]" />
                      {theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
                    </CommandItem>
                  </CommandGroup>
                ),
              },
              {
                key: 'collections',
                entries: COLLECTIONS,
                node: (
                  <CommandGroup heading="Collections">
                    {libraries.map((l, i) => (
                      <CommandItem key={l.slug} value={COLLECTIONS[i].value} onSelect={() => go(paths.gallery(l.slug))}>
                        <Icon name="stack-line" className="size-[18px]" />
                        {l.name}
                        <CommandShortcut className="tabular-nums">{l.count}</CommandShortcut>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ),
              },
              {
                key: 'templates',
                entries: TEMPLATES,
                node: (
                  <CommandGroup heading="Templates">
                    {templates.map((t, i) => (
                      <CommandItem key={t.slug} {...TEMPLATES[i]} onSelect={() => go(paths.template(t.slug))}>
                        <Icon name="robot-2-line" className="size-[18px]" />
                        <span className="shrink-0">{t.name}</span>
                        <span className="truncate text-text-tertiary">{t.tagline}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ),
              },
              {
                key: 'responses',
                entries: RESPONSES,
                node: (
                  <CommandGroup heading="Responses">
                    {demos.map((d, i) => (
                      <CommandItem key={d.slug} {...RESPONSES[i]} onSelect={() => go(paths.demo(d.slug))}>
                        <span className="w-6 shrink-0 font-mono text-caption-1-regular text-text-tertiary">{String(d.index).padStart(2, '0')}</span>
                        <span className="truncate">{d.title}</span>
                        <CommandShortcut>{d.group}</CommandShortcut>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ),
              },
            ])}
            {query.trim() && (
              <CommandGroup>
                <CommandItem value={IN_GALLERY} onSelect={() => go(`${paths.gallery()}?q=${encodeURIComponent(query.trim())}`)}>
                  <Icon name="search-line" className="size-[18px]" />
                  <span className="truncate">Search “{query.trim()}” in Responses</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
