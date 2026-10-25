import { Fragment, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Compass, ExternalLink, Globe, Library, Lock, PanelRightClose, Plus, Quote, RotateCw, Search, Share, Telescope, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatEngine, type ChatScriptApi, type Message, type Part } from './kit/engine';
import { Cite, Markdown } from './kit/markdown';
import { AgentLog } from './kit/primitives';
import { ActionBar, Badge, Canvas, ChatSurface, Composer, Drawer, Frame, FrameHeader, FramePanel, HeaderButton, IconButton, Reasoning, SideRail, Suggestions, Surface, HeaderTools, Welcome, textOf } from './kit/parts';

/* Research — an answer engine. The query becomes the page title with Answer / Sources tabs; searches run
 * on the agent-log trail with live result counts, sources land in a frame, then a cited
 * answer streams and related questions follow as a numbered list. A source card, a source row or a [n] chip
 * opens the page in canvas mode: a browser docked beside the answer (a drawer below lg) with tabs, history,
 * an address bar, a load bar and the cited passage highlighted. Real sites refuse to be framed, so pages are rendered. */

type Step = { q: string; status: 'running' | 'done'; n?: number };
/** A source and the page the side browser renders for it; `quote` is the passage the answer cites, highlighted on load. */
type Source = { title: string; domain: string; path: string; site: string; color: string; snippet: string; crumbs: string; byline: string; body: string[]; quote: string };

const SOURCES: Source[] = [
  {
    title: 'Using server-sent events',
    domain: 'developer.mozilla.org',
    path: '/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events',
    site: 'MDN Web Docs',
    color: '#0f172a',
    snippet: 'Developing a web application that uses server-sent events is straightforward…',
    crumbs: 'References › Web APIs › Server-sent events',
    byline: 'MDN contributors · Updated Jul 2026 · 6 min read',
    body: [
      'Server-sent events let a server push text to the page over a single long-lived HTTP response. The browser exposes them through the EventSource interface, and the payload is plain UTF-8 lines prefixed with field names such as data, event and id.',
      '## Receiving events',
      'Create an EventSource with the URL of the stream, then listen for message events. Each message arrives as soon as the server flushes it, so the page can render tokens one after the other without waiting for the response to end.',
      '## Reconnection',
      'Unlike a fetch call, the stream is resilient by default. If the connection drops, the browser reconnects on its own and resends the ID of the last event it received, so the server can resume where it left off.',
      'Because events travel one way, send user input with a regular POST and keep the event stream for what the server has to say.',
    ],
    quote: 'If the connection drops, the browser reconnects on its own and resends the ID of the last event it received',
  },
  {
    title: 'Streaming responses with the Fetch API',
    domain: 'web.dev',
    path: '/articles/streams',
    site: 'web.dev',
    color: '#2563eb',
    snippet: 'Streams let you start processing data as soon as it arrives…',
    crumbs: 'Articles › Performance',
    byline: 'Chrome DevRel · Mar 2026 · 9 min read',
    body: [
      'A response body is a ReadableStream. Instead of awaiting the whole payload with json() or text(), you can read it chunk by chunk and update the interface as each piece lands.',
      '## Why it matters',
      'Showing the first chunk as soon as it arrives makes the page feel ready long before the response has finished downloading. On slow networks the gap between the first chunk and the last can be several seconds.',
      '## Decoding text',
      'Pipe the body through a TextDecoderStream to get strings instead of bytes, then append each string to the state that renders the answer. Keep the container height stable so the text does not push the layout around as it grows.',
    ],
    quote: 'Showing the first chunk as soon as it arrives makes the page feel ready long before the response has finished downloading',
  },
  {
    title: 'How we cut time-to-first-token by 40%',
    domain: 'engineering.linear.app',
    path: '/time-to-first-token',
    site: 'Linear Engineering',
    color: '#5e6ad2',
    snippet: 'Perceived latency is dominated by the first visible token…',
    crumbs: 'Engineering › Performance',
    byline: 'Platform team · Feb 2026 · 7 min read',
    body: [
      'When we shipped AI search, the median answer took four seconds. People abandoned it far more than the numbers suggested they should, and almost all of the drop-off happened before the first word appeared.',
      '## Measuring the right thing',
      'We stopped tracking total response time and started tracking time to first visible token. Moving the first flush earlier in the pipeline cut that number by 40% without making the full answer any faster.',
      '## Showing the work',
      'Showing what the agent was doing during the search, as long as each step reflected real work, cut abandoned queries more than any backend change. Fake progress had the opposite effect once people noticed it never matched the result.',
      'We also reserved space for the answer before it streamed, so nothing below it jumped as the text grew.',
    ],
    quote: 'Showing what the agent was doing during the search, as long as each step reflected real work, cut abandoned queries more than any backend change',
  },
  {
    title: 'Perceived performance in chat interfaces',
    domain: 'nngroup.com',
    path: '/articles/perceived-performance-chat',
    site: 'Nielsen Norman Group',
    color: '#dc2626',
    snippet: 'Users rate progressive responses as faster even when total time is equal…',
    crumbs: 'Articles › Response times',
    byline: 'UX research · Jan 2026 · 8 min read',
    body: [
      'Response-time limits have not changed much since the early web: about a tenth of a second feels instant, a second keeps the flow of thought, and ten seconds is where attention starts to wander.',
      '## Progressive answers',
      'In our study, participants rated answers that appeared progressively as faster, even when the total wait was identical. Reading could start right away, so the wait was spent on the answer instead of on a spinner.',
      '## When not to stream',
      'For short factual results, such as a single number or a yes or no, a fast complete answer was preferred: watching a few words trickle in felt slower than seeing the result at once.',
    ],
    quote: 'participants rated answers that appeared progressively as faster, even when the total wait was identical',
  },
];

