import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, CheckCheck, CircleCheck, CornerDownLeft, CreditCard, ListFilter, Lock, Mail, Paperclip, RefreshCw, Send, Sparkles, Tag, UserRound, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatEngine, type ChatScriptApi, type Part } from './kit/engine';
import { CopyButton } from './kit/markdown';
import { AssistantMessage, Avatar, Badge, Canvas, ChatSurface, Composer, Frame, FrameFooter, FrameHeader, FramePanel, HeaderButton, IconButton, Surface, HeaderTools, UserMessage, paneIn, textOf } from './kit/parts';

/* Support Copilot — a help desk in three rounded cards: inbox, the customer thread (message bubbles
 * with bottom-anchored avatars) and the copilot. The copilot reads the ticket, checks billing and the help
 * center, then drafts a reply in a frame you can insert, shorten and send. */

const TICKETS = [
  { name: 'Maya Chen', subject: 'Charged twice for the Pro plan', preview: 'Hi, I just noticed two charges of $24…', time: '2m', priority: 'urgent', unread: true },
  { name: 'Jonas Weber', subject: 'SSO login loops back to sign-in', preview: 'Every time I sign in with Okta it…', time: '18m', priority: 'high', unread: true },
  { name: 'Priya Nair', subject: 'Export to CSV is missing columns', preview: 'The export only has 6 of the 9…', time: '1h', priority: 'normal', unread: false },
  { name: 'Lucas Martin', subject: 'Can I move seats between teams?', preview: 'We are reorganising and would like…', time: '3h', priority: 'normal', unread: false },
  { name: 'Sara Ali', subject: 'Invoice needs our VAT number', preview: 'Could you re-issue the March invoice…', time: '5h', priority: 'low', unread: false },
];

const PRIORITY = {
  urgent: { tone: 'danger', label: 'Urgent' },
  high: { tone: 'warning', label: 'High' },
  normal: { tone: 'neutral', label: 'Normal' },
  low: { tone: 'neutral', label: 'Low' },
} as const;

type Thread = { from: 'customer' | 'agent'; text: string; time: string };
const THREAD: Thread[] = [
  { from: 'customer', text: 'Hi, I just noticed two charges of $24 on my card for the Pro plan this morning. I only have one workspace. Can you refund the duplicate?', time: '9:41' },
  { from: 'customer', text: 'The second one says "ACME* PRO 7731". Screenshot attached.', time: '9:42' },
];

const DRAFT = `Hi Maya, thanks for the screenshot. You're right: the upgrade retried after a card timeout and created a second charge of $24. I've refunded the duplicate (ref. RF-7731); it will show on your statement within 5–10 business days. Your Pro plan stays active and nothing else changes. Sorry for the hassle!`;

async function intro(api: ChatScriptApi) {
  await api.sleep(700);
  const a = api.assistant();
  await a.think('Reading the conversation', ['Customer reports a duplicate $24 charge', 'One workspace, one Pro subscription'], 550);
  await a.tool('Checked billing', 'maya.chen@lumen.io', { ms: 900, meta: '2 charges · 1 retry' });
  await a.tool('Searched help center', 'duplicate charge refund', { ms: 800, meta: '3 articles' });
  await a.stream(
    `**Summary** — Maya was charged twice ($24) when her Pro upgrade retried after a card timeout. One subscription is active, so the second charge is a duplicate.

**Suggested action** — refund charge \`ch_7731\` and reply with the refund reference.`,
    30,
  );
  const setDraft = a.custom('draft', { text: DRAFT, shown: 0 });
  for (let i = 0; i <= DRAFT.length; i += 6) {
    setDraft({ shown: i });
    await api.sleep(30);
  }
  setDraft({ shown: DRAFT.length, done: true });
  a.custom('kb', { items: ['Refunding a duplicate charge', 'Why payments are retried', 'Refund timelines by bank'] });
  a.done();
}

