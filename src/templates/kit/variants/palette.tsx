import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Code, Command, CornerDownLeft, Eraser, FileText, History, Languages, Paperclip, Reply, Search, Sparkles, SpellCheck, TextCursorInput } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComposerLoader } from '../primitives';
import { AttachmentStrip } from '../attachments';
import { withAttachments, SendButton, Status, type VariantProps } from '../composer-kit';

/* Palette composer (Command palette): a command palette whose query is also the prompt. One large search row with
 * the model on the right; under it a list that opens on focus: "Ask AI" first, then the commands the query filters
 * and the last prompts. Arrows move the active row, Enter runs it, Tab always hands the raw query to AI, ⌘K turns
 * the list into the actions for the active row. A launcher-style action bar closes the palette. */

const COMMANDS = [
  { id: 'summarize', label: 'Summarize thread', prompt: 'Summarize this thread in three bullet points', icon: <FileText /> },
  { id: 'translate', label: 'Translate to French', prompt: 'Translate the last message to French', icon: <Languages /> },
  { id: 'grammar', label: 'Fix grammar', prompt: 'Fix the grammar of my last message', icon: <SpellCheck /> },
  { id: 'explain', label: 'Explain code', prompt: 'Explain the code in the last message step by step', icon: <Code /> },
  { id: 'reply', label: 'Draft reply', prompt: 'Draft a short, friendly reply to the last message', icon: <Reply /> },
] as const;

const FIRST_RECENTS = ['Rewrite this paragraph to be shorter', 'What changed in the last release?'];

type Row =
  | { kind: 'ai'; key: string; group: null }
  | { kind: 'cmd'; key: string; group: string; cmd: (typeof COMMANDS)[number] }
  | { kind: 'recent'; key: string; group: string; text: string }
  | { kind: 'action'; key: string; group: string; label: string; icon: ReactNode; hint?: string; run: () => void };

/** Every token of the query starts a word of the label ("tr fr" → Translate to French). */
const matches = (label: string, q: string) => {
  const words = label.toLowerCase().split(/\s+/);
  return q.split(/\s+/).every((t) => words.some((w) => w.startsWith(t)));
};

const kbd = 'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-border-button-default bg-background-tertiary-default px-1 font-mono text-[10.5px] leading-none text-text-secondary';
const Kbd = ({ children, className }: { children: ReactNode; className?: string }) => <kbd className={cn(kbd, className)}>{children}</kbd>;

