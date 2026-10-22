import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BookOpen, FileCode, FolderGit2, GitBranch, Globe, ImageIcon, PenLine, Pencil, RotateCcw, ShieldCheck, Terminal, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatEngine, type ChatScriptApi, type Script } from '@/templates/kit/engine';
import { COMPOSER_VARIANTS, type BaseVariant, type ComposerVariant } from '@/templates/kit/composer-variant';
import { EXTENSIONS, isExtension } from '@/templates/kit/variants';
import { AssistantMessage, Badge, ChatSurface, Composer, HeaderButton, ModelPicker, Suggestions, UserMessage, textOf } from '@/templates/kit/parts';

/* One composer variant inside a small live thread, for the /composers showcase. Each variant gets its own
 * scripted intro (typed into the composer, so the composer itself is what you watch) and content that shows
 * off its anatomy: model picker, tool chips, status line. The composer is `lock`ed so a saved global
 * choice never swaps the variant on show. */


/* ------------------------------------------------------------------ scripts (module-level: the intro is an effect dependency) */

interface Demo {
  intro: Script;
  reply: (api: ChatScriptApi, text: string) => Promise<void>;
  suggestions: string[];
}

/** The generic follow-up answer, naming the variant the visitor is trying. */
const replyFor = (name: string) =>
  async function reply(api: ChatScriptApi, text: string) {
    const a = api.assistant();
    await a.think('Thinking', ['Reading your message', 'Drafting a short answer'], 550);
    await a.stream(
      `Here is a quick take on **${text.replace(/[*`]/g, '')}**:

- Start small, then refine with a follow-up.
- You just sent this from the **${name}** composer: try Shift+Enter for a newline, or Stop while I stream.`,
      26,
    );
    a.done();
  };

const DEMOS: Record<BaseVariant, Demo> = {
  pill: {
    async intro(api) {
      await api.sleep(500);
      await api.user('How long should I boil an egg for a jammy yolk?', { type: true });
      const a = api.assistant();
      await a.think('Thinking', ['Checking egg size and starting temperature'], 550);
      await a.stream(
        `About **6½ minutes** for a large egg straight from the fridge, lowered into water that is already boiling.

- Move it to ice water right away so it stops cooking.
- Add 30 seconds for extra-large eggs, take 30 off for medium.`,
        26,
      );
      a.done();
    },
    reply: replyFor('Pill'),
    suggestions: ['What about soft-boiled?', 'How do I peel them cleanly?'],
  },
  box: {
    async intro(api) {
      await api.sleep(500);
      await api.user('I am writing a launch email for our new budgeting app.\nThe draft feels long and flat. How do I make the opening paragraph grab people?', { type: true });
      const a = api.assistant();
      await a.think('Thinking', ['Looking at what makes a launch email opening work', 'Picking three concrete moves'], 600);
      await a.stream(
        `Lead with the reader's problem, not the product:

1. **Open on a moment** they know: *"It's the 24th and the account is already empty."*
2. **One sentence of promise**: what changes for them, in plain words.
3. **Cut the backstory**: the team and the roadmap can live further down.

Keep the first paragraph under 50 words; the subject line and the opening do most of the work.`,
        26,
      );
      a.done();
    },
    reply: replyFor('Box'),
    suggestions: ['Rewrite my subject line', 'Make it sound friendlier', 'Shorten the whole email'],
  },
  panel: {
    async intro(api) {
      await api.sleep(500);
      await api.user('Plan how we add saved searches to the dashboard', { type: true });
      const a = api.assistant();
      await a.think('Planning', ['Reading how filters are stored today', 'Splitting the work into shippable steps'], 650);
      await a.stream(
        `Here is a plan in three steps:

1. **Model** — a \`saved_searches\` table (owner, name, serialized filters).
2. **API** — list, create and delete endpoints behind the existing auth.
3. **UI** — a *Save* button next to the filters and a menu to reopen them.

Switch to **Agent** and I can start with step 1.`,
        26,
      );
      a.done();
    },
    reply: replyFor('Panel'),
    suggestions: ['Start with step 1', 'What about sharing searches?', 'Estimate the effort'],
  },
  dock: {
    async intro(api) {
      await api.sleep(500);
      await api.user('What is the population of Lisbon, and how has it changed?', { type: true });
      const a = api.assistant();
      await a.think('Researching', ['Looking up the latest census figures', 'Comparing with earlier decades'], 650);
      await a.stream(
        `The city of Lisbon has roughly **545,000** residents, while the wider metro area is close to **2.9 million**.

- The city proper peaked around **800,000** in the early 1980s, then shrank as families moved to the suburbs.
- Since the 2010s it has been roughly stable, with the metro area still growing.`,
        26,
      );
      a.done();
    },
    reply: replyFor('Dock'),
    suggestions: ['Compare it with Porto', 'Show the sources'],
  },
  command: {
    async intro(api) {
      await api.sleep(500);
      await api.user('Make the header sticky on scroll', { type: true });
      const a = api.assistant();
      await a.think('Thinking', ['Finding the header component'], 550);
      await a.tool('Read', 'src/components/header.tsx', { meta: '84 lines', ms: 700 });
      await a.tool('Edit', 'src/components/header.tsx', { meta: '+4 −1', ms: 800 });
      await a.tool('Ran', 'pnpm test header', { ms: 600, meta: '1.8s', output: ['✓ renders the logo', '✓ stays visible after scroll', '2 passed'] });
      await a.stream(
        `Done. The header now uses \`sticky top-0 z-20\` with a translucent background, so content scrolls under it.

- Removed the old \`fixed\` positioning that pushed the page down.
- Tests pass; no layout shift on first load.`,
        26,
      );
      a.done();
    },
    reply: replyFor('Command'),
    suggestions: ['Add a shadow once scrolled', 'Show me the diff', 'Run the full test suite'],
  },
};

/** Demo for any variant: the originals' scripts above, the later ones from their own file (kit/variants/*). Cached, so *  the intro and reply keep their identity across renders (both are effect dependencies). */const extDemos = new Map<ComposerVariant, Demo>();function demoOf(variant: ComposerVariant): Demo {  if (!isExtension(variant)) return DEMOS[variant];  let d = extDemos.get(variant);  if (!d) {    const e = EXTENSIONS[variant].demo;    const name = COMPOSER_VARIANTS.find((v) => v.id === variant)!.name;    d = { intro: e.intro, reply: e.reply ?? replyFor(name), suggestions: e.suggestions };    extDemos.set(variant, d);  }  return d;}
const toolIcon = (name: string) => ({ Read: <FileCode />, Edit: <Pencil />, Ran: <Terminal />, Generate: <ImageIcon /> })[name] ?? <FileCode />;

/* ------------------------------------------------------------------ composer content per variant */