const urlOf = (s: Source) => `https://${s.domain}${s.path}`;

const ANSWER = `Users judge a chat answer by **time to first token**, not total time. Interfaces that show the first words within about a second are rated faster even when the full answer takes longer [2][4].

## What the research says
- Streaming text in place keeps attention on the answer instead of on a spinner [4].
- A visible reasoning or search phase makes long waits feel purposeful, as long as it shows real progress [3].
- Server-sent events are the simplest transport for one-way token streams and reconnect on their own [1].

In practice: stream from the first token, show what the agent is doing while it searches, and keep the layout stable so text does not jump as it grows [3].`;

const RELATED = [
  { title: 'How do you measure time to first token?', hint: 'metrics' },
  { title: 'SSE vs WebSockets for AI chat', hint: 'transport' },
  { title: 'Designing a good thinking indicator', hint: 'UX' },
];

async function research(api: ChatScriptApi, query: string, answer: string) {
  const a = api.assistant();
  const steps: Step[] = [];
  const setSteps = a.custom('steps', { items: [] });
  for (const [q, n] of [
    [query.length > 60 ? `${query.slice(0, 57)}…` : query, 12],
    ['time to first token perceived speed study', 8],
    ['streaming text UX research', 6],
  ] as const) {
    steps.push({ q, status: 'running' });
    setSteps({ items: [...steps] });
    await api.sleep(900);
    steps[steps.length - 1] = { q, status: 'done', n };
    setSteps({ items: [...steps] });
  }
  const setSources = a.custom('sources', { items: [] });
  for (let i = 1; i <= SOURCES.length; i++) {
    setSources({ items: SOURCES.slice(0, i) });
    await api.sleep(220);
  }
  await a.think('Reading 4 sources', ['Comparing the latency studies', 'Checking claims against the MDN docs'], 600);
  await a.stream(answer, 24);
  a.custom('related', { items: RELATED });
  a.done();
}

async function intro(api: ChatScriptApi) {
  await api.sleep(500);
  await api.user('Does streaming an AI answer actually make it feel faster?', { type: true });
  await research(api, 'Does streaming an AI answer actually make it feel faster?', ANSWER);
}

async function reply(api: ChatScriptApi, text: string) {
  await research(
    api,
    text,
    `Short answer: it depends on what people are waiting for [1].

- If the answer is a single number or yes/no, a fast complete result beats a stream [4].
- For explanations and code, streaming wins because people start reading immediately [2].
- Either way, show progress that reflects real work, such as the searches above [3].`,
  );
}

const Favicon = ({ s, className }: { s: Source; className?: string }) => (
  <span className={cn('grid size-4 shrink-0 place-items-center rounded-full text-[8.5px] font-bold text-white ring-2 ring-background-secondary-default', className)} style={{ backgroundColor: s.color }}>
    {s.domain[0].toUpperCase()}
  </span>
);

