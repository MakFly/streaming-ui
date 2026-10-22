import { useMemo, useState } from 'react';
import { Check, FileCode, FileDiff, FolderGit2, GitBranch, GitPullRequest, LoaderCircle, Pencil, Search, ShieldCheck, Terminal, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatEngine, type ChatScriptApi, type Message, type Part } from './kit/engine';
import { CodeBlock, type DiffMark } from './kit/markdown';
import { AssistantMessage, Badge, Canvas, ChatSurface, Composer, Frame, FrameHeader, FramePanel, Surface, HeaderTools, UserMessage, paneIn, textOf } from './kit/parts';

/* Coding Agent — the agent plans, searches, reads and edits files, then runs the tests. The chat card shows
 * an Agent Progress plan and Trace lines; the workbench card follows along with the live diff
 * (a CodeBlock with +/− gutters) and the terminal. */

type PlanItem = { t: string; s: 'todo' | 'active' | 'done' };
type DiffLine = { k: DiffMark; t: string };

const THEME_DIFF: DiffLine[] = [
  { k: '@', t: '@@ -1,9 +1,24 @@' },
  { k: ' ', t: "export type Theme = 'light' | 'dark';" },
  { k: ' ', t: '' },
  { k: '-', t: 'export function applyTheme(theme: Theme) {' },
  { k: '-', t: '  document.documentElement.dataset.theme = theme;' },
  { k: '-', t: '}' },
  { k: '+', t: "const KEY = 'acme-theme';" },
  { k: '+', t: '' },
  { k: '+', t: 'export function readTheme(): Theme {' },
  { k: '+', t: '  try {' },
  { k: '+', t: '    const saved = localStorage.getItem(KEY);' },
  { k: '+', t: "    if (saved === 'light' || saved === 'dark') return saved;" },
  { k: '+', t: '  } catch {}' },
  { k: '+', t: "  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';" },
  { k: '+', t: '}' },
  { k: '+', t: '' },
  { k: '+', t: 'export function applyTheme(theme: Theme) {' },
  { k: '+', t: "  document.documentElement.classList.toggle('dark', theme === 'dark');" },
  { k: '+', t: '  try { localStorage.setItem(KEY, theme); } catch {}' },
  { k: '+', t: '}' },
];

const TOGGLE_DIFF: DiffLine[] = [
  { k: '@', t: '@@ -0,0 +1,14 @@' },
  { k: '+', t: "import { useState } from 'react';" },
  { k: '+', t: "import { Moon, Sun } from 'lucide-react';" },
  { k: '+', t: "import { applyTheme, readTheme } from '@/lib/theme';" },
  { k: '+', t: '' },
  { k: '+', t: 'export function ThemeToggle() {' },
  { k: '+', t: '  const [theme, setTheme] = useState(readTheme);' },
  { k: '+', t: "  const next = theme === 'dark' ? 'light' : 'dark';" },
  { k: '+', t: '  return (' },
  { k: '+', t: '    <button aria-label={`Use ${next} mode`} onClick={() => { applyTheme(next); setTheme(next); }}>' },
  { k: '+', t: "      {theme === 'dark' ? <Sun /> : <Moon />}" },
  { k: '+', t: '    </button>' },
  { k: '+', t: '  );' },
  { k: '+', t: '}' },
];

const TEST_OUTPUT = [
  '> acme-web@2.4.0 test',
  '> vitest run',
  '',
  ' ✓ src/lib/theme.test.ts (4 tests) 12ms',
  ' ✓ src/components/theme-toggle.test.tsx (3 tests) 48ms',
  ' ✓ src/app/layout.test.tsx (2 tests) 31ms',
  '',
  ' Test Files  3 passed (3)',
  '      Tests  9 passed (9)',
];

async function edit(api: ChatScriptApi, a: ReturnType<ChatScriptApi['assistant']>, file: string, lines: DiffLine[], fresh = false) {
  const added = lines.filter((l) => l.k === '+').length;
  const removed = lines.filter((l) => l.k === '-').length;
  const setDiff = a.custom('diff', { file, lines, shown: 0, added, removed, fresh });
  for (let i = 1; i <= lines.length; i++) {
    setDiff({ shown: i });
    await api.sleep(70);
  }
  await api.sleep(200);
}

