import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Badge, Frame, FrameHeader, FramePanel } from '@/templates/kit/parts';
import { CodeBlock } from '@/templates/kit/markdown';
import { COMPOSER_VARIANTS, type BaseVariant, type ComposerVariant } from '@/templates/kit/composer-variant';
import { EXTENSIONS, isExtension } from '@/templates/kit/variants';
import type { CompareRow } from '@/templates/kit/variant-types';

/* Spec card and comparison table for the /composers showcase. Every line below describes what
 * src/templates/kit/composers.tsx actually renders; keep them in sync when a variant changes. */

/** Templates that render each variant by default (a <Composer> without `variant` falls back to pill). */
const DEFAULT_IN: Partial<Record<ComposerVariant, string[]>> = {
  pill: ['Assistant', 'Agent Builder', 'Model Compare'],
  box: ['Research', 'Deep Research'],
  panel: ['Data Analyst', 'Agent Approvals'],
  dock: ['Support Copilot', 'Canvas'],
  command: ['Coding Agent'],
};

interface Spec {
  anatomy: string[];
  /** Key chips followed by what they do; `null` keys render the line as plain text. */
  behaviour: { keys: string[] | null; text: string }[];
  bestFor: string;
  usage: string;
}

const SPECS: Record<BaseVariant, Spec> = {
  pill: {
    anatomy: ['Add button', 'Single-line input', 'Model slot', 'Mic (sm and up)', 'Send / Stop', 'Status line under the pill'],
    behaviour: [
      { keys: ['Enter'], text: 'sends; one line only, so Shift+Enter adds nothing' },
      { keys: ['Esc'], text: 'stops while busy, as does the square Stop button' },
      { keys: null, text: 'Busy: Send turns into Stop; Agent Thinking shows above the pill.' },
    ],
    bestFor: 'Quick, conversational prompts where one row is enough. The `tools` slot is not rendered.',
    usage: `<Composer
  value={draft}
  onChange={setDraft}
  onSend={send}
  onStop={stop}
  busy={busy}
  model={<ModelPicker value={model} onChange={setModel} />}
  status={
    <>
      <span><Globe /> Web search on</span>
      <span>{count} messages</span>
    </>
  }
/>`,
  },
  box: {
    anatomy: ['Growing textarea (up to 192px)', 'Add button', 'Tools slot', 'Model slot', 'Mic (sm and up)', 'Send / Stop', 'Status line under the box'],
    behaviour: [
      { keys: ['Enter'], text: 'sends' },
      { keys: ['Shift', 'Enter'], text: 'inserts a newline' },
      { keys: ['Esc'], text: 'stops while busy' },
      { keys: null, text: 'Busy: Send turns into Stop. Clicking the padding focuses the field.' },
    ],
    bestFor: 'Longer, multi-line questions in a reading column, with a few tool chips next to the add button.',
    usage: `<Composer
  variant="box"
  value={draft}
  onChange={setDraft}
  onSend={send}
  onStop={stop}
  busy={busy}
  placeholder="Ask a follow-up"
  tools={<ToolChip icon={<Globe />} label="Web" active={web} onClick={toggleWeb} />}
/>`,
  },
  panel: {
    anatomy: ['Tab rail: branch · project · context ring (opens the Agent Limits Card)', 'Card: attachment strip (56px tiles)', 'Textarea', 'Add button (queues an upload)', 'Permission mode menu', 'Tools slot', 'Model slot', 'Voice + accent Send / Stop', 'Status under the panel'],
    behaviour: [
      { keys: ['Enter'], text: 'sends' },
      { keys: ['Shift', 'Enter'], text: 'inserts a newline' },
      { keys: ['Esc'], text: 'stops while busy' },
      { keys: null, text: 'Busy: Send turns into Stop. Each + queues a file that rings up to 100% before its dismiss appears; sending clears the strip.' },
    ],
    bestFor: 'Agent workspaces: branch, project and context budget on the rail, permission mode beside the prompt, files attached in the card.',
    usage: `<Composer
  variant="panel"
  value={draft}
  onChange={setDraft}
  onSend={send}
  onStop={stop}
  busy={busy}
  placeholder="Ask a question about your data"
  tools={<DatasetChip name="orders" />}
  status={
    <>
      <span>{rows} rows</span>
      <span>Read-only</span>
    </>
  }
/>`,
  },
  dock: {
    anatomy: ['Tool group: add, mention (@md), web toggle', 'Growing textarea', 'Tools slot (inline from @2xl)', 'Model slot', 'Accent send / Stop', 'Tools row under the dock below @2xl', 'Centred status line'],
    behaviour: [
      { keys: ['Enter'], text: 'sends' },
      { keys: ['Shift', 'Enter'], text: 'inserts a newline' },
      { keys: ['Esc'], text: 'stops while busy' },
      { keys: null, text: 'Glass surface (85% background, backdrop blur); busy, Send turns into Stop. Layout follows a container query, not the viewport.' },
    ],
    bestFor: 'Side panels and canvases: the same dock fits a 400px copilot panel and a full-width thread.',
    usage: `<Composer
  variant="dock"
  value={draft}
  onChange={setDraft}
  onSend={send}
  onStop={stop}
  busy={busy}
  placeholder="Ask Copilot"
  model={<ModelPicker value={model} onChange={setModel} />}
  tools={<ToolChip icon={<Ticket />} label="Ticket #4821" />}
/>`,
  },
  command: {
    anatomy: ['Scan line (busy)', 'Slash-command menu', '❯ prompt + monospace textarea', '“run ⏎” submit', 'Key-hint footer with attach and model', 'Tools row under the box', 'Monospace status line'],
    behaviour: [
      { keys: ['⏎'], text: 'sends' },
      { keys: ['⇧', '⏎'], text: 'inserts a newline' },
      { keys: ['/'], text: 'opens /clear, /model, /tools, /summarize; picking one fills the prompt' },
      { keys: ['esc'], text: 'interrupts while busy (key or footer button)' },
      { keys: null, text: 'Busy: an accent scan line runs along the top edge, the footer shows “working” with an elapsed timer, run is disabled.' },
    ],
    bestFor: 'Coding and terminal-style agents, where key hints and commands matter more than buttons.',
    usage: `<Composer
  variant="command"
  value={draft}
  onChange={setDraft}
  onSend={send}
  onStop={stop}
  busy={busy}
  placeholder="Ask the agent to change something"
  tools={<AutoAcceptToggle value={auto} onChange={setAuto} />}
  status={
    <>
      <span><GitBranch /> {files} files changed</span>
      <span>{context}% context</span>
    </>
  }
/>`,
  },
};