/** Web Search: one trail row per query; a shimmer while it runs, then favicons and a count. */
function SearchTrail({ items }: { items: Step[] }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-center gap-2 text-body-2-medium text-text-secondary">
        <Globe className="size-4" /> {items.every((s) => s.status === 'done') ? `Searched the web · ${items.length} queries` : 'Searching the web'}
      </p>
      <AgentLog className="ms-[7px]">
        {items.map((s, i) => (
          <div key={i} className="flex min-w-0 items-center gap-2 text-body-2-regular">
            <Search className="size-3.5 shrink-0 text-foreground-icon-tertiary" />
            <span className={cn('min-w-0 truncate', s.status === 'running' ? 'agent-progress-loading-text' : 'text-text-secondary')}>{s.q}</span>
            {s.n && (
              <span className="flex shrink-0 items-center gap-2">
                <span className="flex -space-x-1.5">
                  {SOURCES.slice(i, i + 3).map((src) => (
                    <Favicon key={src.domain} s={src} />
                  ))}
                </span>
                <span className="text-caption-1-medium text-text-tertiary tabular-nums">{s.n} results</span>
              </span>
            )}
          </div>
        ))}
      </AgentLog>
    </div>
  );
}

/** Opens a source in the side browser; a modified or middle click still opens the real page in a new tab. */
type OpenSource = (i: number) => void;
const sourceLink = (s: Source, i: number, onOpen: OpenSource) => ({
  href: urlOf(s),
  target: '_blank',
  rel: 'noreferrer',
  onClick: (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onOpen(i);
  },
});

function SourceCards({ items, current, onOpen }: { items: Source[]; current: number | null; onOpen: OpenSource }) {
  return (
    <Frame>
      <FrameHeader icon={<Library />} title="Sources">
        <Badge tone="outline">{items.length}</Badge>
      </FrameHeader>
      <div className="grid grid-cols-2 gap-[3px] lg:grid-cols-4">
        {items.map((s, i) => (
          <FramePanel key={s.domain} className="animate-in fade-in-0 zoom-in-95 duration-300">
            <a
              {...sourceLink(s, i, onOpen)}
              aria-current={current === i || undefined}
              className={cn('flex h-full flex-col gap-2.5 rounded-[inherit] p-2.5 transition-[background-color,box-shadow] hover:bg-background-primary-hover', current === i && 'bg-background-primary-hover ring-2 ring-accent-500/40 ring-inset')}
            >
              <span className="line-clamp-2 text-body-2-medium leading-5 text-text-primary">{s.title}</span>
              <span className="mt-auto flex items-center gap-1.5 text-caption-1-regular text-text-tertiary">
                <Favicon s={s} className="ring-0" />
                <span className="min-w-0 truncate">{s.domain}</span>
                <span className={cn('ms-auto font-mono tabular-nums', current === i && 'text-accent-500')}>{i + 1}</span>
              </span>
            </a>
          </FramePanel>
        ))}
      </div>
    </Frame>
  );
}

