import { useEffect } from 'react';
import { DocsPage } from '@/components/docs/docs-page';
import { AgentFeedDemo } from '@/components/agent-feed/agent-feed-demo';
import { CodeBlock } from '@/templates/kit/markdown';
import { AGENT_FEED, applyHead } from '@/seo/routes';

/* `/components/agent-feed`: several agents working at once, as a rolling three-row window that folds into
 * "Thought for Ns". Grok's Heavy mode runs on the same engine with its own rows. */

const USAGE = `import { AgentFeed, AgentFeedHeader, AgentFeedRow, type AgentFeedAgent, type AgentFeedItem } from '@/components/agent-feed';

export function Run({ agents, items, started, done, onOpenLog }: {
  agents: AgentFeedAgent[];
  items: AgentFeedItem[];
  started: number;
  done: boolean;
  onOpenLog: () => void;
}) {
  return (
    <div>
      <AgentFeedHeader agents={agents} running={!done} started={started} onOpen={onOpenLog} />
      {/* Ids must stay stable: the window keys rows by id to slide them. */}
      <AgentFeed items={items} running={!done} renderItem={(item) => <AgentFeedRow item={item} agents={agents} />} />
    </div>
  );
}`;

const CUSTOM = `// Your own rows and motion: the engine only needs items with an id.
<AgentFeed
  items={steps}
  max={4}
  running={!done}
  renderItem={(step) => <MyRow step={step} />}
  enterClassName="my-feed-in"
  exitClassName="my-feed-out"
/>`;

export function AgentFeedPage() {
  useEffect(() => {
    applyHead(AGENT_FEED);
  }, []);

  return (
    <DocsPage
      title="Agent Feed: multi-agent activity, three rows at a time"
      description="What a group of agents is doing, live: searches, visited pages, status lines and their messages to each other. The last three items show; a new one blurs in below, the others slide up and the oldest leaves upward. When the run ends the window empties and the header folds into Thought for Ns, which can open the full log."
      sections={[
        {
          id: 'preview',
          title: 'Preview',
          lead: 'Four agents research a question. When they are done, click Thought for Ns to list the whole run. Replay starts over.',
          children: <AgentFeedDemo />,
        },
        {
          id: 'usage',
          title: 'Usage',
          lead: 'Items are searches, visits, status lines or messages. Each agent brings its own avatar node.',
          children: <CodeBlock lang="tsx" title="run.tsx" code={USAGE} bodyClassName="max-h-[560px]" />,
        },
        {
          id: 'custom-rows',
          title: 'Custom rows',
          lead: 'The window is generic over the item type. Grok Heavy passes its own rows and blur classes to the same engine.',
          children: <CodeBlock lang="tsx" title="custom.tsx" code={CUSTOM} />,
        },
      ]}
    />
  );
}
