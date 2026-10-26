import { useCallback, useState } from 'react';
import { Ellipsis, Globe, Menu, PanelLeft, Search, Share, Sparkles, SquarePen, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatEngine, type ChatScriptApi } from './kit/engine';
import { AssistantMessage, Avatar, ChatSurface, Canvas, Composer, HeaderButton, IconButton, Drawer, ModelPicker, SideRail, Suggestions, Surface, HeaderTools, UserMessage, Welcome, textOf } from './kit/parts';

/* Assistant — a general-purpose chat app laid out as an agent chat: a history rail and the chat
 * as rounded cards on the canvas. The thread keeps answers bubble-less, with an action bar,
 * edit beside your own messages, reasoning that folds to "Thought for Ns", scroll-to-bottom. */

const HISTORY: { group: string; items: { t: string; time: string; unread?: boolean }[] }[] = [
  { group: 'Today', items: [{ t: 'Streaming vs polling for chat', time: 'now' }, { t: 'Rename the billing events', time: '2h', unread: true }] },
  { group: 'Yesterday', items: [{ t: 'Postgres index for search', time: '1d' }, { t: 'Weekly update for the team', time: '1d' }, { t: 'Explain React transitions', time: '1d' }] },
  { group: 'Previous 7 days', items: [{ t: 'Onboarding email sequence', time: '3d' }, { t: 'Fix flaky checkout test', time: '4d' }, { t: 'Name ideas for the CLI', time: '5d' }, { t: 'Pricing page copy', time: '6d' }] },
];


const ANSWER = `For a chat UI, **Server-Sent Events** are usually the right default: the server pushes tokens over one long-lived HTTP response, and the browser reconnects on its own.

## When to pick what
- **SSE** — one-way token streams. Plain HTTP, works through proxies, resumes with \`Last-Event-ID\`.
- **WebSockets** — two-way traffic: live cursors, voice, or interrupting the model mid-answer.
- **Polling** — only when you can't hold a connection open. Every poll adds latency to each token.

## Reading the stream
\`\`\`ts
const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages }) });
const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();

for (;;) {
  const { value, done } = await reader.read();
  if (done) break;
  setAnswer((prev) => prev + value);
}
\`\`\`

Render tokens as they arrive, keep the scroll pinned to the bottom, and swap the send button for **Stop** so people can cut a long answer short.`;

async function intro(api: ChatScriptApi) {
  await api.sleep(600);
  await api.user('How should a chat UI stream responses: SSE, WebSockets or polling?', { type: true });
  const a = api.assistant();
  await a.think('Thinking', ['Comparing transport options for token streams', 'Checking reconnection and proxy behaviour', 'Picking a default and a code example'], 650);
  await a.stream(ANSWER, 26);
  a.done();
}

async function reply(api: ChatScriptApi, text: string) {
  const a = api.assistant();
  await a.think('Thinking', ['Reading your question', 'Drafting a short answer'], 600);
  await a.stream(
    `Good question. Here is the short version on **${text.replace(/[*`]/g, '')}**:

- Start from the smallest thing that works, then measure.
- Stream partial results so people see progress within a second.
- Keep a visible way out: Stop, Retry and Edit on every message.

