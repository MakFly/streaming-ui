import { useEffect } from 'react';
import { Icon } from '@/components/icon';
import { ShowcaseSection as Section, type ShowcaseCardProps as Card } from '@/components/docs/showcase';
import { ThinkingOrb } from '@/components/thinking-orb';
import { AgentLimitsCard } from '@/templates/kit/agent-limits';
import { ThreadNavigator } from '@/components/thread-navigator';
import { ModelPicker, PROVIDERS } from '@/templates/kit/model-picker';
import { templates } from '@/templates/registry';
import { DemoPreview } from '@/components/landing/demo-preview';
import { demos, libraries } from '@/engine/registry';
import { useTheme } from '@/providers/theme-provider';
import { paths } from '@/lib/paths';
import { COMPONENTS_INDEX, applyHead } from '@/seo/routes';

/* `/components`: the library index, laid out like BoardUI's /components. One section per job in a chat interface
 * (input, agent status, navigation, responses), then the templates built from them and the tools around them.
 * Each section is a grid of showcase cards: a live (but inert) preview on top, name and one line below, the whole
 * card a link. */

const firstOf = new Map(libraries.map((l) => [l.slug, demos.find((d) => d.library.slug === l.slug)!]));

/** A still composer: field, attach and send, as the pill variant draws them. */
function ComposerPreview() {
  return (
    <div className="flex w-[248px] items-center gap-2 rounded-full border border-border-button-default bg-background-primary-default py-1.5 ps-1.5 pe-1.5 shadow-xs">
      <span className="grid size-7 place-items-center rounded-full bg-background-tertiary-default">
        <Icon name="add-line" className="size-4 text-foreground-icon-secondary" />
      </span>
      <span className="flex-1 text-body-2-regular text-text-tertiary">Ask me anything</span>
      <span className="grid size-7 place-items-center rounded-full bg-text-primary">
        <Icon name="arrow-up-line" className="size-4 text-background-primary-default" />
      </span>
    </div>
  );
}

/** Three lines arriving, the last one still streaming. */
function ResponsesPreview() {
  return (
    <div className="flex w-[220px] flex-col gap-2">
      <span className="h-2 w-full rounded-full bg-background-tertiary-default" />
      <span className="h-2 w-[86%] rounded-full bg-background-tertiary-default" />
      <span className="flex items-center gap-1">
        <span className="h-2 w-[52%] rounded-full bg-background-tertiary-default" />
        <span className="h-3 w-0.5 animate-pulse rounded-full bg-text-primary" />
      </span>
    </div>
  );
}

/** The playground's pickers as a row of chips: the combination is the point. */
function PlaygroundPreview() {
  return (
    <div className="flex w-[232px] flex-wrap justify-center gap-1.5">
      {['Pill composer', 'Fable 5', 'Working orb', 'Ocean palette', 'Agent response', 'Mobile'].map((chip) => (
        <span key={chip} className="rounded-full border border-border-button-default bg-background-primary-default px-2.5 py-1 text-caption-1-medium text-text-secondary shadow-xs">
          {chip}
        </span>
      ))}
    </div>
  );
}

/** A Markdown prompt: a heading, a command, then prose. */
function PromptsPreview() {
  return (
    <div className="flex w-[220px] flex-col gap-2 rounded-xl border border-border-button-default bg-background-primary-default p-3 shadow-xs">
      <span className="font-mono text-[11px] text-text-primary"># Rebuild: Pill composer</span>
      <span className="truncate rounded-sm bg-background-tertiary-default px-1.5 py-1 font-mono text-[10px] text-text-secondary">npx shadcn add …/r/pill.json</span>
      <span className="h-1.5 w-full rounded-full bg-background-tertiary-default" />
      <span className="h-1.5 w-[70%] rounded-full bg-background-tertiary-default" />
    </div>
  );
}

/** A browser window with the template's name in it. */
function TemplatePreview({ name }: { name: string }) {
  return (
    <div className="flex h-[132px] w-[220px] flex-col overflow-hidden rounded-xl border border-border-button-default bg-background-primary-default shadow-xs">
      <div className="flex items-center gap-1 border-b border-separator-border px-2.5 py-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 rounded-full bg-foreground-icon-quaternary" />
        ))}
      </div>
      <div className="flex flex-1">
        <div className="flex w-14 flex-col gap-1.5 border-e border-separator-border p-2">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-1.5 rounded-full bg-background-tertiary-default" />
          ))}
        </div>
        <div className="flex flex-1 flex-col justify-between p-2.5">
          <span className="text-caption-1-medium text-text-secondary">{name}</span>
          <span className="h-5 rounded-full border border-border-button-default" />
        </div>
      </div>
    </div>
  );
}

