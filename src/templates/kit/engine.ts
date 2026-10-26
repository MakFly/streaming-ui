import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chat, useChat } from '@ai-sdk/react';
import type { UIMessage, UIMessageChunk } from 'ai';
import { ScriptTransport, type Turn } from './script-transport';

/* A tiny scripted chat engine on top of the AI SDK. Templates describe a conversation as an async script
 * (think → call tools → stream markdown); each call writes the UI message stream chunks a real model would send,
 * useChat turns them into messages, and a new user message (or unmount) cancels whatever is still playing.
 * The templates read `Message`/`Part` below, mapped from the AI SDK's UIMessage parts, so a live transport
 * renders through the same components. */

export type ToolStatus = 'running' | 'done' | 'error';

export type Part =
  | { kind: 'thinking'; id: string; label: string; steps: string[]; done: boolean; seconds?: number }
  | { kind: 'tool'; id: string; name: string; arg?: string; status: ToolStatus; meta?: string; output?: string[] }
  | { kind: 'text'; id: string; text: string; shown: number; done: boolean }
  | { kind: 'custom'; id: string; type: string; data: Record<string, unknown> };

import type { ReplyRef } from './reply';
export type { ReplyRef };

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  parts: Part[];
  done: boolean;
  /** A user message written in reply to an earlier one. */
  replyTo?: ReplyRef;
}

/** The AI SDK message the engine keeps: the reply quote rides in its metadata. */
export type ChatMessage = UIMessage<{ replyTo?: ReplyRef }>;

/** providerMetadata namespace for what the protocol has no field for: the reasoning label and its duration. */
const DEMO = 'demo';
/** Tool output as the scripts send it: the meta shown on the row, and the lines streamed under it. */
type ToolOutput = { meta?: string; lines?: string[] };

let seq = 0;
const uid = () => `p${++seq}`;

class Cancelled extends Error {}