function SourceList({ items, onOpen }: { items: Source[]; onOpen: OpenSource }) {
  return (
    <ul className="flex flex-col divide-y divide-separator-border">
      {items.map((s, i) => (
        <li key={s.domain} className="tpl-reveal py-3 first:pt-0">
          <a {...sourceLink(s, i, onOpen)} className="group flex gap-3">
            <span className="w-5 pt-0.5 font-mono text-caption-1-regular text-text-tertiary tabular-nums">{i + 1}</span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="flex items-center gap-1.5 text-caption-1-regular text-text-tertiary">
                <Favicon s={s} className="ring-0" /> {s.domain}
              </span>
              <span className="text-body-medium text-text-primary group-hover:text-accent-500">{s.title}</span>
              <span className="line-clamp-2 text-body-2-regular text-text-secondary">{s.snippet}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

const Heading = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <h3 className="flex items-center gap-2 text-headline-semibold text-text-primary [&_svg]:size-[18px] [&_svg]:text-foreground-icon-secondary">
    {icon}
    {children}
  </h3>
);

/** One query and its answer, with the Answer / Sources tabs under the title. */
function Turn({ query, answer, isLast, first, onPick, current, onOpen }: { query: string; answer?: Message; isLast: boolean; first: boolean; onPick: (q: string) => void; current: number | null; onOpen: OpenSource }) {
  const [tab, setTab] = useState<'answer' | 'sources'>('answer');
  const custom = (type: string) => answer?.parts.find((p): p is Extract<Part, { kind: 'custom' }> => p.kind === 'custom' && p.type === type)?.data.items;
  const sources = (custom('sources') as Source[] | undefined) ?? [];
  const steps = (custom('steps') as Step[] | undefined) ?? [];
  const tabCls = (on: boolean) => cn('-mb-px flex items-center gap-1.5 border-b-2 pb-2.5 transition-colors', on ? 'border-text-primary text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary');
  return (
    <section className={cn('flex flex-col gap-6', !first && 'border-t border-separator-border pt-8')}>
      <div className="flex flex-col gap-4">
        <h1 className="animate-in fade-in-0 slide-in-from-bottom-1 text-title-1-semibold tracking-[-0.015em] text-balance duration-300">{query}</h1>
        <div role="tablist" className="flex gap-5 border-b border-separator-border text-body-2-medium">
          <button type="button" role="tab" aria-selected={tab === 'answer'} onClick={() => setTab('answer')} className={tabCls(tab === 'answer')}>
            <BookOpen className="size-4" /> Answer
          </button>
          <button type="button" role="tab" aria-selected={tab === 'sources'} onClick={() => setTab('sources')} className={tabCls(tab === 'sources')}>
            <Library className="size-4" /> Sources
            {sources.length > 0 && <Badge tone="neutral" round className="h-[18px] px-1.5">{sources.length}</Badge>}
          </button>
          <span className="ms-auto hidden pb-2.5 text-caption-1-medium text-text-tertiary sm:block">{steps.length ? `${steps.length} searches` : ''}</span>
        </div>
      </div>
      {tab === 'sources' ? (
        <SourceList items={sources} onOpen={onOpen} />
      ) : (
        answer && (
          <div className="group/message flex flex-col gap-6">
            {answer.parts.map((p) => {
              if (p.kind === 'custom' && p.type === 'steps') return <SearchTrail key={p.id} items={p.data.items as Step[]} />;
              if (p.kind === 'custom' && p.type === 'sources') return (p.data.items as Source[]).length ? <SourceCards key={p.id} items={p.data.items as Source[]} current={current} onOpen={onOpen} /> : null;
              if (p.kind === 'thinking') return <Reasoning key={p.id} part={p} />;
              if (p.kind === 'text')
                return (
                  <div key={p.id} className="flex flex-col gap-3">
                    <Heading icon={<Telescope />}>Answer</Heading>
                    <Markdown
                      text={p.text.slice(0, p.shown)}
                      streaming={!p.done}
                      className="text-[15.5px] leading-7"
                      cite={(n) =>
                        SOURCES[n - 1] ? (
                          <button type="button" onClick={() => onOpen(n - 1)} aria-label={`Open source ${n}: ${SOURCES[n - 1].title}`} className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring [&>span]:cursor-pointer">
                            <Cite n={n} title={`${SOURCES[n - 1].title} — ${SOURCES[n - 1].domain}`} />
                          </button>
                        ) : (
                          <Cite n={n} />
                        )
                      }
                    />
                    {p.done && <ActionBar message={answer} isLast={isLast} onRegenerate={() => onPick(query)} />}
                  </div>
                );
              if (p.kind === 'custom' && p.type === 'related')
                return (
                  <div key={p.id} className="tpl-reveal flex flex-col gap-2">
                    <Heading icon={<Compass />}>Related</Heading>
                    <Suggestions variant="list" items={p.data.items as { title: string; hint: string }[]} onPick={onPick} className="-mx-2" />
                  </div>
                );
              return null;
            })}
          </div>
        )
      )}
    </section>
  );
}

/* ------------------------------------------------------------ source browser */

/** A browser tab: its own back / forward history of pages (source indexes, or NEW_TAB for the start page). */
type Tab = { id: number; hist: number[]; pos: number };
const NEW_TAB = -1;
let tabSeq = 0;

function useSourceBrowser() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  // Bumps on every navigation or reload, which replays the load; switching tabs shows the page as it was.
  const [nav, setNav] = useState(0);
  const tab = tabs.find((t) => t.id === activeId) ?? null;
  const page = tab ? tab.hist[tab.pos] : null;
  const bump = () => setNav((n) => n + 1);
  const add = (first: number) => {
    const t: Tab = { id: ++tabSeq, hist: [first], pos: 0 };
    setTabs((all) => [...all, t]);
    setActiveId(t.id);
    bump();
  };
  const patch = (fn: (t: Tab) => Tab) => {
    if (!tab) return;
    setTabs((all) => all.map((t) => (t.id === tab.id ? fn(t) : t)));
    bump();
  };
  return {
    tabs,
    activeId,
    open,
    nav,
    page,
    canBack: !!tab && tab.pos > 0,
    canForward: !!tab && tab.pos < tab.hist.length - 1,
    /** From the answer: focus the tab already showing that source, or open it in a new one. */
    openSource(i: number) {
      const hit = tabs.find((t) => t.hist[t.pos] === i);
      if (hit) setActiveId(hit.id);
      else add(i);
      setOpen(true);
    },
    go: (i: number) => patch((t) => ({ ...t, hist: [...t.hist.slice(0, t.pos + 1), i], pos: t.pos + 1 })),
    back: () => patch((t) => ({ ...t, pos: Math.max(0, t.pos - 1) })),
    forward: () => patch((t) => ({ ...t, pos: Math.min(t.hist.length - 1, t.pos + 1) })),
    reload: bump,
    newTab: () => add(NEW_TAB),
    select: setActiveId,
    closeTab(id: number) {
      const at = tabs.findIndex((t) => t.id === id);
      const rest = tabs.filter((t) => t.id !== id);
      setTabs(rest);
      if (id !== activeId) return;
      const next = rest[Math.min(at, rest.length - 1)];
      setActiveId(next?.id ?? null);
      if (!next) setOpen(false);
    },
    close: () => setOpen(false),
    reset() {
      setOpen(false);
      setTabs([]);
      setActiveId(null);
    },
  };
}
type SourceBrowserState = ReturnType<typeof useSourceBrowser>;

function useViewportWidth() {
  const [w, setW] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth));
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

/** The page a source renders to: the site's own header, the article, the cited passage highlighted, further reading. */
function SourcePage({ s, n, onGo }: { s: Source; n: number; onGo: (i: number) => void }) {
  return (
    <div className="tpl-stream-in min-h-full">
      <header className="flex h-12 items-center gap-2.5 px-5 text-white" style={{ backgroundColor: s.color }}>
        <span className="grid size-6 place-items-center rounded-md bg-white/15 text-[12px] font-bold">{s.site[0]}</span>
        <span className="truncate text-body-2-semibold">{s.site}</span>
        <nav aria-hidden="true" className="ms-auto hidden gap-4 text-caption-1-medium text-white/70 sm:flex">
          <span>Docs</span>
          <span>Articles</span>
          <span>About</span>
        </nav>
      </header>
      <article className="mx-auto max-w-[620px] px-6 pt-8 pb-24">
        <p className="text-caption-1-medium text-text-tertiary">{s.crumbs}</p>
        <h1 className="mt-2 text-title-2-semibold tracking-[-0.015em] text-balance text-text-primary">{s.title}</h1>
        <p className="mt-2 text-caption-1-regular text-text-tertiary">{s.byline}</p>
        <div className="mt-6 flex flex-col gap-4 text-[15px] leading-7 text-text-secondary">
          {s.body.map((para, i) => {
            if (para.startsWith('## ')) return <h2 key={i} className="pt-2 text-headline-semibold text-text-primary">{para.slice(3)}</h2>;
            const at = para.indexOf(s.quote);
            if (at < 0) return <p key={i}>{para}</p>;
            return (
              <p key={i}>
                {para.slice(0, at)}
                <mark data-cite={n} className="tpl-cite-mark text-text-primary">{s.quote}</mark>
                {para.slice(at + s.quote.length)}
              </p>
            );
          })}
        </div>
        <div className="mt-10 border-t border-separator-border pt-5">
          <p className="text-caption-1-semibold tracking-wide text-text-tertiary uppercase">Further reading</p>
          <ul className="mt-2 flex flex-col">
            {SOURCES.map((o, i) =>
              i === n - 1 ? null : (
                <li key={o.domain}>
                  <button type="button" onClick={() => onGo(i)} className="group flex w-full items-center gap-2 rounded-lg py-1.5 text-start text-body-2-regular text-accent-500 outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
                    <Favicon s={o} className="ring-0" />
                    <span className="truncate group-hover:underline group-hover:underline-offset-2">{o.title}</span>
                    <span className="ms-auto shrink-0 text-caption-1-regular text-text-tertiary">{o.domain}</span>
                  </button>
                </li>
              ),
            )}
          </ul>
        </div>
      </article>
    </div>
  );
}

/** New tab: a search field and the sources from this research as shortcuts. */
function StartPage({ onGo }: { onGo: (i: number) => void }) {
  return (
    <div className="tpl-stream-in flex min-h-full flex-col items-center justify-center gap-6 px-6 py-12">
      <span className="grid size-12 place-items-center rounded-2xl bg-accent-500 text-white shadow-xs">
        <Telescope className="size-6" />
      </span>
      <div className="flex h-11 w-full max-w-[420px] items-center gap-2 rounded-full border border-border-button-default bg-background-primary-default px-4 text-body-2-regular text-text-tertiary shadow-xs">
        <Search className="size-4" /> Search or enter address
      </div>
      <div className="grid w-full max-w-[420px] grid-cols-4 gap-2">
        {SOURCES.map((s, i) => (
          <button key={s.domain} type="button" onClick={() => onGo(i)} className="flex min-w-0 flex-col items-center gap-2 rounded-xl p-2 transition-colors outline-none hover:bg-background-tertiary-default focus-visible:ring-2 focus-visible:ring-border-focus-ring">
            <span className="grid size-10 place-items-center rounded-xl text-body-2-bold text-white shadow-xs" style={{ backgroundColor: s.color }}>
              {s.site[0]}
            </span>
            <span className="w-full truncate text-center text-caption-1-medium text-text-secondary">{s.site}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PageSkeleton() {
  const bar = 'rounded-full bg-background-tertiary-default';
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="h-12 bg-background-tertiary-default/70" />
      <div className="mx-auto flex max-w-[620px] flex-col gap-3 px-6 pt-8">
        <div className={cn(bar, 'h-3 w-40')} />
        <div className={cn(bar, 'h-7 w-4/5')} />
        <div className={cn(bar, 'h-3 w-56')} />
        {[100, 96, 88, 100, 72, 94, 60].map((w, i) => (
          <div key={i} className={cn(bar, 'h-3', i === 0 && 'mt-5')} style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

const navBtn = (enabled: boolean) => cn(!enabled && 'pointer-events-none opacity-35');

/** Canvas mode: a browser beside the answer with tabs, history, reload, an address bar and the page itself. */
function SourceBrowser({ b }: { b: SourceBrowserState }) {
  const [loading, setLoading] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const s = b.page !== null && b.page !== NEW_TAB ? SOURCES[b.page] : null;

  // Every navigation "loads" for a beat: the bar runs, a skeleton holds the place, then the page blurs in.
  useEffect(() => {
    if (!b.nav) return;
    setLoading(true);
    scroller.current?.scrollTo({ top: 0 });
    const id = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(id);
  }, [b.nav]);

  const jump = (smooth = true) => {
    const el = scroller.current;
    const mark = el?.querySelector<HTMLElement>('mark[data-cite]');
    if (el && mark) el.scrollTo({ top: Math.max(0, mark.offsetTop - 96), behavior: smooth ? 'smooth' : 'auto' });
  };
  // Once a page is in, bring the cited passage into view (the highlight sweeps in as it arrives).
  useEffect(() => {
    if (loading || !s) return;
    const id = window.setTimeout(() => jump(), 120);
    return () => window.clearTimeout(id);
  }, [loading, s]);

  return (
    <Surface className="h-full w-full">
      {/* Chrome in three tones: the tab strip on the surface, the active tab and toolbar as one raised block
       * (concave feet join the tab to the bar), and a recessed address field. The page sits on the full background. */}
      <div className="flex h-11 shrink-0 items-end gap-1 pe-1.5">
        <div role="tablist" aria-label="Browser tabs" className="scrollbar-none flex min-w-0 flex-1 items-end overflow-x-auto px-2.5">
          {b.tabs.map((t, i) => {
            const p = t.hist[t.pos];
            const src = p === NEW_TAB ? null : SOURCES[p];
            const on = t.id === b.activeId;
            // A hairline between two resting tabs, as browsers draw it; none beside the active one.
            const divider = !on && i < b.tabs.length - 1 && b.tabs[i + 1].id !== b.activeId;
            return (
              <div
                key={t.id}
                role="tab"
                aria-selected={on}
                className={cn(
                  'group/tab animate-in fade-in-0 slide-in-from-bottom-1 relative flex h-8 w-[180px] min-w-[92px] shrink items-center gap-1 rounded-t-[10px] ps-2.5 pe-1 text-caption-1-medium duration-200',
                  on
                    ? 'z-10 bg-background-primary-default text-text-primary before:absolute before:bottom-0 before:-left-2.5 before:size-2.5 before:bg-[radial-gradient(circle_at_0_0,transparent_10px,var(--color-background-primary-default)_10.5px)] after:absolute after:-right-2.5 after:bottom-0 after:size-2.5 after:bg-[radial-gradient(circle_at_100%_0,transparent_10px,var(--color-background-primary-default)_10.5px)]'
                    : cn('text-text-secondary transition-colors hover:text-text-primary', divider && 'after:absolute after:inset-y-2 after:right-0 after:w-px after:bg-separator-border-strong'),
                )}
              >
                {!on && <span aria-hidden="true" className="absolute inset-x-0.5 inset-y-1 -z-10 rounded-lg transition-colors group-hover/tab:bg-black/[0.05] dark:group-hover/tab:bg-white/[0.06]" />}
                <button type="button" onClick={() => b.select(t.id)} className="flex min-w-0 flex-1 items-center gap-2 outline-none">
                  {src ? <Favicon s={src} className="ring-1 ring-black/10 dark:ring-white/20" /> : <Globe className="size-3.5 shrink-0 text-foreground-icon-tertiary" />}
                  <span className="truncate">{src ? src.title : 'New tab'}</span>
                </button>
                <button
                  type="button"
                  aria-label="Close tab"
                  onClick={() => b.closeTab(t.id)}
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-md text-foreground-icon-tertiary transition-[color,background-color,opacity] outline-none hover:bg-black/[0.06] hover:text-foreground-icon-primary focus-visible:opacity-100 dark:hover:bg-white/10 [&_svg]:size-3',
                    !on && 'opacity-0 group-hover/tab:opacity-100',
                  )}
                >
                  <X />
                </button>
              </div>
            );
          })}
          <IconButton label="New tab" onClick={b.newTab} className="mb-0.5 ms-1.5">
            <Plus />
          </IconButton>
        </div>
        <IconButton label="Close browser" onClick={b.close} className="mb-0.5">
          <PanelRightClose />
        </IconButton>
      </div>

      <div className="flex h-11 shrink-0 items-center gap-0.5 border-b border-separator-border-strong bg-background-primary-default px-2">
        <IconButton label="Back" onClick={b.back} className={navBtn(b.canBack)}>
          <ArrowLeft />
        </IconButton>
        <IconButton label="Forward" onClick={b.forward} className={navBtn(b.canForward)}>
          <ArrowRight />
        </IconButton>
        <IconButton label={loading ? 'Stop' : 'Reload'} onClick={loading ? () => setLoading(false) : b.reload}>
          {loading ? <X /> : <RotateCw />}
        </IconButton>
        <div className="mx-1 flex h-8 min-w-0 flex-1 items-center gap-2 rounded-full bg-background-secondary-default px-3 text-body-2-regular">
          {s ? <Lock className="size-3.5 shrink-0 text-foreground-icon-tertiary" /> : <Search className="size-3.5 shrink-0 text-foreground-icon-tertiary" />}
          <span className="min-w-0 truncate">
            {s ? (
              <>
                <span className="text-text-primary">{s.domain}</span>
                <span className="text-text-tertiary">{s.path}</span>
              </>
            ) : (
              <span className="text-text-tertiary">Search or enter address</span>
            )}
          </span>
        </div>
        {s && (
          <a href={urlOf(s)} target="_blank" rel="noreferrer" aria-label="Open in a new window" title="Open in a new window" className="grid size-7 shrink-0 place-items-center rounded-md text-foreground-icon-tertiary transition-colors hover:bg-background-tertiary-default hover:text-foreground-icon-primary dark:hover:bg-background-primary-hover [&_svg]:size-4">
            <ExternalLink />
          </a>
        )}
      </div>

      <div className="relative min-h-0 flex-1 bg-background-full">
        <div key={b.nav} aria-hidden="true" className={cn('absolute inset-x-0 top-0 z-10 h-0.5 bg-accent-500', loading ? 'tpl-load' : 'opacity-0 transition-opacity duration-300')} />
        <div ref={scroller} className="scrollbar-thin relative h-full overflow-y-auto" aria-busy={loading}>
          {loading ? <PageSkeleton /> : s ? <SourcePage key={b.nav} s={s} n={b.page! + 1} onGo={b.go} /> : b.page === NEW_TAB ? <StartPage key={b.nav} onGo={b.go} /> : null}
        </div>
        {s && !loading && (
          <button
            type="button"
            onClick={() => jump()}
            className="tpl-stream-in absolute bottom-3 left-1/2 flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-full border border-border-button-default bg-background-primary-default ps-2 pe-3 text-caption-1-medium whitespace-nowrap text-text-secondary shadow-dropdown transition-colors hover:text-text-primary"
          >
            <Quote className="size-3.5 text-accent-500" /> Cited as <Cite n={b.page! + 1} /> · Jump to passage
          </button>
        )}
      </div>
    </Surface>
  );
}

export default function ResearchTemplate() {
  const chat = useChatEngine({ intro, reply });
  const browser = useSourceBrowser();
  const vw = useViewportWidth();
  const wide = vw >= 1024;
  // Desktop: the browser docks beside the answer and the thread reflows; narrower: it slides over as a drawer.
  const paneWidth = Math.round(Math.min(680, Math.max(460, vw * 0.46)));
  const current = browser.open && browser.page !== null && browser.page !== NEW_TAB ? browser.page : null;
  const { open: browserOpen, close: closeBrowser } = browser;
  useEffect(() => {
    if (!browserOpen || !wide) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      closeBrowser();
    };
    // Capture phase, as the drawer does: Escape closes the browser before the Live preview's exit handler sees it.
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [browserOpen, wide, closeBrowser]);
  const newSearch = () => {
    browser.reset();
    chat.reset();
  };
  const empty = chat.messages.length === 0;
  const rail = 'grid size-9 place-items-center rounded-xl text-foreground-icon-secondary transition-colors hover:bg-background-secondary-hover hover:text-foreground-icon-primary [&_svg]:size-[18px]';

  const composer = (
    <Composer
      variant="box"
      value={chat.draft}
      onChange={chat.setDraft}
      onSend={chat.send}
      onStop={chat.stop}
      busy={chat.busy}
      placeholder={empty ? 'Ask anything…' : 'Ask a follow-up'}
      tools={
        <button type="button" className="flex h-8 items-center gap-1.5 rounded-full border border-border-button-default px-2.5 text-body-2-medium text-accent-500 transition-colors hover:bg-background-primary-hover">
          <Telescope className="size-4" /> Pro search
        </button>
      }
    />
  );

  return (
    <Canvas>
      <Surface className="hidden w-[60px] shrink-0 items-center gap-1.5 py-3 sm:flex">
        <span className="mb-2 grid size-9 place-items-center rounded-xl bg-accent-500 text-white shadow-xs">
          <Telescope className="size-[18px]" />
        </span>
        <button type="button" aria-label="New search" onClick={newSearch} className={cn(rail, 'bg-background-primary-default text-foreground-icon-primary shadow-xs')}>
          <Plus />
        </button>
        <button type="button" aria-label="Discover" className={rail}>
          <Compass />
        </button>
        <button type="button" aria-label="Library" className={rail}>
          <Library />
        </button>
      </Surface>
      <ChatSurface
        dep={chat.messages}
        empty={empty}
        width="max-w-[46rem]"
        header={
          <>
            <span className="px-1 text-headline-medium text-text-primary">Research</span>
            <Badge tone="info" round>
              Pro search
            </Badge>
            <span className="ms-auto flex items-center gap-1">
              <HeaderTools />
              <HeaderButton outline>
                <Share /> <span className="hidden sm:inline">Share</span>
              </HeaderButton>
              <IconButton label="New search" onClick={newSearch} className="sm:hidden">
                <Plus />
              </IconButton>
            </span>
          </>
        }
        footer={!empty && composer}
      >
        {empty ? (
          <Welcome title="Where knowledge begins" subtitle="Every answer cites the sources it used.">
            <div className="mt-2 w-full text-start">{composer}</div>
            <Suggestions variant="list" items={RELATED} onPick={chat.send} className="text-start" />
          </Welcome>
        ) : (
          chat.messages.map((m, i) =>
            m.role === 'user' ? (
              <Fragment key={m.id}>
                <Turn query={textOf(m)} answer={chat.messages[i + 1]} isLast={i + 1 === chat.messages.length - 1} first={i === 0} onPick={chat.send} current={current} onOpen={browser.openSource} />
              </Fragment>
            ) : null,
          )
        )}
      </ChatSurface>
      {wide ? (
        <SideRail open={browser.open} width={paneWidth} side="end">
          <SourceBrowser b={browser} />
        </SideRail>
      ) : (
        <Drawer open={browser.open} onClose={browser.close} side="end">
          <div className="h-full w-[min(560px,calc(100vw-1rem))]">
            <SourceBrowser b={browser} />
          </div>
        </Drawer>
      )}
    </Canvas>
  );
}
