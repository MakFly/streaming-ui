import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttachmentStrip } from '../attachments';
import { withAttachments, AddButton, Field, SendButton, Status, useField, type VariantProps } from '../composer-kit';

/* Halo (Glow rim): a rounded card inside a glowing conic rim. Rather than painting the rim
 * with a shader, it is a conic-gradient whose start angle is an animated @property, plus a blurred copy
 * behind it for the glow. Calm at rest, brighter on focus, fast and bright while busy. Empty, the field types and
 * erases example prompts; Enhance rewrites the draft into a richer prompt; sending dissolves the text into
 * drifting characters before the message leaves. Reduced motion: still rim, prompts swap whole, no vanish. */

/* ------------------------------------------------------------------ styles (scoped by the tpl-halo prefix) */

const CSS = `
@keyframes tpl-halo-blink { 50% { opacity: 0; } }
@keyframes tpl-halo-shimmer { from { background-position: 150% 0; } to { background-position: -50% 0; } }
@keyframes tpl-halo-vanish {
  0% { opacity: 1; transform: translate(0, 0) scale(1); filter: blur(0); }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--r)) scale(0.6); filter: blur(3px); }
}
.tpl-halo-ring {
  --rim: color-mix(in oklab, var(--color-text-primary) 70%, transparent);
  background: conic-gradient(from 200deg, var(--rim), transparent 28%, transparent 50%, var(--rim) 72%, transparent 92%, var(--rim));
}
.tpl-halo-caret { animation: tpl-halo-blink 1s steps(1) infinite; }
.tpl-halo-shimmer {
  background: linear-gradient(100deg, transparent 30%, oklch(0.7 0.2 290 / 0.22) 50%, transparent 70%) no-repeat;
  background-size: 200% 100%;
  animation: tpl-halo-shimmer 0.9s ease-in-out infinite;
}
.tpl-halo-char { display: inline-block; animation: tpl-halo-vanish 460ms cubic-bezier(0.4, 0, 0.7, 1) forwards; }
@media (prefers-reduced-motion: reduce) {
  .tpl-halo-caret, .tpl-halo-shimmer { animation: none; }
}
`;

/* ------------------------------------------------------------------ helpers */

const EXAMPLES = ['Summarize this article in three bullet points', 'Plan a 3-day trip to Kyoto in autumn', 'Explain closures in JavaScript like I am five', 'Draft a friendly reminder for an overdue invoice'];

const VANISH_MS = 560;
const ENHANCE_MS = 750;

const motionQuery = '(prefers-reduced-motion: reduce)';
function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia(motionQuery);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
const useReducedMotion = () =>
  useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(motionQuery).matches,
    () => false,
  );

/** The simulated "Enhance": keeps the ask, adds the context, shape and constraints a good prompt carries. */
function enhance(draft: string) {
  const ask = draft.trim().replace(/[.?!]+$/, '');
  return `${ask.charAt(0).toUpperCase()}${ask.slice(1)}.

Context: I want a clear, practical answer I can act on today.
Format: start with a one-sentence summary, then concrete steps as a short list.
Constraints: plain language, call out any assumptions, and keep it under 200 words.`;
}

interface Particle {
  ch: string;
  dx: number;
  dy: number;
  r: number;
  delay: number;
}

/** Splits the sent text into characters, each with a random drift up and out, staggered left to right. */
function particlesOf(text: string): Particle[] {
  const chars = Array.from(text.slice(0, 320));
  const n = Math.max(1, chars.length - 1);
  return chars.map((ch, i) => ({
    ch,
    dx: Math.round((Math.random() - 0.3) * 36),
    dy: Math.round(-8 - Math.random() * 26),
    r: Math.round((Math.random() - 0.5) * 70),
    delay: Math.round((i / n) * 140 + Math.random() * 40),
  }));
}

/** Groups particles into words so the overlay wraps like the textarea did. */
function wordsOf(parts: Particle[]) {
  const out: (Particle[] | string)[] = [];
  let word: Particle[] = [];
  for (const p of parts) {
    if (/\s/.test(p.ch)) {
      if (word.length) out.push(word);
      word = [];
      out.push(p.ch);
    } else word.push(p);
  }
  if (word.length) out.push(word);
  return out;
}

/* ------------------------------------------------------------------ the typed placeholder */

/** Types each example letter by letter, holds, erases, moves on. Timers only; paused while `on` is false. */
function useTypedPlaceholder(examples: string[], on: boolean, reduced: boolean) {
  const [t, setT] = useState({ i: 0, n: 0, erase: false });
  useEffect(() => {
    if (!on) return;
    const text = examples[t.i % examples.length];
    let delay: number;
    let next: typeof t;
    if (reduced) {
      // No typing: show each example whole and swap every few seconds.
      delay = t.n === 0 ? 0 : 3200;
      next = t.n === 0 ? { ...t, n: text.length } : { i: t.i + 1, n: examples[(t.i + 1) % examples.length].length, erase: false };
    } else if (!t.erase) {
      delay = t.n === 0 ? 450 : t.n < text.length ? 38 + Math.random() * 40 : 1800;
      next = t.n < text.length ? { ...t, n: t.n + 1 } : { ...t, erase: true };
    } else {
      delay = 16;
      next = t.n > 0 ? { ...t, n: t.n - 1 } : { i: t.i + 1, n: 0, erase: false };
    }
    const id = window.setTimeout(() => setT(next), delay);
    return () => window.clearTimeout(id);
  }, [on, reduced, t, examples]);
  const text = examples[t.i % examples.length];
  return { text: text.slice(0, t.n), full: text };
}

