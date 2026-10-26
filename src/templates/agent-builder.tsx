import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  BookOpen, Bot, Brain, Check, ChevronDown, Code2, FileText, Globe, HardDrive, Hash, Image, Link2, LoaderCircle, Lock, MessageSquare,
  Plug, Plus, Rocket, Search, Settings2, ShieldCheck, Sparkles, Upload, Wand2, Wrench, X, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useChatEngine, type ChatScriptApi } from './kit/engine';
import { ThinkingIndicator } from './kit/thinking-style';
import { CodeBlock } from './kit/markdown';
import { BLOUB_NAMES, Bloub, COLORS, EXPRESSIONS, POSES, SEQUENCE, SHAPES, type StateId } from './kit/bloub';
import sentryLogo from './kit/logos/sentry.svg';
import githubLogo from './kit/logos/github_light.svg';
import linearLogo from './kit/logos/linear.svg';
import slackLogo from './kit/logos/slack.svg';
import postgresLogo from './kit/logos/postgresql.svg';
import notionLogo from './kit/logos/notion.svg';
import { AssistantMessage, Badge, Canvas, ChatSurface, Composer, Frame, FrameHeader, FramePanel, HeaderButton, IconButton, ModelPicker, Suggestions, HeaderTools, UserMessage, Welcome, textOf } from './kit/parts';

/* Agent Builder — a normal agent chat, with everything about the agent in a settings dialog: identity,
 * instructions, MCP servers (per-tool switches and Ask / Auto approval), skills, built-in tools, knowledge
 * and deploy, reached from a side menu (tabs on phones). "Generate with AI" redrafts the whole agent as it
 * streams. The chat runs against the live config, so a tool you switch off is really unavailable. All mocked. */

/* ------------------------------------------------------------------ data */

type Approval = 'auto' | 'ask';
type Tool = { id: string; name: string; desc: string; on: boolean; approval: Approval; write?: boolean };
type Server = { id: string; name: string; logo: ReactNode; url: string; status: 'connected' | 'auth' | 'off'; on: boolean; tools: Tool[] };

/** Official brand marks (svgl.app), unmodified. */
const Logo = ({ src }: { src: string }) => <img src={src} alt="" className="size-full object-contain" />;
type Skill = { id: string; name: string; desc: string; by: string; version: string; on: boolean };
type BuiltIn = { id: string; name: string; desc: string; icon: ReactNode; on: boolean };
type Doc = { name: string; size: string; progress: number };

const tool = (id: string, name: string, desc: string, write = false): Tool => ({ id, name, desc, on: false, approval: write ? 'ask' : 'auto', write });

const GEN = {
  prompt: 'An agent that turns new Sentry errors into Linear issues, with the suspect code from GitHub.',
  name: 'Triage Bot',
  description: 'Turns new production errors into well-written Linear issues.',
  instructions: `You are Triage Bot, the on-call assistant for the web team.

When a new Sentry issue arrives:
1. Read the event and stack trace.
2. Find the code involved on GitHub and the last commit that touched it.
3. Search Linear for duplicates; if none, create an issue in team WEB.

Write issues with: impact, steps to reproduce, suspect commit, and a proposed owner.
Never resolve Sentry issues or merge code yourself. Ask before creating anything.`,
  starters: ['Triage the latest Sentry error', 'Is ERR-4821 a duplicate?', 'What tools can you use?'],
  tools: { sentry: ['list_issues', 'get_event'], github: ['search_code', 'get_file'], linear: ['search_issues', 'create_issue'] } as Record<string, string[]>,
  skills: ['incident'],
};

const SERVERS: Server[] = [
  { id: 'sentry', name: 'Sentry', logo: <Logo src={sentryLogo} />, url: 'mcp.sentry.dev/sse', status: 'connected', on: false, tools: [tool('list_issues', 'list_issues', 'New and regressed errors'), tool('get_event', 'get_event', 'Stack trace and breadcrumbs'), tool('resolve_issue', 'resolve_issue', 'Mark an issue resolved', true)] },
  { id: 'github', name: 'GitHub', logo: <Logo src={githubLogo} />, url: 'api.githubcopilot.com/mcp', status: 'connected', on: false, tools: [tool('search_code', 'search_code', 'Search across repositories'), tool('get_file', 'get_file_contents', 'Read a file at a ref'), tool('create_issue', 'create_issue', 'Open an issue', true), tool('create_pr', 'create_pull_request', 'Open a pull request', true)] },
  { id: 'linear', name: 'Linear', logo: <Logo src={linearLogo} />, url: 'mcp.linear.app/sse', status: 'connected', on: false, tools: [tool('search_issues', 'search_issues', 'Find existing issues'), tool('create_issue', 'create_issue', 'Create an issue', true), tool('update_issue', 'update_issue', 'Change state, assignee, labels', true)] },
  { id: 'slack', name: 'Slack', logo: <Logo src={slackLogo} />, url: 'mcp.slack.com', status: 'auth', on: false, tools: [tool('read_channel', 'read_channel', 'Recent messages in a channel'), tool('post_message', 'post_message', 'Post as the agent', true)] },
  { id: 'postgres', name: 'Postgres', logo: <Logo src={postgresLogo} />, url: 'localhost:5432 · stdio', status: 'connected', on: false, tools: [tool('list_tables', 'list_tables', 'Schemas and tables'), tool('query', 'query', 'Read-only SQL')] },
  { id: 'notion', name: 'Notion', logo: <Logo src={notionLogo} />, url: 'mcp.notion.com/sse', status: 'off', on: false, tools: [tool('search', 'search', 'Search pages'), tool('create_page', 'create_page', 'Write a page', true)] },
];

/** The servers with the generated agent's tools switched on. */
const generatedServers = () => SERVERS.map((s) => (GEN.tools[s.id] ? { ...s, on: true, tools: s.tools.map((t) => ({ ...t, on: GEN.tools[s.id].includes(t.id) })) } : s));

