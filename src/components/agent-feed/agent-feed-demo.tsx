import { useEffect, useState } from 'react';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Bloub, type ColorId } from '@/templates/kit/bloub';
import { AgentFeed, AgentFeedHeader, AgentFeedRow } from './agent-feed';
import type { AgentFeedAgent, AgentFeedItem } from './types';

/* The docs demo: four agents research a question, one beat at a time, then the run folds into
 * "Thought for Ns". Clicking it lists the whole run. Replay starts over. */

const avatar = (color: ColorId, name: string) => <Bloub size={28} color={color} label={name} className="-m-[5px] block max-w-none" />;

const AGENTS: AgentFeedAgent[] = [
  { id: 'lead', name: 'Lead', role: 'Coordinator', avatar: avatar('violet', 'Lead') },
  { id: 'a1', name: 'Agent 1', avatar: avatar('vert', 'Agent 1') },
  { id: 'a2', name: 'Agent 2', avatar: avatar('bleu', 'Agent 2') },
  { id: 'a3', name: 'Agent 3', avatar: avatar('turquoise', 'Agent 3') },
];

type NewItem = AgentFeedItem extends infer F ? (F extends AgentFeedItem ? Omit<F, 'id'> : never) : never;
type Beat = { at: number; join?: string } | { at: number; item: NewItem; settle?: boolean };

const SCRIPT: Beat[] = [
  { at: 900, join: 'lead' },
  { at: 150, join: 'a1' },
  { at: 150, join: 'a2' },
  { at: 150, join: 'a3' },
  { at: 300, item: { kind: 'status', text: 'Comparing streaming transports for a chat UI' } },
  { at: 1000, item: { kind: 'search', agent: 'a1', query: 'SSE vs WebSocket for LLM streaming', results: 12, sources: [{ name: 'MDN', color: '#1b1b1b' }, { name: 'web.dev', color: '#1a73e8' }, { name: 'Vercel', color: '#000' }] }, settle: true },
  { at: 1200, item: { kind: 'message', agent: 'a1', text: 'SSE wins for one-way token streams: plain HTTP, automatic reconnect, and Last-Event-ID to resume.' } },
  { at: 1200, item: { kind: 'visit', agent: 'a2', url: 'developer.mozilla.org/docs/Web/API/EventSource' } },
  { at: 1000, item: { kind: 'message', agent: 'a2', text: 'Checked the spec: reconnect waits for the retry field, 3 seconds by default.' } },
  { at: 1200, item: { kind: 'message', agent: 'lead', text: 'Good. Agent 3, any case where a WebSocket is worth it?' } },
  { at: 1300, item: { kind: 'message', agent: 'a3', text: 'Only when the client talks back mid-stream, like voice or live tool approvals.' } },
  { at: 1000, item: { kind: 'status', text: 'Writing the final answer' } },
  { at: 1400 },
];

function useRun(run: number) {
  const [joined, setJoined] = useState<AgentFeedAgent[]>([]);
  const [items, setItems] = useState<AgentFeedItem[]>([]);
  const [started, setStarted] = useState(() => Date.now());
  const [seconds, setSeconds] = useState<number | null>(null);

  useEffect(() => {
    const t0 = Date.now();
    setJoined([]);
    setItems([]);
    setStarted(t0);
    setSeconds(null);
    const timers: ReturnType<typeof setTimeout>[] = [];
    let at = 0;
    SCRIPT.forEach((beat, i) => {
      at += beat.at;
      timers.push(
        setTimeout(() => {
          if ('join' in beat && beat.join) setJoined((j) => [...j, AGENTS.find((a) => a.id === beat.join)!]);
          else if ('item' in beat) {
            const id = `i${i}`;
            setItems((list) => [...list, { ...beat.item, id, ...(beat.settle && { pending: true }) } as AgentFeedItem]);
            if (beat.settle) timers.push(setTimeout(() => setItems((list) => list.map((x) => (x.id === id ? { ...x, pending: false } : x))), 700));
          } else setSeconds(Math.max(1, Math.round((Date.now() - t0) / 1000)));
        }, at),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [run]);

  return { joined, items, started, seconds, running: seconds === null };
}

export function AgentFeedDemo() {
  const [run, setRun] = useState(0);
  const [open, setOpen] = useState(false);
  const { joined, items, started, seconds, running } = useRun(run);
  return (
    <div className="relative flex min-h-[327px] flex-col rounded-3xl border border-border-component-detail-container p-8 max-sm:p-4">
      <Button
        size="sm"
        className="absolute end-4 top-4"
        onClick={() => {
          setOpen(false);
          setRun((n) => n + 1);
        }}
      >
        <Icon name="refresh-line" className="size-4" />
        Replay
      </Button>
      <div className="flex w-full max-w-[560px] flex-col pt-10">
        <AgentFeedHeader agents={joined} running={running} started={started} seconds={seconds ?? undefined} onOpen={() => setOpen((o) => !o)} />
        <AgentFeed items={items} running={running} renderItem={(it) => <AgentFeedRow item={it} agents={AGENTS} />} />
        {!running && open && (
          <div className="tpl-stream-in mt-3 flex flex-col gap-2 border-s border-separator-border ps-4">
            {items.map((it) => (
              <AgentFeedRow key={it.id} item={it} agents={AGENTS} full />
            ))}
          </div>
        )}
        {!running && (
          <p className="tpl-stream-in mt-3 text-body-regular text-text-primary">
            Use Server-Sent Events: one long response, automatic reconnect, and a resume point. Reach for a WebSocket only when the client must talk back mid-stream.
          </p>
        )}
      </div>
    </div>
  );
}
