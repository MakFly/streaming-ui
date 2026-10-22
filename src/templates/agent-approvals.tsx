import { useState } from 'react';
import { Activity, Ban, Check, CircleAlert, Copy, GitCommitHorizontal, Pencil, Server, ShieldAlert, ShieldCheck, TerminalSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatEngine, type ChatScriptApi, type Message, type Part } from './kit/engine';
import { AssistantMessage, Badge, Canvas, ChatSurface, Composer, Surface, HeaderTools, UserMessage, textOf } from './kit/parts';

/* Agent Approvals — an on-call agent that reads metrics freely but stops before anything that changes
 * production (tool approvals in the thread, an agent-activity run console beside it). The script really waits:
 * Approve runs the rollback, Deny makes it back off; the right rail logs every step as a timeline. */

type Decision = 'approve' | 'deny' | null;
// Shared between the script and the approval card (each preview frame is its own document).
const gate: { decision: Decision } = { decision: null };

const ERRORS = [0.4, 0.5, 0.4, 0.6, 0.5, 0.7, 2.1, 4.8, 6.2, 5.9, 6.4, 6.1];
const RECOVERED = [6.1, 5.2, 3.0, 1.4, 0.8, 0.6, 0.5, 0.5];

async function waitForDecision(api: ChatScriptApi) {
  gate.decision = null;
  while (gate.decision === null) await api.sleep(120);
  return gate.decision;
}

async function incident(api: ChatScriptApi) {
  const a = api.assistant();
  await a.think('Investigating', ['Error rate on checkout-api eu-west is 6.2%, baseline 0.5%', 'Spike starts 14:05, right after deploy v2.14.3'], 520);
  await a.tool('Queried metrics', 'checkout-api · eu-west · 1h', { ms: 900, meta: 'p95 3.1s · 6.2% errors' });
  a.custom('chart', { points: ERRORS, label: 'Error rate · last hour' });
  await a.tool('Read deploy log', 'checkout-api', { ms: 700, meta: 'v2.14.3 at 14:04' });
  await a.stream('The spike lines up with **v2.14.3**, which changed the payment client timeout. Rolling back to **v2.14.2** is the fastest fix. This changes production, so I need your approval.', 30);
  const set = a.custom('approval', { status: 'pending', command: 'kubectl rollout undo deploy/checkout-api -n eu-west --to-revision=41' });
  const decision = await waitForDecision(api);
  set({ status: decision === 'approve' ? 'approved' : 'denied' });
  if (decision === 'deny') {
    await a.stream('Understood, nothing was changed. I can **scale the payment workers** instead, or page the owner of v2.14.3. Which do you prefer?', 30);
    a.done();
    return;
  }
  await a.tool('Ran', 'kubectl rollout undo …', { ms: 600, lineMs: 220, meta: 'rolled back', output: ['deployment.apps/checkout-api rolled back', 'Waiting for rollout: 2 of 6 updated replicas…', 'Waiting for rollout: 4 of 6 updated replicas…', 'deployment "checkout-api" successfully rolled out'] });
  await a.tool('Verified', 'error rate · 5 min', { ms: 1000, meta: '0.5% · recovered' });
  a.custom('chart', { points: RECOVERED, label: 'Error rate · since rollback', ok: true });
  await a.stream('Recovered: errors are back to **0.5%** and p95 to 240 ms. I opened **INC-2193** with the timeline and pinned v2.14.3 so it is not redeployed.', 30);
  a.done();
}

async function intro(api: ChatScriptApi) {
  await api.sleep(500);
  await api.user('Checkout is failing in eu-west, can you look?', { type: true });
  await incident(api);
}

