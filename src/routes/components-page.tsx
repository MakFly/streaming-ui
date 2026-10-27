import { useEffect } from 'react';
import { Icon } from '@/components/icon';
import { ShowcaseSection as Section, type ShowcaseCardProps as Card } from '@/components/docs/showcase';
import { ThinkingOrb } from '@/components/thinking-orb';
import { AgentLimitsCard } from '@/templates/kit/agent-limits';
import { ModelPicker } from '@/templates/kit/model-picker';
import { templates } from '@/templates/registry';
import { useTheme } from '@/providers/theme-provider';
import { paths } from '@/lib/paths';
import { COMPONENTS_INDEX, applyHead } from '@/seo/routes';

/* `/components`: the library index, laid out like BoardUI's /components. One section per group, each a grid of
 * showcase cards: a live (but inert) preview on top, name and one line below, the whole card a link. */

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

  const components: Card[] = [
    { name: 'Composers', text: 'Eleven interchangeable input boxes behind one interface.', to: paths.composers(), preview: <ComposerPreview /> },
    { name: 'Model Picker', text: 'Providers on a rail, search across every model, effort and fast mode.', to: paths.modelPicker(), preview: <ModelPicker value="Fable 5" onChange={() => {}} className="border border-border-button-default shadow-xs" /> },
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
    {
      name: 'Thinking Orbs',
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
  ];
  const browse: Card[] = [
    { name: 'Responses', text: 'Every way an AI response can arrive, live and copyable.', to: paths.gallery(), preview: <ResponsesPreview /> },
    { name: 'Playground', text: 'Every piece together, the combination in the URL.', to: paths.playground(), preview: <ComposerPreview /> },
  ];

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <h1 className="text-title-1-medium text-text-primary">Components</h1>
        <p className="max-w-2xl text-headline-medium text-text-secondary">
          The pieces of an AI chat interface, in React and Tailwind, ready to copy or pull in with{' '}
          <code className="rounded-sm bg-background-tertiary-default px-1 py-0.5 font-mono text-[13px] text-text-primary">npx shadcn add</code>. Everything shares the same
          tokens, so it all fits together.
        </p>
      </header>
      <Section id="components" title="Components" text="The building blocks every template is made of." cards={components} />
      <Section id="browse" title="Browse" text="The libraries built from them." cards={browse} />
      <Section
        id="templates"
        title="Templates"
        text="Whole chat apps, playing live."
        cards={templates.map((t) => ({ name: t.name, text: t.tagline, to: paths.template(t.slug), preview: <TemplatePreview name={t.name} /> }))}
      />
    </div>
  );
}
