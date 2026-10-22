import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Keyboard, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttachmentStrip } from '../attachments';
import { ComposerLoader } from '../primitives';
import { withAttachments, AddButton, Field, SendButton, Status, useField, type VariantProps } from '../composer-kit';

/* Voice composer (Voice orb, drawn without motion libraries or WebGL): a glowing orb you hold to talk.
 *
 *  idle       soft orb with a mic, hint line "Hold the orb or Space to talk"
 *  listening  rings swell with a simulated level, the transcript types into the draft; release sends
 *  thinking   busy: the orb spins faster inside a dashed ring
 *  speaking   busy after a beat: the level returns as the "voice" of the answer; tap the orb or Esc stops
 *
 * Transcription uses the Web Speech API when the browser has one and falls back to a canned phrase typed
 * word by word (no microphone, no permission, the same on every machine). A keyboard toggle swaps the
 * transcript line for the shared textarea. Levels run on setInterval, not rAF, so hidden tabs don't stall. */

/* ------------------------------------------------------------------ speech recognition (guarded) */

interface RecResult {
  isFinal: boolean;
  length: number;
  [i: number]: { transcript: string };
}
interface RecEvent {
  results: { length: number; [i: number]: RecResult };
}
interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: RecEvent) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** What the simulation "hears", one per hold, in turn. */
const PHRASES = [
  'What can I cook tonight with eggs, spinach and a bit of feta?',
  'Remind me what we decided about the launch date',
  'Give me three ideas for a rainy Sunday with kids',
  'How do I say thank you very much in Japanese?',
];
let phraseTurn = 0;

const join = (base: string, add: string) => (base && add ? `${base} ${add}` : base || add);

/* ------------------------------------------------------------------ hooks */

function useReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

interface Session {
  base: string;
  text: string;
  heard: boolean;
  releasing: boolean;
  sim?: number;
  wait?: number;
  rec: Recognition | null;
}