/** A toggle chip for the composer's `tools` slot. */
function ToolChip({ on, onToggle, icon, children, tone = 'neutral' }: { on: boolean; onToggle: () => void; icon: ReactNode; children: ReactNode; tone?: 'neutral' | 'amber' }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className={cn(
        'flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-body-2-medium transition-colors [&_svg]:size-4',
        on
          ? tone === 'amber'
            ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
            : 'border-accent-500/30 bg-accent-500/10 text-accent-500'
          : 'border-border-button-default text-text-secondary hover:bg-background-primary-hover',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/**
 * `active`: only the demo in view plays, so a single composer is busy at a time.
 * It starts its intro when it becomes active; leaving mid-intro resets it, to replay whole on the way back.
 */
export function ComposerThreadDemo({ variant, active = true, className }: { variant: ComposerVariant; active?: boolean; className?: string }) {
  const demo = demoOf(variant);
  const meta = COMPOSER_VARIANTS.find((v) => v.id === variant)!;
  const chat = useChatEngine({ reply: demo.reply });
  const played = useRef(false);
  const { run, reset, busy } = chat;
  const busyRef = useRef(busy);
  busyRef.current = busy;
  useEffect(() => {
    if (active && !played.current) {
      played.current = true;
      void run(demo.intro);
    } else if (!active && busyRef.current) {
      played.current = false;
      reset();
    }
  }, [active, demo.intro, run, reset]);
  const [model, setModel] = useState('Fable 5');
  const [tool, setTool] = useState(true);
  const last = chat.messages[chat.messages.length - 1];
  const count = chat.messages.length;

  const replay = () => {
    chat.reset();
    void chat.run(demo.intro);
  };

  const picker = <ModelPicker value={model} onChange={setModel} className="hidden sm:flex" />;
  const content: Record<BaseVariant, { model?: ReactNode; tools?: ReactNode; status?: ReactNode; placeholder?: string }> = {
    pill: {
      model: picker,
      status: (
        <>
          <span className="flex items-center gap-1">
            <Globe /> Web search on
          </span>
          <span className="tabular-nums">{count ? `${count} messages` : 'Fable can make mistakes'}</span>
        </>
      ),
    },
    box: {
      placeholder: 'Ask for help with your writing',
      tools: (
        <ToolChip on={tool} onToggle={() => setTool((t) => !t)} icon={<PenLine />}>
          Writing coach
        </ToolChip>
      ),
      status: (
        <>
          <span>Shift+Enter for a new line</span>
          <span className="tabular-nums">{count ? `${count} messages` : 'Drafts stay private'}</span>
        </>
      ),
    },
    panel: {
      placeholder: 'Describe the feature to plan',
      model: picker,
      tools: (
        <ToolChip on={tool} onToggle={() => setTool((t) => !t)} icon={<FolderGit2 />}>
          acme/web
        </ToolChip>
      ),
      status: (
        <>
          <span className="flex items-center gap-1">
            <GitBranch /> main
          </span>
          <span className="tabular-nums">{count ? `${count} messages` : 'Plans before it edits'}</span>
        </>
      ),
    },
    dock: {
      placeholder: 'Look something up',
      tools: (
        <ToolChip on={tool} onToggle={() => setTool((t) => !t)} icon={<BookOpen />}>
          Cite sources
        </ToolChip>
      ),
    },
    command: {
      placeholder: 'Ask the agent to change something',
      tools: (
        <ToolChip on={tool} onToggle={() => setTool((t) => !t)} icon={tool ? <Zap /> : <ShieldCheck />} tone="amber">
          {tool ? 'Auto-accept edits' : 'Ask before edits'}
        </ToolChip>
      ),
      status: (
        <>
          <span className="flex items-center gap-1">
            <GitBranch /> feat/sticky-header
          </span>
          <span className="tabular-nums">{Math.min(90, 8 + count * 6)}% context</span>
        </>
      ),
    },
  };

  const decorate = isExtension(variant) ? EXTENSIONS[variant].demo.renderText : undefined;

  return (
    <ChatSurface
      dep={chat.messages}
      width="max-w-none"
      className={cn('h-[520px] flex-none rounded-3xl', className)}
      columnClassName="gap-5 px-4 sm:px-6"
      header={
        <>
          <span className="shrink-0 px-1 text-headline-medium text-text-primary">{meta.name}</span>
          <Badge tone="outline" className="min-w-0">
            <span className="truncate">{meta.from}</span>
          </Badge>
          <HeaderButton onClick={replay} className="ms-auto">
            <RotateCcw /> Replay
          </HeaderButton>
        </>
      }
      footer={<Composer variant={variant} lock value={chat.draft} onChange={chat.setDraft} onSend={chat.send} onStop={chat.stop} busy={chat.busy} {...(isExtension(variant) ? EXTENSIONS[variant].demo.content({ picker, count }) : content[variant])} context={Math.min(92, 31 + chat.messages.length * 7)} branch="Main" project="project-sea" />}
    >
      {chat.messages.map((m, i) =>
        m.role === 'user' ? (
          <UserMessage key={m.id}>{decorate ? decorate(textOf(m)) : textOf(m)}</UserMessage>
        ) : (
          <AssistantMessage key={m.id} message={m} isLast={i === chat.messages.length - 1} toolIcon={toolIcon} decorate={decorate} textClassName={variant === 'command' ? 'text-body-2-regular leading-6' : undefined} />
        ),
      )}
      {last?.role === 'assistant' && last.done && !chat.busy && <Suggestions items={demo.suggestions} onPick={chat.send} decorate={decorate} />}
    </ChatSurface>
  );
}