async function intro(api: ChatScriptApi) {
  await api.sleep(500);
  await api.user("Add a dark mode toggle to the header that remembers the user's choice.", { type: true });
  const a = api.assistant();
  await a.think('Planning', ['Theme is applied in layout.tsx via a data attribute', 'Need persistence and a system-preference fallback'], 600);
  const plan: PlanItem[] = [
    { t: 'Find where the theme is applied', s: 'active' },
    { t: 'Persist the choice in localStorage', s: 'todo' },
    { t: 'Add a ThemeToggle to the header', s: 'todo' },
    { t: 'Run the test suite', s: 'todo' },
  ];
  const setPlan = a.custom('plan', { items: plan });
  const step = (i: number) => {
    plan.forEach((p, j) => (p.s = j < i ? 'done' : j === i ? 'active' : 'todo'));
    setPlan({ items: plan.map((p) => ({ ...p })) });
  };
  await a.tool('Searched', '"theme" in src/', { ms: 800, meta: '4 matches' });
  await a.tool('Read', 'src/app/layout.tsx', { ms: 700, meta: '84 lines' });
  step(1);
  await edit(api, a, 'src/lib/theme.ts', THEME_DIFF);
  step(2);
  await edit(api, a, 'src/components/theme-toggle.tsx', TOGGLE_DIFF, true);
  step(3);
  await a.tool('Ran', 'npm test', { ms: 600, output: TEST_OUTPUT, lineMs: 160, meta: '9 passed' });
  step(4);
  await a.stream(
    `Done. The header now has a **ThemeToggle**, and the choice survives a reload:

- \`readTheme()\` prefers the saved value and falls back to the system setting.
- \`applyTheme()\` toggles the \`dark\` class and stores the choice.
- All 9 tests pass. Ready to open a pull request.`,
    28,
  );
  a.done();
}

async function reply(api: ChatScriptApi, text: string) {
  const a = api.assistant();
  await a.think('Planning', [`Scoping: ${text.slice(0, 60)}`], 600);
  await a.tool('Read', 'src/lib/theme.ts', { ms: 600, meta: '20 lines' });
  await edit(api, a, 'src/lib/theme.ts', [
    { k: '@', t: '@@ -16,4 +16,5 @@' },
    { k: ' ', t: 'export function applyTheme(theme: Theme) {' },
    { k: ' ', t: "  document.documentElement.classList.toggle('dark', theme === 'dark');" },
    { k: '+', t: '  document.documentElement.style.colorScheme = theme;' },
    { k: ' ', t: '  try { localStorage.setItem(KEY, theme); } catch {}' },
  ]);
  await a.tool('Ran', 'npm test', { ms: 500, output: TEST_OUTPUT.slice(-2), lineMs: 160, meta: '9 passed' });
  await a.stream('Applied. I also set `color-scheme` so native form controls and scrollbars follow the theme. Tests still pass.', 28);
  a.done();
}

const toolIcon = (name: string) => ({ Searched: <Search />, Read: <FileCode />, Ran: <Terminal /> })[name] ?? <FileCode />;

