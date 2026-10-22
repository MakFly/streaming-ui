import { Children, Fragment, isValidElement, type ComponentType, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUp, Mic, Plus, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAttachments } from './attachments';
import { ContextMeter } from './agent-limits';

/* What every composer variant shares: the props contract, the textarea behaviour (auto-grow, Enter / Shift+Enter /
 * Esc) and the small buttons and status line. Lives apart from composers.tsx so variant files (kit/variants/*)
 * can import it without a cycle through the variant registry. */
export interface ComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSend: (v: string) => void;
  onStop?: () => void;
  busy?: boolean;
  placeholder?: string;
  /** Model picker, shown where the variant has room. */
  model?: ReactNode;
  /** Tool chips (mode toggles, dataset…). */
  tools?: ReactNode;
  /** Two spans (left, right) for the status line under or inside the composer. */
  status?: ReactNode;
  /** Context window used, 0–100: the context ring, which opens the Agent Limits Card. */
  context?: number;
  /** Branch and project for the Panel's top rail. */
  branch?: string;
  project?: string;
  className?: string;
}

/** What each variant renders from: the props plus the attachment queue, owned by <Composer> so switching variant keeps the files. */
export type VariantProps = ComposerProps & { placeholder: string; att: ReturnType<typeof useAttachments> };

/** Grows with its text up to 8 lines (a quarter of the viewport on short screens, never under 4 lines), then
 * scrolls inside, like ChatGPT. */
export const fieldMaxHeight = () => Math.max(96, Math.min(192, Math.round(window.innerHeight * 0.25)));

