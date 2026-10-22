import { useState } from 'react';
import { Check, Columns3, Crown, Gauge, Plus, Timer, Trophy, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatEngine, type ChatScriptApi } from './kit/engine';
import { CopyButton, Markdown } from './kit/markdown';
import { AgentThinking } from './kit/primitives';
import { Badge, Canvas, ChatSurface, Composer, Frame, FrameFooter, FrameHeader, FramePanel, HeaderButton, Suggestions, HeaderTools, UserMessage, Welcome, textOf } from './kit/parts';

/* Model Compare — one prompt, several models streaming side by side (after Zola's multi-model chat and
 * arena-style comparisons). Each column shows its own time to first token, speed and cost as it streams;
 * pick the better answer and the winner is marked. */

type Model = { id: string; vendor: string; color: string; ttft: number; tps: number; cost: number };
const MODELS: Model[] = [
  { id: 'Fable 5', vendor: 'Anthropic', color: '#d97757', ttft: 380, tps: 92, cost: 0.0041 },
  { id: 'Sonnet 5.5', vendor: 'Anthropic', color: '#c15f3c', ttft: 260, tps: 128, cost: 0.0019 },
  { id: 'Haiku 5.5', vendor: 'Anthropic', color: '#e8a17f', ttft: 140, tps: 210, cost: 0.0004 },
  { id: 'Open 70B', vendor: 'Self-hosted', color: '#2563eb', ttft: 520, tps: 64, cost: 0.0007 },
];

type Answer = { model: string; text: string; shown: number; started: boolean; done: boolean; ttft: number; tps: number; cost: number };

const ANSWERS: Record<string, string> = {
  'Fable 5': `**Use SSE by default.** It's one long HTTP response the server writes tokens into, so it works through proxies and CDNs, and the browser reconnects on its own with \`Last-Event-ID\`.

Switch to WebSockets only when the client must talk back mid-stream: voice, live cursors, or interrupting a long answer without a new request.`,
  'Sonnet 5.5': `Pick **Server-Sent Events**:
- one-way token streams are exactly what SSE is for
- plain HTTP, so auth, caching and proxies just work
- automatic reconnects

WebSockets add a stateful connection you then have to scale and load-balance.`,
  'Haiku 5.5': `SSE. It's simpler, reconnects automatically, and chat tokens only flow one way. Use WebSockets if you need two-way realtime.`,
  'Open 70B': `Both work. SSE is easier for streaming text from server to client. WebSockets are bidirectional and better for interactive apps. Many chat apps use SSE with a separate POST for user messages.`,
};

let picked: string[] = MODELS.slice(0, 3).map((m) => m.id);

async function compare(api: ChatScriptApi, prompt: string) {
  const a = api.assistant();
  const models = MODELS.filter((m) => picked.includes(m.id));
  const answers: Answer[] = models.map((m) => ({ model: m.id, text: ANSWERS[m.id] ?? `On **${prompt}**: keep it simple, measure, then iterate.`, shown: 0, started: false, done: false, ttft: m.ttft, tps: m.tps, cost: m.cost }));
  const set = a.custom('compare', { answers: answers.map((x) => ({ ...x })), vote: null });
  // One clock for every column: each starts at its own TTFT, then advances at its own tokens/s.
  for (let t = 0; answers.some((x) => !x.done); t += 60) {
    answers.forEach((x) => {
      if (t < x.ttft || x.done) return;
      x.started = true;
      x.shown = Math.min(x.text.length, x.shown + Math.round(x.tps / 6));
      x.done = x.shown >= x.text.length;
    });
    set({ answers: answers.map((x) => ({ ...x })) });
    await api.sleep(60);
  }
  a.done();
}

async function intro(api: ChatScriptApi) {
  picked = MODELS.slice(0, 3).map((m) => m.id);
  await api.sleep(500);
  await api.user('SSE or WebSockets for streaming chat responses?', { type: true });
  await compare(api, 'SSE or WebSockets');
}

async function reply(api: ChatScriptApi, text: string) {
  await compare(api, text);
}

const modelOf = (id: string) => MODELS.find((m) => m.id === id)!;

function Column({ a, vote, best, onVote }: { a: Answer; vote: string | null; best: Record<string, string>; onVote: () => void }) {
  const m = modelOf(a.model);
  const won = vote === a.model;
  const lost = vote !== null && !won;
  return (
    <Frame className={cn('min-w-[260px] flex-1 transition-opacity duration-300', won && 'border-emerald-500/40 bg-emerald-500/10', lost && 'opacity-60')}>
      <FrameHeader icon={<span className="size-2.5 rounded-full" style={{ backgroundColor: m.color }} />} title={m.id}>
        {won ? <Badge tone="success"><Trophy /> Preferred</Badge> : <span className="text-caption-1-regular text-text-tertiary">{m.vendor}</span>}
      </FrameHeader>
      <FramePanel className="flex min-h-48 flex-1 flex-col px-3.5 py-3">
        {a.started ? <Markdown text={a.text.slice(0, a.shown)} streaming={!a.done} className="text-body-2-regular leading-6" /> : <AgentThinking label="Waiting for first token" small showTimer />}
      </FramePanel>
      <FrameFooter className="flex-wrap gap-x-3 gap-y-1 text-caption-1-regular text-text-tertiary tabular-nums [&_svg]:size-3.5">
        <span className={cn('flex items-center gap-1', best.ttft === a.model && 'text-emerald-600 dark:text-emerald-400')}>
          <Timer /> {a.started ? `${a.ttft} ms` : '—'}
        </span>
        <span className={cn('flex items-center gap-1', best.tps === a.model && 'text-emerald-600 dark:text-emerald-400')}>
          <Gauge /> {a.started ? `${a.tps} tok/s` : '—'}
        </span>
        <span className={cn('flex items-center gap-1', best.cost === a.model && 'text-emerald-600 dark:text-emerald-400')}>
          <Zap /> ${a.cost.toFixed(4)}
        </span>
        <span className="ms-auto flex items-center gap-0.5">
          {a.done && <CopyButton text={a.text} />}
          {a.done && vote === null && (
            <button type="button" onClick={onVote} className="flex h-7 items-center gap-1 rounded-lg border border-border-button-default bg-background-primary-default px-2 text-caption-1-medium text-text-primary shadow-xs transition-[scale] active:scale-95">
              <Crown className="size-3.5" /> Prefer
            </button>
          )}
        </span>
      </FrameFooter>
    </Frame>
  );
}

