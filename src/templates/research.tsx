import { Fragment, useState } from 'react';
import { BookOpen, Compass, Globe, Library, Plus, Search, Share, Telescope } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatEngine, type ChatScriptApi, type Message, type Part } from './kit/engine';
import { Cite, Markdown } from './kit/markdown';
import { AgentLog } from './kit/primitives';
import { ActionBar, Badge, Canvas, ChatSurface, Composer, Frame, FrameHeader, FramePanel, HeaderButton, IconButton, Reasoning, Suggestions, Surface, HeaderTools, Welcome, textOf } from './kit/parts';

/* Research — an answer engine. The query becomes the page title with Answer / Sources tabs; searches run
 * on the agent-log trail with live result counts, sources land in a frame, then a cited
 * answer streams and related questions follow as a numbered list. */

type Step = { q: string; status: 'running' | 'done'; n?: number };
type Source = { title: string; domain: string; color: string; snippet: string };

const SOURCES: Source[] = [
  { title: 'Using server-sent events', domain: 'developer.mozilla.org', color: '#0f172a', snippet: 'Developing a web application that uses server-sent events is straightforward…' },
  { title: 'Streaming responses with the Fetch API', domain: 'web.dev', color: '#2563eb', snippet: 'Streams let you start processing data as soon as it arrives…' },
  { title: 'How we cut time-to-first-token by 40%', domain: 'engineering.linear.app', color: '#5e6ad2', snippet: 'Perceived latency is dominated by the first visible token…' },
  { title: 'Perceived performance in chat interfaces', domain: 'nngroup.com', color: '#dc2626', snippet: 'Users rate progressive responses as faster even when total time is equal…' },
];

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

function SourceCards({ items }: { items: Source[] }) {
  return (
    <Frame>
      <FrameHeader icon={<Library />} title="Sources">
        <Badge tone="outline">{items.length}</Badge>
      </FrameHeader>
      <div className="grid grid-cols-2 gap-[3px] lg:grid-cols-4">
        {items.map((s, i) => (
          <FramePanel key={s.domain} className="animate-in fade-in-0 zoom-in-95 duration-300">
            <a href={`https://${s.domain}`} target="_blank" rel="noreferrer" className="flex h-full flex-col gap-2.5 p-2.5 transition-colors hover:bg-background-primary-hover">
              <span className="line-clamp-2 text-body-2-medium leading-5 text-text-primary">{s.title}</span>
              <span className="mt-auto flex items-center gap-1.5 text-caption-1-regular text-text-tertiary">
                <Favicon s={s} className="ring-0" />
                <span className="min-w-0 truncate">{s.domain}</span>
                <span className="ms-auto font-mono tabular-nums">{i + 1}</span>
              </span>
            </a>
          </FramePanel>
        ))}
      </div>
    </Frame>
  );
}

function SourceList({ items }: { items: Source[] }) {
  return (
    <ul className="flex flex-col divide-y divide-separator-border">
      {items.map((s, i) => (
        <li key={s.domain} className="tpl-reveal py-3 first:pt-0">
          <a href={`https://${s.domain}`} target="_blank" rel="noreferrer" className="group flex gap-3">
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
function Turn({ query, answer, isLast, first, onPick }: { query: string; answer?: Message; isLast: boolean; first: boolean; onPick: (q: string) => void }) {
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
        <SourceList items={sources} />
      ) : (
        answer && (
          <div className="group/message flex flex-col gap-6">
            {answer.parts.map((p) => {
              if (p.kind === 'custom' && p.type === 'steps') return <SearchTrail key={p.id} items={p.data.items as Step[]} />;
              if (p.kind === 'custom' && p.type === 'sources') return (p.data.items as Source[]).length ? <SourceCards key={p.id} items={p.data.items as Source[]} /> : null;
              if (p.kind === 'thinking') return <Reasoning key={p.id} part={p} />;
              if (p.kind === 'text')
                return (
                  <div key={p.id} className="flex flex-col gap-3">
                    <Heading icon={<Telescope />}>Answer</Heading>
                    <Markdown
                      text={p.text.slice(0, p.shown)}
                      streaming={!p.done}
                      className="text-[15.5px] leading-7"
                      cite={(n) => <Cite n={n} title={SOURCES[n - 1] ? `${SOURCES[n - 1].title} — ${SOURCES[n - 1].domain}` : undefined} />}
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

export default function ResearchTemplate() {
  const chat = useChatEngine({ intro, reply });
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
        <button type="button" aria-label="New search" onClick={chat.reset} className={cn(rail, 'bg-background-primary-default text-foreground-icon-primary shadow-xs')}>
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
              <IconButton label="New search" onClick={chat.reset} className="sm:hidden">
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
                <Turn query={textOf(m)} answer={chat.messages[i + 1]} isLast={i + 1 === chat.messages.length - 1} first={i === 0} onPick={chat.send} />
              </Fragment>
            ) : null,
          )
        )}
      </ChatSurface>
    </Canvas>
  );
}
