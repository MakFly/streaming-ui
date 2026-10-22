import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { Folder, GitBranch, Infinity as InfinityIcon, RotateCcw } from 'lucide-react';
import { AgentThinking } from '@/templates/kit/primitives';
import { useChatEngine, type ChatScriptApi, type Script } from '@/templates/kit/engine';
import { AssistantMessage, Composer, ModelPicker, Suggestions, UserMessage, textOf, useThreadScroll } from '@/templates/kit/parts';
import { cn } from '@/lib/utils';

/* The landing's Composer Loader, live: the same scene as the gallery's Composer Loader demo (the message lands, Send turns into Stop,
 * Agent Thinking sits above the pill, the answer streams in) but the pill is a real composer — type, send, stop,
 * pick a model, try a suggestion. Replies are scripted, matched on a few keywords. */

const FIRST = 'Draft a migration plan to React 19.';

const ANSWERS: [RegExp, string][] = [
  [/react|migrat|upgrade/i, 'Four steps: upgrade dependencies and types, replace `forwardRef` with the `ref` prop, adopt Actions for forms, then enable the compiler on a pilot route.'],
  [/test|vitest|jest/i, 'Start with the routes that changed most: one smoke test per page, then **Testing Library** for forms. Run them in CI before the compiler goes wide.'],
  [/compiler|perf|memo/i, 'Turn the compiler on for one route, compare **INP** before and after, then drop the `useMemo` and `useCallback` calls it makes redundant.'],
  [/risk|break|rollback/i, 'The risky part is third-party libraries still on `forwardRef`. Ship behind a flag, keep React 18 in a branch, and roll back by reverting the lockfile.'],
];
const SUGGESTIONS = ['What are the risks?', 'How should we test it?', 'Is the compiler worth it?'];

const answerFor = (text: string) =>
  ANSWERS.find(([re]) => re.test(text))?.[1] ?? `Here is a short plan for “${text.replace(/[.?!]+$/, '')}”: scope it, ship a pilot behind a flag, measure, then roll it out.`;

async function reply(api: ChatScriptApi, text: string) {
  const a = api.assistant();
  // No parts yet: the composer's own Agent Thinking shows above the pill while the answer is on its way.
  await api.sleep(2600);
  await a.stream(answerFor(text), 18);
  a.done();
}

const intro: Script = async (api) => {
  await api.sleep(500);
  await api.user(FIRST, { type: true });
  await reply(api, FIRST);
};

/** `bare`: no card of its own (the gallery's stage frame draws it) and no Replay button (the card has Run again). */
export function ComposerPlayground({ ref, bare, className }: { ref?: Ref<{ restart: () => void }>; bare?: boolean; className?: string }) {
  // The intro waits until the section scrolls into view, so the scene starts where the reader is.
  const chat = useChatEngine({ reply });
  const { run, reset } = chat;
  const restart = useCallback(() => {
    reset();
    void run(intro);
  }, [reset, run]);
  useImperativeHandle(ref, () => ({ restart }), [restart]);
  const root = useRef<HTMLDivElement>(null);
  // Once the reader has typed, the intro never starts on its own (it would cancel their message).
  const touched = useRef(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (!touched.current) void run(intro);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [run]);
  const [model, setModel] = useState('Fable 5');
  const { ref: threadRef } = useThreadScroll<HTMLDivElement>(chat.messages);
  const last = chat.messages[chat.messages.length - 1];
  const thinking = chat.busy && last?.role === 'assistant' && last.parts.length === 0;

  return (
    <div ref={root} className={cn('bg-background-primary-default p-4 sm:p-8', !bare && 'rounded-3xl border border-separator-border', className)}>
      <div className="relative flex h-[420px] flex-col rounded-3xl bg-background-secondary-default p-3">
        {!bare && (
        <button
          type="button"
          onClick={restart}
          className="absolute end-3 top-3 z-10 flex h-7 items-center gap-1 rounded-full px-2.5 text-caption-1-medium text-text-tertiary transition-colors hover:bg-background-primary-default hover:text-text-primary"
        >
          <RotateCcw className="size-3.5" /> Replay
        </button>
        )}
        <div ref={threadRef} className={cn('scrollbar-thin flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1 pb-3', bare ? 'pt-3' : 'pt-10')}>
          <div className="mt-auto" />
          {chat.messages.map((m, i) =>
            m.role === 'user' ? (
              <UserMessage key={m.id}>{textOf(m)}</UserMessage>
            ) : m.parts.length ? (
              <AssistantMessage key={m.id} message={m} isLast={i === chat.messages.length - 1} className="px-1" />
            ) : null,
          )}
          {last?.role === 'assistant' && last.done && !chat.busy && <Suggestions items={SUGGESTIONS} onPick={chat.send} />}
        </div>
        <div className="flex flex-col gap-2">
          {thinking && <AgentThinking small className="animate-in fade-in-0 px-1.5" />}
          <Composer
            variant="pill"
            lock
            value={chat.draft}
            onChange={(v) => {
              touched.current = true;
              chat.setDraft(v);
            }}
            onSend={(v) => {
              touched.current = true;
              chat.send(v);
            }}
            onStop={chat.stop}
            busy={chat.busy}
            context={Math.min(92, 57 + chat.messages.length * 4)}
            model={<ModelPicker value={model} onChange={setModel} className="hidden sm:flex" />}
            status={
              <>
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <GitBranch /> Main
                  </span>
                  <span className="flex items-center gap-1">
                    <Folder /> project-sea
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <InfinityIcon /> Agent
                </span>
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}
