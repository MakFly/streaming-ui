import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Message } from '@/templates/kit/engine';
import { AssistantMessage, Badge, ChatSurface, Composer, ModelPicker, UserMessage } from '@/templates/kit/parts';
import { ThreadNavigator } from './thread-navigator';
import { ThreadTurn, useThreadReading } from './use-thread-reading';

/* Interactive thread: a long scripted conversation, one answer that keeps streaming,
 * and bookmarks held in component state. Nothing here talks to a model or to storage.
 * Scrolling up, or jumping from the rail, leaves the viewport where it is while tokens append. */

type ScriptTurn = { id: string; user: string; assistant: string; references?: string[] };
type Shown = ScriptTurn & { revealed: number };

const TURNS: ScriptTurn[] = [
  {
    id: 'turn-transport',
    user: 'How should a chat UI stream tokens: SSE, WebSockets, or polling?',
    references: ['HTML Living Standard', 'MDN'],
    assistant: `Server-Sent Events are the default worth shipping. One HTTP response stays open and the server writes tokens as they are ready. Proxies already understand that pattern, and the browser reconnects on its own.

WebSockets earn their place when the client must talk back on the same pipe: a cursor, a barge-in, a tool result pushed mid-answer. Polling only fits when a connection cannot be held. Every poll adds a wait to the next token.

Render each chunk as it arrives, and keep Stop next to Send so a long answer can be cut without closing the thread.`,
  },
  {
    id: 'turn-reconnect',
    user: 'If the laptop sleeps halfway through an answer, how do we resume without duplicating the text already on screen?',
    references: ['Last-Event-ID'],
    assistant: `Give every chunk an id that only moves forward. When the browser reconnects it sends the last id it applied. The server continues after that id, or replays the tail if it still has it.

The client should treat a replay as idempotent: ignore any id it has already committed. A reconnect is not a new turn, so it must not scroll the reader and it must not mint a second message row.

If the buffer is gone, say so in the thread and let the person retry from the last user turn. Silence looks like a hang.`,
  },
  {
    id: 'turn-markdown',
    user: 'The answer is markdown, but it arrives as a broken prefix. Headings, lists and an unclosed code fence should not jump around.',
    assistant: `Parse whatever prefix you have. An unclosed fence is a code block that is still open, not a paragraph full of backticks. A list item without its next sibling is still a list.

Keep block identity stable across parses so React does not remount a heading every token. Remounting restarts the entrance motion and moves the line the person is reading.

Inline marks can wait until they close. A trailing unmatched asterisk is plain text until the next character decides it.`,
  },
  {
    id: 'turn-tools',
    user: 'Where do tool calls sit while the answer is still streaming?',
    references: ['Tool trace', 'Partial output'],
    assistant: `A tool call is a part of the same assistant message, ordered with the text. Show it as running as soon as the name and arguments arrive, then stream its output lines under that row.

Do not wait for the final stop reason to reveal the row. People need to see that the model is in a tool, not frozen. When the turn is aborted, a tool that never finished reads as stopped, not as a success with an empty body.

Keep the row's id equal to the tool call id from the stream, so a replay updates the same row.`,
  },
  {
    id: 'turn-a11y',
    user: 'What should a screen reader hear while tokens arrive?',
    assistant: `Not every token. A live region that announces each word is unusable. Announce the start of a turn, then the finished answer, and expose Stop as a real button.

The thread navigator is a list of buttons, one per user turn, with the visible turn marked current. The preview is extra. Keyboard users reach the same jump with Enter, and they can move the bookmark without a pointer.

Reduced motion drops the smooth scroll and the tick's width transition. The jump itself still happens.`,
  },
  {
    id: 'turn-theme',
    user: 'Do the ticks and the preview need their own colors for dark mode?',
    assistant: `No. They use the same semantic tokens as the menus: primary text for the visible tick, icon secondary for the resting ticks, dropdown background and the dropdown shadow for the card.

Switching the document theme repaints the rail without a second palette. A hard-coded white card would glow in dark mode and fail the focus ring, which is also a token.

If a product remaps the accent, the rail does not care. It is not an accent control.`,
  },
  {
    id: 'turn-scroll',
    user: 'How do we append tokens without dragging someone who scrolled up to reread an earlier turn?',
    assistant: `Pin the scroll to the bottom only while the reader is already there. The pin is a flag, not a side effect of "content changed".

The moment they scroll up, or jump from the rail, clear that flag in the same turn as the click, before the next token is painted. Otherwise the stream's layout effect still believes they are following and assigns scrollTop to the bottom.

New turns may appear in the rail. Their ids are stable, so the active mark stays on the passage in view. It must not jump to the turn that is still being written below the fold.`,
  },
  {
    id: 'turn-stop',
    user: 'What stays on screen if I press Stop halfway through?',
    assistant: `The text that already arrived stays. The message is marked done where it was cut, and a running tool becomes stopped. Do not delete the partial, and do not replace it with an error banner unless the transport actually failed.

Send is available again. A retry starts a new assistant message or replaces the cut one, by the product's rule, but it uses the same user turn id. The rail still has one mark for that question.

Stop should also drop the follow pin if the cut leaves them looking at the partial. The viewport does not jump to a composer.`,
  },
  {
    id: 'turn-mobile',
    user: 'And on a phone?',
    references: ['Visual viewport', '44px targets'],
    assistant: `The rail stays on the inline start of the thread, with a hit target up to 44px when there is room. A long thread shares that height, so marks shrink instead of pushing the composer off the screen.

There is no hover. The first tap opens the preview. A second tap on the same mark, or a tap on the preview text, jumps. The bookmark is its own button, large enough for a coarse pointer.

The preview is portaled and clamped to the visual viewport, including the offset when the browser chrome or the keyboard resizes it. It does not sit under the URL bar.`,
  },
  {
    id: 'turn-bookmarks',
    user: 'Can a bookmark survive a new streamed turn without being stored in the browser?',
    assistant: `Yes. Bookmarks are an array of message ids owned by the parent. The rail only asks for a toggle. This demo keeps that array in React state, so a refresh forgets it on purpose.

Adding a turn does not rewrite ids, so a bookmark on an earlier question still lights the same preview. The control is omitted entirely when the parent passes no toggle, which keeps a read-only transcript free of a dead button.

Nothing in the rail reads localStorage, a cookie, or a model provider.`,
  },
];

