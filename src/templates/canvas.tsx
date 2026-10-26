import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, History, Maximize2, PenLine, Smile, Sparkles, Text, Wand2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatEngine, type ChatScriptApi, type Message, type Part } from './kit/engine';
import { CopyButton, Markdown } from './kit/markdown';
import { AssistantMessage, Badge, Canvas, ChatSurface, Composer, Frame, FrameFooter, FrameHeader, IconButton, Surface, HeaderTools, UserMessage, paneIn, textOf } from './kit/parts';

/* Canvas — chat on the left, a document artifact on the right (the classic chat +
 * artifact layout). The draft streams into the canvas; every edit asked for in chat, or from the floating
 * toolbar, lands as a new version you can step back through. */

type Doc = { title: string; version: number; text: string; shown: number; note: string };
type DocPart = Extract<Part, { kind: 'custom' }> & { data: Doc };

const V1 = `# Streaming SDK 1.0 is here

Today we're shipping **Streaming SDK 1.0**, the fastest way to put live AI answers in front of your users.

## What's new
- **First token in under 300 ms** on every major provider, measured end to end.
- **Resumable streams**: a dropped connection picks up where it left off, no duplicated tokens.
- **Typed events** for reasoning, tool calls and sources, so your UI can show real progress.

## Why it matters
People judge an answer by how fast it starts, not how fast it ends. With 1.0, the first words land while the model is still thinking, and nothing jumps as the rest arrives.

## Get started
Install it with \`npm i @acme/stream\`, wrap your handler in \`stream()\`, and you're live. The migration guide covers everything that changed since 0.9.`;

const EDITS: Record<string, { note: string; text: (t: string) => string }> = {
  shorter: {
    note: 'Shortened',
    text: () => `# Streaming SDK 1.0 is here

**Streaming SDK 1.0** puts live AI answers in front of your users, fast.

- **First token in under 300 ms** on every major provider.
- **Resumable streams** that survive dropped connections.
- **Typed events** for reasoning, tool calls and sources.

Install it with \`npm i @acme/stream\` and you're live.`,
  },
  polish: {
    note: 'Polished',
    text: (t) => t.replace('Today we\'re shipping', 'Meet').replace('the fastest way to put', 'the fastest way yet to put').replace('and you\'re live.', 'and ship it the same afternoon.'),
  },
  emoji: {
    note: 'Added emoji',
    text: (t) => t.replace('# Streaming SDK 1.0 is here', '# 🚀 Streaming SDK 1.0 is here').replace('## What\'s new', '## ✨ What\'s new').replace('## Why it matters', '## 💡 Why it matters').replace('## Get started', '## 🛠️ Get started'),
  },
};

// The document as the script last left it (each preview is its own document, so module state is per frame).
let latest = V1;
let version = 1;

async function writeDoc(api: ChatScriptApi, a: ReturnType<ChatScriptApi['assistant']>, text: string, version: number, note: string) {
  const set = a.custom('doc', { title: 'Launch announcement', version, text, shown: 0, note } satisfies Doc);
  for (let i = 0; i <= text.length; i += 9) {
    set({ shown: i });
    await api.sleep(22);
  }
  set({ shown: text.length });
}

async function intro(api: ChatScriptApi) {
  latest = V1;
  version = 1;
  await api.sleep(500);
  await api.user('Draft a launch announcement for Streaming SDK 1.0', { type: true });
  const a = api.assistant();
  await a.think('Thinking', ['Audience: developers already streaming tokens', 'Lead with time to first token, then resumable streams'], 550);
  await writeDoc(api, a, V1, 1, 'First draft');
  await a.stream('The draft is in the canvas. Ask for changes here, or use the toolbar to shorten, polish or add emoji.', 30);
  a.done();
}

function pickEdit(text: string) {
  if (/short|length|brief|concise/i.test(text)) return EDITS.shorter;
  if (/emoji/i.test(text)) return EDITS.emoji;
  return EDITS.polish;
}

async function reply(api: ChatScriptApi, text: string) {
  const a = api.assistant();
  const edit = pickEdit(text);
  await a.think('Editing', [`${edit.note} the announcement`], 500);
  latest = edit.text(latest);
  version += 1;
  await writeDoc(api, a, latest, version, edit.note);
  await a.stream(`${edit.note} — version ${version} is in the canvas. Step back with the arrows to compare.`, 30);
  a.done();
}

