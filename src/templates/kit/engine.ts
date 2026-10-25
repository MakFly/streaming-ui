import { useCallback, useEffect, useRef, useState } from 'react';

/* A tiny scripted chat engine. Templates describe a conversation as an async script
 * (think → call tools → stream markdown); the engine turns it into React state over time,
 * and a new user message (or unmount) cancels whatever is still playing. */

export type ToolStatus = 'running' | 'done' | 'error';

export type Part =
  | { kind: 'thinking'; id: string; label: string; steps: string[]; done: boolean; seconds?: number }
  | { kind: 'tool'; id: string; name: string; arg?: string; status: ToolStatus; meta?: string; output?: string[] }
  | { kind: 'text'; id: string; text: string; shown: number; done: boolean }
  | { kind: 'custom'; id: string; type: string; data: Record<string, unknown> };

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  parts: Part[];
  done: boolean;
}

let seq = 0;
const uid = () => `p${++seq}`;

class Cancelled extends Error {}

export interface ChatScriptApi {
  /** Wait, unless the script was cancelled. */
  sleep(ms: number): Promise<void>;
  /** Adds a user message (optionally typed into the composer first). */
  user(text: string, opts?: { type?: boolean }): Promise<void>;
  /** Starts an assistant message; every call below writes into it. */
  assistant(): AssistantApi;
  /** Text shown in the composer while the script "types". */
  setDraft(text: string): void;
}

export interface AssistantApi {
  /** Reasoning block: label shimmers while each step is appended, then collapses to "Thought for Ns". */
  think(label: string, steps?: string[], stepMs?: number): Promise<void>;
  /** Tool call row: spinner → check. `output` lines stream in under it. */
  tool(name: string, arg: string | undefined, opts?: { ms?: number; meta?: string; output?: string[]; lineMs?: number; status?: ToolStatus }): Promise<string>;
  /** Streams markdown word by word (~`wps` words per second). */
  stream(markdown: string, wps?: number): Promise<void>;
  /** Template-specific block (table, chart, diff…); returns a setter to update it over time. */
  custom(type: string, data: Record<string, unknown>): (patch: Record<string, unknown>) => void;
  done(): void;
}

export type Script = (api: ChatScriptApi) => Promise<void>;