/** Push-to-talk: `start` on press, `release(true)` sends what was heard, `release(false)` puts the draft back. */
function usePushToTalk(p: VariantProps) {
  const [listening, setListening] = useState(false);
  const latest = useRef(p);
  latest.current = p;
  const session = useRef<Session | null>(null);

  const write = useCallback((s: Session, text: string) => {
    if (session.current !== s) return;
    s.text = text;
    latest.current.onChange(text);
  }, []);

  const finish = useCallback((s: Session, send: boolean) => {
    if (session.current !== s) return;
    session.current = null;
    window.clearInterval(s.sim);
    window.clearTimeout(s.wait);
    setListening(false);
    const text = s.text.trim();
    if (!send) latest.current.onChange(s.base);
    else if (text && !latest.current.busy) latest.current.onSend(text);
  }, []);

  const simulate = useCallback(
    (s: Session) => {
      if (s.sim !== undefined || session.current !== s) return;
      const words = PHRASES[phraseTurn++ % PHRASES.length].split(' ');
      let i = 0;
      s.sim = window.setInterval(() => {
        if (i >= words.length) return;
        i += 1;
        write(s, join(s.base, words.slice(0, i).join(' ')));
      }, 230);
    },
    [write],
  );

  const start = useCallback(() => {
    if (session.current || latest.current.busy) return;
    const base = latest.current.value.trim();
    const s: Session = { base, text: base, heard: false, releasing: false, rec: null };
    session.current = s;
    setListening(true);
    const Ctor = recognitionCtor();
    if (!Ctor) {
      simulate(s);
      return;
    }
    try {
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
      rec.onresult = (e) => {
        let t = '';
        for (let i = 0; i < e.results.length; i++) t += e.results[i][0]?.transcript ?? '';
        s.heard = true;
        write(s, join(s.base, t.trim()));
      };
      // Denied, offline, no device: the simulation takes over so the hold still does something.
      rec.onerror = () => {
        if (s.rec !== rec) return;
        s.rec = null;
        if (s.releasing) finish(s, true);
        else if (!s.heard) simulate(s);
      };
      rec.onend = () => {
        if (s.rec !== rec) return;
        s.rec = null;
        if (s.releasing) finish(s, true);
        else if (!s.heard) simulate(s);
      };
      s.rec = rec;
      rec.start();
    } catch {
      s.rec = null;
      simulate(s);
    }
  }, [finish, simulate, write]);

  const release = useCallback(
    (send: boolean) => {
      const s = session.current;
      if (!s || s.releasing) return;
      const rec = s.rec;
      if (!send || !rec) {
        try {
          rec?.abort();
        } catch {
          /* already stopped */
        }
        s.rec = null;
        finish(s, send);
        return;
      }
      // Real recognition delivers its last words after stop(): wait for `end`, but never longer than 1.5s.
      s.releasing = true;
      s.wait = window.setTimeout(() => finish(s, true), 1500);
      try {
        rec.stop();
      } catch {
        finish(s, true);
      }
    },
    [finish],
  );

  useEffect(() => {
    return () => {
      const s = session.current;
      if (!s) return;
      session.current = null;
      window.clearInterval(s.sim);
      window.clearTimeout(s.wait);
      try {
        s.rec?.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return { listening, start, release };
}

type Phase = 'idle' | 'listening' | 'thinking' | 'speaking';

/** Busy reads as "thinking" for a beat, then as "speaking" (the answer streaming back as voice). */
function usePhase(listening: boolean, busy: boolean): Phase {
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    if (!busy) return;
    const t = window.setTimeout(() => setSpeaking(true), 1400);
    return () => {
      window.clearTimeout(t);
      setSpeaking(false);
    };
  }, [busy]);
  if (listening) return 'listening';
  if (busy) return speaking ? 'speaking' : 'thinking';
  return 'idle';
}

/** A 0–1 level: random while listening or speaking, a slow swell while thinking, 0 at rest. */
function useLevel(phase: Phase, reduced: boolean) {
  const [level, setLevel] = useState(0);
  useEffect(() => {
    if (phase === 'idle' || reduced) return;
    let tick = 0;
    const id = window.setInterval(() => {
      tick += 1;
      const target = phase === 'thinking' ? 0.22 + 0.14 * Math.sin(tick / 4) : phase === 'listening' ? 0.25 + Math.random() * 0.75 : 0.15 + Math.random() * 0.6;
      setLevel((prev) => prev + (target - prev) * 0.55);
    }, 90);
    return () => {
      window.clearInterval(id);
      setLevel(0);
    };
  }, [phase, reduced]);
  if (phase === 'idle') return 0;
  return reduced ? 0.35 : level;
}

/* ------------------------------------------------------------------ orb */

const CORE: CSSProperties = {
  background: [
    'radial-gradient(circle at 32% 26%, oklch(1 0 0 / 0.9), oklch(1 0 0 / 0) 34%)',
    'radial-gradient(circle at 72% 78%, oklch(0.6 0.24 300 / 0.85), oklch(0.6 0.24 300 / 0) 62%)',
    'radial-gradient(circle at 50% 50%, var(--color-accent-400), var(--color-accent-500) 70%, color-mix(in oklch, var(--color-accent-500) 70%, black))',
  ].join(', '),
  boxShadow: 'inset 0 -6px 12px oklch(0 0 0 / 0.18), inset 0 2px 4px oklch(1 0 0 / 0.35)',
};
const SWIRL: CSSProperties = {
  background: 'conic-gradient(from 0deg, oklch(0.82 0.14 200 / 0) 0deg, oklch(0.82 0.14 200 / 0.75) 70deg, oklch(0.82 0.14 200 / 0) 150deg, oklch(0.7 0.22 320 / 0.6) 230deg, oklch(0.7 0.22 320 / 0) 320deg)',
  filter: 'blur(6px)',
};
const GLOW: CSSProperties = {
  background: 'radial-gradient(circle, color-mix(in oklch, var(--color-accent-500) 60%, transparent), transparent 68%)',
  filter: 'blur(10px)',
};

function Orb({ phase, level }: { phase: Phase; level: number }) {
  const live = phase !== 'idle';
  return (
    <>
      {/* Glow and two rings, scaled by the level. */}
      <span aria-hidden className={cn('pointer-events-none absolute -inset-4 rounded-full transition-opacity duration-300 motion-reduce:transition-none', live ? 'opacity-90 dark:opacity-100' : 'opacity-40 dark:opacity-60')} style={{ ...GLOW, transform: `scale(${0.85 + level * 0.5})` }} />
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-accent-500/15 transition-transform duration-100 ease-out motion-reduce:transition-none dark:bg-accent-400/20" style={{ transform: `scale(${1 + level * 0.9})` }} />
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-accent-500/20 transition-transform duration-100 ease-out motion-reduce:transition-none dark:bg-accent-400/25" style={{ transform: `scale(${1 + level * 0.45})` }} />
      {phase === 'thinking' && <span aria-hidden className="pointer-events-none absolute -inset-1.5 animate-spin rounded-full border border-dashed border-accent-500/50 [animation-duration:5s] motion-reduce:animate-none" />}
      {/* The sphere: lit pigment, a slow swirl inside, a specular highlight on top. */}
      <span aria-hidden className="absolute inset-0 overflow-hidden rounded-full transition-transform duration-150 ease-out motion-reduce:transition-none" style={{ ...CORE, transform: `scale(${1 + level * 0.06})` }}>
        <span className={cn('absolute -inset-1/4 animate-spin opacity-80 mix-blend-screen motion-reduce:animate-none', phase === 'thinking' ? '[animation-duration:1.6s]' : live ? '[animation-duration:4s]' : '[animation-duration:12s]')} style={SWIRL} />
        <span className="absolute top-[14%] left-[22%] h-[22%] w-[34%] rounded-full bg-white/50 blur-[3px]" />
      </span>
      <Mic aria-hidden className={cn('relative size-5 text-white drop-shadow-[0_1px_2px_oklch(0_0_0/0.35)] transition-opacity duration-200', phase === 'idle' ? 'opacity-95' : 'opacity-0')} />
    </>
  );
}

const BAR_SHAPE = [0.45, 0.8, 1, 0.7, 0.5];

/** Five level bars beside the transcript while the orb is live. */
const Bars = ({ level }: { level: number }) => (
  <span aria-hidden className="flex h-4 shrink-0 items-center gap-[3px]">
    {BAR_SHAPE.map((k, i) => (
      <span key={i} className="w-[3px] rounded-full bg-accent-500 transition-[height] duration-100 motion-reduce:transition-none" style={{ height: `${4 + level * 12 * k}px` }} />
    ))}
  </span>
);

/* ------------------------------------------------------------------ composer */

export function VoiceComposerView(p: VariantProps) {
  const field = useField(p);
  const reduced = useReducedMotion();
  const { listening, start, release } = usePushToTalk(p);
  const phase = usePhase(listening, !!p.busy);
  const level = useLevel(phase, reduced);
  const [typing, setTyping] = useState(false);
  const orb = useRef<HTMLButtonElement>(null);
  const pointerHeld = useRef(false);
  const spaceHeld = useRef(false);
  const spaceAt = useRef(0);

  // Space and focus loss end a hold even when the key comes up elsewhere.
  useEffect(() => {
    if (!listening) return;
    const up = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || !spaceHeld.current) return;
      spaceHeld.current = false;
      spaceAt.current = Date.now();
      release(true);
    };
    const blur = () => {
      spaceHeld.current = false;
      pointerHeld.current = false;
      release(true);
    };
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [listening, release]);

  useEffect(() => {
    if (typing) field.ref.current?.focus();
  }, [typing, field.ref]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    const t = e.target as HTMLElement;
    const inField = !!t.closest('textarea, input, [contenteditable="true"]');
    if (e.key === 'Escape') {
      if (listening) {
        e.preventDefault();
        release(false);
      } else if (p.busy && !inField) p.onStop?.();
      return;
    }
    if (e.code !== 'Space' || inField) return;
    // Other buttons (model picker, toggles) keep Space as their click.
    if (t.tagName === 'BUTTON' && t !== orb.current) return;
    e.preventDefault();
    if (e.repeat || p.busy || listening) return;
    spaceHeld.current = true;
    start();
  };

  const hint =
    phase === 'listening'
      ? 'Listening…'
      : phase === 'thinking'
        ? 'Thinking…'
        : phase === 'speaking'
          ? 'Speaking · tap the orb or press Esc to stop'
          : 'Hold the orb or Space to talk';
  const transcript = phase === 'listening' || (phase === 'idle' && p.value) ? p.value : '';

  return (
    <div className={cn('flex w-full flex-col gap-1.5', p.className)}>
      <ComposerLoader active={!!p.busy} radius={28}>
        <form
          tabIndex={-1}
          onSubmit={(e) => {
            e.preventDefault();
            field.submit();
          }}
          onKeyDown={onKeyDown}
          onKeyUp={(e) => {
            // Stop the focused orb from also "clicking" when Space comes up.
            if (e.code === 'Space' && e.target === orb.current) e.preventDefault();
          }}
          className="flex w-full flex-col gap-2 p-2.5 outline-none"
        >
          <AttachmentStrip attachments={p.att.files} onRemove={p.att.remove} className="px-1" />
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="flex items-center gap-1 justify-self-start">
              <AddButton onClick={p.att.add} />
              <button
                type="button"
                aria-label={typing ? 'Back to voice' : 'Type instead'}
                aria-pressed={typing}
                onClick={() => setTyping((v) => !v)}
                className={cn('grid size-9 shrink-0 place-items-center rounded-full text-foreground-icon-secondary transition-colors outline-none hover:bg-background-tertiary-default hover:text-foreground-icon-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring', typing && 'bg-accent-500/10 text-accent-500 hover:bg-accent-500/15 hover:text-accent-500')}
              >
                <Keyboard className="size-[18px]" />
              </button>
            </div>
            <button
              ref={orb}
              type="button"
              aria-label={p.busy ? 'Stop the answer' : listening ? 'Release to send' : 'Hold to talk'}
              aria-pressed={listening}
              data-phase={phase}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                if (p.busy) {
                  p.onStop?.();
                  return;
                }
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  /* capture is a nicety */
                }
                pointerHeld.current = true;
                start();
              }}
              onPointerUp={() => {
                if (!pointerHeld.current) return;
                pointerHeld.current = false;
                release(true);
              }}
              onPointerCancel={() => {
                if (!pointerHeld.current) return;
                pointerHeld.current = false;
                release(true);
              }}
              onClick={(e) => {
                // Pointer presses are handled above; a keyboard click (Enter) toggles the hold.
                if (e.detail !== 0 || Date.now() - spaceAt.current < 400) return;
                if (listening) release(true);
                else if (p.busy) p.onStop?.();
                else start();
              }}
              onContextMenu={(e) => e.preventDefault()}
              className={cn('relative my-1 grid size-14 shrink-0 cursor-pointer touch-none place-items-center rounded-full outline-none select-none focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background-primary-default', listening && 'scale-105', 'transition-transform duration-150 active:scale-95 motion-reduce:transition-none')}
            >
              <Orb phase={phase} level={level} />
            </button>
            <div className="flex min-w-0 items-center gap-1 justify-self-end">
              {p.model}
              <SendButton busy={p.busy} onStop={p.onStop} disabled={!p.value.trim() || listening} />
            </div>
          </div>
          {typing ? (
            <div className="rounded-2xl bg-background-tertiary-default/60 px-3 py-1.5">
              <Field field={field} value={p.value} onChange={p.onChange} placeholder={p.placeholder} className="block min-h-6" />
            </div>
          ) : (
            <div aria-live="polite" className="flex min-h-9 items-center justify-center gap-2 px-2 pb-1 text-center">
              {phase !== 'idle' && <Bars level={level} />}
              {transcript ? (
                <span className="line-clamp-2 min-w-0 text-body-regular text-text-primary">
                  {transcript}
                  {listening && <span aria-hidden className="ms-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-accent-500 motion-reduce:animate-none" />}
                </span>
              ) : (
                <span className={cn('truncate text-body-2-medium', phase === 'idle' ? 'text-text-tertiary' : 'text-text-secondary', phase === 'thinking' && 'animate-pulse motion-reduce:animate-none')}>{hint}</span>
              )}
              {phase !== 'idle' && <Bars level={level} />}
            </div>
          )}
        </form>
      </ComposerLoader>
      {p.tools && <div className="flex flex-wrap items-center justify-center gap-1.5">{p.tools}</div>}
      <Status context={p.context}>{p.status}</Status>
    </div>
  );
}

export const VoiceComposer = withAttachments(VoiceComposerView);