const SKILLS: Skill[] = [
  { id: 'incident', name: 'Incident write-up', desc: 'Turns an error into a clear issue: impact, repro, suspect commit.', by: 'Your team', version: '1.3.0', on: false },
  { id: 'pdf', name: 'PDF', desc: 'Read, fill and generate PDF files.', by: 'Anthropic', version: '2.1.0', on: false },
  { id: 'xlsx', name: 'Spreadsheets', desc: 'Formulas, charts and clean tables in .xlsx.', by: 'Anthropic', version: '2.0.4', on: false },
  { id: 'voice', name: 'Brand voice', desc: 'House style for every message the agent writes.', by: 'Your team', version: '0.9.2', on: false },
  { id: 'sql', name: 'SQL analyst', desc: 'Writes safe, explained queries against your warehouse.', by: 'Community', version: '1.0.1', on: false },
];

const BUILTINS: BuiltIn[] = [
  { id: 'web', name: 'Web search', desc: 'Search and read public pages', icon: <Globe />, on: false },
  { id: 'code', name: 'Code execution', desc: 'Run Python in a sandbox', icon: <Code2 />, on: false },
  { id: 'memory', name: 'Memory', desc: 'Remember facts across runs', icon: <Brain />, on: true },
  { id: 'files', name: 'File system', desc: 'Read and write a scratch folder', icon: <HardDrive />, on: false },
  { id: 'image', name: 'Image generation', desc: 'Create images from prompts', icon: <Image />, on: false },
];


/** The agent's bloub: body shape, colour and resting expression (bloub's customiser). */
type Look = { shape: string; color: string; expression: string };
const GEN_LOOK: Look = { shape: 'galet', color: 'turquoise', expression: 'attentif' };

/* ------------------------------------------------------------------ the chat script reads the live config */

type Config = { name: string; model: string; servers: Server[]; skills: Skill[] };
// Each preview frame is its own document, so module state is per frame.
const live: { config: Config | null } = { config: null };

const isOn = (c: Config, server: string, toolId: string) => {
  const s = c.servers.find((x) => x.id === server);
  return Boolean(s?.on && s.status === 'connected' && s.tools.find((x) => x.id === toolId)?.on);
};

async function triage(api: ChatScriptApi) {
  const c = live.config!;
  const a = api.assistant();
  await a.think('Thinking', ['New error: TypeError in checkout/confirm', 'Plan: read the event, find the code, check for duplicates'], 450);
  const steps: [string, string, string, string, string][] = [
    ['sentry', 'list_issues', 'sentry.list_issues', 'project:web · last 1h', '1 new · ERR-4821'],
    ['sentry', 'get_event', 'sentry.get_event', 'ERR-4821', 'TypeError at confirm.ts:42'],
    ['github', 'search_code', 'github.search_code', '"confirmPayment" repo:acme/web', '2 matches'],
    ['linear', 'search_issues', 'linear.search_issues', '"confirmPayment TypeError"', 'no duplicate'],
  ];
  const missing: string[] = [];
  for (const [server, id, name, arg, meta] of steps) {
    if (isOn(c, server, id)) await a.tool(name, arg, { ms: 650, meta });
    else {
      missing.push(name);
      await a.tool(name, arg, { ms: 250, status: 'error', meta: 'disabled' });
    }
  }
  if (isOn(c, 'linear', 'create_issue')) {
    const ask = c.servers.find((s) => s.id === 'linear')!.tools.find((t) => t.id === 'create_issue')!.approval === 'ask';
    await a.tool('linear.create_issue', 'team:WEB · "TypeError in confirmPayment"', { ms: 800, meta: ask ? 'approved · WEB-1288' : 'WEB-1288' });
  } else missing.push('linear.create_issue');
  const skill = c.skills.find((s) => s.id === 'incident')?.on;
  await a.stream(
    missing.length === 0
      ? `Created **WEB-1288** — "TypeError in confirmPayment".${skill ? '\n\n- **Impact:** 3.1% of checkouts in eu-west since 14:05\n- **Suspect commit:** `a41f9c2` changed the payment client timeout\n- **Owner:** @maya (last touched confirm.ts)' : ' Turn on the **Incident write-up** skill for impact, repro and owner sections.'}`
      : `I couldn't finish: ${missing.map((m) => `\`${m}\``).join(', ')} ${missing.length > 1 ? 'are' : 'is'} switched off. Open **Configure → MCP servers**, turn ${missing.length > 1 ? 'them' : 'it'} on and ask again.`,
    30,
  );
  a.done();
}

async function intro(api: ChatScriptApi) {
  await api.sleep(600);
  await api.user(GEN.starters[0], { type: true });
  await triage(api);
}

async function reply(api: ChatScriptApi, text: string) {
  if (/triage|error|sentry|duplicate|ERR/i.test(text)) return triage(api);
  const c = live.config!;
  const a = api.assistant();
  const tools = c.servers.flatMap((s) => (s.on && s.status === 'connected' ? s.tools.filter((t) => t.on).map((t) => `${s.id}.${t.name}`) : []));
  const skills = c.skills.filter((s) => s.on).map((s) => s.name);
  await a.think('Thinking', ['Checking what I am allowed to use'], 400);
  await a.stream(
    `I'm **${c.name || 'your agent'}** on ${c.model}. Right now I can use ${tools.length ? tools.map((t) => `\`${t}\``).join(', ') : 'no MCP tools'}${skills.length ? `, plus the ${skills.join(', ')} skill${skills.length > 1 ? 's' : ''}` : ''}. Ask me to triage an error to see them in action.`,
    30,
  );
  a.done();
}

/* ------------------------------------------------------------------ form pieces */