export function PaletteComposerView(p: VariantProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const [actions, setActions] = useState(false);
  const [recents, setRecents] = useState(FIRST_RECENTS);

  const query = p.value.trim();
  const q = query.toLowerCase();
  const hits = q ? COMMANDS.filter((c) => matches(c.label, q)) : [];
  // A query that names a command filters the list; any other query is the argument the commands apply to.
  const filtering = hits.length > 0;

  const send = (text: string) => {
    if (p.busy || !text.trim()) return;
    p.onSend(text);
    setRecents((r) => [text, ...r.filter((x) => x !== text)].slice(0, 2));
    setActions(false);
    setActive(0);
  };
  const runCommand = (c: (typeof COMMANDS)[number]) => send(!query || filtering ? c.prompt : `${c.label}: ${query}`);

  const base: Row[] = [
    { kind: 'ai', key: 'ai', group: null },
    ...(filtering ? hits : COMMANDS).map((cmd): Row => ({ kind: 'cmd', key: cmd.id, group: query && !filtering ? `Use “${query}” with` : 'Commands', cmd })),
    ...recents.filter((t) => !q || t.toLowerCase().includes(q)).map((text, i): Row => ({ kind: 'recent', key: `recent-${i}`, group: 'Recent', text })),
  ];
  const at = Math.min(active, base.length - 1);
  const target = base[at];
  const targetLabel = target.kind === 'ai' ? 'Ask AI' : target.kind === 'cmd' ? target.cmd.label : target.kind === 'recent' ? target.text : '';

  const actionRows: Row[] = [
    { kind: 'action', key: 'run', group: `Actions · ${targetLabel}`, label: target.kind === 'ai' ? 'Ask AI' : 'Run', icon: <CornerDownLeft />, hint: '↵', run: () => runRow(target) },
    { kind: 'action', key: 'ask', group: `Actions · ${targetLabel}`, label: 'Ask AI with the query', icon: <Sparkles />, hint: 'Tab', run: () => send(query) },
    ...(target.kind === 'cmd' || target.kind === 'recent'
      ? [{ kind: 'action', key: 'insert', group: `Actions · ${targetLabel}`, label: 'Edit in the field', icon: <TextCursorInput />, run: () => fill(target.kind === 'cmd' ? `${target.cmd.label}: ` : target.text) } satisfies Row]
      : []),
    {
      kind: 'action',
      key: 'attach',
      group: `Actions · ${targetLabel}`,
      label: 'Attach file',
      icon: <Paperclip />,
      run: () => {
        p.att.add();
        setActions(false);
      },
    },
    { kind: 'action', key: 'clear', group: `Actions · ${targetLabel}`, label: 'Clear query', icon: <Eraser />, hint: 'esc', run: () => fill('') },
  ];

  const rows = actions ? actionRows : base;
  const current = actions ? Math.min(active, rows.length - 1) : at;
  const open = !p.busy && (focused || !!p.value || actions);

  function fill(text: string) {
    p.onChange(text);
    setActions(false);
    setActive(0);
    input.current?.focus();
  }

  function runRow(r: Row) {
    if (r.kind === 'ai') send(query);
    else if (r.kind === 'cmd') runCommand(r.cmd);
    else if (r.kind === 'recent') send(r.text);
    else r.run();
  }

  const toggleActions = () => {
    // The actions panel opens on the row that was active, and starts on its first action.
    if (actions) {
      setActions(false);
      setActive(0);
    } else {
      setActive(0);
      setActions(true);
    }
    input.current?.focus();
  };

  // Keep the active row in view as the arrows walk the scrolling list.
  const activeId = open && rows.length ? `${uid}-opt-${rows[current].key}` : undefined;
  useEffect(() => {
    if (!activeId) return;
    list.current?.querySelector(`#${activeId}`)?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (!p.busy) toggleActions();
      return;
    }
    if (e.key === 'Escape') {
      if (p.busy) {
        e.preventDefault();
        p.onStop?.();
      } else if (actions) {
        e.preventDefault();
        setActions(false);
        setActive(0);
      } else if (p.value) {
        e.preventDefault();
        fill('');
      } else {
        e.preventDefault();
        input.current?.blur();
      }
      return;
    }
    if (p.busy) {
      if (e.key === 'Enter') e.preventDefault();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!rows.length) return;
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive((current + step + rows.length) % rows.length);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (rows.length) runRow(rows[current]);
      return;
    }
    // Tab hands the query to AI; on an empty field it keeps moving focus.
    if (e.key === 'Tab' && !e.shiftKey && query) {
      e.preventDefault();
      send(query);
    }
  };

  const chip = 'flex h-6 items-center gap-1.5 rounded-md px-1.5 text-caption-1-medium text-text-secondary transition-colors hover:bg-background-tertiary-default hover:text-text-primary disabled:pointer-events-none disabled:opacity-40';
  let lastGroup: string | null = null;

  return (
    <div className={cn('flex w-full flex-col gap-1.5', p.className)}>
      <ComposerLoader active={!!p.busy} radius={16} surfaceClassName="shadow-dropdown">
        <div className="flex w-full flex-col">
          <div className="flex h-[52px] items-center gap-2.5 ps-4 pe-2">
            <Search className={cn('size-5 shrink-0 transition-colors', focused ? 'text-foreground-icon-primary' : 'text-foreground-icon-tertiary')} />
            <input
              ref={input}
              value={p.value}
              onChange={(e) => {
                p.onChange(e.target.value);
                setActive(0);
                setActions(false);
              }}
              onKeyDown={onKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={p.placeholder}
              role="combobox"
              aria-label="Ask AI or search commands"
              aria-expanded={open}
              aria-controls={`${uid}-list`}
              aria-activedescendant={activeId}
              aria-autocomplete="list"
              className="h-7 min-w-0 flex-1 bg-transparent text-[16.5px] leading-7 text-text-primary caret-accent-500 outline-none placeholder:text-text-tertiary"
            />
            {p.busy ? (
              <SendButton busy onStop={p.onStop} disabled={false} className="size-8" stopClassName="size-8 rounded-lg" />
            ) : (
              <span className="flex shrink-0 items-center [&_button]:h-7 [&_button]:rounded-lg">{p.model}</span>
            )}
          </div>

          <AttachmentStrip attachments={p.att.files} onRemove={p.att.remove} className="px-3 pb-2" />

          {open && (
            <ul
              ref={list}
              id={`${uid}-list`}
              role="listbox"
              aria-label={actions ? 'Actions' : 'Ask AI and commands'}
              className="animate-in fade-in-0 scrollbar-thin max-h-[212px] overflow-y-auto border-t border-separator-border p-1.5 duration-150"
            >
              {rows.map((r, i) => {
                const heading = r.group !== lastGroup && r.group ? r.group : null;
                lastGroup = r.group;
                const on = i === current;
                return (
                  <li key={r.key} role="presentation">
                    {heading && (
                      <div role="presentation" className="truncate px-2.5 pt-2 pb-1 text-caption-1-medium text-text-tertiary">
                        {heading}
                      </div>
                    )}
                    <div
                      id={`${uid}-opt-${r.key}`}
                      role="option"
                      aria-selected={on}
                      onMouseMove={() => i !== current && setActive(i)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => runRow(r)}
                      className={cn(
                        'flex h-9 cursor-default items-center gap-2.5 rounded-lg px-2.5 text-body-2-medium text-text-primary select-none [&_svg]:size-4 [&_svg]:shrink-0',
                        on ? 'bg-background-tertiary-default' : 'bg-transparent',
                      )}
                    >
                      {r.kind === 'ai' && (
                        <>
                          <span className="grid size-5 shrink-0 place-items-center rounded-md bg-accent-500 text-white [&_svg]:size-3!">
                            <Sparkles />
                          </span>
                          <span className="shrink-0">Ask AI</span>
                          <span className={cn('min-w-0 flex-1 truncate', query ? 'text-text-secondary' : 'text-text-tertiary')}>{query ? `· ${query}` : 'Type a question'}</span>
                          <Kbd>Tab</Kbd>
                        </>
                      )}
                      {r.kind === 'cmd' && (
                        <>
                          <span className="grid size-5 shrink-0 place-items-center rounded-md bg-background-tertiary-default text-foreground-icon-secondary [&_svg]:size-3.5!">{r.cmd.icon}</span>
                          <span className="min-w-0 flex-1 truncate">{r.cmd.label}</span>
                          <span className="shrink-0 text-caption-1-regular text-text-tertiary">Command</span>
                        </>
                      )}
                      {r.kind === 'recent' && (
                        <>
                          <History className="ms-0.5 me-0.5 text-foreground-icon-tertiary" />
                          <span className="min-w-0 flex-1 truncate text-text-secondary">{r.text}</span>
                          <span className="shrink-0 text-caption-1-regular text-text-tertiary">Recent</span>
                        </>
                      )}
                      {r.kind === 'action' && (
                        <>
                          <span className="ms-0.5 me-0.5 text-foreground-icon-secondary">{r.icon}</span>
                          <span className="min-w-0 flex-1 truncate">{r.label}</span>
                          {r.hint && <Kbd>{r.hint}</Kbd>}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex h-10 items-center gap-2 rounded-b-2xl border-t border-separator-border bg-background-tertiary-default/40 ps-3 pe-1.5">
            <span className="flex min-w-0 items-center gap-1.5 text-caption-1-medium text-text-tertiary">
              <span className="grid size-4 shrink-0 place-items-center rounded-[5px] bg-accent-500 text-white">
                <Sparkles className="size-2.5" />
              </span>
              <span className="truncate">Quick AI</span>
            </span>
            {p.busy ? (
              <button type="button" onClick={p.onStop} className={cn(chip, 'ms-auto')}>
                Stop <Kbd>esc</Kbd>
              </button>
            ) : (
              <span className="ms-auto flex shrink-0 items-center">
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => send(query)} disabled={!query} className={cn(chip, 'hidden sm:flex')}>
                  Ask AI <Kbd>Tab</Kbd>
                </button>
                <span className="mx-1 hidden h-3.5 w-px bg-separator-border sm:block" />
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runRow(rows[current])} disabled={!query && current === 0 && !actions} className={chip}>
                  Run <Kbd>↵</Kbd>
                </button>
                <span className="mx-1 h-3.5 w-px bg-separator-border" />
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={toggleActions} aria-pressed={actions} className={cn(chip, actions && 'bg-background-tertiary-default text-text-primary')}>
                  Actions
                  <span className="flex items-center gap-0.5">
                    <Kbd>
                      <Command className="size-2.5" />
                    </Kbd>
                    <Kbd>K</Kbd>
                  </span>
                </button>
              </span>
            )}
          </div>
        </div>
      </ComposerLoader>
      {p.tools && <div className="flex flex-wrap items-center gap-1.5 px-1">{p.tools}</div>}
      <Status context={p.context}>{p.status}</Status>
    </div>
  );
}

export const PaletteComposer = withAttachments(PaletteComposerView);
