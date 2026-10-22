import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LoaderCircle, Paperclip, Sparkles, TextQuote, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttachmentStrip } from '../attachments';
import { ComposerLoader } from '../primitives';
import { withAttachments, SendButton, Status, useField, type VariantProps } from '../composer-kit';

/* Inline (Selection bar, ⌘K): a compact single-line bar meant to sit on a selection. Select text anywhere on the
 * page, press ⌘K / Ctrl+K: the bar takes focus and carries the selection as a quote chip. Edit or Ask decides
 * what the submit means (⌥↵ always asks); Tab fills a suggested instruction; Esc stops, then drops the chip,
 * then leaves the bar. The quote travels with the message as a markdown blockquote. */

type Mode = 'edit' | 'ask';

const SUGGEST: Record<Mode, string> = { edit: 'Make this shorter and clearer', ask: 'Explain what this means' };

const isMac = () => typeof navigator !== 'undefined' && /Mac|iP(hone|ad|od)/.test(navigator.platform);

const kbd = 'inline-flex h-4 min-w-4 items-center justify-center rounded border border-border-button-default bg-background-tertiary-default px-1 font-mono text-[10px] leading-none text-text-secondary';

const Key = ({ children }: { children: ReactNode }) => <kbd className={kbd}>{children}</kbd>;

export function InlineComposerView(p: VariantProps) {
  const field = useField(p);
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('edit');
  const [quote, setQuote] = useState<string | null>(null);
  const [mod, setMod] = useState('⌘');

  useEffect(() => {
    if (!isMac()) setMod('Ctrl');
  }, []);

  // Global ⌘K / Ctrl+K focuses the field (the page selection was captured just before, see below).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // The latest non-empty selection outside the bar becomes the chip. It stays when focusing the field
  // collapses the page selection, until it is removed, replaced or sent.
  const read = () => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? '';
    if (!text || !sel?.anchorNode || root.current?.contains(sel.anchorNode)) return;
    setQuote(text.slice(0, 2000));
  };
  const readRef = useRef(read);
  readRef.current = read;
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const onChange = () => {
      clearTimeout(t);
      t = setTimeout(() => readRef.current(), 120);
    };
    document.addEventListener('selectionchange', onChange);
    return () => {
      clearTimeout(t);
      document.removeEventListener('selectionchange', onChange);
    };
  }, []);

  const submit = (as: Mode = mode) => {
    if (p.busy || !p.value.trim()) return;
    if (as !== mode) setMode(as);
    const text = quote ? `> ${quote.replace(/\n/g, '\n> ')}\n\n${p.value}` : p.value;
    p.onSend(text);
    setQuote(null);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      submit(e.altKey ? 'ask' : mode);
      return;
    }
    if (e.key === 'Tab' && !e.shiftKey && !p.value) {
      e.preventDefault();
      p.onChange(SUGGEST[mode]);
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      if (p.busy) field.onKeyDown(e);
      else if (quote) setQuote(null);
      else input.current?.blur();
    }
  };

  const segment = (m: Mode, label: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={mode === m}
      onClick={() => {
        setMode(m);
        input.current?.focus();
      }}
      className={cn('h-6 rounded-md px-2 text-caption-1-medium transition-colors', mode === m ? 'bg-background-primary-default text-text-primary shadow-xs' : 'text-text-tertiary hover:text-text-secondary')}
    >
      {label}
    </button>
  );

  return (
    <div ref={root} className={cn('flex w-full flex-col gap-1.5', p.className)}>
      <AttachmentStrip attachments={p.att.files} onRemove={p.att.remove} className="px-2" />
      <ComposerLoader active={!!p.busy} radius={12}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          onClick={(e) => e.target === e.currentTarget && input.current?.focus()}
          className="flex w-full cursor-text flex-col"
        >
          <div className="flex h-11 items-center gap-1.5 ps-2.5 pe-1.5">
            <span className={cn('grid size-6 shrink-0 place-items-center rounded-md', p.busy ? 'text-accent-500' : 'bg-accent-500/10 text-accent-500')} aria-hidden>
              {p.busy ? <LoaderCircle className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
            </span>
            {quote ? (
              <span title={quote} className="flex h-6 max-w-[38%] min-w-0 shrink items-center gap-1 rounded-md border border-border-button-default bg-background-tertiary-default ps-1.5 pe-0.5 text-caption-1-medium text-text-secondary">
                <TextQuote className="size-3 shrink-0 text-foreground-icon-tertiary" />
                <span className="truncate">{quote}</span>
                <button type="button" aria-label="Remove selection" onClick={() => setQuote(null)} className="grid size-4 shrink-0 place-items-center rounded text-foreground-icon-tertiary hover:bg-background-primary-hover hover:text-foreground-icon-primary">
                  <X className="size-3" />
                </button>
              </span>
            ) : (
              <span className="hidden h-6 shrink-0 items-center rounded-md border border-dashed border-border-button-default px-1.5 text-caption-1-medium text-text-tertiary sm:flex">No selection</span>
            )}
            <input
              ref={input}
              value={p.value}
              onChange={(e) => p.onChange(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={read}
              placeholder={quote ? (mode === 'edit' ? 'Describe the edit…' : 'Ask about the selection…') : p.placeholder}
              aria-label={mode === 'edit' ? 'Edit instruction' : 'Question'}
              className="h-6 min-w-0 flex-1 bg-transparent px-1 text-body-2-regular text-text-primary caret-accent-500 outline-none placeholder:text-text-tertiary"
            />
            <div role="radiogroup" aria-label="Mode" className="flex shrink-0 items-center rounded-lg bg-background-tertiary-default p-0.5">
              {segment('edit', 'Edit')}
              {segment('ask', 'Ask')}
            </div>
            {p.model && <span className="hidden shrink-0 items-center sm:flex [&_button]:h-7 [&_button]:text-caption-1-medium">{p.model}</span>}
            <SendButton busy={p.busy} onStop={p.onStop} disabled={!p.value.trim()} className="size-7 rounded-lg [&_svg]:size-4" stopClassName="size-7 rounded-lg" />
          </div>
          <div className="flex h-7 items-center gap-3 border-t border-separator-border ps-3 pe-1.5 text-caption-2-medium text-text-tertiary">
            {p.busy ? (
              <button type="button" onClick={p.onStop} className="flex items-center gap-1 hover:text-text-primary">
                <Key>Esc</Key> stop
              </button>
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <Key>{mod === '⌘' ? '⌘K' : 'Ctrl K'}</Key> focus
                </span>
                <span className="flex items-center gap-1">
                  <Key>↵</Key> {mode}
                </span>
                <span className="hidden items-center gap-1 sm:flex">
                  <Key>{mod === '⌘' ? '⌥↵' : 'Alt ↵'}</Key> ask
                </span>
                <span className="hidden items-center gap-1 md:flex">
                  <Key>Tab</Key> accept
                </span>
                <span className="hidden items-center gap-1 sm:flex">
                  <Key>Esc</Key> close
                </span>
              </>
            )}
            <button type="button" aria-label="Attach file" onClick={p.att.add} className="ms-auto grid size-6 place-items-center rounded-md hover:bg-background-tertiary-default dark:hover:bg-background-primary-hover hover:text-text-primary">
              <Paperclip className="size-3.5" />
            </button>
          </div>
        </form>
      </ComposerLoader>
      {p.tools && <div className="flex flex-wrap items-center gap-1.5 px-1">{p.tools}</div>}
      <Status context={p.context}>{p.status}</Status>
    </div>
  );
}

export const InlineComposer = withAttachments(InlineComposerView);