export default function ModelCompareTemplate() {
  const chat = useChatEngine({ intro, reply });
  const [models, setModels] = useState<string[]>(picked);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const empty = chat.messages.length === 0;

  const toggle = (id: string) =>
    setModels((cur) => {
      const next = cur.includes(id) ? (cur.length > 1 ? cur.filter((x) => x !== id) : cur) : [...cur, id];
      picked = next;
      return next;
    });

  const composer = (
    <Composer
      value={chat.draft}
      onChange={chat.setDraft}
      onSend={chat.send}
      onStop={chat.stop}
      busy={chat.busy}
      placeholder={`Send to ${models.length} models`}
      status={
        <>
          <span className="flex items-center gap-1">
            <Columns3 /> {models.length} models side by side
          </span>
          <span className="tabular-nums">{Object.keys(votes).length} votes</span>
        </>
      }
    />
  );

  return (
    <Canvas>
      <ChatSurface
        dep={chat.messages}
        empty={empty}
        width="max-w-[72rem]"
        header={
          <>
            <span className="grid size-7 place-items-center rounded-lg bg-text-primary text-background-primary-default">
              <Columns3 className="size-4" />
            </span>
            <span className="hidden text-headline-medium sm:inline">Compare</span>
            <div className="scrollbar-none ms-1 flex min-w-0 items-center gap-1 overflow-x-auto">
              {MODELS.map((m) => {
                const on = models.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(m.id)}
                    className={cn('flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-caption-1-medium transition-colors', on ? 'border-border-button-default bg-background-primary-default text-text-primary shadow-xs' : 'border-dashed border-border-button-default text-text-tertiary hover:text-text-secondary')}
                  >
                    <span className="size-2 rounded-full" style={{ backgroundColor: m.color, opacity: on ? 1 : 0.4 }} />
                    {m.id}
                    {on ? <X className="size-3 text-foreground-icon-tertiary" /> : <Plus className="size-3" />}
                  </button>
                );
              })}
            </div>
            <span className="ms-auto flex items-center gap-1">
              <HeaderTools />
              <HeaderButton outline onClick={chat.reset} className="hidden sm:flex">
                New
              </HeaderButton>
            </span>
          </>
        }
        footer={!empty && <div className="mx-auto w-full max-w-3xl">{composer}</div>}
      >
        {empty ? (
          <Welcome title="Which model answers best?" subtitle="Send one prompt to several models and compare speed, cost and quality.">
            <div className="mt-2 w-full max-w-2xl text-start">{composer}</div>
            <Suggestions className="justify-center" items={['Explain CRDTs in two sentences', 'Write a regex for ISO dates', 'Name a CLI for streaming logs']} onPick={chat.send} />
          </Welcome>
        ) : (
          chat.messages.map((m) => {
            if (m.role === 'user')
              return (
                <UserMessage key={m.id} onEdit={() => chat.setDraft(textOf(m))}>
                  {textOf(m)}
                </UserMessage>
              );
            const part = m.parts.find((p) => p.kind === 'custom' && p.type === 'compare');
            if (!part || part.kind !== 'custom') return <AgentThinking key={m.id} small />;
            const answers = part.data.answers as Answer[];
            const started = answers.filter((a) => a.started);
            const by = (k: 'ttft' | 'tps' | 'cost', min: boolean) => started.reduce<Answer | null>((b, a) => (!b || (min ? a[k] < b[k] : a[k] > b[k]) ? a : b), null)?.model ?? '';
            const best = { ttft: by('ttft', true), tps: by('tps', false), cost: by('cost', true) };
            return (
              <div key={m.id} className="scrollbar-thin -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
                {answers.map((a) => (
                  <Column key={a.model} a={a} vote={votes[m.id] ?? null} best={best} onVote={() => setVotes((v) => ({ ...v, [m.id]: a.model }))} />
                ))}
              </div>
            );
          })
        )}
        {Object.keys(votes).length > 0 && !chat.busy && (
          <p className="flex items-center justify-center gap-1.5 text-caption-1-regular text-text-tertiary">
            <Check className="size-3.5" /> Votes are saved to your leaderboard
          </p>
        )}
      </ChatSurface>
    </Canvas>
  );
}
