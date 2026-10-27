import { useEffect } from 'react';
import { DocsPage, DocsPreview } from '@/components/docs/docs-page';
import { CopyLine, InstallButton } from '@/components/composers/install-button';
import { PromptButton } from '@/components/prompt-button';
import { AgentLimitsCard, ContextMeter } from '@/templates/kit/agent-limits';
import { AGENT_LIMITS, applyHead } from '@/seo/routes';

/* `/components/agent-limits-card`: the composer kit's budget widget on its own page, named as in BoardUI and
 * installable from our registry as `agent-limits-card`. Collapsed and expanded card, then the ring that opens it. */

const loadPrompt = () => import('@/templates/agent-limits-prompt').then((m) => m.buildAgentLimitsPrompt());

const USAGE = `import { AgentLimitsCard, ContextMeter } from '@/components/composer/agent-limits';

<AgentLimitsCard />                 // collapsed, sample data
<AgentLimitsCard defaultOpen />     // breakdown open
<ContextMeter percent={82} />       // the ring that opens it`;

export function AgentLimitsPage() {
  useEffect(() => {
    applyHead(AGENT_LIMITS);
  }, []);

  return (
    <DocsPage
      title="Agent Limits Card"
      description="The agent budget widget: a context window bar segmented by token bucket with a used / max readout, and plan usage limits with reset times. Expanding the context window grows the card to reveal the per-bucket breakdown, free space, deferred buckets and collapsible member lists."
      actions={
        <>
          <InstallButton item="agent-limits-card" label="Install AgentLimitsCard" />
          <PromptButton title="Agent Limits Card" fileName="agent-limits-card.prompt.md" downloadName="agent-limits-card.prompt.md" load={loadPrompt} />
        </>
      }
      sections={[
        {
          id: 'preview',
          title: 'Preview',
          children: (
            <DocsPreview>
              <AgentLimitsCard className="max-w-[448px]" />
            </DocsPreview>
          ),
        },
        {
          id: 'installation',
          title: 'Installation',
          lead: 'Pull it from the registry with the shadcn CLI, then import the Streaming UI tokens once after Tailwind.',
          children: (
            <div className="flex flex-col gap-3">
              <CopyLine text={`npx shadcn@latest add ${typeof window === 'undefined' ? '' : window.location.origin}/r/agent-limits-card.json`} />
              <pre className="scrollbar-thin overflow-x-auto rounded-2xl bg-background-secondary-default p-4 font-mono text-caption-1-regular text-text-secondary">{USAGE}</pre>
            </div>
          ),
        },
        {
          id: 'expanded',
          title: 'Expanded',
          lead: (
            <>
              <code className="rounded-sm bg-background-tertiary-default px-1 py-0.5 font-mono text-[13px] text-text-primary">defaultOpen</code> opens the breakdown on mount. Click a group to list its members.
            </>
          ),
          children: (
            <DocsPreview>
              <AgentLimitsCard defaultOpen className="max-w-[448px]" />
            </DocsPreview>
          ),
        },
        {
          id: 'context-ring',
          title: 'Context ring',
          lead: 'What a composer carries in its status line: the ring opens the same card above it, scaled to its percentage.',
          children: (
            <DocsPreview className="items-end pb-12">
              <div className="flex items-center gap-2 rounded-full border border-border-button-default bg-background-primary-default py-1 ps-3 pe-1 shadow-xs">
                <span className="text-body-2-medium text-text-tertiary">Fable 5</span>
                <ContextMeter percent={82} />
              </div>
            </DocsPreview>
          ),
        },
      ]}
    />
  );
}