const TOOLS = [
  { icon: <Text />, label: 'Adjust length', prompt: 'Make it shorter' },
  { icon: <Wand2 />, label: 'Polish', prompt: 'Polish the wording' },
  { icon: <Smile />, label: 'Add emoji', prompt: 'Add emoji to the headings' },
];

/** The artifact panel: title bar with version stepper, the document, and a floating edit toolbar. */
function ArtifactPanel({ docs, busy, onAsk, onClose }: { docs: Doc[]; busy: boolean; onAsk: (p: string) => void; onClose?: () => void }) {
  const [idx, setIdx] = useState<number | null>(null);
  const [tools, setTools] = useState(false);
  // Follow the newest version while it streams; stepping back pins an older one until the next edit.
  useEffect(() => {
    setIdx(null);
  }, [docs.length]);
  const i = idx ?? docs.length - 1;
  const doc = docs[i];
  const writing = doc && doc.shown < doc.text.length;
  const words = doc ? doc.text.slice(0, doc.shown).split(/\s+/).filter(Boolean).length : 0;

  return (
    <Surface className="h-full w-full">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-separator-border px-3">
        {onClose && (
          <IconButton label="Close canvas" onClick={onClose}>
            <X />
          </IconButton>
        )}
        <span className="grid size-7 place-items-center rounded-lg bg-background-primary-default text-foreground-icon-secondary shadow-xs">
          <FileText className="size-4" />
        </span>
        <span className="min-w-0 truncate text-headline-medium">{doc?.title ?? 'Canvas'}</span>
        {writing ? <Badge tone="info">Writing…</Badge> : doc && <Badge tone="neutral">v{doc.version}</Badge>}
        <span className="ms-auto flex items-center gap-0.5">
          {docs.length > 1 && (
            <span className="me-1 flex items-center gap-0.5 rounded-lg border border-border-button-default bg-background-primary-default p-0.5 shadow-xs">
              <IconButton label="Previous version" onClick={() => setIdx(Math.max(0, i - 1))} className="size-6">
                <ChevronLeft />
              </IconButton>
              <span className="flex items-center gap-1 px-1 text-caption-1-medium text-text-secondary tabular-nums">
                <History className="size-3.5" /> {i + 1} / {docs.length}
              </span>
              <IconButton label="Next version" onClick={() => setIdx(Math.min(docs.length - 1, i + 1))} className="size-6">
                <ChevronRight />
              </IconButton>
            </span>
          )}
          {doc && <CopyButton text={doc.text} />}
          <IconButton label="Full screen" className="hidden md:grid">
            <Maximize2 />
          </IconButton>
        </span>
      </div>

      <div className="scrollbar-thin relative min-h-0 flex-1 overflow-y-auto">
        {doc ? (
          <article className="mx-auto max-w-[680px] px-6 py-10 sm:px-10">
            {idx !== null && idx < docs.length - 1 && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-body-2-regular text-amber-800 dark:text-amber-300">
                <History className="size-4 shrink-0" /> Viewing version {doc.version} · {doc.note}
                <button type="button" onClick={() => setIdx(null)} className="ms-auto text-body-2-medium underline underline-offset-2">
                  Back to latest
                </button>
              </div>
            )}
            <Markdown key={`${doc.version}`} text={doc.text.slice(0, doc.shown)} streaming={writing} className="text-[16px] leading-[1.8] [&_.text-headline-semibold]:pt-4 [&_.text-headline-semibold]:text-title-3-semibold [&_.text-title-3-semibold]:text-[28px] [&_.text-title-3-semibold]:leading-tight [&_.text-title-3-semibold]:tracking-[-0.02em]" />
          </article>
        ) : (
          <div className="grid h-full place-items-center p-8 text-center">
            <p className="flex flex-col items-center gap-2 text-body-2-regular text-text-tertiary">
              <FileText className="size-6" /> Documents you ask for open here.
            </p>
          </div>
        )}

        {doc && (
          <div className="sticky bottom-4 flex justify-end px-4">
            <div className="flex flex-col items-end gap-2">
              {tools && (
                <div className="animate-in fade-in-0 slide-in-from-bottom-2 flex flex-col gap-1 rounded-2xl border border-border-button-default bg-background-primary-default p-1.5 shadow-dropdown duration-200">
                  {TOOLS.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setTools(false);
                        onAsk(t.prompt);
                      }}
                      className="flex h-8 items-center gap-2 rounded-lg px-2.5 text-body-2-medium text-text-secondary transition-colors hover:bg-background-tertiary-default hover:text-text-primary disabled:opacity-40 [&_svg]:size-4"
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                aria-expanded={tools}
                onClick={() => setTools((o) => !o)}
                className={cn('grid size-11 place-items-center rounded-full border border-border-button-default bg-background-primary-default text-foreground-icon-primary shadow-dropdown transition-[rotate,background-color] duration-200 hover:bg-background-primary-hover', tools && 'rotate-45')}
              >
                {tools ? <X className="size-5 -rotate-45" /> : <PenLine className="size-5" />}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex h-9 shrink-0 items-center gap-3 border-t border-separator-border px-4 text-caption-1-regular text-text-tertiary">
        <span className="tabular-nums">{words} words</span>
        <span className="tabular-nums">{Math.max(1, Math.round(words / 200))} min read</span>
        <span className="ms-auto">{doc ? (writing ? 'Saving…' : 'Saved') : ''}</span>
      </div>
    </Surface>
  );
}

export default function CanvasTemplate() {
  const chat = useChatEngine({ intro, reply });
  const [open, setOpen] = useState(false);
  const docs = useMemo(() => chat.messages.flatMap((m: Message) => m.parts.filter((p): p is DocPart => p.kind === 'custom' && p.type === 'doc').map((p) => p.data)), [chat.messages]);

  const renderCustom = (p: Extract<Part, { kind: 'custom' }>) => {
    if (p.type !== 'doc') return null;
    const d = p.data as Doc;
    const writing = d.shown < d.text.length;
    return (
      <Frame>
        <FrameHeader icon={<FileText />} title={d.title}>
          {writing ? <Badge tone="info">Writing…</Badge> : <Badge tone="neutral">v{d.version} · {d.note}</Badge>}
        </FrameHeader>
        <button type="button" onClick={() => setOpen(true)} className="relative block h-24 overflow-hidden rounded-[13px] border border-border-button-default bg-background-primary-default px-3 py-2.5 text-start shadow-xs">
          <span className="line-clamp-3 text-caption-1-regular leading-5 text-text-secondary">{d.text.slice(0, Math.max(d.shown, 1)).replace(/[#*`]/g, '')}</span>
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background-primary-default" />
        </button>
        <FrameFooter>
          <span className="text-caption-1-regular text-text-tertiary">Document · Markdown</span>
          <button type="button" onClick={() => setOpen(true)} className="ms-auto flex h-7 items-center gap-1.5 rounded-lg bg-text-primary px-2.5 text-caption-1-medium text-background-primary-default lg:hidden">
            Open
          </button>
        </FrameFooter>
      </Frame>
    );
  };

  return (
    <Canvas>
      <ChatSurface
        className={cn('lg:max-w-[440px]', open ? 'hidden lg:flex' : paneIn.lgStart)}
        dep={chat.messages}
        width="max-w-none"
        header={
          <>
            <span className="grid size-7 place-items-center rounded-lg bg-text-primary text-background-primary-default">
              <Sparkles className="size-4" />
            </span>
            <span className="truncate text-headline-medium">Launch announcement</span>
            <span className="ms-auto">
              <HeaderTools />
            </span>
          </>
        }
        footer={<Composer reply={chat.replyTo} onClearReply={chat.clearReply} variant="dock" value={chat.draft} onChange={chat.setDraft} onSend={chat.send} onStop={chat.stop} busy={chat.busy} placeholder="Ask for a change" />}
      >
        {chat.messages.map((m, i) =>
          m.role === 'user' ? (
            <UserMessage key={m.id} replyTo={m.replyTo} onEdit={() => chat.setDraft(textOf(m))}>
              {textOf(m)}
            </UserMessage>
          ) : (
            <AssistantMessage key={m.id} message={m} onReply={chat.startReply} isLast={i === chat.messages.length - 1} renderCustom={renderCustom} textClassName="text-body-2-regular leading-6" />
          ),
        )}
      </ChatSurface>
      <div className={cn('min-w-0 flex-1', open ? cn('flex', paneIn.lgEnd) : 'hidden lg:flex')}>
        <ArtifactPanel docs={docs} busy={chat.busy} onAsk={chat.send} onClose={open ? () => setOpen(false) : undefined} />
      </div>
    </Canvas>
  );
}