export function ComponentsPage() {
  const { theme } = useTheme();
  useEffect(() => {
    applyHead(COMPONENTS_INDEX);
  }, []);

  /* Grouped by the job each piece does in a chat interface, so a reader looking for one thing finds its section. */
  const input: Card[] = [
    { name: 'Composers', meta: '11 variants', text: 'Eleven interchangeable input boxes behind one interface.', to: paths.composers(), preview: <ComposerPreview /> },
    { name: 'Model Picker', meta: `${PROVIDERS.length} providers`, text: 'Providers on a rail, search across every model, effort and fast mode.', to: paths.modelPicker(), preview: <ModelPicker value="Fable 5" onChange={() => {}} className="border border-border-button-default shadow-xs" /> },
  ];
  const status: Card[] = [
    {
      name: 'Thinking Orbs',
      meta: '9 states',
      text: 'Dotted loaders for an agent at work, in nine states.',
      to: paths.orbs(),
      preview: (
        <div className="flex items-center gap-6">
          <ThinkingOrb state="searching" size={32} theme={theme} />
          <ThinkingOrb state="working" size={64} theme={theme} />
          <ThinkingOrb state="solving" size={32} theme={theme} />
        </div>
      ),
    },
    {
      name: 'Agent Limits Card',
      text: 'Context window by token bucket, and plan limits with reset times.',
      to: paths.agentLimits(),
      preview: (
        <div className="w-[448px] shrink-0 scale-[0.58]">
          <AgentLimitsCard />
        </div>
      ),
    },
  ];
  const navigation: Card[] = [
    {
      name: 'Thread Navigator',
      text: 'One mark per user turn, with a preview, a jump, and a bookmark.',
      to: paths.threadNavigator(),
      preview: (
        <ThreadNavigator
          className="h-40"
          activeId="scroll"
          onNavigate={() => {}}
          items={[
            { id: 'sse', label: 'Stream tokens over SSE', preview: 'One long-lived response, then Stop beside Send.' },
            { id: 'resume', label: 'Resume after a dropped connection', preview: 'Continue from the last applied event id.' },
            { id: 'scroll', label: 'Append tokens without moving the reader', preview: 'Pin the scroll only while they are already at the end.' },
            { id: 'stop', label: 'Keep the partial answer', preview: 'Stop leaves the text where it was cut.' },
            { id: 'phone', label: 'And on a phone?', preview: 'First tap previews. The next tap jumps.' },
          ]}
        />
      ),
    },
  ];
  const responses: Card[] = [
    { name: 'All responses', meta: `${demos.length}`, text: 'Every way an AI response can arrive, live and copyable.', to: paths.gallery(), preview: <ResponsesPreview /> },
    ...libraries.map((l) => ({
      name: l.name,
      meta: `${l.count}`,
      text: `${l.count} responses, each with the prompt that rebuilds it.`,
      to: paths.gallery(l.slug),
      preview: <DemoPreview demo={firstOf.get(l.slug)!} scale={0.5} className="size-full" />,
    })),
  ];
  const tools: Card[] = [
    { name: 'Playground', text: 'Every piece together, the combination in the URL.', to: paths.playground(), preview: <PlaygroundPreview /> },
    { name: 'Prompts', text: 'A Markdown prompt per piece, for an agent to rebuild it 1:1.', to: paths.prompts(), preview: <PromptsPreview /> },
  ];
  const sections = [
    { id: 'input', title: 'Input', text: 'What the user types into and what they pick.', cards: input },
    { id: 'agent-status', title: 'Agent status', text: 'What the agent is doing, and how much it has left.', cards: status },
    { id: 'navigation', title: 'Navigation', text: 'Finding your way around a long thread.', cards: navigation },
    { id: 'responses', title: 'Responses', text: 'How the answer arrives, by collection.', cards: responses },
    {
      id: 'templates',
      title: 'Templates',
      text: 'Whole chat apps built from the pieces above, playing live.',
      cards: templates.map((t) => ({ name: t.name, text: t.tagline, to: paths.template(t.slug), preview: <TemplatePreview name={t.name} /> })),
    },
    { id: 'tools', title: 'Tools', text: 'Try the pieces together, or hand them to an agent.', cards: tools },
  ];

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <h1 className="text-title-1-medium text-text-primary">AI chat UI components</h1>
        <p className="max-w-2xl text-headline-medium text-text-secondary">
          The pieces of an AI chat interface, in React and Tailwind, ready to copy or pull in with{' '}
          <code className="rounded-sm bg-background-tertiary-default px-1 py-0.5 font-mono text-[13px] text-text-primary">npx shadcn add</code>. Everything shares the same
          tokens, so it all fits together.
        </p>
        <nav aria-label="Sections" className="flex flex-wrap gap-2 pt-1">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-border-button-default px-3 py-1 text-body-medium text-text-secondary transition-colors hover:border-border-button-hover hover:text-text-primary"
            >
              {s.title}
            </a>
          ))}
        </nav>
      </header>
      {sections.map((s) => (
        <Section key={s.id} {...s} />
      ))}
    </div>
  );
}
