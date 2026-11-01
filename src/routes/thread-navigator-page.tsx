import { useEffect } from 'react';
import { DocsPage } from '@/components/docs/docs-page';
import { ThreadDemo } from '@/components/thread-navigator/thread-demo';
import { CodeBlock } from '@/templates/kit/markdown';
import { THREAD_NAVIGATOR, applyHead } from '@/seo/routes';

/* `/components/thread-navigator`: the rail on a long thread, with streaming and bookmarks.
 * The visual component stays controlled. The demo's adapter owns scroll and message ids. */

const USAGE = `import { useState } from 'react';
import { ThreadNavigator, ThreadTurn, useThreadReading } from '@/components/thread-navigator';

type Turn = { id: string; question: string; answer: string };

export function Thread({ turns }: { turns: Turn[] }) {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  // Re-run on every token: pass something that changes as the answers grow.
  const { ref, activeId, navigate } = useThreadReading(turns, turns.map((turn) => turn.id));

  const toggleBookmark = (id: string) =>
    setBookmarks((cur) => (cur.includes(id) ? cur.filter((b) => b !== id) : [...cur, id]));

  return (
    <div className="relative h-full">
      <div ref={ref} className="h-full overflow-y-auto ps-14">
        {turns.map((turn) => (
          <article key={turn.id}>
            <ThreadTurn id={turn.id}>
              <p>{turn.question}</p>
            </ThreadTurn>
            <p>{turn.answer}</p>
          </article>
        ))}
      </div>
      <div className="absolute inset-y-2 start-1 w-11">
        <ThreadNavigator
          items={turns.map((turn) => ({ id: turn.id, label: turn.question, preview: turn.answer }))}
          activeId={activeId}
          onNavigate={navigate}
          bookmarks={bookmarks}
          onBookmark={toggleBookmark}
        />
      </div>
    </div>
  );
}`;

export function ThreadNavigatorPage() {
  useEffect(() => {
    applyHead(THREAD_NAVIGATOR);
  }, []);

  return (
    <DocsPage
      title="Thread Navigator: a minimap for long AI chats"
      description="A discreet rail for a long conversation: one mark per user turn, a longer mark for the turn in view, and an instant preview with the request, the answer excerpt, any references, and a bookmark. The rail is controlled. Scroll position and message ids live in a separate adapter, so streaming can append tokens without moving a reader who has left the end."
      sections={[
        {
          id: 'conversation',
          title: 'Conversation',
          lead: 'Hover or focus a mark on the left rail: arrows, Home and End move along it, Enter jumps, Escape closes the preview. The next question waits in the composer, so Enter sends it. You can also type your own. Scroll up while an answer streams and the thread stays put.',
          children: <ThreadDemo />,
        },
        {
          id: 'usage',
          title: 'Usage',
          lead: 'Items carry the stable message id. The parent owns the active id, the bookmark list, and what a jump does.',
          children: <CodeBlock lang="tsx" title="thread.tsx" code={USAGE} bodyClassName="max-h-[560px]" />,
        },
      ]}
    />
  );
}
