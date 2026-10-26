import { Fragment } from 'react';
import { Bot, Check, Clock, Download, FileSearch, Globe, Layers, ListTree, LoaderCircle, Lock, Microscope, Share } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatEngine, type ChatScriptApi, type Part } from './kit/engine';
import { Cite, Markdown } from './kit/markdown';
import { ActionBar, Badge, Canvas, ChatSurface, Composer, Frame, FrameFooter, FrameHeader, FramePanel, HeaderButton, Reasoning, Suggestions, HeaderTools, UserMessage, Welcome, replyRefOf, textOf } from './kit/parts';

/* Deep Research — the agent splits the question, then runs four browser agents in parallel (the usual
 * deep-research layout). Each lane shows its live page, progress and finds; then a
 * long cited report streams with a table of contents beside it. */

type Lane = { agent: string; topic: string; url: string; pages: number; found: number; progress: number; status: 'queued' | 'browsing' | 'done' };

const LANES: Omit<Lane, 'pages' | 'found' | 'progress' | 'status'>[] = [
  { agent: 'Agent 1', topic: 'Battery chemistry roadmaps', url: 'nature.com/articles/s41560-025', },
  { agent: 'Agent 2', topic: 'Cost per kWh, 2020–2026', url: 'about.bnef.com/blog/battery-pack-prices', },
  { agent: 'Agent 3', topic: 'Grid storage deployments', url: 'iea.org/reports/batteries-and-secure-energy', },
  { agent: 'Agent 4', topic: 'Sodium-ion supply chain', url: 'ft.com/content/sodium-ion-catl', },
];

const PAGES = [
  ['nature.com', 'ft.com', 'iea.org'],
  ['bnef.com', 'reuters.com', 'ourworldindata.org'],
  ['iea.org', 'energy.gov', 'lazard.com'],
  ['ft.com', 'catl.com', 'benchmarkminerals.com'],
];

const REPORT = `## Summary
Lithium-ion pack prices fell to roughly **$115/kWh in 2024** and are on track to break $100 by 2026 [2]. That drop, more than any chemistry breakthrough, is what moved grid storage from pilot projects to the default choice for evening peaks [3].

## Cost curve
- Pack prices fell about 20% in 2024 alone, the steepest drop since 2017 [2].
- LFP cells now undercut NMC by 25–30%, which is why most stationary storage uses them [1].

## Deployments
- Global grid storage additions roughly doubled in 2024, led by China and the US [3].
- Four-hour systems are now the norm; longer durations remain niche until costs fall further [3].

## Sodium-ion
Sodium-ion cells entered mass production in 2025. They trade energy density for cheaper, abundant materials, a good fit for stationary use where weight matters less [4].

## Outlook
Expect LFP to dominate stationary storage through 2030, with sodium-ion taking share at the low-cost end if lithium prices rebound [1][4].`;

const TOC = ['Summary', 'Cost curve', 'Deployments', 'Sodium-ion', 'Outlook'];

async function research(api: ChatScriptApi, query: string) {
  const a = api.assistant();
  await a.think('Planning the research', ['Split into chemistry, cost, deployment and supply chain', 'Assign one browser agent per question', 'Budget: 40 pages, 2 minutes'], 520);
  const lanes: Lane[] = LANES.map((l) => ({ ...l, pages: 0, found: 0, progress: 0, status: 'queued' }));
  const set = a.custom('lanes', { lanes: lanes.map((l) => ({ ...l })), query });
  // All four agents advance on the same tick at different speeds, as parallel browsers would.
  const speed = [7, 5, 6, 4];
  for (let t = 0; lanes.some((l) => l.status !== 'done'); t++) {
    lanes.forEach((l, i) => {
      if (l.status === 'done') return;
      if (t >= i) l.status = 'browsing';
      if (l.status !== 'browsing') return;
      l.progress = Math.min(100, l.progress + speed[i] + (t % 3));
      l.pages = Math.min(12, Math.floor(l.progress / 9));
      l.found = Math.floor(l.pages * 0.8);
      l.url = `${PAGES[i][t % 3]}/${['research', 'report', 'data'][(t + i) % 3]}`;
      if (l.progress >= 100) l.status = 'done';
    });
    set({ lanes: lanes.map((l) => ({ ...l })) });
    await api.sleep(160);
  }
  a.custom('stats', { sources: lanes.reduce((n, l) => n + l.found, 0), pages: lanes.reduce((n, l) => n + l.pages, 0) });
  await a.think('Writing the report', ['Merging 4 agent briefs', 'Resolving conflicting price figures'], 450);
  a.custom('toc', { items: TOC });
  await a.stream(REPORT, 32);
  a.done();
}