/** Shared behaviour: an auto-growing textarea, Enter to send (Shift+Enter for a newline), Esc to stop. */
export function useField({ value, busy, onSend, onStop }: Pick<ComposerProps, 'value' | 'busy' | 'onSend' | 'onStop'>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  // Before paint, so the field never shows a stale height; composers that move the field call fit() again.
  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, fieldMaxHeight())}px`;
  }, []);
  useLayoutEffect(fit, [value, fit]);
  const submit = () => {
    if (!busy && value.trim()) onSend(value);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
    if (e.key === 'Escape' && busy) onStop?.();
  };
  return { ref, submit, onKeyDown, fit };
}

export const AddButton = ({ className, onClick }: { className?: string; onClick?: () => void }) => (
  <button type="button" aria-label="Add attachment" onClick={onClick} className={cn('grid size-9 shrink-0 place-items-center rounded-full bg-ai-chat-composer-add-background text-foreground-icon-primary transition-[background-color,scale] hover:bg-ai-chat-composer-add-hover-background active:scale-[0.96]', className)}>
    <Plus className="size-5" />
  </button>
);

/* Dictation: the browser's speech recognition writes into the field as you talk; where there is none, or the mic is
 * refused, a short phrase is "heard" word by word instead so the button always does something. Click again to stop. */
type Recognition = { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; abort(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null };
const recognitionCtor = () => {
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};
const HEARD = ['Summarize what changed since yesterday', 'Draft a short reply that says we ship on Friday', 'List the risks before we merge this'];

export function useDictation(value: string, onChange: (v: string) => void) {
  const [listening, setListening] = useState(false);
  const live = useRef({ value, onChange });
  live.current = { value, onChange };
  const session = useRef<{ rec: Recognition | null; timer: number | null; heard: boolean } | null>(null);
  const turn = useRef(0);

  const stop = useCallback(() => {
    const s = session.current;
    session.current = null;
    if (s?.timer) window.clearInterval(s.timer);
    try {
      s?.rec?.stop();
    } catch {
      /* already stopped */
    }
    setListening(false);
  }, []);

  const start = useCallback(() => {
    if (session.current) return;
    const base = live.current.value.trim();
    const join = (t: string) => (base && t ? `${base} ${t}` : base || t);
    const s: { rec: Recognition | null; timer: number | null; heard: boolean } = { rec: null, timer: null, heard: false };
    session.current = s;
    setListening(true);
    const simulate = () => {
      if (session.current !== s) return;
      s.rec = null;
      const words = HEARD[turn.current++ % HEARD.length].split(' ');
      let i = 0;
      s.timer = window.setInterval(() => {
        live.current.onChange(join(words.slice(0, ++i).join(' ')));
        if (i >= words.length) stop();
      }, 180);
    };
    const Ctor = recognitionCtor();
    if (!Ctor) return simulate();
    try {
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = navigator.language || 'en-US';
      rec.onresult = (e) => {
        let t = '';
        for (let i = 0; i < e.results.length; i++) t += e.results[i][0]?.transcript ?? '';
        s.heard = true;
        live.current.onChange(join(t.trim()));
      };
      // Refused, offline or no device: fall back to the simulation; a real session that ended just stops.
      rec.onerror = () => !s.heard && simulate();
      rec.onend = () => {
        if (session.current === s && !s.timer) (s.heard ? stop() : simulate());
      };
      s.rec = rec;
      rec.start();
    } catch {
      simulate();
    }
  }, [stop]);

  useEffect(() => stop, [stop]);
  return { listening, toggle: () => (session.current ? stop() : start()) };
}

/** Dictate into the field; pulses while listening. */
export function MicButton({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  const { listening, toggle } = useDictation(value, onChange);
  return (
    <button
      type="button"
      aria-label={listening ? 'Stop dictation' : 'Dictate'}
      aria-pressed={listening}
      onClick={toggle}
      className={cn(
        'relative hidden size-9 shrink-0 place-items-center rounded-full transition-colors sm:grid',
        listening ? 'bg-red-500/10 text-red-500 hover:bg-red-500/15' : 'text-foreground-icon-secondary hover:bg-background-tertiary-default hover:text-foreground-icon-primary',
        className,
      )}
    >
      {listening && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-red-500/20 motion-reduce:animate-none" />}
      <Mic className="relative size-[18px]" />
    </button>
  );
}

export function SendButton({ busy, disabled, onStop, className, stopClassName }: { busy?: boolean; disabled: boolean; onStop?: () => void; className?: string; stopClassName?: string }) {
  return busy ? (
    <button type="button" onClick={onStop} aria-label="Stop generating" className={cn('grid size-9 shrink-0 place-items-center rounded-full bg-background-tertiary-default text-foreground-icon-primary transition-colors hover:bg-background-tertiary-hover', stopClassName)}>
      <Square className="size-3.5 fill-current" />
    </button>
  ) : (
    <button type="submit" aria-label="Send message" disabled={disabled} className={cn('grid size-9 shrink-0 place-items-center rounded-full bg-text-primary text-background-primary-default transition-[opacity,scale] active:scale-95 disabled:opacity-30', className)}>
      <ArrowUp className="size-5" />
    </button>
  );
}

/**
 * The line under a composer: templates pass two spans (left, right). With `context`, the ring takes the far
 * right and the right span sits just before it.
 */
export const Status = ({ children, context, className }: { children?: ReactNode; context?: number; className?: string }) => {
  if (!children && context === undefined) return null;
  // `status` usually arrives as a fragment: unwrap it to reach the two spans.
  const flat = Children.toArray(children).flatMap((c) => (isValidElement<{ children?: ReactNode }>(c) && c.type === Fragment ? Children.toArray(c.props.children) : [c]));
  const [left, ...right] = flat;
  return (
    <div className={cn('flex h-[26px] items-center justify-between gap-3 px-2 text-body-2-medium text-text-tertiary [&_svg]:size-4 [&_svg]:text-foreground-icon-tertiary', className)}>
      {left ?? <span />}
      <span className="flex min-w-0 items-center gap-2">
        {right}
        {context !== undefined && <ContextMeter percent={context} className="-me-2" />}
      </span>
    </div>
  );
};

export const Field = ({ field, value, onChange, placeholder, className }: { field: ReturnType<typeof useField>; value: string; onChange: (v: string) => void; placeholder: string; className?: string }) => (
  <textarea
    ref={field.ref}
    rows={1}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onKeyDown={field.onKeyDown}
    placeholder={placeholder}
    aria-label="Message"
    className={cn('scrollbar-thin w-full resize-none bg-transparent text-body-regular leading-6 text-text-primary caret-text-primary outline-none placeholder:text-text-tertiary', className)}
  />
);

/**
 * Makes a composer view standalone: it owns its attachment queue and clears it on send, as a chat composer
 * should. Every composer file exports both the view (for a switcher that shares one queue) and this wrapped form.
 */
export function withAttachments(View: ComponentType<VariantProps>) {
  function StandaloneComposer({ placeholder = 'Ask me anything', ...p }: ComposerProps) {
    const att = useAttachments();
    const onSend = (v: string) => {
      p.onSend(v);
      att.clear();
    };
    return <View {...p} placeholder={placeholder} onSend={onSend} att={att} />;
  }
  StandaloneComposer.displayName = View.displayName ?? View.name.replace(/View$/, '');
  return StandaloneComposer;
}