export interface ChatScriptApi {
  /** Wait, unless the script was cancelled. */
  sleep(ms: number): Promise<void>;
  /** Adds a user message (optionally typed into the composer first). */
  user(text: string, opts?: { type?: boolean; replyTo?: ReplyRef }): Promise<void>;
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

/** Seconds each reasoning part took, timed on the client when the stream does not say (a live model). */
type Clock = { started: Map<string, number>; took: Map<string, number> };

/** UIMessage parts → the kit's parts. `settle` freezes a message no longer streaming: text ends where it is,
 *  reasoning collapses, a tool still running reads as stopped. */
function toPart(p: ChatMessage['parts'][number], key: string, settle: boolean, clock: Clock): Part | null {
  if (p.type === 'text') return { kind: 'text', id: key, text: p.text, shown: p.text.length, done: settle || p.state !== 'streaming' };
  if (p.type === 'reasoning') {
    const meta = p.providerMetadata?.[DEMO] as { label?: string; seconds?: number } | undefined;
    const done = settle || p.state !== 'streaming';
    if (!clock.started.has(key)) clock.started.set(key, Date.now());
    if (done && !clock.took.has(key)) clock.took.set(key, meta?.seconds ?? Math.max(1, Math.round((Date.now() - clock.started.get(key)!) / 1000)));
    return { kind: 'thinking', id: key, label: meta?.label ?? 'Thinking', steps: p.text.split('\n').filter(Boolean), done, seconds: done ? clock.took.get(key) : undefined };
  }
  if (p.type === 'dynamic-tool') {
    const out = (p.state === 'output-available' ? p.output : p.toolMetadata) as ToolOutput | undefined;
    const arg = p.input == null ? undefined : typeof p.input === 'string' ? p.input : JSON.stringify(p.input);
    const tool = { kind: 'tool', id: p.toolCallId, name: p.toolName, arg, output: out?.lines } as const;
    if (p.state === 'output-error') return { ...tool, status: 'error', meta: p.errorText || undefined };
    if (p.state === 'output-available' && !p.preliminary) return { ...tool, status: 'done', meta: out?.meta };
    return settle ? { ...tool, status: 'error', meta: 'Stopped' } : { ...tool, status: 'running' };
  }
  if (p.type.startsWith('data-') && 'data' in p) return { kind: 'custom', id: p.id ?? key, type: p.type.slice(5), data: p.data as Record<string, unknown> };
  return null;
}

function toMessage(m: ChatMessage, live: boolean, clock: Clock): Message {
  const parts = m.parts.flatMap((p, i) => toPart(p, `${m.id}:${i}`, !live, clock) ?? []);
  return { id: m.id, role: m.role === 'user' ? 'user' : 'assistant', parts, done: !live, replyTo: m.metadata?.replyTo };
}

export function useChatEngine({ intro, reply }: { intro?: Script; reply: (api: ChatScriptApi, text: string) => Promise<void> }) {
  const [transport] = useState(() => new ScriptTransport());
  // One Chat per conversation: New chat (or a replayed intro) starts a fresh one rather than clearing a busy one.
  const [chat, setChat] = useState(() => new Chat<ChatMessage>({ transport }));
  const current = useRef(chat);
  const { messages: raw } = useChat({ chat });
  const [live, setLive] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState('');
  const token = useRef(0);
  // The response being written: its stream, and the assistant message once the script started one.
  const turn = useRef<{ io: Turn; message?: string } | null>(null);

  const clock = useRef<Clock>({ started: new Map(), took: new Map() });
  const messages = useMemo(() => raw.map((m) => toMessage(m, m.id === live, clock.current)), [raw, live]);

  const endTurn = useCallback(() => {
    turn.current?.io.write({ type: 'finish' });
    turn.current?.io.close();
    turn.current = null;
    setLive(null);
  }, []);

  /** Opens a response: with a user message, or none (an assistant that speaks first). */
  const request = useCallback(
    (text?: string, replyTo?: ReplyRef) => {
      endTurn();
      turn.current = { io: transport.turn() };
      void current.current.sendMessage(text === undefined ? undefined : { text, metadata: { replyTo } });
    },
    [endTurn, transport],
  );

  const fresh = useCallback(() => {
    void current.current.stop();
    current.current = new Chat<ChatMessage>({ transport });
    setChat(current.current);
  }, [transport]);

  const run = useCallback(
    async (script: Script) => {
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
      // A new script takes over: whatever was still streaming ends where it is.
      endTurn();

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
          request(text, opts?.replyTo);
          await sleep(250);
        },
        assistant() {
          const msgId = uid();
          if (alive()) {
            if (!turn.current?.io.open || turn.current.message) request();
            turn.current!.message = msgId;
            turn.current!.io.write({ type: 'start', messageId: msgId });
            setLive(msgId);
          }
          const mine = () => alive() && turn.current?.message === msgId;
          const emit = (chunk: UIMessageChunk) => mine() && turn.current!.io.write(chunk);
          return {
            async think(label, steps = [], stepMs = 700) {
              const id = uid();
              const t0 = Date.now();
              emit({ type: 'reasoning-start', id, providerMetadata: { [DEMO]: { label } } });
              await sleep(500);
              for (const s of steps) {
                emit({ type: 'reasoning-delta', id, delta: `${s}\n` });
                await sleep(stepMs);
              }
              const seconds = Math.max(1, Math.round((Date.now() - t0) / 1000));
              emit({ type: 'reasoning-end', id, providerMetadata: { [DEMO]: { label, seconds } } });
              await sleep(200);
            },
            async tool(name, arg, opts = {}) {
              const id = uid();
              emit({ type: 'tool-input-available', toolCallId: id, toolName: name, input: arg, dynamic: true });
              await sleep(opts.ms ?? 900);
              const lines = opts.output ?? [];
              // Lines arrive as preliminary results, like a tool that yields as it runs.
              for (let i = 1; i <= lines.length; i++) {
                emit({ type: 'tool-output-available', toolCallId: id, output: { lines: lines.slice(0, i) }, dynamic: true, preliminary: true });
                await sleep(opts.lineMs ?? 120);
              }
              const output: ToolOutput = { meta: opts.meta, lines: opts.output };
              if (opts.status === 'error') emit({ type: 'tool-output-error', toolCallId: id, errorText: opts.meta ?? '', dynamic: true, toolMetadata: opts.output && { lines: opts.output } });
              else if (opts.status !== 'running') emit({ type: 'tool-output-available', toolCallId: id, output, dynamic: true });
              await sleep(180);
              return id;
            },
            async stream(markdown, wps = 22) {
              const id = uid();
              emit({ type: 'text-start', id });
              const words = markdown.split(/(?<=\s)/);
              for (let i = 0; i < words.length; i += 2) {
                const chunk = words[i] + (words[i + 1] ?? '');
                emit({ type: 'text-delta', id, delta: chunk });
                // Breathe like BoardUI: a beat after a sentence, a longer one before the next block.
                const pause = /\n\s*$/.test(chunk) ? 160 : /[.!?:]\s*$/.test(chunk) ? 100 : 0;
                await sleep(2000 / wps + pause);
              }
              emit({ type: 'text-end', id });
            },
            custom(type, data) {
              const id = uid();
              let value = data;
              emit({ type: `data-${type}`, id, data });
              // A data part with the same id replaces the previous one; once the response has ended, patch it in place.
              return (patch) => {
                value = { ...value, ...patch };
                if (emit({ type: `data-${type}`, id, data: value }) || !alive()) return;
                const c = current.current;
                c.messages = c.messages.map((m) => (m.id !== msgId ? m : { ...m, parts: m.parts.map((p) => (p.type === `data-${type}` && 'id' in p && p.id === id ? { ...p, data: value } : p)) }));
              };
            },
            done() {
              if (mine()) endTurn();
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
          endTurn();
        }
      }
    },
    [endTurn, request],
  );

  // Play the intro conversation once mounted; unmount cancels it.
  useEffect(() => {
    if (intro) {
      fresh();
      void run(intro);
    }
    return () => {
      token.current++;
      endTurn();
    };
  }, [intro, run, fresh, endTurn]);

  // Reply: the answer quoted in the composer (<Composer reply>) until the next send takes it along.
  const [replyTo, setReplyTo] = useState<ReplyRef | null>(null);
  const quoted = useRef<ReplyRef | null>(null);
  quoted.current = replyTo;
  const startReply = useCallback((ref: ReplyRef) => setReplyTo(ref), []);
  const clearReply = useCallback(() => setReplyTo(null), []);

  const send = useCallback(
    (text: string, replyTo?: ReplyRef) => {
      const t = text.trim();
      if (!t) return;
      const ref = replyTo ?? quoted.current ?? undefined;
      setDraft('');
      setReplyTo(null);
      void run(async (api) => {
        await api.user(t, { replyTo: ref });
        await reply(api, t);
      });
    },
    [reply, run],
  );

  /** Freezes whatever is in flight: the response ends where it is (see toPart's settle). */
  const stop = useCallback(() => {
    token.current++;
    setBusy(false);
    endTurn();
    void current.current.stop();
  }, [endTurn]);

  /** Cancels whatever is playing and empties the thread (New chat). */
  const reset = useCallback(() => {
    token.current++;
    setBusy(false);
    setDraft('');
    setReplyTo(null);
    endTurn();
    fresh();
  }, [endTurn, fresh]);

  return { messages, busy, draft, setDraft, send, stop, run, reset, replyTo, startReply, clearReply };
}