async function intro(api: ChatScriptApi) {
  await api.sleep(500);
  await api.user('How fast is grid battery storage getting cheaper, and what comes after lithium-ion?', { type: true });
  await research(api, 'grid battery storage');
}

async function reply(api: ChatScriptApi, text: string) {
  await research(api, text);
}

const favicon = (url: string) => url.split('.')[0][0].toUpperCase();

/** Four browser agents side by side: mini chrome with the live URL, a page skeleton, progress and counts. */
function Lanes({ lanes }: { lanes: Lane[] }) {
  const done = lanes.filter((l) => l.status === 'done').length;
  return (
    <Frame>
      <FrameHeader icon={<Bot />} title="Browser agents">
        {done < lanes.length ? <Badge tone="info">{lanes.length - done} running</Badge> : <Badge tone="success" dot>All done</Badge>}
      </FrameHeader>
      <div className="grid grid-cols-1 gap-[3px] sm:grid-cols-2">
        {lanes.map((l) => (
          <FramePanel key={l.agent} className={cn('flex flex-col transition-opacity duration-300', l.status === 'queued' && 'opacity-50')}>
            <div className="flex items-center gap-2 border-b border-separator-border px-2.5 py-2">
              <span className="text-caption-1-semibold text-text-primary">{l.agent}</span>
              <span className="min-w-0 flex-1 truncate text-caption-1-regular text-text-secondary">{l.topic}</span>
              {l.status === 'done' ? (
                <span className="grid size-4 place-items-center rounded-full bg-emerald-500 text-white">
                  <Check className="size-2.5" strokeWidth={3.5} />
                </span>
              ) : l.status === 'browsing' ? (
                <LoaderCircle className="size-3.5 animate-spin text-text-tertiary" />
              ) : (
                <Clock className="size-3.5 text-text-tertiary" />
              )}
            </div>
            <div className="flex flex-col gap-2 p-2.5">
              <div className="flex h-6 items-center gap-1.5 rounded-md bg-background-tertiary-default px-2 font-mono text-[11px] text-text-tertiary">
                <Lock className="size-3 shrink-0" />
                <span className="grid size-3.5 shrink-0 place-items-center rounded-full bg-text-tertiary text-[8px] font-bold text-background-primary-default">{favicon(l.url)}</span>
                <span key={l.url} className={cn('min-w-0 truncate', l.status === 'browsing' && 'animate-in fade-in-0 duration-300')}>{l.url}</span>
              </div>
              <div className="flex flex-col gap-1.5 py-1" aria-hidden>
                {[92, 78, 85].map((w, i) => (
                  <span key={i} className={cn('h-1.5 rounded-full bg-background-tertiary-default', l.status === 'browsing' && 'sui-skeleton')} style={{ width: `${w - i * 6}%` }} />
                ))}
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-background-tertiary-default">
                <div className={cn('h-full rounded-full transition-[width] duration-300', l.status === 'done' ? 'bg-emerald-500' : 'bg-accent-500')} style={{ width: `${l.progress}%` }} />
              </div>
              <div className="flex items-center justify-between text-caption-1-regular text-text-tertiary tabular-nums">
                <span>{l.pages} pages read</span>
                <span>{l.found} sources kept</span>
              </div>
            </div>
          </FramePanel>
        ))}
      </div>
    </Frame>
  );
}

function Stats({ sources, pages }: { sources: number; pages: number }) {
  const items: [React.ReactNode, string, string][] = [
    [<Layers key="s" />, String(sources), 'sources'],
    [<FileSearch key="p" />, String(pages), 'pages read'],
    [<Bot key="a" />, '4', 'agents'],
    [<Clock key="t" />, '1m 12s', 'elapsed'],
  ];
  return (
    <div className="tpl-reveal grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map(([icon, v, k]) => (
        <div key={k} className="flex flex-col gap-1 rounded-2xl bg-background-primary-default px-3 py-2.5 shadow-xs">
          <span className="flex items-center gap-1.5 text-caption-1-medium text-text-tertiary [&_svg]:size-3.5">
            {icon} {k}
          </span>
          <span className="text-title-3-semibold tracking-[-0.01em] tabular-nums">{v}</span>
        </div>
      ))}
    </div>
  );
}

const SRC = ['nature.com', 'bnef.com', 'iea.org', 'ft.com'];