const IMPORT = `import { Composer } from '@/templates/kit/composers';\n\n`;

/** Keyboard chip, same recipe as the command composer's key hints. */
const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-border-button-default bg-background-tertiary-default px-1 font-mono text-[10.5px] text-text-secondary">{children}</kbd>
);

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="flex flex-col gap-2 px-3.5 py-3">
    <h3 className="text-caption-1-medium text-text-tertiary uppercase tracking-wide">{title}</h3>
    {children}
  </section>
);

/* ------------------------------------------------------------------ spec card */

export function ComposerSpec({ variant }: { variant: ComposerVariant }) {
  const meta = COMPOSER_VARIANTS.find((v) => v.id === variant)!;
  const spec = isExtension(variant) ? EXTENSIONS[variant].spec : SPECS[variant];
  return (
    <Frame className="w-full max-w-[360px]">
      <FrameHeader title={meta.name}>
        <Badge tone="outline">{meta.from}</Badge>
      </FrameHeader>
      <FramePanel className="divide-y divide-separator-border">
        <Section title="Anatomy">
          <ol className="flex flex-col gap-1">
            {spec.anatomy.map((part, i) => (
              <li key={part} className="flex items-baseline gap-2 text-body-2-medium text-text-primary">
                <span className="w-4 shrink-0 text-end font-mono text-caption-1-regular text-text-tertiary tabular-nums">{i + 1}</span>
                {part}
              </li>
            ))}
          </ol>
        </Section>
        <Section title="Behaviour">
          <ul className="flex flex-col gap-1.5">
            {spec.behaviour.map((b) => (
              <li key={b.text} className={cn('text-body-2-medium', b.keys ? 'flex flex-wrap items-center gap-1.5 text-text-secondary' : 'text-caption-1-regular text-text-tertiary')}>
                {b.keys && (
                  <span className="flex items-center gap-0.5">
                    {b.keys.map((k) => (
                      <Kbd key={k}>{k}</Kbd>
                    ))}
                  </span>
                )}
                {b.text}
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Best for">
          <p className="text-body-2-medium text-text-secondary">{spec.bestFor}</p>
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-caption-1-regular text-text-tertiary">{DEFAULT_IN[variant]?.length ? "Default in" : "Opt-in: pick it in any template header"}</span>
            {(DEFAULT_IN[variant] ?? []).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        </Section>
        <Section title="Usage">
          <CodeBlock lang="tsx" title={`${variant}.tsx`} code={IMPORT + spec.usage} />
        </Section>
      </FramePanel>
    </Frame>
  );
}

/* ------------------------------------------------------------------ comparison table */

const YES = <span className="text-emerald-600 dark:text-emerald-400">✓</span>;
const NO = <span className="text-text-tertiary">—</span>;

const ROWS: { label: string; cells: Partial<Record<ComposerVariant, ReactNode>> }[] = [
  {
    label: 'Input',
    cells: { pill: 'Single line', box: 'Growing textarea', panel: 'Growing textarea', dock: 'Growing textarea', command: 'Monospace textarea' },
  },
  {
    label: 'Shift+Enter newline',
    cells: { pill: NO, box: YES, panel: YES, dock: YES, command: YES },
  },
  {
    label: 'Model slot',
    cells: { pill: 'In the row', box: 'Action row, right', panel: 'Action row, right', dock: 'Before send', command: 'Key-hint footer' },
  },
  {
    label: 'Tools slot',
    cells: { pill: <Badge tone="warning">Not rendered</Badge>, box: 'After add button', panel: 'After add button', dock: 'Inline from @2xl, else below', command: 'Row under the box' },
  },
  {
    label: 'Built-in tools',
    cells: { pill: 'Add, mic', box: 'Add, mic', panel: 'Add', dock: 'Add, mention, web toggle', command: 'Attach' },
  },
  {
    label: 'Status placement',
    cells: { pill: 'Under', box: 'Under', panel: 'On the rail', dock: 'Under, centred', command: 'Under, monospace' },
  },
  {
    label: 'Modes',
    cells: { pill: NO, box: NO, panel: <Badge tone="purple">Permission menu</Badge>, dock: NO, command: NO },
  },
  {
    label: 'Slash commands',
    cells: { pill: NO, box: NO, panel: NO, dock: NO, command: <Badge tone="info">4 commands</Badge> },
  },
  {
    label: 'Busy indicator',
    cells: { pill: 'Stop button', box: 'Stop button', panel: 'Stop button', dock: 'Stop button', command: 'Scan line + timer' },
  },
  {
    label: 'Stop control',
    cells: { pill: 'Stop button', box: 'Stop button', panel: 'Stop button', dock: 'Stop button', command: 'esc hint button' },
  },
  {
    label: 'Esc to stop',
    cells: { pill: YES, box: YES, panel: YES, dock: YES, command: YES },
  },
  {
    label: 'Best width',
    cells: { pill: 'Any', box: 'Thread column', panel: 'Main column', dock: 'Any (container query)', command: 'Dev pane' },
  },
  {
    label: 'Default in templates',
    cells: Object.fromEntries(COMPOSER_VARIANTS.map((v) => [v.id, (DEFAULT_IN[v.id] ?? []).join(', ') || '—'])),
  },
];

export function ComposerCompare() {
  return (
    <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-border-button-default bg-background-primary-default">
      <table className="w-full min-w-[760px] border-collapse text-start text-body-2-medium">
        <thead>
          <tr className="h-9 bg-background-tertiary-default/70 text-caption-1-medium text-text-tertiary">
            <th scope="col" className="sticky start-0 bg-background-tertiary-default px-3 text-start font-medium">
              Feature
            </th>
            {COMPOSER_VARIANTS.map((v) => (
              <th key={v.id} scope="col" className="px-3 text-start font-medium">
                <span className="text-text-primary">{v.name}</span> <span className="hidden lg:inline">· {v.from}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.label} className="border-t border-border-button-default">
              <th scope="row" className="sticky start-0 bg-background-primary-default px-3 py-2 text-start text-caption-1-medium whitespace-nowrap text-text-tertiary">
                {r.label}
              </th>
              {COMPOSER_VARIANTS.map((v) => (
                <td key={v.id} className="px-3 py-2 align-middle text-text-secondary">
                  {r.cells[v.id] ?? (isExtension(v.id) ? EXTENSIONS[v.id].compare[r.label as CompareRow] : null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