const INITIAL = 6;

/** The answer a question typed by hand gets: it becomes a turn like the scripted ones, with its own mark. */
const freeAnswer = (question: string) => `**${question.replace(/[*`_#]/g, '')}** is now a turn of its own, with a new mark at the bottom of the rail.

Hover or focus that mark while this answer streams: the preview fills in as the tokens arrive. Scroll up before it ends and the thread stays on the passage you are reading.

The demo has no model behind it. Any question gets this answer.`;

function plain(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** A turn's answer as the kit's assistant message, so it gets the same Markdown, motion and action bar as the templates. */
function answerOf(turn: Shown): Message {
  const done = turn.revealed >= turn.assistant.length;
  return { id: `${turn.id}-answer`, role: 'assistant', done, parts: [{ kind: 'text', id: `${turn.id}-text`, text: turn.assistant, shown: turn.revealed, done }] };
}

export function ThreadDemo() {
  const [turns, setTurns] = useState<Shown[]>(() => TURNS.slice(0, INITIAL).map((turn) => ({ ...turn, revealed: turn.assistant.length })));
  const [next, setNext] = useState(INITIAL);
  // Busy from the start: the first answer streams on mount, and the draft must not pick up its question.
  const [busy, setBusy] = useState(true);
  const [draft, setDraft] = useState('');
  const [model, setModel] = useState('Fable 5');
  const [bookmarks, setBookmarks] = useState<string[]>(['turn-reconnect']);
  const timer = useRef(0);
  const gen = useRef(0);
  const streamingId = useRef<string | null>(null);
  const typed = useRef(0);

  const stream = useCallback((src: ScriptTurn) => {
    const my = ++gen.current;
    window.clearTimeout(timer.current);
    streamingId.current = src.id;
    setBusy(true);
    setTurns((prev) => (prev.some((turn) => turn.id === src.id) ? prev : [...prev, { ...src, revealed: 0 }]));
    let shown = 0;
    const tick = () => {
      if (my !== gen.current) return;
      let words = 0;
      while (shown < src.assistant.length && words < 2) {
        if (/\s/.test(src.assistant[shown] ?? '')) {
          while (shown < src.assistant.length && /\s/.test(src.assistant[shown] ?? '')) shown += 1;
          words += 1;
        } else {
          while (shown < src.assistant.length && !/\s/.test(src.assistant[shown] ?? '')) shown += 1;
        }
      }
      const at = shown;
      setTurns((prev) => prev.map((turn) => (turn.id === src.id ? { ...turn, revealed: at } : turn)));
      if (at >= src.assistant.length) {
        streamingId.current = null;
        setBusy(false);
        return;
      }
      timer.current = window.setTimeout(tick, 70);
    };
    timer.current = window.setTimeout(tick, 240);
  }, []);

  const play = useCallback(
    (index: number) => {
      const src = TURNS[index];
      if (!src) return;
      setNext(index + 1);
      stream(src);
    },
    [stream],
  );

  useEffect(() => {
    play(INITIAL);
    return () => {
      gen.current += 1;
      window.clearTimeout(timer.current);
    };
  }, [play]);

  // Once an answer ends, the next scripted question waits in the composer: Enter sends it, or type your own.
  useEffect(() => {
    if (!busy) setDraft((cur) => cur || (TURNS[next]?.user ?? ''));
  }, [busy, next]);

  const send = (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    setDraft('');
    if (question === TURNS[next]?.user) play(next);
    else stream({ id: `turn-typed-${++typed.current}`, user: question, assistant: freeAnswer(question) });
  };

  // Stop keeps what already arrived: the answer is cut where it was, and the rail keeps its mark.
  const stop = () => {
    gen.current += 1;
    window.clearTimeout(timer.current);
    const id = streamingId.current;
    streamingId.current = null;
    setBusy(false);
    setTurns((prev) => prev.map((turn) => (turn.id === id ? { ...turn, assistant: turn.assistant.slice(0, turn.revealed) } : turn)));
  };

  const items = turns.map((turn) => {
    const excerpt = plain(turn.assistant.slice(0, turn.revealed));
    return {
      id: turn.id,
      label: turn.user,
      preview: excerpt || undefined,
      references: turn.references,
    };
  });
  const dep = turns.map((turn) => `${turn.id}:${turn.revealed}`).join('|');
  const { ref, activeId, navigate, following } = useThreadReading(dep, items.map((item) => item.id));

  const toggleBookmark = (id: string) => {
    setBookmarks((cur) => (cur.includes(id) ? cur.filter((item) => item !== id) : [...cur, id]));
  };

  return (
    <div data-thread-demo="" data-active-turn={activeId ?? ''} data-following={following ? 'true' : 'false'} data-bookmarks={bookmarks.join(' ')}>
      <ChatSurface
        dep={dep}
        scrollRef={ref}
        className="h-[min(40rem,78dvh)] min-h-[26rem] flex-none"
        columnClassName="gap-6 ps-14 sm:ps-16"
        header={
          <>
            <span className="shrink-0 px-1 text-headline-medium text-text-primary">Streaming transports</span>
            <Badge tone="outline">{turns.length} questions</Badge>
            <span aria-live="polite" className="ms-auto flex min-w-0 items-center gap-1.5 px-1 text-caption-1-medium text-text-tertiary">
              <span className={cn('size-1.5 shrink-0 rounded-full transition-colors', following ? 'bg-accent-500' : 'bg-foreground-icon-tertiary')} />
              <span className="truncate">{following ? 'Following the stream' : 'Staying on this passage'}</span>
            </span>
          </>
        }
        overlay={
          <div className="absolute inset-y-2 start-1 w-11">
            <ThreadNavigator items={items} activeId={activeId} onNavigate={navigate} bookmarks={bookmarks} onBookmark={toggleBookmark} />
          </div>
        }
        footer={
          <Composer
            variant="pill"
            lock
            value={draft}
            onChange={setDraft}
            onSend={send}
            onStop={stop}
            busy={busy}
            placeholder={next < TURNS.length ? 'Ask a follow-up' : 'Ask anything: it becomes a new turn'}
            model={<ModelPicker value={model} onChange={setModel} />}
            status={
              <>
                <span>Enter sends the suggested question</span>
                <span className="tabular-nums">{bookmarks.length} bookmarked</span>
              </>
            }
          />
        }
      >
        {turns.map((turn, i) => (
          <div key={turn.id} className="flex flex-col gap-4">
            <ThreadTurn id={turn.id}>
              <UserMessage>{turn.user}</UserMessage>
            </ThreadTurn>
            <AssistantMessage message={answerOf(turn)} isLast={i === turns.length - 1} />
          </div>
        ))}
      </ChatSurface>
    </div>
  );
}