/** Agent Progress: a ring that fills with the plan, rows that check off and strike through. */
function Plan({ items }: { items: PlanItem[] }) {
  const done = items.filter((i) => i.s === 'done').length;
  const left = items.length - done;
  const r = 6.75;
  const c = 2 * Math.PI * r;
  return (
    <Frame>
      <FrameHeader
        icon={
          left === 0 ? (
            <span className="grid size-[18px] place-items-center rounded-full bg-emerald-500 text-white">
              <Check className="size-3" strokeWidth={3} />
            </span>
          ) : (
          <svg viewBox="0 0 18 18" className="size-[18px] -rotate-90" aria-hidden>
            <circle cx="9" cy="9" r={r} fill="none" strokeWidth="2.5" className="stroke-background-quaternary-default" />
            <circle cx="9" cy="9" r={r} fill="none" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - done / items.length)} className="stroke-accent-500 transition-[stroke-dashoffset] duration-500" />
          </svg>
          )
        }
        title="Plan"
      >
        <span className="text-caption-1-medium text-text-tertiary tabular-nums">{left ? `${left} step${left > 1 ? 's' : ''} left` : 'All done'}</span>
      </FrameHeader>
      <FramePanel>
        <ul className="flex flex-col py-1.5">
          {items.map((i) => (
            <li key={i.t} className="flex items-center gap-2.5 px-3 py-1.5 text-body-2-regular">
              {i.s === 'done' ? (
                <span className="grid size-4 shrink-0 place-items-center rounded-full bg-text-primary text-background-primary-default">
                  <Check className="size-2.5" strokeWidth={3.5} />
                </span>
              ) : i.s === 'active' ? (
                <LoaderCircle className="size-4 shrink-0 animate-spin text-accent-500" />
              ) : (
                <span className="size-4 shrink-0 rounded-full border-[1.5px] border-dashed border-foreground-icon-quaternary" />
              )}
              <span className={cn('min-w-0 truncate', i.s === 'done' && 'text-text-tertiary line-through decoration-text-tertiary/60', i.s === 'active' && 'agent-progress-loading-text', i.s === 'todo' && 'text-text-secondary')}>{i.t}</span>
            </li>
          ))}
        </ul>
      </FramePanel>
    </Frame>
  );
}

type DiffPart = Extract<Part, { kind: 'custom' }> & { data: { file: string; lines: DiffLine[]; shown: number; added: number; removed: number; fresh: boolean } };

const Stat = ({ added, removed }: { added: number; removed: number }) => (
  <span className="flex shrink-0 items-center gap-1.5 font-mono text-caption-1-medium tabular-nums">
    <span className="text-emerald-600 dark:text-emerald-400">+{added}</span>
    {removed > 0 && <span className="text-red-600 dark:text-red-400">−{removed}</span>}
  </span>
);