export default function DeepResearchTemplate() {
  const chat = useChatEngine({ intro, reply });
  const empty = chat.messages.length === 0;

  const report = (m: (typeof chat.messages)[number], isLast: boolean) => {
    const toc = m.parts.find((p): p is Extract<Part, { kind: 'custom' }> => p.kind === 'custom' && p.type === 'toc')?.data.items as string[] | undefined;
    const text = m.parts.find((p): p is Extract<Part, { kind: 'text' }> => p.kind === 'text');
    return (
      <div data-message-id={m.id} className="group/message flex flex-col gap-5 rounded-lg">
        {m.parts.map((p) => {
          if (p.kind === 'thinking') return <Reasoning key={p.id} part={p} />;
          if (p.kind === 'custom' && p.type === 'lanes') return <Lanes key={p.id} lanes={p.data.lanes as Lane[]} />;
          if (p.kind === 'custom' && p.type === 'stats') return <Stats key={p.id} sources={Number(p.data.sources)} pages={Number(p.data.pages)} />;
          return null;
        })}
        {text && (
          <Frame>
            <FrameHeader icon={<Microscope />} title="Research report">
              {!text.done ? <Badge tone="info">Writing…</Badge> : <Badge tone="success">High confidence</Badge>}
            </FrameHeader>
            {/* overflow-visible so the contents can stick while the report scrolls past. */}
            <FramePanel className="flex overflow-visible">
              {toc && (
                <div className="hidden w-44 shrink-0 border-e border-separator-border md:block">
                <nav aria-label="Contents" className="sticky top-14 flex flex-col gap-0.5 p-3">
                  <span className="flex items-center gap-1.5 pb-1.5 text-caption-1-medium text-text-tertiary">
                    <ListTree className="size-3.5" /> Contents
                  </span>
                  {toc.map((h) => {
                    const reached = text.text.slice(0, text.shown).includes(`## ${h}`);
                    return (
                      <span key={h} className={cn('rounded-md px-2 py-1 text-body-2-regular transition-colors', reached ? 'text-text-primary' : 'text-text-tertiary')}>
                        {h}
                      </span>
                    );
                  })}
                </nav>
                </div>
              )}
              <div className="min-w-0 flex-1 px-5 py-4">
                <Markdown text={text.text.slice(0, text.shown)} streaming={!text.done} cite={(n) => <Cite n={n} title={SRC[n - 1]} />} className="text-[15px] leading-7" />
              </div>
            </FramePanel>
            {text.done && (
              <FrameFooter>
                <HeaderButton className="h-7 text-caption-1-medium">
                  <Download /> Export PDF
                </HeaderButton>
                <HeaderButton className="h-7 text-caption-1-medium">
                  <Share /> Share
                </HeaderButton>
                <span className="ms-auto flex -space-x-1.5">
                  {SRC.map((s) => (
                    <span key={s} title={s} className="grid size-5 place-items-center rounded-full bg-text-tertiary text-[9px] font-bold text-background-primary-default ring-2 ring-background-tertiary-default">
                      {s[0].toUpperCase()}
                    </span>
                  ))}
                </span>
              </FrameFooter>
            )}
          </Frame>
        )}
        {text?.done && <ActionBar message={m} isLast={isLast} onReply={() => chat.startReply(replyRefOf(m, 'Report'))} />}
      </div>
    );
  };

  const composer = (
    <Composer reply={chat.replyTo} onClearReply={chat.clearReply}
      variant="box"
      value={chat.draft}
      onChange={chat.setDraft}
      onSend={chat.send}
      onStop={chat.stop}
      busy={chat.busy}
      placeholder="What should the agents research?"
      tools={
        <span className="flex h-8 items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 text-body-2-medium text-violet-700 dark:text-violet-300">
          <Microscope className="size-4" /> Deep research
        </span>
      }
    />
  );

  return (
    <Canvas>
      <ChatSurface
        dep={chat.messages}
        empty={empty}
        width="max-w-[52rem]"
        header={
          <>
            <span className="grid size-7 place-items-center rounded-lg bg-violet-500 text-white">
              <Microscope className="size-4" />
            </span>
            <span className="text-headline-medium">Deep Research</span>
            <Badge tone="purple" className="hidden sm:inline-flex">
              <Globe /> 4 agents
            </Badge>
            <span className="ms-auto flex items-center gap-1">
              <HeaderTools />
              <HeaderButton outline onClick={chat.reset}>
                New report
              </HeaderButton>
            </span>
          </>
        }
        footer={!empty && composer}
      >
        {empty ? (
          <Welcome title="Research anything, in depth" subtitle="Four browser agents read the web in parallel, then write a cited report.">
            <div className="mt-2 w-full text-start">{composer}</div>
            <Suggestions variant="list" items={['State of small modular reactors in 2026', 'How do LLM evals compare across labs?', 'Market for heat pumps in Europe']} onPick={chat.send} className="text-start" />
          </Welcome>
        ) : (
          chat.messages.map((m, i) => (
            <Fragment key={m.id}>{m.role === 'user' ? <UserMessage replyTo={m.replyTo} onEdit={() => chat.setDraft(textOf(m))}>{textOf(m)}</UserMessage> : report(m, i === chat.messages.length - 1)}</Fragment>
          ))
        )}
      </ChatSurface>
    </Canvas>
  );
}