Want me to turn this into a checklist or sketch the component?`,
    26,
  );
  a.done();
}

const STARTERS = ['Explain React Server Components', 'Write a haiku about latency', 'Plan a 3-day trip to Lisbon', 'Review my SQL query'];

/** History rail: date groups, unread dot, the time crossfading to a menu on hover. */
function HistoryRail({ active, onNew, onClose }: { active: string | null; onNew: () => void; onClose?: () => void }) {
  const [q, setQ] = useState('');
  return (
    <Surface className="h-full w-[260px] shrink-0 gap-4 p-3">
      <div className="flex items-center gap-2 px-1">
        <span className="grid size-7 place-items-center rounded-lg bg-text-primary text-background-primary-default">
          <Sparkles className="size-4" />
        </span>
        <span className="text-headline-semibold">Fable</span>
        {onClose && (
          <IconButton label="Close sidebar" onClick={onClose} className="ms-auto">
            <X />
          </IconButton>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <button type="button" onClick={onNew} className="flex items-center gap-2 rounded-2lg px-2 py-2 text-body-medium text-text-primary transition-colors hover:bg-background-secondary-hover">
          <SquarePen className="size-[18px] text-foreground-icon-secondary" /> New chat
        </button>
        <label className="flex h-9 items-center gap-2 rounded-2lg px-2 text-body-2-regular text-text-tertiary transition-colors focus-within:bg-background-secondary-hover hover:bg-background-secondary-hover">
          <Search className="size-[18px] text-foreground-icon-secondary" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chats" className="min-w-0 flex-1 bg-transparent text-body-medium text-text-primary outline-none placeholder:text-text-secondary" />
        </label>
      </div>
      <nav className="scrollbar-thin -mx-1 flex flex-1 flex-col gap-5 overflow-y-auto px-1" aria-label="Chat history">
        {HISTORY.map(({ group, items }) => {
          const shown = items.filter((i) => i.t.toLowerCase().includes(q.toLowerCase()));
          if (!shown.length) return null;
          return (
            <div key={group} className="flex flex-col gap-0.5">
              <p className="px-2 pb-1 text-body-2-medium text-text-tertiary">{group}</p>
              {shown.map((it) => {
                const on = it.t === active;
                return (
                  <a
                    key={it.t}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className={cn('group/row relative flex h-8 items-center gap-2 rounded-2lg ps-2 pe-1 transition-colors', on ? 'bg-background-secondary-hover' : 'hover:bg-background-secondary-hover')}
                  >
                    {it.unread && <span className="size-1.5 shrink-0 rounded-full bg-accent-500" />}
                    <span className={cn('min-w-0 flex-1 truncate text-body-2-regular', on || it.unread ? 'text-text-primary' : 'text-text-secondary')}>{it.t}</span>
                    <span className="relative grid size-7 shrink-0 place-items-center">
                      <span className="text-caption-1-regular text-text-tertiary transition-opacity group-hover/row:opacity-0">{it.time}</span>
                      <span className="absolute inset-0.5 grid place-items-center rounded-md text-foreground-icon-secondary opacity-0 transition-opacity group-hover/row:opacity-100 hover:bg-background-tertiary-default dark:hover:bg-background-primary-hover">
                        <Ellipsis className="size-4" />
                      </span>
                    </span>
                  </a>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div className="flex items-center gap-2.5 border-t border-separator-border px-1 pt-3">
        <Avatar label="Alex Rivera" className="size-7" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-body-2-medium">Alex Rivera</span>
          <span className="text-caption-1-regular text-text-tertiary">Pro plan</span>
        </div>
        <IconButton label="Account" className="ms-auto">
          <Ellipsis />
        </IconButton>
      </div>
    </Surface>
  );
}

export default function AssistantTemplate() {
  const chat = useChatEngine({ intro, reply });
  const [drawer, setDrawer] = useState(false);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  const [rail, setRail] = useState(true);
  const [model, setModel] = useState('Fable 5');
  const [fresh, setFresh] = useState(false);
  const empty = chat.messages.length === 0;
  const last = chat.messages[chat.messages.length - 1];
  const lastUser = [...chat.messages].reverse().find((m) => m.role === 'user');
  const title = fresh ? (lastUser ? textOf(lastUser).slice(0, 48) : 'New chat') : 'Streaming vs polling for chat';

  const newChat = () => {
    chat.reset();
    setFresh(true);
    setDrawer(false);
  };

  const composer = (
    <Composer reply={chat.replyTo} onClearReply={chat.clearReply}
      context={Math.min(92, 12 + chat.messages.length * 7)}
      value={chat.draft}
      onChange={chat.setDraft}
      onSend={chat.send}
      onStop={chat.stop}
      busy={chat.busy}
      model={<ModelPicker value={model} onChange={setModel} />}
      status={
        <>
          <span className="flex items-center gap-1">
            <Globe /> Web search on
          </span>
          <span className="tabular-nums">{chat.messages.length ? `${chat.messages.length} messages` : 'Fable can make mistakes'}</span>
        </>
      }
    />
  );

  return (
    <Canvas>
      <SideRail open={rail} width={260} className="hidden md:block">
        <HistoryRail active={fresh ? null : 'Streaming vs polling for chat'} onNew={newChat} />
      </SideRail>
      <Drawer open={drawer} onClose={closeDrawer} className="md:hidden">
        <HistoryRail active={fresh ? null : 'Streaming vs polling for chat'} onNew={newChat} onClose={closeDrawer} />
      </Drawer>
      <ChatSurface
        dep={chat.messages}
        empty={empty}
        header={
          <>
            <IconButton label="Open history" onClick={() => setDrawer(true)} className="md:hidden">
              <Menu />
            </IconButton>
            <IconButton label={rail ? 'Hide history' : 'Show history'} onClick={() => setRail((r) => !r)} className="hidden md:grid">
              <PanelLeft />
            </IconButton>
            <span className="min-w-0 truncate px-1 text-headline-medium text-text-primary">{title}</span>
            <span className="ms-auto flex items-center gap-1">
              <HeaderTools />
              <HeaderButton outline>
                <Share /> <span className="hidden sm:inline">Share</span>
              </HeaderButton>
              <IconButton label="New chat" onClick={newChat}>
                <SquarePen />
              </IconButton>
            </span>
          </>
        }
        footer={!empty && composer}
      >
        {empty ? (
          <Welcome
            icon={
              <span className="grid size-11 place-items-center rounded-2xl bg-background-primary-default shadow-card">
                <Sparkles className="size-5 text-accent-500" />
              </span>
            }
            title="What can I help with?"
            subtitle="Ask anything, or start from one of these."
          >
            <div className="mt-2 w-full max-w-2xl text-start">{composer}</div>
            <Suggestions className="justify-center" items={STARTERS} onPick={chat.send} />
          </Welcome>
        ) : (
          chat.messages.map((m, i) =>
            m.role === 'user' ? (
              <UserMessage key={m.id} replyTo={m.replyTo} onEdit={() => chat.setDraft(textOf(m))}>
                {textOf(m)}
              </UserMessage>
            ) : (
              <AssistantMessage key={m.id} message={m} onReply={chat.startReply} isLast={i === chat.messages.length - 1} onRegenerate={() => lastUser && chat.send(textOf(lastUser))} />
            ),
          )
        )}
        {last?.role === 'assistant' && last.done && !chat.busy && <Suggestions items={['Show the server side', 'Handle reconnects', 'Add a Stop button']} onPick={chat.send} />}
      </ChatSurface>
    </Canvas>
  );
}