function Workbench({ messages, busy, tab, setTab, file, setFile, ready }: { messages: Message[]; busy: boolean; tab: 'diff' | 'terminal'; setTab: (t: 'diff' | 'terminal') => void; file: string | null; setFile: (f: string) => void; ready: boolean }) {
  const diffs = useMemo(() => {
    const byFile = new Map<string, DiffPart>();
    for (const m of messages) for (const p of m.parts) if (p.kind === 'custom' && p.type === 'diff') byFile.set((p as DiffPart).data.file, p as DiffPart);
    return [...byFile.values()];
  }, [messages]);
  const runs = useMemo(() => messages.flatMap((m) => m.parts.filter((p): p is Extract<Part, { kind: 'tool' }> => p.kind === 'tool' && p.name === 'Ran')), [messages]);
  const current = diffs.find((d) => d.data.file === file) ?? diffs[diffs.length - 1];
  const total = diffs.reduce((a, d) => ({ added: a.added + d.data.added, removed: a.removed + d.data.removed }), { added: 0, removed: 0 });
  const seg = (on: boolean) => cn('flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-body-2-medium transition-colors [&_svg]:size-4', on ? 'bg-background-primary-default text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary');

  return (
    <Surface className="h-full">
      <div className="flex h-12 shrink-0 items-center gap-2 px-3">
        <div role="tablist" className="flex rounded-[10px] bg-background-tertiary-default p-0.5">
          <button type="button" role="tab" aria-selected={tab === 'diff'} className={seg(tab === 'diff')} onClick={() => setTab('diff')}>
            <FileDiff /> Changes
            {diffs.length > 0 && <Badge tone="neutral" className="h-[18px] px-1">{diffs.length}</Badge>}
          </button>
          <button type="button" role="tab" aria-selected={tab === 'terminal'} className={seg(tab === 'terminal')} onClick={() => setTab('terminal')}>
            <Terminal /> Terminal
          </button>
        </div>
        {busy && <LoaderCircle className="size-4 animate-spin text-text-tertiary" />}
        <span className="ms-auto flex items-center gap-2">
          {diffs.length > 0 && <Stat {...total} />}
          <button type="button" disabled={!ready} className="flex h-8 items-center gap-1.5 rounded-lg bg-text-primary px-3 text-body-2-medium text-background-primary-default shadow-xs transition-opacity disabled:opacity-30">
            <GitPullRequest className="size-4" /> Create PR
          </button>
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 pb-3">
        {tab === 'diff' ? (
          diffs.length ? (
            <>
              <div className="scrollbar-none flex shrink-0 gap-1 overflow-x-auto">
                {diffs.map((d) => (
                  <button
                    key={d.data.file}
                    type="button"
                    onClick={() => setFile(d.data.file)}
                    className={cn('flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-1.5 font-mono text-caption-1-regular transition-colors', d === current ? 'bg-background-primary-default text-text-primary shadow-xs' : 'text-text-secondary hover:bg-background-secondary-hover')}
                  >
                    {d.data.shown < d.data.lines.length ? <LoaderCircle className="size-3 animate-spin" /> : <FileCode className="size-3.5" />}
                    {d.data.file.split('/').pop()}
                    {d.data.fresh && <Badge tone="success" className="h-4 px-1 text-[10px]">new</Badge>}
                  </button>
                ))}
              </div>
              {current && (
                <CodeBlock
                  className="flex min-h-0 flex-1 flex-col"
                  bodyClassName="min-h-0 flex-1 overflow-auto"
                  lang="tsx"
                  numbers
                  title={current.data.file}
                  code={current.data.lines.slice(0, current.data.shown).map((l) => l.t).join('\n')}
                  diff={current.data.lines.slice(0, current.data.shown).map((l) => l.k)}
                  actions={<Stat added={current.data.added} removed={current.data.removed} />}
                />
              )}
            </>
          ) : (
            <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-border-button-default text-center">
              <p className="flex flex-col items-center gap-2 text-body-2-regular text-text-tertiary">
                <FileDiff className="size-5" /> Edits appear here as the agent makes them.
              </p>
            </div>
          )
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-black/10 bg-[#0b0b0c] shadow-xs dark:border-white/10">
            <div className="flex h-9 shrink-0 items-center gap-1.5 border-b border-white/10 px-3">
              {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                <span key={c} className="size-2.5 rounded-full" style={{ backgroundColor: c }} />
              ))}
              <span className="ms-2 font-mono text-caption-1-regular text-[#a1a1aa]">zsh — acme/web</span>
            </div>
            <pre className="scrollbar-thin min-h-0 flex-1 overflow-auto p-4 font-mono text-[12.5px] leading-6 text-[#d4d4d8] [font-variant-ligatures:none]">
              {runs.length === 0 && <span className="text-[#71717a]">$ waiting for the agent…</span>}
              {runs.map((t) => (
                <div key={t.id} className="mb-3">
                  <div>
                    <span className="text-[#4ade80]">❯</span> {t.arg}
                  </div>
                  {t.output?.map((l, i) => (
                    <div key={i} className={cn(/✓|passed/.test(l) && 'text-[#4ade80]', l.startsWith('>') && 'text-[#71717a]')}>
                      {l || ' '}
                    </div>
                  ))}
                </div>
              ))}
            </pre>
          </div>
        )}
      </div>
    </Surface>
  );
}