/* ------------------------------------------------------------------ composer */

export function HaloComposerView(p: VariantProps) {
  const reduced = useReducedMotion();
  const [vanish, setVanish] = useState<Particle[] | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const send = (text: string) => {
    if (vanish || enhancing) return;
    if (reduced) {
      p.onSend(text);
      return;
    }
    setVanish(particlesOf(text));
    p.onChange('');
    later(() => {
      setVanish(null);
      p.onSend(text);
    }, VANISH_MS);
  };
  const field = useField({ value: p.value, busy: p.busy, onStop: p.onStop, onSend: send });

  const examples = useMemo(() => [p.placeholder, ...EXAMPLES.filter((e) => e !== p.placeholder)], [p.placeholder]);
  const idle = !p.value && !vanish && !enhancing;
  const typed = useTypedPlaceholder(examples, idle, reduced);

  const onEnhance = () => {
    if (enhancing || vanish) return;
    // Empty: take the example on show as the starting draft.
    const draft = p.value.trim() || typed.full;
    setEnhancing(true);
    p.onChange(draft);
    later(() => {
      setEnhancing(false);
      p.onChange(enhance(draft));
      field.ref.current?.focus();
    }, reduced ? 0 : ENHANCE_MS);
  };

  const text = 'px-3.5 pt-3 pb-1 text-body-regular leading-6';
  return (
    <div className={cn('flex w-full flex-col gap-1.5', p.className)}>
      <style>{CSS}</style>
      <div data-busy={p.busy ? '' : undefined} className="tpl-halo group/halo relative isolate">
        {/* Glow: a blurred copy of the rim, calm at rest, brighter on focus and while busy. */}
        <div
          aria-hidden
          className={cn(
            'tpl-halo-ring pointer-events-none absolute -inset-1 -z-10 rounded-[28px] blur-xl transition-opacity duration-500',
            p.busy ? 'opacity-80 dark:opacity-90' : 'opacity-0 group-focus-within/halo:opacity-55 dark:group-focus-within/halo:opacity-70',
          )}
        />
        <div className="relative overflow-hidden rounded-3xl bg-border-button-default p-[1.5px] shadow-xs">
          <div aria-hidden className={cn('tpl-halo-ring absolute inset-0 transition-opacity duration-500', p.busy ? 'opacity-100' : 'opacity-0 group-focus-within/halo:opacity-100')} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              field.submit();
            }}
            onClick={(e) => e.target === e.currentTarget && field.ref.current?.focus()}
            className="relative flex w-full cursor-text flex-col gap-1 rounded-[22.5px] bg-background-primary-default p-2"
          >
            <AttachmentStrip attachments={p.att.files} onRemove={p.att.remove} className="px-1.5 pt-1" />
            <div className="relative">
              <Field
                field={field}
                value={p.value}
                onChange={p.onChange}
                placeholder={p.placeholder}
                className={cn('min-h-12 placeholder:text-transparent', text, enhancing && 'text-text-tertiary')}
              />
              {idle && (
                <div aria-hidden className={cn('pointer-events-none absolute inset-0 truncate text-text-tertiary', text)}>
                  {typed.text}
                  {!reduced && <span className="tpl-halo-caret ms-px inline-block h-4 w-px translate-y-[3px] bg-text-tertiary" />}
                </div>
              )}
              {enhancing && <div aria-hidden className="tpl-halo-shimmer pointer-events-none absolute inset-0 rounded-xl" />}
              {vanish && (
                <div aria-hidden className={cn('pointer-events-none absolute inset-0 max-h-48 overflow-visible break-words whitespace-pre-wrap text-text-primary', text)}>
                  {wordsOf(vanish).map((w, i) =>
                    typeof w === 'string' ? (
                      w
                    ) : (
                      <span key={i} className="inline-block whitespace-nowrap">
                        {w.map((c, j) => (
                          <span
                            key={j}
                            className="tpl-halo-char"
                            style={{ '--dx': `${c.dx}px`, '--dy': `${c.dy}px`, '--r': `${c.r}deg`, animationDelay: `${c.delay}ms` } as CSSProperties}
                          >
                            {c.ch}
                          </span>
                        ))}
                      </span>
                    ),
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <AddButton onClick={p.att.add} />
              <button
                type="button"
                onClick={onEnhance}
                disabled={enhancing || !!vanish}
                aria-label="Enhance prompt"
                className={cn(
                  'flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-body-2-medium transition-[background-color,color,scale] active:scale-[0.96] disabled:cursor-default [&_svg]:size-4',
                  enhancing ? 'bg-violet-500/15 text-violet-600 dark:text-violet-300' : 'text-text-secondary hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-300',
                )}
              >
                <Sparkles className={cn(enhancing && 'animate-pulse')} />
                <span className="hidden sm:inline">{enhancing ? 'Enhancing…' : 'Enhance'}</span>
              </button>
              {p.tools}
              <span className="ms-auto flex items-center gap-1">
                {p.model}
                <SendButton busy={p.busy} onStop={p.onStop} disabled={!p.value.trim() || enhancing || !!vanish} />
              </span>
            </div>
          </form>
        </div>
      </div>
      <Status context={p.context}>{p.status}</Status>
    </div>
  );
}

export const HaloComposer = withAttachments(HaloComposerView);