async function reply(api: ChatScriptApi, text: string) {
  const a = api.assistant();
  await a.think('Thinking', ['Checking the ticket and billing history'], 600);
  await a.stream(
    /tone|short|shorter|friend/i.test(text)
      ? `Shorter version:\n\n> Hi Maya, sorry about that! The duplicate $24 charge is refunded (RF-7731) and should appear in 5–10 business days.`
      : `Here's what I found for **${text.replace(/[*`]/g, '')}**: the account has one active Pro subscription, no other open tickets, and a 4.8 CSAT history. Nothing blocks the refund.`,
    30,
  );
  a.done();
}

function Inbox({ onPick }: { onPick?: () => void }) {
  const [filter, setFilter] = useState('Open');
  return (
    <Surface className="h-full w-[300px] shrink-0">
      <div className="flex h-12 shrink-0 items-center gap-2 px-4">
        <span className="text-headline-semibold">Inbox</span>
        <Badge tone="neutral">12</Badge>
        <IconButton label="Filter" className="ms-auto">
          <ListFilter />
        </IconButton>
      </div>
      <div className="px-3 pb-2">
        <div role="tablist" className="flex rounded-[10px] bg-background-tertiary-default p-0.5">
          {[['Open', 12], ['Mine', 5], ['Urgent', 1]].map(([f, n]) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(String(f))}
              className={cn('flex h-7 flex-1 items-center justify-center gap-1.5 rounded-lg text-caption-1-medium transition-colors', filter === f ? 'bg-background-primary-default text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary')}
            >
              {f} <span className="text-text-tertiary tabular-nums">{n}</span>
            </button>
          ))}
        </div>
      </div>
      <ul className="scrollbar-thin flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
        {TICKETS.filter((t) => filter !== 'Urgent' || t.priority === 'urgent').map((t, i) => {
          const p = PRIORITY[t.priority as keyof typeof PRIORITY];
          const on = i === 0;
          return (
            <li key={t.name}>
              <button
                type="button"
                onClick={onPick}
                className={cn('flex w-full gap-3 rounded-2xl p-2.5 text-start transition-colors', on ? 'bg-background-primary-default shadow-xs' : 'hover:bg-background-secondary-hover')}
              >
                <Avatar label={t.name} className="size-8" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className={cn('truncate text-body-2-semibold', t.unread ? 'text-text-primary' : 'text-text-secondary')}>{t.name}</span>
                    {t.unread && <span className="size-1.5 shrink-0 rounded-full bg-accent-500" />}
                    <span className="ms-auto shrink-0 text-caption-1-regular text-text-tertiary">{t.time}</span>
                  </span>
                  <span className="truncate text-body-2-medium text-text-primary">{t.subject}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="min-w-0 flex-1 truncate text-caption-1-regular text-text-tertiary">{t.preview}</span>
                    {t.priority !== 'normal' && t.priority !== 'low' && <Badge tone={p.tone} className="h-[18px] px-1 text-[10.5px]">{p.label}</Badge>}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}

/** Marker: a centred label between hairlines. */
const isMac = () => typeof navigator !== 'undefined' && /Mac|iP(hone|ad|od)/.test(navigator.platform);

const Marker = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 text-caption-1-medium text-text-tertiary">
    <span className="h-px flex-1 bg-separator-border" />
    {children}
    <span className="h-px flex-1 bg-separator-border" />
  </div>
);

/** Message + Bubble: avatar anchored to the bottom, the row flips for your own replies. */
function Bubble({ m }: { m: Thread }) {
  const mine = m.from === 'agent';
  return (
    <div className={cn('animate-in fade-in-0 slide-in-from-bottom-1 flex items-end gap-2 duration-300', mine && 'flex-row-reverse')}>
      {mine ? <Avatar label="Alex Rivera" className="size-7" color="#0f172a" /> : <Avatar label="Maya Chen" className="size-7" />}
      <div className={cn('flex max-w-[80%] flex-col gap-1', mine && 'items-end')}>
        <span className="px-1 text-caption-1-medium text-text-tertiary">
          {mine ? 'You' : 'Maya Chen'} · {m.time}
        </span>
        <div className={cn('rounded-2xl px-3.5 py-2.5 text-body-2-regular leading-6', mine ? 'rounded-ee-md bg-accent-500 text-white' : 'rounded-es-md bg-background-primary-default text-text-primary shadow-card')}>{m.text}</div>
        {mine && (
          <span className="flex items-center gap-1 px-1 text-caption-2-regular text-text-tertiary">
            <CheckCheck className="size-3" /> Delivered
          </span>
        )}
      </div>
    </div>
  );
}

function CustomerCard() {
  const rows: [React.ReactNode, string, React.ReactNode][] = [
    [<CreditCard key="c" />, 'Plan', <Badge key="p" tone="purple">Pro · monthly</Badge>],
    [<UserRound key="u" />, 'Customer since', 'Mar 2023'],
    [<Tag key="t" />, 'Lifetime value', '$1,152'],
  ];
  return (
    <Frame className="tpl-reveal">
      <FrameHeader icon={<UserRound />} title="Maya Chen">
        <span className="text-caption-1-regular text-text-tertiary">Lumen</span>
      </FrameHeader>
      <FramePanel>
        <dl className="flex flex-col divide-y divide-separator-border">
          {rows.map(([icon, k, v]) => (
            <div key={k} className="flex items-center gap-2 px-3 py-2 text-body-2-regular">
              <span className="text-foreground-icon-tertiary [&_svg]:size-3.5">{icon}</span>
              <dt className="text-text-secondary">{k}</dt>
              <dd className="ms-auto text-text-primary tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </FramePanel>
    </Frame>
  );
}

export default function SupportCopilotTemplate() {
  const copilot = useChatEngine({ intro, reply });
  const [thread, setThread] = useState<Thread[]>(THREAD);
  const [replyText, setReplyText] = useState('');
  const [mode, setMode] = useState<'reply' | 'note'>('reply');
  const [pane, setPane] = useState<'ticket' | 'copilot'>('ticket');
  const [resolved, setResolved] = useState(false);

  // After the agent sends, the customer answers (a small touch that closes the loop).
  useEffect(() => {
    if (thread[thread.length - 1]?.from !== 'agent') return;
    const id = setTimeout(() => setThread((t) => [...t, { from: 'customer', text: 'That was fast, thank you! 🙏', time: 'now' }]), 2200);
    return () => clearTimeout(id);
  }, [thread]);

  const [sendKeys] = useState(() => (isMac() ? '⌘↵' : 'Ctrl ↵'));
  const send = () => {
    if (!replyText.trim()) return;
    setThread((t) => [...t, { from: 'agent', text: replyText.trim(), time: 'now' }]);
    setReplyText('');
  };

  const renderCustom = (p: Extract<Part, { kind: 'custom' }>) => {
    if (p.type === 'draft') {
      const text = String(p.data.text);
      const shown = Number(p.data.shown);
      return (
        <Frame>
          <FrameHeader icon={<Wand2 />} title="Suggested reply">
            {!p.data.done ? <Badge tone="info">Writing…</Badge> : <Badge tone="success">Ready</Badge>}
          </FrameHeader>
          <FramePanel>
            <p className="px-3 py-2.5 text-body-2-regular leading-6 text-text-primary">
              {text.slice(0, shown)}
            </p>
          </FramePanel>
          {Boolean(p.data.done) && (
            <FrameFooter className="animate-in fade-in-0 duration-300">
              <button
                type="button"
                onClick={() => {
                  setReplyText(text);
                  setMode('reply');
                  setPane('ticket');
                }}
                className="flex h-7 items-center gap-1.5 rounded-lg bg-text-primary px-2.5 text-caption-1-medium text-background-primary-default shadow-xs"
              >
                <CornerDownLeft className="size-3.5" /> Insert
              </button>
              <button type="button" onClick={() => copilot.send('Make it shorter and friendlier')} className="flex h-7 items-center gap-1.5 rounded-lg border border-border-button-default bg-background-primary-default px-2.5 text-caption-1-medium text-text-secondary transition-colors hover:text-text-primary">
                <RefreshCw className="size-3.5" /> Shorter
              </button>
              <CopyButton text={text} className="ms-auto" />
            </FrameFooter>
          )}
        </Frame>
      );
    }
    if (p.type === 'kb')
      return (
        <div className="tpl-reveal flex flex-col gap-1">
          <span className="pb-1 text-caption-1-medium text-text-tertiary">From the help center</span>
          {(p.data.items as string[]).map((k) => (
            <a key={k} href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-body-2-regular text-text-secondary transition-colors hover:bg-background-secondary-hover hover:text-text-primary">
              <BookOpen className="size-3.5 shrink-0 text-foreground-icon-tertiary" /> {k}
            </a>
          ))}
        </div>
      );
    return null;
  };

  return (
    <Canvas>
      <aside className="hidden xl:flex">
        <Inbox />
      </aside>

      <ChatSurface
        className={cn(pane === 'copilot' ? 'hidden md:flex' : paneIn.mdStart)}
        dep={thread}
        width="max-w-[680px]"
        header={
          <>
            <Avatar label="Maya Chen" className="size-7" />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-body-2-semibold">Charged twice for the Pro plan</span>
              <span className="truncate text-caption-1-regular text-text-tertiary">Maya Chen · #4821 · via email</span>
            </div>
            <span className="ms-auto flex items-center gap-1.5">
              {resolved ? <Badge tone="success" dot>Resolved</Badge> : <Badge tone="danger" dot className="hidden sm:inline-flex">Urgent</Badge>}
              <HeaderTools />
              <HeaderButton outline onClick={() => setResolved((r) => !r)} className="hidden sm:flex">
                <CircleCheck /> {resolved ? 'Reopen' : 'Resolve'}
              </HeaderButton>
              <HeaderButton outline onClick={() => setPane('copilot')} className="md:hidden">
                <Sparkles className="text-accent-500" /> Copilot
              </HeaderButton>
            </span>
          </>
        }
        footer={
          <div className="flex flex-col rounded-[22px] border border-border-button-default bg-background-primary-default shadow-xs">
            <div className="flex items-center gap-1 px-2 pt-2">
              {([['reply', 'Reply', Mail], ['note', 'Internal note', Lock]] as const).map(([k, l, I]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setMode(k)}
                  className={cn('flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-caption-1-medium transition-colors', mode === k ? (k === 'note' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-background-tertiary-default text-text-primary') : 'text-text-tertiary hover:text-text-secondary')}
                >
                  <I className="size-3.5" /> {l}
                </button>
              ))}
              <span className="ms-auto pe-1 text-caption-1-regular text-text-tertiary">to maya.chen@lumen.io</span>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              // An email reply: Enter starts a new line, Ctrl/⌘ + Enter sends (as in a help desk).
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={mode === 'reply' ? 'Write a reply, or insert the copilot draft' : 'Only your team sees internal notes'}
              className="scrollbar-thin resize-none bg-transparent px-4 py-2 text-body-2-regular leading-6 text-text-primary outline-none placeholder:text-text-tertiary"
            />
            <div className="flex items-center gap-1 px-2 pb-2">
              <IconButton label="Attach file">
                <Paperclip />
              </IconButton>
              <button type="button" onClick={() => setPane('copilot')} className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-caption-1-medium text-accent-500 transition-colors hover:bg-accent-500/10">
                <Sparkles className="size-3.5" /> Ask Copilot
              </button>
              <button type="button" onClick={send} disabled={!replyText.trim()} title={`Send (${sendKeys})`} aria-keyshortcuts={isMac() ? 'Meta+Enter' : 'Control+Enter'} className="ms-auto flex h-8 items-center gap-1.5 rounded-full bg-text-primary ps-3.5 pe-3 text-body-2-medium text-background-primary-default transition-opacity disabled:opacity-30">
                Send
                {/* The shortcut, where there is a keyboard to press it. */}
                <kbd className="hidden rounded-md bg-background-primary-default/15 px-1.5 font-sans text-caption-2-medium text-background-primary-default/75 sm:inline">{sendKeys}</kbd>
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        }
      >
        <Marker>Today</Marker>
        {thread.map((m, i) => (
          <Bubble key={i} m={m} />
        ))}
      </ChatSurface>

      <ChatSurface
        className={cn('md:max-w-[360px] xl:max-w-[380px]', pane === 'copilot' ? cn('flex', paneIn.mdEnd) : 'hidden md:flex')}
        dep={copilot.messages}
        width="max-w-none"
        columnClassName="gap-5 px-3"
        header={
          <>
            <IconButton label="Back to ticket" onClick={() => setPane('ticket')} className="md:hidden">
              <ArrowLeft />
            </IconButton>
            <span className="grid size-6 place-items-center rounded-lg bg-accent-500/10 text-accent-500">
              <Sparkles className="size-3.5" />
            </span>
            <span className="text-headline-medium">Copilot</span>
            <Badge tone="outline" className="ms-auto">
              Ticket #4821
            </Badge>
          </>
        }
        footer={<Composer variant="dock" reply={copilot.replyTo} onClearReply={copilot.clearReply} value={copilot.draft} onChange={copilot.setDraft} onSend={copilot.send} onStop={copilot.stop} busy={copilot.busy} placeholder="Ask Copilot" />}
      >
        <CustomerCard />
        {copilot.messages.map((m, i) =>
          m.role === 'user' ? (
            <UserMessage key={m.id} replyTo={m.replyTo}>{textOf(m)}</UserMessage>
          ) : (
            <AssistantMessage
              key={m.id}
              message={m}
              isLast={i === copilot.messages.length - 1}
              renderCustom={renderCustom}
              actions={false}
              onReply={(r) => copilot.startReply({ ...r, label: 'Copilot' })}
              textClassName="text-body-2-regular leading-6"
              toolIcon={(n) => (n.includes('help') ? <BookOpen /> : <CreditCard />)}
            />
          ),
        )}
      </ChatSurface>
    </Canvas>
  );
}