export default function CodingAgentTemplate() {
  const chat = useChatEngine({ intro, reply });
  const [tab, setTab] = useState<'diff' | 'terminal'>('diff');
  const [file, setFile] = useState<string | null>(null);
  const [pane, setPane] = useState<'chat' | 'changes'>('chat');
  const [auto, setAuto] = useState(true);
  const ready = !chat.busy && chat.messages.some((m) => m.role === 'assistant' && m.done);
  const files = new Set(chat.messages.flatMap((m) => m.parts.filter((p) => p.kind === 'custom' && p.type === 'diff').map((p) => (p as DiffPart).data.file))).size;

  const renderCustom = (p: Extract<Part, { kind: 'custom' }>) => {
    if (p.type === 'plan') return <Plan items={p.data.items as PlanItem[]} />;
    if (p.type === 'diff') {
      const d = p as DiffPart;
      const writing = d.data.shown < d.data.lines.length;
      return (
        <button
          type="button"
          onClick={() => {
            setTab('diff');
            setFile(d.data.file);
            setPane('changes');
          }}
          className="tpl-reveal flex w-fit max-w-full items-center gap-2 text-body-2-regular text-text-secondary transition-colors hover:text-text-primary"
        >
          <span className="grid size-4 shrink-0 place-items-center">{writing ? <LoaderCircle className="size-4 animate-spin" /> : <Pencil className="size-4" />}</span>
          <span className={cn('min-w-0 truncate', writing && 'agent-progress-loading-text')}>
            <span className="text-text-primary">{d.data.fresh ? 'Created' : 'Edited'}</span>
            <span className="ms-1.5 font-mono text-[12.5px] underline decoration-separator-border underline-offset-4">{d.data.file}</span>
          </span>
          <Stat added={d.data.added} removed={d.data.removed} />
        </button>
      );
    }
    return null;
  };

  return (
    <Canvas>
      <ChatSurface
        className={cn('lg:max-w-[480px]', pane === 'changes' ? 'hidden lg:flex' : paneIn.lgStart)}
        dep={chat.messages}
        width="max-w-none"
        header={
          <>
            <FolderGit2 className="ms-1 size-[18px] text-foreground-icon-secondary" />
            <span className="text-headline-medium">acme/web</span>
            <Badge tone="outline" className="font-mono">
              <GitBranch /> feat/dark-mode
            </Badge>
            <span className="ms-auto flex items-center gap-1">
              <PaneSwitch pane={pane} setPane={setPane} />
              <HeaderTools />
            </span>
          </>
        }
        footer={
          <Composer
            variant="command"
            context={Math.min(90, 8 + chat.messages.length * 6)}
            branch="feat/dark-mode"
            project="acme/web"
            value={chat.draft}
            onChange={chat.setDraft}
            onSend={chat.send}
            onStop={chat.stop}
            busy={chat.busy}
            placeholder="Ask the agent to change something"
            tools={
              <button
                type="button"
                onClick={() => setAuto((a) => !a)}
                className={cn('flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-body-2-medium transition-colors', auto ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'border-border-button-default text-text-secondary hover:bg-background-primary-hover')}
              >
                {auto ? <Zap className="size-4" /> : <ShieldCheck className="size-4" />}
                {auto ? 'Auto-accept edits' : 'Ask before edits'}
              </button>
            }
            status={
              <>
                <span className="flex items-center gap-1">
                  <GitBranch /> {files ? `${files} file${files > 1 ? 's' : ''} changed` : 'No changes yet'}
                </span>
                <span className="tabular-nums">{chat.messages.length} messages</span>
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
            <AssistantMessage key={m.id} message={m} isLast={i === chat.messages.length - 1} renderCustom={renderCustom} toolIcon={toolIcon} textClassName="text-body-2-regular leading-6" />
          ),
        )}
      </ChatSurface>
      <div className={cn('min-w-0 flex-1', pane === 'chat' ? 'hidden lg:block' : cn('flex flex-col', paneIn.lgEnd))}>
        {pane === 'changes' && (
          <div className="flex h-12 items-center px-3 lg:hidden">
            <PaneSwitch pane={pane} setPane={setPane} />
          </div>
        )}
        <div className="min-h-0 flex-1 lg:h-full">
          <Workbench messages={chat.messages} busy={chat.busy} tab={tab} setTab={setTab} file={file} setFile={setFile} ready={ready} />
        </div>
      </div>
    </Canvas>
  );
}

function PaneSwitch({ pane, setPane }: { pane: 'chat' | 'changes'; setPane: (p: 'chat' | 'changes') => void }) {
  return (
    <div className="flex rounded-[10px] bg-background-tertiary-default p-0.5 lg:hidden">
      {(['chat', 'changes'] as const).map((p) => (
        <button key={p} type="button" onClick={() => setPane(p)} className={cn('h-7 rounded-lg px-2.5 text-caption-1-medium capitalize transition-colors', pane === p ? 'bg-background-primary-default text-text-primary shadow-xs' : 'text-text-secondary')}>
          {p}
        </button>
      ))}
    </div>
  );
}
