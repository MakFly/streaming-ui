import { useEffect, useState } from 'react';
import { DocsPage, DocsPreview } from '@/components/docs/docs-page';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { CodeBlock, Markdown, MarkdownTable } from '@/templates/kit/markdown';
import { MARKDOWN, applyHead } from '@/seo/routes';

/* `/components/markdown`: the kit's streaming Markdown renderer on its own page. The preview replays an answer
 * a few characters at a time, so half-written blocks (an open table, an unclosed fence) show how they settle. */

const ANSWER = `## Streaming over SSE
One long-lived response carries every token. Pin the scroll only while the reader is already at the end. [1]

### What each option costs
| Transport | Latency | Resume |
|---|---|---|
| **SSE** | One round trip | \`Last-Event-ID\` |
| WebSocket | One handshake | Your own protocol |
| Polling | One interval | Free |

### Steps
1. Open the stream and append each chunk
2. Keep the partial answer when the user stops
3. Resume from the last applied event id [2]

\`\`\`ts
const res = await fetch('/api/chat', { method: 'POST', body });
for await (const chunk of res.body!) append(chunk);
\`\`\`

> Stop leaves the text where it was cut.`;

const TABLE = [
  ['Model', 'Context', 'Output'],
  ['Fable 5.1', '1M tokens', '128k'],
  ['Opus 5.5', '1M tokens', '64k'],
  ['Haiku 5.5', '200k tokens', '32k'],
];

const USAGE = `import { Markdown, MarkdownTable, parseMarkdown } from '@/templates/kit/markdown';

export function Answer({ text, streaming }: { text: string; streaming: boolean }) {
  // Parses whatever prefix has arrived: tables, fences and lists render while they grow.
  return <Markdown text={text} streaming={streaming} />;
}

export function Pricing() {
  // The first row is the header; \`classNames\` restyles the table, rows or cells.
  return <MarkdownTable rows={[['Plan', 'Price'], ['Pro', '$20']]} />;
}

// Laying the blocks out yourself: one block per heading, paragraph, list, table, image or fence.
const blocks = parseMarkdown('| a | b |\\n|---|---|\\n| 1 | 2 |');`;

/** Replays \`text\` a few characters per tick; a new \`run\` starts over. */
function useStream(text: string, run: number) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(text.length);
      return;
    }
    setShown(0);
    const id = setInterval(() => setShown((n) => (n >= text.length ? (clearInterval(id), n) : n + 4)), 24);
    return () => clearInterval(id);
  }, [text, run]);
  return { text: text.slice(0, shown), done: shown >= text.length };
}

function StreamDemo() {
  const [run, setRun] = useState(0);
  const { text, done } = useStream(ANSWER, run);
  return (
    <DocsPreview className="relative items-start justify-start">
      <Button size="sm" className="absolute end-4 top-4" onClick={() => setRun((n) => n + 1)} aria-label="Replay the answer">
        <Icon name="refresh-line" className="size-4" />
        Replay
      </Button>
      <Markdown key={run} text={text} streaming={!done} className="w-full max-w-[640px] pt-8" />
    </DocsPreview>
  );
}

export function MarkdownPage() {
  useEffect(() => {
    applyHead(MARKDOWN);
  }, []);

  return (
    <DocsPage
      title="Markdown: streamed answers with tables"
      description="The renderer behind every streamed answer: headings, paragraphs, lists, quotes, highlighted code, tables, images, bold, links and [n] citation chips. It parses whatever prefix has arrived, so a table still gaining rows or an unclosed fence renders sensibly, and each new block blurs in once."
      sections={[
        {
          id: 'preview',
          title: 'Preview',
          lead: 'The answer streams four characters at a time. Replay restarts it.',
          children: <StreamDemo />,
        },
        {
          id: 'table',
          title: 'Table',
          lead: 'MarkdownTable on its own: the first row is the header, the cell prop renders each cell (Markdown passes its inline parser), and wide tables scroll sideways.',
          children: (
            <DocsPreview>
              <MarkdownTable rows={TABLE} className="w-full max-w-[560px]" />
            </DocsPreview>
          ),
        },
        {
          id: 'usage',
          title: 'Usage',
          lead: 'Markdown for the default look; parseMarkdown, MarkdownTable and Words when a template lays the blocks out in its own style, as Grok does.',
          children: <CodeBlock lang="tsx" title="answer.tsx" code={USAGE} />,
        },
      ]}
    />
  );
}