const field = 'w-full rounded-xl border border-border-button-default bg-background-primary-default px-3 text-body-2-regular text-text-primary shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-text-tertiary focus:border-border-button-hover focus:shadow-sm';

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline gap-2 text-body-2-medium text-text-primary">
        {label}
        {hint && <span className="text-caption-1-regular text-text-tertiary">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/** Settings row: icon, title, description, control on the right. */
function Row({ icon, title, desc, children, className }: { icon: ReactNode; title: ReactNode; desc: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 rounded-2xl bg-background-primary-default px-3 py-2.5 shadow-xs', className)}>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-background-tertiary-default text-foreground-icon-secondary [&_svg]:size-4">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2 text-body-2-semibold text-text-primary">{title}</span>
        <span className="truncate text-caption-1-regular text-text-tertiary">{desc}</span>
      </span>
      {children}
    </div>
  );
}

function Picker({ label, hint, cols = 'grid-cols-4 sm:grid-cols-8', children }: { label: string; hint?: string; cols?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-baseline gap-2 text-body-2-medium text-text-primary">
        {label}
        {hint && <span className="text-caption-1-regular text-text-tertiary">{hint}</span>}
      </span>
      <div className={cn('grid gap-1', cols)}>{children}</div>
    </div>
  );
}

/** A frozen bloub thumbnail (no animation loop) with its name. */
function Thumb({ name, on, onClick, children }: { name: string; on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      title={name}
      aria-pressed={on}
      onClick={onClick}
      className={cn('flex flex-col items-center rounded-xl pb-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring', on ? 'bg-background-tertiary-default ring-1 ring-text-primary/70' : 'hover:bg-background-tertiary-default/60')}
    >
      {children}
      <span className={cn('w-full truncate px-0.5 text-center text-caption-2-regular', on ? 'text-text-primary' : 'text-text-tertiary')}>{name}</span>
    </button>
  );
}

/** Brief ring on a value the generator just set. */
const flash = (on: boolean) => (on ? 'ring-2 ring-violet-500/40 transition-shadow duration-500' : 'transition-shadow duration-700');

function ServerCard({ s, onChange, highlight }: { s: Server; onChange: (s: Server) => void; highlight: boolean }) {
  const [open, setOpen] = useState(false);
  const enabled = s.tools.filter((t) => t.on).length;
  const usable = s.status === 'connected';
  return (
    <FramePanel className={cn('flex flex-col', flash(highlight))}>
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* White in both themes: brand marks are drawn for a light ground (Sentry's purple vanishes on dark). */}
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-black/[0.08] bg-white p-2 shadow-xs">{s.logo}</span>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex min-w-0 flex-1 flex-col text-start">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-body-2-semibold text-text-primary">{s.name}</span>
            {s.status === 'connected' ? (
              <Badge tone="success" dot className="h-[18px] px-1">Connected</Badge>
            ) : s.status === 'auth' ? (
              <Badge tone="warning" className="h-[18px] px-1">Needs sign-in</Badge>
            ) : (
              <Badge tone="neutral" className="h-[18px] px-1">Not connected</Badge>
            )}
          </span>
          <span className="truncate font-mono text-caption-1-regular text-text-tertiary">
            {s.url} · {enabled}/{s.tools.length} tools
          </span>
        </button>
        <IconButton label={open ? 'Hide tools' : 'Show tools'} onClick={() => setOpen((o) => !o)}>
          <ChevronDown className={cn('transition-transform duration-200', open && 'rotate-180')} />
        </IconButton>
        {usable ? (
          <Switch checked={s.on} onCheckedChange={(on) => onChange({ ...s, on })} aria-label={`Enable ${s.name}`} />
        ) : (
          <button type="button" onClick={() => onChange({ ...s, status: 'connected' })} className="flex h-7 shrink-0 items-center gap-1 rounded-lg border border-border-button-default bg-background-primary-default px-2 text-caption-1-medium text-text-primary shadow-xs">
            <Plug className="size-3.5" /> {s.status === 'auth' ? 'Sign in' : 'Connect'}
          </button>
        )}
      </div>
      {open && (
        <ul className="animate-in fade-in-0 slide-in-from-top-1 flex flex-col border-t border-separator-border duration-200">
          {s.tools.map((t) => (
            <li key={t.id} className={cn('flex items-center gap-3 px-3 py-2', !(s.on && usable) && 'opacity-50')}>
              <Wrench className="size-3.5 shrink-0 text-foreground-icon-tertiary" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-1.5 font-mono text-caption-1-medium text-text-primary">
                  {t.name}
                  {t.write && <Badge tone="warning" className="h-4 px-1 font-sans text-[10px]">write</Badge>}
                </span>
                <span className="truncate text-caption-1-regular text-text-tertiary">{t.desc}</span>
              </span>
              <button
                type="button"
                disabled={!t.on}
                onClick={() => onChange({ ...s, tools: s.tools.map((x) => (x.id === t.id ? { ...x, approval: x.approval === 'ask' ? 'auto' : 'ask' } : x)) })}
                className={cn('flex h-6 items-center gap-1 rounded-md border px-1.5 text-caption-2-medium transition-colors disabled:opacity-40', t.approval === 'ask' ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'border-border-button-default text-text-secondary')}
              >
                {t.approval === 'ask' ? <Lock className="size-3" /> : <Zap className="size-3" />}
                <span className="hidden sm:inline">{t.approval === 'ask' ? 'Ask first' : 'Auto'}</span>
              </button>
              <Switch
                checked={t.on}
                disabled={!(s.on && usable)}
                onCheckedChange={(on) => onChange({ ...s, tools: s.tools.map((x) => (x.id === t.id ? { ...x, on } : x)) })}
                aria-label={`Enable ${t.name}`}
                className="scale-90"
              />
            </li>
          ))}
        </ul>
      )}
    </FramePanel>
  );
}

/* ------------------------------------------------------------------ settings menu */

type SectionId = 'identity' | 'instructions' | 'mcp' | 'skills' | 'builtin' | 'knowledge' | 'deploy';
const MENU: { group: string; items: { id: SectionId; label: string; icon: ReactNode; sub: string }[] }[] = [
  {
    group: 'Agent',
    items: [
      { id: 'identity', label: 'Identity', icon: <Bot />, sub: 'Name, look and model.' },
      { id: 'instructions', label: 'Instructions', icon: <MessageSquare />, sub: 'The system prompt and conversation starters.' },
    ],
  },
  {
    group: 'Capabilities',
    items: [
      { id: 'mcp', label: 'MCP servers', icon: <Plug />, sub: 'Connect servers and choose each tool the agent may call.' },
      { id: 'skills', label: 'Skills', icon: <Sparkles />, sub: 'Packaged know-how the agent loads when a task needs it.' },
      { id: 'builtin', label: 'Built-in tools', icon: <Wrench />, sub: 'Capabilities provided by the platform.' },
      { id: 'knowledge', label: 'Knowledge', icon: <BookOpen />, sub: 'Files and sites the agent can search.' },
    ],
  },
  { group: 'Publish', items: [{ id: 'deploy', label: 'Deploy', icon: <Rocket />, sub: 'Check the essentials, pick where it runs, ship it.' }] },
];
const ALL = MENU.flatMap((g) => g.items);

export default function AgentBuilderTemplate() {
  // `?configure=<section>` deep-links straight into the settings.
  const [deepLink] = useState(() => new URLSearchParams(window.location.search).get('configure') as SectionId | null);
  const [open, setOpen] = useState(Boolean(deepLink && ALL.some((i) => i.id === deepLink)));
  const [section, setSection] = useState<SectionId>(deepLink && ALL.some((i) => i.id === deepLink) ? deepLink : 'identity');
  const [prompt, setPrompt] = useState(GEN.prompt);
  const [generating, setGenerating] = useState(false);
  const [name, setName] = useState(GEN.name);
  const [description, setDescription] = useState(GEN.description);
  const [look, setLook] = useState<Look>(GEN_LOOK);
  const [preview, setPreview] = useState<StateId | null>(null);
  const [after, setAfter] = useState<StateId | null>(null);
  const [model, setModel] = useState('Sonnet 5');
  const [temperature, setTemperature] = useState(0.3);
  const [instructions, setInstructions] = useState(GEN.instructions);
  const [starters, setStarters] = useState<string[]>(GEN.starters);
  const [servers, setServers] = useState<Server[]>(generatedServers);
  const [skills, setSkills] = useState<Skill[]>(() => SKILLS.map((s) => ({ ...s, on: GEN.skills.includes(s.id) })));
  const [builtins, setBuiltins] = useState(BUILTINS);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState('');
  const [lit, setLit] = useState<Set<string>>(new Set());
  const [deploy, setDeploy] = useState<{ targets: Record<string, boolean>; state: 'idle' | 'deploying' | 'live'; progress: number }>({ targets: { api: true, slack: false, widget: true }, state: 'idle', progress: 0 });
  const timers = useRef<number[]>([]);
  const body = useRef<HTMLDivElement>(null);

  live.config = { name, model, servers, skills };
  const chat = useChatEngine({ intro, reply });

  // The bloub acts out what the agent is doing: thinking, orbiting while a tool runs, a wink when it is done.
  const lastMsg = chat.messages[chat.messages.length - 1];
  const toolRunning = Boolean(chat.busy && lastMsg?.parts.some((p) => p.kind === 'tool' && p.status === 'running'));
  useEffect(() => {
    if (chat.busy || !chat.messages.length) return;
    setAfter('wink');
    const id = window.setTimeout(() => setAfter(null), 1400);
    return () => window.clearTimeout(id);
  }, [chat.busy, chat.messages.length]);
  const mood: StateId = chat.busy ? (toolRunning ? 'orbit' : 'thinking') : (after ?? 'idle');

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  // Braces matter: Chromium's scrollTo() now returns a Promise, which React would take for a cleanup.
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [section]);

  const configure = (s: SectionId) => {
    setSection(s);
    setOpen(true);
  };

  /** "Generate with AI": clears the agent and redrafts it, walking through the sections as it streams. */
  const generate = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setGenerating(true);
    setName('');
    setDescription('');
    setInstructions('');
    setStarters([]);
    setServers(SERVERS);
    setSkills(SKILLS);
    setLook({ shape: 'cercle', color: 'gris', expression: 'neutre' });
    let t = 200;
    for (let i = 1; i <= GEN.name.length; i++) later((t += 45), () => setName(GEN.name.slice(0, i)));
    later((t += 200), () => setLook((l) => ({ ...l, shape: GEN_LOOK.shape })));
    later((t += 200), () => setLook((l) => ({ ...l, color: GEN_LOOK.color })));
    later((t += 200), () => setLook(GEN_LOOK));
    for (let i = 4; i <= GEN.description.length + 3; i += 4) later((t += 22), () => setDescription(GEN.description.slice(0, i)));
    later((t += 300), () => setSection('instructions'));
    for (let i = 8; i <= GEN.instructions.length + 7; i += 8) later((t += 14), () => setInstructions(GEN.instructions.slice(0, i)));
    GEN.starters.forEach((_, i) => later((t += 160), () => setStarters(GEN.starters.slice(0, i + 1))));
    later((t += 400), () => setSection('mcp'));
    Object.keys(GEN.tools).forEach((sid) =>
      later((t += 420), () => {
        setServers((all) => all.map((s) => (s.id === sid ? generatedServers().find((g) => g.id === sid)! : s)));
        setLit((l) => new Set(l).add(sid));
        later(900, () => setLit((l) => (l.delete(sid), new Set(l))));
      }),
    );
    later((t += 500), () => setSection('skills'));
    later((t += 400), () => {
      setSkills((all) => all.map((s) => ({ ...s, on: GEN.skills.includes(s.id) })));
      setLit((l) => new Set(l).add('incident'));
      later(900, () => setLit(new Set()));
    });
    later((t += 300), () => setGenerating(false));
  };

  const addDoc = () => {
    const n = docs.length;
    const doc = { name: ['runbook-checkout.md', 'oncall-rotation.pdf', 'service-owners.csv'][n % 3], size: ['14 KB', '220 KB', '3 KB'][n % 3], progress: 0 };
    setDocs((d) => [...d, doc]);
    for (let p = 20; p <= 100; p += 20) later(p * 9, () => setDocs((d) => d.map((x, i) => (i === n ? { ...x, progress: p } : x))));
  };

  const runDeploy = () => {
    setDeploy((d) => ({ ...d, state: 'deploying', progress: 0 }));
    for (let p = 10; p <= 100; p += 10) later(p * 22, () => setDeploy((d) => ({ ...d, progress: p, state: p === 100 ? 'live' : 'deploying' })));
  };

  const toolsOn = useMemo(() => servers.reduce((n, s) => n + (s.on && s.status === 'connected' ? s.tools.filter((t) => t.on).length : 0), 0), [servers]);
  const toolsAll = servers.reduce((n, s) => n + s.tools.length, 0);
  const skillsOn = skills.filter((s) => s.on).length;
  const builtinsOn = builtins.filter((b) => b.on).length;
  const tokens = toolsOn * 340 + skillsOn * 120 + builtinsOn * 260;
  const match = (s: string) => s.toLowerCase().includes(q.toLowerCase());
  const count: Partial<Record<SectionId, ReactNode>> = { mcp: toolsOn, skills: skillsOn, builtin: builtinsOn, knowledge: docs.length || undefined, deploy: deploy.state === 'live' ? <span className="size-1.5 rounded-full bg-emerald-500" /> : undefined };
  const checks: [string, boolean][] = [
    ['Name and model', Boolean(name && model)],
    ['Instructions', instructions.length > 40],
    ['At least one tool', toolsOn > 0],
    ['Writes ask before running', servers.every((s) => s.tools.every((t) => !t.on || !t.write || t.approval === 'ask'))],
    ['Tested in chat', chat.messages.some((m) => m.role === 'assistant' && m.done)],
  ];
  const current = ALL.find((i) => i.id === section)!;
  // The viewBox leaves room for orbit rings, so the body is ~63% of `size`.
  const avatar = (size: number) => <Bloub size={size} state={mood} {...look} label={`${name || 'Agent'} avatar`} className="-m-[3px] shrink-0" />;

  const sections: Record<SectionId, ReactNode> = {
    identity: (
      <div className="flex flex-col gap-6">
        <Frame className="border-violet-500/25 bg-violet-500/[0.07]">
          <FrameHeader icon={<Wand2 className="text-violet-600! dark:text-violet-400!" />} title="Describe it, we draft the rest">
            {generating && <ThinkingIndicator label="Generating" small showTimer={false} />}
          </FrameHeader>
          <FramePanel className="flex flex-col gap-2 p-2 sm:flex-row sm:items-end">
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} placeholder="What should your agent do?" className="min-h-12 flex-1 resize-none bg-transparent px-1.5 py-1 text-body-2-regular leading-6 outline-none placeholder:text-text-tertiary" />
            <button type="button" disabled={generating || !prompt.trim()} onClick={generate} className="flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 text-body-2-medium text-white shadow-xs disabled:opacity-40">
              {generating ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Generate
            </button>
          </FramePanel>
        </Frame>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* Live bloub: follows the pointer at rest, plays whichever animation you pick below. */}
          <div className="flex shrink-0 flex-col items-center gap-1 self-center rounded-3xl bg-background-primary-default px-3 pt-1 pb-2.5 shadow-xs sm:self-start">
            <Bloub size={136} state={preview ?? mood} {...look} paper="panel" follow label={`${name || 'Agent'} avatar`} />
            <span className="text-caption-1-medium text-text-tertiary">{BLOUB_NAMES[preview ?? mood]}</span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Triage Bot" className={cn(field, 'h-9')} />
            </Field>
            <Field label="Description" hint="shown to people who use it">
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="One line about what it does" className={cn(field, 'h-9')} />
            </Field>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Model">
            <div className={cn(field, 'flex h-9 items-center px-1')}>
              <ModelPicker value={model} onChange={setModel} className="w-full justify-between" />
            </div>
          </Field>
          <Field label="Temperature" hint={temperature.toFixed(1)}>
            <input type="range" min={0} max={1} step={0.1} value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="h-9 w-full accent-[var(--color-text-primary)]" />
          </Field>
        </div>

        {/* bloub's customiser: 8 shapes, 12 colours, 16 resting expressions, and the 14 animations to preview. */}
        <Frame>
          <FrameHeader icon={<Sparkles />} title="Avatar">
            <span className="text-caption-1-regular text-text-tertiary">bloub</span>
          </FrameHeader>
          <FramePanel className="flex flex-col gap-4 p-3">
            <Picker label="Shape">
              {SHAPES.map((s) => (
                <Thumb key={s.id} name={BLOUB_NAMES[s.id]} on={look.shape === s.id} onClick={() => setLook({ ...look, shape: s.id })}>
                  <Bloub size={52} frozenAt={POSES.idle} shape={s.id} color={look.color} expression={look.expression} paper="panel" />
                </Thumb>
              ))}
            </Picker>
            <Picker label="Colour" cols="grid-cols-6 sm:grid-cols-12">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  title={BLOUB_NAMES[c.id]}
                  aria-label={BLOUB_NAMES[c.id]}
                  aria-pressed={look.color === c.id}
                  onClick={() => setLook({ ...look, color: c.id })}
                  className={cn('mx-auto size-7 rounded-full border border-black/10 ring-offset-2 ring-offset-background-primary-default transition-[box-shadow,scale] hover:scale-110 dark:border-white/15', look.color === c.id && 'ring-2 ring-text-primary')}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </Picker>
            <Picker label="Expression">
              {EXPRESSIONS.map((e) => (
                <Thumb key={e.id} name={BLOUB_NAMES[e.id]} on={look.expression === e.id} onClick={() => setLook({ ...look, expression: e.id })}>
                  <Bloub size={52} frozenAt={POSES.idle} shape={look.shape} color={look.color} expression={e.id} paper="panel" />
                </Thumb>
              ))}
            </Picker>
            <Picker label="Animations" hint="click to preview">
              {SEQUENCE.map((s) => (
                <Thumb key={s} name={BLOUB_NAMES[s]} on={preview === s} onClick={() => setPreview(preview === s ? null : s)}>
                  <Bloub size={52} state={s} frozenAt={POSES[s]} shape={look.shape} color={look.color} expression={look.expression} paper="panel" />
                </Thumb>
              ))}
            </Picker>
          </FramePanel>
        </Frame>
      </div>
    ),

    instructions: (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border-button-default bg-background-primary-default shadow-xs focus-within:border-border-button-hover">
          <div className="flex items-center gap-1.5 border-b border-separator-border px-3 py-1.5">
            {['{{user.name}}', '{{date}}', '{{team}}'].map((v) => (
              <button key={v} type="button" onClick={() => setInstructions((s) => `${s}${v}`)} className="rounded-md bg-background-tertiary-default px-1.5 py-0.5 font-mono text-caption-2-regular text-text-secondary hover:text-text-primary">
                {v}
              </button>
            ))}
            <span className="ms-auto text-caption-1-regular text-text-tertiary tabular-nums">{instructions.length} chars</span>
          </div>
          <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={12} placeholder="You are…" className="scrollbar-thin resize-none bg-transparent px-3.5 py-3 font-mono text-[12.5px] leading-6 text-text-primary outline-none placeholder:text-text-tertiary" />
        </div>
        <Field label="Conversation starters" hint="shown on an empty chat">
          <div className="flex flex-col gap-1.5">
            {starters.map((s, i) => (
              <div key={i} className="animate-in fade-in-0 slide-in-from-left-1 flex items-center gap-2 duration-300">
                <input value={s} onChange={(e) => setStarters(starters.map((x, j) => (j === i ? e.target.value : x)))} className={cn(field, 'h-8')} />
                <IconButton label="Remove starter" onClick={() => setStarters(starters.filter((_, j) => j !== i))}>
                  <X />
                </IconButton>
              </div>
            ))}
            <button type="button" onClick={() => setStarters([...starters, ''])} className="flex h-8 w-fit items-center gap-1.5 rounded-lg px-2 text-body-2-medium text-text-secondary hover:text-text-primary">
              <Plus className="size-4" /> Add starter
            </button>
          </div>
        </Field>
      </div>
    ),

    mcp: (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            ['Tools on', `${toolsOn}/${toolsAll}`],
            ['Servers', `${servers.filter((s) => s.on && s.status === 'connected').length}/${servers.length}`],
            ['Context', `${(tokens / 1000).toFixed(1)}K tok`],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col rounded-2xl bg-background-primary-default px-3 py-2 shadow-xs">
              <span className="text-caption-1-medium text-text-tertiary">{k}</span>
              <span className="text-headline-semibold tabular-nums">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border-button-default bg-background-primary-default px-2.5 shadow-xs">
            <Search className="size-4 text-foreground-icon-tertiary" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter servers and tools" className="min-w-0 flex-1 bg-transparent text-body-2-regular outline-none placeholder:text-text-tertiary" />
          </label>
          <HeaderButton outline onClick={() => setAdding((a) => !a)}>
            {adding ? <X /> : <Plus />} <span className="hidden sm:inline">{adding ? 'Cancel' : 'Add server'}</span>
          </HeaderButton>
        </div>
        {adding && (
          <div className="animate-in fade-in-0 slide-in-from-top-1 flex flex-col gap-2 rounded-2xl bg-background-primary-default p-3 shadow-xs duration-200">
            <div className="flex gap-2">
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://mcp.example.com/sse" className={cn(field, 'h-8 font-mono text-caption-1-regular')} />
              <button
                type="button"
                disabled={!url.trim()}
                onClick={() => {
                  const host = url.replace(/^https?:\/\//, '');
                  setServers([...servers, { id: `custom-${servers.length}`, name: host.split(/[./]/)[1] ?? host, logo: <Link2 className="size-full text-foreground-icon-secondary" />, url: host, status: 'connected', on: true, tools: [{ ...tool('ping', 'ping', 'Health check'), on: true }, tool('call', 'call', 'Generic call', true)] }]);
                  setUrl('');
                  setAdding(false);
                }}
                className="h-8 shrink-0 rounded-lg bg-text-primary px-3 text-body-2-medium text-background-primary-default disabled:opacity-30"
              >
                Connect
              </button>
            </div>
            <span className="text-caption-1-regular text-text-tertiary">Streamable HTTP or SSE. Tools are discovered on connect.</span>
          </div>
        )}
        <Frame>
          {servers.filter((s) => match(s.name) || s.tools.some((t) => match(t.name))).map((s) => (
            <ServerCard key={s.id} s={s} highlight={lit.has(s.id)} onChange={(n) => setServers(servers.map((x) => (x.id === n.id ? n : x)))} />
          ))}
        </Frame>
      </div>
    ),

    skills: (
      <div className="flex flex-col gap-2">
        {skills.map((s) => (
          <Row
            key={s.id}
            className={flash(lit.has(s.id))}
            icon={<FileText className="text-violet-600 dark:text-violet-400" />}
            title={
              <>
                {s.name}
                <span className="font-mono text-caption-2-regular font-normal text-text-tertiary">v{s.version}</span>
                <Badge tone={s.by === 'Anthropic' ? 'info' : s.by === 'Your team' ? 'purple' : 'neutral'} className="hidden h-[18px] px-1 sm:inline-flex">
                  {s.by}
                </Badge>
              </>
            }
            desc={s.desc}
          >
            <Switch checked={s.on} onCheckedChange={(on) => setSkills(skills.map((x) => (x.id === s.id ? { ...x, on } : x)))} aria-label={`Enable ${s.name}`} />
          </Row>
        ))}
        <button type="button" className="mt-1 flex h-11 items-center justify-center gap-2 rounded-2xl border border-dashed border-border-button-hover text-body-2-medium text-text-secondary transition-colors hover:bg-background-primary-default hover:text-text-primary">
          <Upload className="size-4" /> Upload a skill (.zip)
        </button>
      </div>
    ),

    builtin: (
      <div className="flex flex-col gap-2">
        {builtins.map((b) => (
          <Row key={b.id} icon={b.icon} title={b.name} desc={b.desc}>
            <Switch checked={b.on} onCheckedChange={(on) => setBuiltins(builtins.map((x) => (x.id === b.id ? { ...x, on } : x)))} aria-label={`Enable ${b.name}`} />
          </Row>
        ))}
      </div>
    ),

    knowledge: (
      <div className="flex flex-col gap-5">
        <button type="button" onClick={addDoc} className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border-button-hover bg-background-primary-default/60 px-4 py-8 text-center transition-colors hover:bg-background-primary-default">
          <span className="grid size-10 place-items-center rounded-xl bg-background-tertiary-default text-foreground-icon-secondary">
            <Upload className="size-5" />
          </span>
          <span className="text-body-2-medium text-text-primary">Drop files or click to upload</span>
          <span className="text-caption-1-regular text-text-tertiary">PDF, Markdown, CSV · up to 50 MB each</span>
        </button>
        {docs.map((d, i) => (
          <Row key={i} icon={<FileText />} title={d.name} desc={<span className="flex items-center gap-2">{d.size}<span className="h-1 w-24 overflow-hidden rounded-full bg-background-tertiary-default"><span className={cn('block h-full rounded-full transition-[width] duration-300', d.progress === 100 ? 'bg-emerald-500' : 'bg-accent-500')} style={{ width: `${d.progress}%` }} /></span></span>}>
            {d.progress === 100 ? <Badge tone="success">Indexed</Badge> : <Badge tone="info">{d.progress}%</Badge>}
          </Row>
        ))}
        <Field label="Websites" hint="crawled weekly">
          <div className="flex gap-2">
            <input placeholder="https://docs.acme.dev" className={cn(field, 'h-9')} />
            <button type="button" className="h-9 shrink-0 rounded-xl border border-border-button-default bg-background-primary-default px-3 text-body-2-medium shadow-xs">
              Add
            </button>
          </div>
        </Field>
      </div>
    ),

    deploy: (
      <div className="flex flex-col gap-5">
        <Frame>
          <FrameHeader icon={<ShieldCheck />} title="Checklist">
            <Badge tone={checks.every(([, ok]) => ok) ? 'success' : 'warning'}>
              {checks.filter(([, ok]) => ok).length}/{checks.length}
            </Badge>
          </FrameHeader>
          <FramePanel>
            <ul className="flex flex-col py-1">
              {checks.map(([k, ok]) => (
                <li key={k} className="flex items-center gap-2.5 px-3 py-1.5 text-body-2-regular">
                  {ok ? (
                    <span className="grid size-4 place-items-center rounded-full bg-emerald-500 text-white">
                      <Check className="size-2.5" strokeWidth={3.5} />
                    </span>
                  ) : (
                    <span className="size-4 rounded-full border-[1.5px] border-dashed border-foreground-icon-quaternary" />
                  )}
                  <span className={ok ? 'text-text-primary' : 'text-text-secondary'}>{k}</span>
                </li>
              ))}
            </ul>
          </FramePanel>
        </Frame>
        <div className="flex flex-col gap-2">
          {([['api', 'API', 'REST endpoint with streaming', <Code2 key="a" />], ['slack', 'Slack app', 'Mention it in any channel', <Hash key="s" />], ['widget', 'Web widget', 'Embed on your site', <Globe key="w" />]] as const).map(([id, label, desc, icon]) => (
            <Row key={id} icon={icon} title={label} desc={desc}>
              <Switch checked={deploy.targets[id]} onCheckedChange={(on) => setDeploy((d) => ({ ...d, targets: { ...d.targets, [id]: on } }))} aria-label={`Deploy to ${label}`} />
            </Row>
          ))}
        </div>
        {deploy.state === 'live' ? (
          <CodeBlock className="tpl-reveal" lang="bash" title="Live · agents.acme.dev" code={`curl https://agents.acme.dev/v1/${(name || 'agent').toLowerCase().replace(/\s+/g, '-')}/runs \\\n  -H "Authorization: Bearer $ACME_KEY" \\\n  -d '{"input": "${GEN.starters[0]}"}'`} />
        ) : (
          <button type="button" disabled={deploy.state === 'deploying'} onClick={runDeploy} className="relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-text-primary text-body-medium text-background-primary-default shadow-xs disabled:cursor-wait">
            {deploy.state === 'deploying' && <span className="absolute inset-y-0 left-0 bg-white/15 transition-[width] duration-200" style={{ width: `${deploy.progress}%` }} />}
            {deploy.state === 'deploying' ? <LoaderCircle className="size-4 animate-spin" /> : <Rocket className="size-4" />}
            {deploy.state === 'deploying' ? `Deploying… ${deploy.progress}%` : `Deploy ${name || 'agent'}`}
          </button>
        )}
      </div>
    ),
  };

  const empty = chat.messages.length === 0;
  const composer = (
    <Composer reply={chat.replyTo} onClearReply={chat.clearReply}
      context={Math.min(95, 14 + Math.round(tokens / 120) + chat.messages.length * 3)}
      branch="Main"
      project={(name || "agent").toLowerCase().replace(/s+/g, "-")}
      value={chat.draft}
      onChange={chat.setDraft}
      onSend={chat.send}
      onStop={chat.stop}
      busy={chat.busy}
      placeholder={`Message ${name || 'your agent'}`}
      model={<ModelPicker value={model} onChange={setModel} />}
      status={
        <>
          <button type="button" onClick={() => configure('mcp')} className="flex items-center gap-1 rounded-md px-1 transition-colors hover:text-text-primary">
            <Wrench /> {toolsOn} tools · {skillsOn} skill{skillsOn === 1 ? '' : 's'}
          </button>
          <button type="button" onClick={() => configure('deploy')} className="flex items-center gap-1 rounded-md px-1 transition-colors hover:text-text-primary">
            <Rocket /> {deploy.state === 'live' ? 'Live' : 'Draft'}
          </button>
        </>
      }
    />
  );

  return (
    <Canvas>
      <ChatSurface
        dep={chat.messages}
        empty={empty}
        header={
          <>
            {avatar(36)}
            <span className="min-w-0 truncate text-headline-medium">{name || 'New agent'}</span>
            <Badge tone="outline" className="hidden sm:inline-flex">{model}</Badge>
            <span className="ms-auto flex items-center gap-1">
              <HeaderTools />
              <HeaderButton outline onClick={() => configure('identity')}>
                <Settings2 /> <span className="hidden sm:inline">Configure</span>
              </HeaderButton>
            </span>
          </>
        }
        footer={!empty && composer}
      >
        {empty ? (
          <Welcome icon={avatar(96)} title={name || 'Your agent'} subtitle={description}>
            <div className="mt-2 w-full max-w-2xl text-start">{composer}</div>
            <Suggestions className="justify-center" items={starters.filter(Boolean)} onPick={chat.send} />
          </Welcome>
        ) : (
          chat.messages.map((m, i) =>
            m.role === 'user' ? (
              <UserMessage key={m.id} replyTo={m.replyTo} onEdit={() => chat.setDraft(textOf(m))}>
                {textOf(m)}
              </UserMessage>
            ) : (
              <AssistantMessage key={m.id} message={m} onReply={chat.startReply} isLast={i === chat.messages.length - 1} toolIcon={() => <Wrench />} onRegenerate={() => chat.send(GEN.starters[0])} />
            ),
          )
        )}
      </ChatSurface>

      {/* Settings: ~60% of the window on desktop with a side menu; full screen with tabs on phones. */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          // Focus the dialog itself rather than the first menu item, which would open with a focus ring.
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).focus();
          }}
          aria-describedby={undefined}
          className="bg-background-secondary-default max-md:inset-2 max-md:h-auto max-md:w-auto max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-2xl max-md:border max-md:border-border-button-default md:h-[min(760px,88vh)] md:w-[clamp(min(720px,94vw),60vw,1120px)] md:flex-row md:rounded-3xl md:border md:border-border-button-default"
        >
          {/* Side menu (desktop) */}
          <aside className="hidden w-60 shrink-0 flex-col gap-4 border-e border-separator-border p-3 md:flex">
            <div className="flex items-center gap-2.5 px-1.5 pt-1">
              {avatar(46)}
              <div className="flex min-w-0 flex-col">
                <DialogTitle className="truncate text-body-semibold">{name || 'New agent'}</DialogTitle>
                <span className="text-caption-1-regular text-text-tertiary">{deploy.state === 'live' ? 'Live' : 'Draft'} · {model}</span>
              </div>
            </div>
            <nav aria-label="Agent settings" className="scrollbar-thin flex flex-1 flex-col gap-4 overflow-y-auto">
              {MENU.map((g) => (
                <div key={g.group} className="flex flex-col gap-0.5">
                  <span className="px-2 pb-1 text-caption-1-medium text-text-tertiary">{g.group}</span>
                  {g.items.map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => setSection(it.id)}
                      aria-current={section === it.id ? 'page' : undefined}
                      className={cn('flex h-9 items-center gap-2.5 rounded-2lg px-2 text-body-2-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring [&>svg]:size-4', section === it.id ? 'bg-background-primary-default text-text-primary shadow-xs' : 'text-text-secondary hover:bg-background-secondary-hover hover:text-text-primary')}
                    >
                      {it.icon}
                      {it.label}
                      {count[it.id] !== undefined && <span className="ms-auto text-caption-1-medium text-text-tertiary tabular-nums">{count[it.id]}</span>}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
            <button type="button" onClick={() => setSection('identity')} className="flex items-center gap-2 rounded-2xl bg-violet-500/10 px-3 py-2.5 text-start text-body-2-medium text-violet-700 transition-colors hover:bg-violet-500/15 dark:text-violet-300">
              {generating ? <LoaderCircle className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
              {generating ? 'Drafting your agent…' : 'Generate with AI'}
            </button>
          </aside>

          {/* Content */}
          <section className="flex min-h-0 min-w-0 flex-1 flex-col">
            <header className="flex shrink-0 items-start gap-3 border-b border-separator-border px-4 pt-3 pb-3 md:px-6 md:pt-5">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2 text-title-3-semibold text-text-primary">
                  <span className="md:hidden">{avatar(30)}</span>
                  {current.label}
                </span>
                <DialogDescription className="text-body-2-regular text-text-secondary">{current.sub}</DialogDescription>
              </div>
              <IconButton label="Close settings" onClick={() => setOpen(false)} className="size-8">
                <X />
              </IconButton>
            </header>
            {/* Tabs (phones) */}
            <nav aria-label="Agent settings" className="scrollbar-none flex shrink-0 gap-1 overflow-x-auto border-b border-separator-border px-3 py-2 md:hidden">
              {ALL.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setSection(it.id)}
                  className={cn('flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-caption-1-medium transition-colors [&>svg]:size-3.5', section === it.id ? 'bg-text-primary text-background-primary-default' : 'bg-background-primary-default text-text-secondary shadow-xs')}
                >
                  {it.icon} {it.label}
                </button>
              ))}
            </nav>
            <div ref={body} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
              <div key={section} className="animate-in fade-in-0 slide-in-from-bottom-1 mx-auto w-full max-w-2xl px-4 py-5 duration-200 md:px-6">
                {sections[section]}
              </div>
            </div>
            <footer className="flex h-14 shrink-0 items-center gap-2 border-t border-separator-border px-4 md:px-6">
              <span className="flex items-center gap-1.5 text-caption-1-regular text-text-tertiary">
                {generating ? <LoaderCircle className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                {generating ? 'Drafting…' : 'Saved'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  chat.send(GEN.starters[0]);
                }}
                className="ms-auto flex h-8 items-center gap-1.5 rounded-lg border border-border-button-default bg-background-primary-default px-3 text-body-2-medium shadow-xs"
              >
                <MessageSquare className="size-4" /> <span className="hidden sm:inline">Test in chat</span>
                <span className="sm:hidden">Test</span>
              </button>
              <button type="button" onClick={() => setOpen(false)} className="flex h-8 items-center rounded-lg bg-text-primary px-4 text-body-2-medium text-background-primary-default shadow-xs">
                Done
              </button>
            </footer>
          </section>
        </DialogContent>
      </Dialog>
    </Canvas>
  );
}