async function reply(api: ChatScriptApi, text: string) {
  if (/scale|worker/i.test(text)) {
    const a = api.assistant();
    await a.think('Planning', ['Scaling is reversible but still a production change'], 450);
    const set = a.custom('approval', { status: 'pending', command: 'kubectl scale deploy/payment-worker -n eu-west --replicas=12' });
    const decision = await waitForDecision(api);
    set({ status: decision === 'approve' ? 'approved' : 'denied' });
    if (decision === 'approve') await a.tool('Ran', 'kubectl scale …', { ms: 700, meta: '12 replicas' });
    await a.stream(decision === 'approve' ? 'Scaled to 12 workers. I will watch the error rate for the next 10 minutes.' : 'Okay, I will leave it as is.', 30);
    a.done();
    return;
  }
  await incident(api);
}

function Sparkline({ points, label, ok }: { points: number[]; label: string; ok?: boolean }) {
  const max = 7;
  const w = 280;
  const h = 56;
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${(i / (points.length - 1)) * w},${h - (p / max) * h}`).join(' ');
  const color = ok ? '#10b981' : '#ef4444';
  return (
    <div className="tpl-reveal flex w-full max-w-sm flex-col gap-1.5 rounded-xl border border-border-button-default bg-background-primary-default p-3 shadow-xs">
      <div className="flex items-center justify-between text-caption-1-medium">
        <span className="text-text-secondary">{label}</span>
        <span className="tabular-nums" style={{ color }}>
          {points[points.length - 1]}%
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full overflow-visible" preserveAspectRatio="none">
        <line x1="0" x2={w} y1={h - (1 / max) * h} y2={h - (1 / max) * h} className="stroke-separator-border" strokeDasharray="4 4" />
        <path d={`${d} L${w},${h} L0,${h} Z`} fill={color} opacity={0.08} />
        <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

/**
 * The approval card: what will run, why it is gated, and the three ways out. A neutral card like the rest of the
 * thread; the warning colour stays in two small places (the icon and the dot in the grey Production pill), so
 * it never turns muddy over grey. Once decided, the same card keeps the command and swaps the actions for a
 * quiet verdict line.
 */
function Approval({ status, command, onDecide }: { status: string; command: string; onDecide: (d: 'approve' | 'deny') => void }) {
  const pending = status === 'pending';
  const approved = status === 'approved';
  const [copied, setCopied] = useState(false);
  return (
    <div className="tpl-reveal overflow-hidden rounded-xl border border-border-button-default bg-background-primary-default shadow-xs">
      <div className="flex items-center gap-2 px-3.5 pt-3 pb-2">
        {pending ? (
          <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        ) : approved ? (
          <ShieldCheck className="size-4 shrink-0 text-foreground-icon-secondary" />
        ) : (
          <Ban className="size-4 shrink-0 text-foreground-icon-secondary" />
        )}
        <span className="text-body-2-semibold text-text-primary">{pending ? 'Approval needed' : approved ? 'Rollback approved' : 'Rollback denied'}</span>
        {pending && (
          <span className="ms-auto flex items-center gap-1.5 rounded-full border border-border-button-default bg-background-secondary-default px-2 py-px text-caption-1-medium text-text-secondary">
            <span className="size-1.5 rounded-full bg-amber-500" /> Production
          </span>
        )}
      </div>

      {/* The command, recessed and neutral. */}
      <div className="group/cmd mx-3 flex items-start gap-2 rounded-lg bg-background-secondary-default px-3 py-2 font-mono text-[12.5px] leading-5">
        <span className="select-none text-text-tertiary">$</span>
        <code className="min-w-0 flex-1 break-all text-text-primary">{command}</code>
        <button
          type="button"
          aria-label={copied ? 'Copied' : 'Copy command'}
          onClick={() => {
            void navigator.clipboard?.writeText(command).catch(() => {});
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1400);
          }}
          className="-me-1 grid size-5 shrink-0 place-items-center rounded-md text-foreground-icon-tertiary opacity-0 transition-opacity group-hover/cmd:opacity-100 hover:text-foreground-icon-primary focus-visible:opacity-100"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>

      <ul className="flex flex-col gap-1 px-3.5 py-2.5 text-body-2-regular text-text-secondary dark:text-neutral-400">
        <li className="flex items-center gap-2">
          <Server className="size-3.5 shrink-0 text-foreground-icon-tertiary" /> 6 pods in eu-west, rolling, no downtime
        </li>
        <li className="flex items-center gap-2">
          <GitCommitHorizontal className="size-3.5 shrink-0 text-foreground-icon-tertiary" /> Reverts the payment client timeout change
        </li>
      </ul>

      <div className="flex min-h-11 flex-wrap items-center gap-2 border-t border-separator-border px-3 py-2">
        {pending ? (
          <>
            <span className="flex items-center gap-1.5 text-caption-1-regular text-text-tertiary dark:text-neutral-500">
              <span className="size-1.5 rounded-full bg-amber-500 motion-safe:animate-pulse" /> The agent is paused
            </span>
            <span className="ms-auto flex items-center gap-1.5">
              <button type="button" className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-body-2-medium text-text-secondary transition-colors hover:bg-background-tertiary-default hover:text-text-primary dark:hover:bg-background-primary-hover">
                <Pencil className="size-3.5" /> Edit
              </button>
              <button type="button" onClick={() => onDecide('deny')} className="flex h-8 items-center gap-1.5 rounded-lg border border-border-button-default bg-background-primary-default px-3 text-body-2-medium text-text-primary shadow-xs transition-[background-color,scale] hover:bg-background-primary-hover active:scale-[0.97]">
                <X className="size-4" /> Deny
              </button>
              <button type="button" onClick={() => onDecide('approve')} className="flex h-8 items-center gap-1.5 rounded-lg bg-text-primary px-3 text-body-2-medium text-background-primary-default shadow-xs transition-[opacity,scale] hover:opacity-90 active:scale-[0.97]">
                <Check className="size-4" /> Approve
              </button>
            </span>
          </>
        ) : (
          <span className="flex items-center gap-1.5 text-caption-1-regular text-text-tertiary">
            {approved ? <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" /> : <X className="size-3.5 text-red-600 dark:text-red-400" />}
            {approved ? 'Approved by you · 14:09' : 'Denied by you · 14:09'}
          </span>
        )}
      </div>
    </div>
  );
}

type Event = { t: string; text: string; tone: 'neutral' | 'warning' | 'success' | 'danger' | 'info' };

/** Timeline of what the agent did, built from the conversation's parts. */
function RunLog({ messages }: { messages: Message[] }) {
  const events: Event[] = [];
  let minute = 6;
  const at = () => `14:${String(minute++).padStart(2, '0')}`;
  for (const m of messages)
    for (const p of m.parts) {
      if (p.kind === 'tool') events.push({ t: at(), text: `${p.name} ${p.arg ?? ''}`, tone: p.status === 'running' ? 'info' : 'neutral' });
      if (p.kind === 'custom' && p.type === 'approval') {
        const s = String(p.data.status);
        events.push({ t: at(), text: s === 'pending' ? 'Waiting for approval' : s === 'approved' ? 'Approved by Alex' : 'Denied by Alex', tone: s === 'pending' ? 'warning' : s === 'approved' ? 'success' : 'danger' });
      }
    }
  const dot = { neutral: 'border-foreground-icon-quaternary', info: 'border-blue-500 bg-blue-500/20', warning: 'border-amber-500 bg-amber-500/20', success: 'border-emerald-500 bg-emerald-500', danger: 'border-red-500 bg-red-500' };
  return (
    <ol className="flex flex-col">
      {events.map((e, i) => (
        <li key={i} className="tpl-reveal relative flex gap-3 pb-4 last:pb-0">
          {i < events.length - 1 && <span className="absolute start-[7px] top-5 bottom-0 w-px bg-separator-border" />}
          <span className={cn('relative mt-1 size-[15px] shrink-0 rounded-full border-2 bg-background-secondary-default', dot[e.tone])} />
          <span className="flex min-w-0 flex-col">
            <span className="font-mono text-caption-2-regular text-text-tertiary">{e.t}</span>
            <span className="truncate text-body-2-regular text-text-primary">{e.text}</span>
          </span>
        </li>
      ))}
      {events.length === 0 && <li className="text-body-2-regular text-text-tertiary">No activity yet.</li>}
    </ol>
  );
}

export default function AgentApprovalsTemplate() {
  const chat = useChatEngine({ intro, reply });
  const [readOnlyAuto, setReadOnlyAuto] = useState(true);
  const pending = chat.messages.some((m) => m.parts.some((p) => p.kind === 'custom' && p.type === 'approval' && p.data.status === 'pending'));

  const decide = (d: 'approve' | 'deny') => {
    gate.decision = d;
  };

  const renderCustom = (p: Extract<Part, { kind: 'custom' }>) => {
    if (p.type === 'chart') return <Sparkline points={p.data.points as number[]} label={String(p.data.label)} ok={Boolean(p.data.ok)} />;
    if (p.type === 'approval') return <Approval status={String(p.data.status)} command={String(p.data.command)} onDecide={decide} />;
    return null;
  };

  return (
    <Canvas>
      <ChatSurface
        dep={chat.messages}
        width="max-w-[46rem]"
        header={
          <>
            <span className="grid size-7 place-items-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
              <CircleAlert className="size-4" />
            </span>
            <span className="truncate text-headline-medium">checkout-api errors · eu-west</span>
            <Badge tone={pending ? 'warning' : 'danger'} dot className="hidden sm:inline-flex">
              {pending ? 'Awaiting you' : 'SEV-2'}
            </Badge>
            <span className="ms-auto">
              <HeaderTools />
            </span>
          </>
        }
        footer={
          <Composer
            variant="panel"
            value={chat.draft}
            onChange={chat.setDraft}
            onSend={chat.send}
            onStop={chat.stop}
            busy={chat.busy && !pending}
            placeholder={pending ? 'Approve or deny above, or tell the agent what to do instead' : 'Ask the on-call agent'}
            status={
              <>
                <span className="flex items-center gap-1">
                  <ShieldCheck /> Read-only actions run without asking
                </span>
                <span className="flex items-center gap-1">
                  <Activity /> prod · eu-west
                </span>
              </>
            }
          />
        }
      >
        {chat.messages.map((m, i) =>
          m.role === 'user' ? (
            <UserMessage key={m.id} onEdit={() => chat.setDraft(textOf(m))}>
              {textOf(m)}
            </UserMessage>
          ) : (
            <AssistantMessage key={m.id} message={m} isLast={i === chat.messages.length - 1} renderCustom={renderCustom} toolIcon={(n) => (n === 'Ran' ? <TerminalSquare /> : <Activity />)} />
          ),
        )}
      </ChatSurface>

      <Surface className="hidden h-full w-[300px] shrink-0 gap-5 p-4 xl:flex">
        <div className="flex flex-col gap-3">
          <span className="text-headline-semibold">Permissions</span>
          {[
            ['Read metrics and logs', 'Always allowed', true, () => {}],
            ['Auto-approve read-only tools', 'Queries, reads, dry runs', readOnlyAuto, () => setReadOnlyAuto((v) => !v)],
            ['Change production', 'Ask every time', false, () => {}],
          ].map(([t, s, on, toggle]) => (
            <button key={String(t)} type="button" onClick={toggle as () => void} className="flex items-center gap-3 rounded-2xl bg-background-primary-default px-3 py-2.5 text-start shadow-xs">
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-body-2-medium">{String(t)}</span>
                <span className="text-caption-1-regular text-text-tertiary">{String(s)}</span>
              </span>
              <span className={cn('relative h-5 w-9 shrink-0 rounded-full transition-colors', on ? 'bg-emerald-500' : 'bg-background-quaternary-default')}>
                <span className={cn('absolute top-0.5 size-4 rounded-full bg-white shadow-xs transition-[left]', on ? 'left-[18px]' : 'left-0.5')} />
              </span>
            </button>
          ))}
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <span className="flex items-center gap-2 text-headline-semibold">
            Run log <Badge tone="neutral">live</Badge>
          </span>
          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
            <RunLog messages={chat.messages} />
          </div>
        </div>
      </Surface>
    </Canvas>
  );
}