export function useChatEngine({ intro, reply }: { intro?: Script; reply: (api: ChatScriptApi, text: string) => Promise<void> }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState('');
  const token = useRef(0);

  const run = useCallback(async (script: Script) => {
    const my = ++token.current;
    const alive = () => my === token.current;
    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const id = setTimeout(() => (alive() ? resolve() : reject(new Cancelled())), ms);
        if (!alive()) {
          clearTimeout(id);
          reject(new Cancelled());
        }
      });
    const patchMessage = (msgId: string, fn: (m: Message) => Message) =>
      alive() && setMessages((all) => all.map((m) => (m.id === msgId ? fn(m) : m)));
    const patchPart = (msgId: string, partId: string, fn: (p: Part) => Part) =>
      patchMessage(msgId, (m) => ({ ...m, parts: m.parts.map((p) => (p.id === partId ? fn(p) : p)) }));
    const addPart = (msgId: string, part: Part) => patchMessage(msgId, (m) => ({ ...m, parts: [...m.parts, part] }));

    const api: ChatScriptApi = {
      sleep,
      setDraft: (t) => alive() && setDraft(t),
      async user(text, opts) {
        if (opts?.type) {
          for (let i = 1; i <= text.length; i++) {
            setDraft(text.slice(0, i));
            await sleep(text[i - 1] === ' ' ? 45 : 22);
          }
          await sleep(350);
          setDraft('');
        }
        if (!alive()) throw new Cancelled();
        setMessages((all) => [...all, { id: uid(), role: 'user', parts: [{ kind: 'text', id: uid(), text, shown: text.length, done: true }], done: true }]);
        await sleep(250);
      },
      assistant() {
        const msgId = uid();
        if (alive()) setMessages((all) => [...all, { id: msgId, role: 'assistant', parts: [], done: false }]);
        return {
          async think(label, steps = [], stepMs = 700) {
            const id = uid();
            const t0 = Date.now();
            addPart(msgId, { kind: 'thinking', id, label, steps: [], done: false });
            await sleep(500);
            for (const s of steps) {
              patchPart(msgId, id, (p) => (p.kind === 'thinking' ? { ...p, steps: [...p.steps, s] } : p));
              await sleep(stepMs);
            }
            const seconds = Math.max(1, Math.round((Date.now() - t0) / 1000));
            patchPart(msgId, id, (p) => (p.kind === 'thinking' ? { ...p, done: true, seconds } : p));
            await sleep(200);
          },
          async tool(name, arg, opts = {}) {
            const id = uid();
            addPart(msgId, { kind: 'tool', id, name, arg, status: 'running', output: opts.output ? [] : undefined });
            await sleep(opts.ms ?? 900);
            for (const line of opts.output ?? []) {
              patchPart(msgId, id, (p) => (p.kind === 'tool' ? { ...p, output: [...(p.output ?? []), line] } : p));
              await sleep(opts.lineMs ?? 120);
            }
            patchPart(msgId, id, (p) => (p.kind === 'tool' ? { ...p, status: opts.status ?? 'done', meta: opts.meta } : p));
            await sleep(180);
            return id;
          },
          async stream(markdown, wps = 22) {
            const id = uid();
            addPart(msgId, { kind: 'text', id, text: markdown, shown: 0, done: false });
            const words = markdown.split(/(?<=\s)/);
            let shown = 0;
            for (let i = 0; i < words.length; i += 2) {
              const chunk = words[i] + (words[i + 1] ?? '');
              shown += chunk.length;
              const n = shown;
              patchPart(msgId, id, (p) => (p.kind === 'text' ? { ...p, shown: n } : p));
              // Breathe like BoardUI: a beat after a sentence, a longer one before the next block.
              const pause = /\n\s*$/.test(chunk) ? 160 : /[.!?:]\s*$/.test(chunk) ? 100 : 0;
              await sleep(2000 / wps + pause);
            }
            patchPart(msgId, id, (p) => (p.kind === 'text' ? { ...p, shown: markdown.length, done: true } : p));
          },
          custom(type, data) {
            const id = uid();
            addPart(msgId, { kind: 'custom', id, type, data });
            return (patch) => patchPart(msgId, id, (p) => (p.kind === 'custom' ? { ...p, data: { ...p.data, ...patch } } : p));
          },
          done() {
            patchMessage(msgId, (m) => ({ ...m, done: true }));
          },
        };
      },
    };

    setBusy(true);
    try {
      await script(api);
    } catch (error) {
      if (!(error instanceof Cancelled)) console.error(error);
    } finally {
      if (alive()) {
        setBusy(false);
        setMessages((all) => all.map((m) => (m.done ? m : { ...m, done: true })));
      }
    }
  }, []);

  // Play the intro conversation once mounted; unmount cancels it.
  useEffect(() => {
    if (intro) {
      setMessages([]);
      void run(intro);
    }
    return () => {
      token.current++;
    };
  }, [intro, run]);

  const send = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t) return;
      setDraft('');
      void run(async (api) => {
        await api.user(t);
        await reply(api, t);
      });
    },
    [reply, run],
  );

  const stop = useCallback(() => {
    token.current++;
    setBusy(false);
    // Freeze whatever was in flight: streams end where they are, reasoning collapses, running tools settle.
    const settle = (p: Part): Part =>
      p.kind === 'text' ? { ...p, done: true } : p.kind === 'thinking' && !p.done ? { ...p, done: true, seconds: Math.max(1, p.steps.length) } : p.kind === 'tool' && p.status === 'running' ? { ...p, status: 'error', meta: 'Stopped' } : p;
    setMessages((all) => all.map((m) => (m.done ? m : { ...m, done: true, parts: m.parts.map(settle) })));
  }, []);

  /** Cancels whatever is playing and empties the thread (New chat). */
  const reset = useCallback(() => {
    token.current++;
    setBusy(false);
    setDraft('');
    setMessages([]);
  }, []);

  return { messages, busy, draft, setDraft, send, stop, run, reset };
}
