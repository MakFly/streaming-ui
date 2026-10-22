import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AtSign, FileCode, Layers, User, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComposerLoader } from '../primitives';
import { AttachmentStrip } from '../attachments';
import { withAttachments, AddButton, SendButton, Status, type VariantProps } from '../composer-kit';

/* Mention composer (Mentions): a Box-like card whose field is a
 * contentEditable with atomic @mention chips. Typing "@" opens a menu at the caret with files, people, sources
 * and tools; picking one drops a tinted chip. The value stays plain text: a chip serializes to "@label", and an
 * external value (the demo typing, the clear after send) is re-parsed into chips wherever a known label appears. */

/* ------------------------------------------------------------------ candidates */

type Kind = 'file' | 'person' | 'source' | 'tool';
interface Candidate {
  label: string;
  kind: Kind;
  hint: string;
}

const GROUPS: { title: string; kind: Kind; items: Candidate[] }[] = [
  {
    title: 'Files',
    kind: 'file',
    items: [
      { label: 'app.tsx', kind: 'file', hint: 'src/app.tsx' },
      { label: 'schema.sql', kind: 'file', hint: 'db/schema.sql' },
      { label: 'README.md', kind: 'file', hint: 'Project root' },
    ],
  },
  {
    title: 'People',
    kind: 'person',
    items: [
      { label: 'Ana', kind: 'person', hint: 'Design lead' },
      { label: 'Léo', kind: 'person', hint: 'Backend' },
    ],
  },
  {
    title: 'Sources',
    kind: 'source',
    items: [
      { label: 'Linear', kind: 'source', hint: 'Issues and cycles' },
      { label: 'Notion', kind: 'source', hint: 'Team wiki' },
      { label: 'Web', kind: 'source', hint: 'Live search' },
    ],
  },
  {
    title: 'Tools',
    kind: 'tool',
    items: [
      { label: 'Terminal', kind: 'tool', hint: 'Run a command' },
      { label: 'Browser', kind: 'tool', hint: 'Open a page' },
    ],
  },
];

const ALL = GROUPS.flatMap((g) => g.items);
/** Longest first, so a label never loses to one of its own prefixes. */
const BY_LENGTH = [...ALL].sort((a, b) => b.label.length - a.label.length);

/** Chip tints, one per kind; literal strings so Tailwind sees them. */
const TINT: Record<Kind, string> = {
  file: 'bg-sky-500/10 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300',
  person: 'bg-violet-500/10 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300',
  source: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300',
  tool: 'bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
};
const CHIP = 'mx-px inline-flex items-center gap-1 rounded-md px-1.5 align-baseline text-body-2-medium leading-5 whitespace-nowrap select-none [&_svg]:size-3.5 [&_svg]:shrink-0';

/** Menu icons (React) and the same marks as static SVG for chips, which live outside React in the editable. */
const KIND_ICON: Record<Kind, ReactNode> = { file: <FileCode />, person: <User />, source: <Layers />, tool: <Wrench /> };
const SVG = (d: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const KIND_SVG: Record<Kind, string> = {
  file: SVG('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/>'),
  person: SVG('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  source: SVG('<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>'),
  tool: SVG('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),
};

/* ------------------------------------------------------------------ thread rendering */

/** The same chip as in the field, for text already sent: user bubbles and answers show mentions in their tint. */
function MentionChip({ c }: { c: Candidate }) {
  return (
    <span data-mention={c.label} className={cn(CHIP, TINT[c.kind])}>
      {KIND_ICON[c.kind]}
      <span>{c.label}</span>
    </span>
  );
}

/** Splits plain text on known "@label" mentions; unknown or half-typed ones stay text. */
export function renderMentions(text: string): ReactNode {
  const out: ReactNode[] = [];
  let run = '';
  let i = 0;
  while (i < text.length) {
    const c = text[i] === '@' && (i === 0 || !/[p{L}p{N}]/u.test(text[i - 1])) ? BY_LENGTH.find((x) => text.startsWith(x.label, i + 1) && !/[p{L}p{N}]/u.test(text[i + 1 + x.label.length] ?? '')) : undefined;
    if (c) {
      if (run) out.push(run);
      run = '';
      out.push(<MentionChip key={i} c={c} />);
      i += c.label.length + 1;
    } else run += text[i++];
  }
  if (run) out.push(run);
  return out;
}

/* ------------------------------------------------------------------ DOM <-> plain text */

const isChip = (n: Node | null | undefined): n is HTMLElement => !!n && n.nodeType === Node.ELEMENT_NODE && (n as HTMLElement).dataset.mention !== undefined;

function makeChip(c: Candidate) {
  const el = document.createElement('span');
  el.contentEditable = 'false';
  el.dataset.mention = c.label;
  el.dataset.kind = c.kind;
  el.className = cn(CHIP, TINT[c.kind]);
  el.innerHTML = KIND_SVG[c.kind];
  const label = document.createElement('span');
  label.textContent = c.label;
  el.appendChild(label);
  return el;
}

/** Text with newlines as <br>s. */
function textNodes(s: string): Node[] {
  const out: Node[] = [];
  s.split('\n').forEach((line, i) => {
    if (i) out.push(document.createElement('br'));
    if (line) out.push(document.createTextNode(line));
  });
  return out;
}

/** "@label" for a known candidate, followed by the end or a non-word character. */
function chipAt(value: string, i: number) {
  if (value[i] !== '@' || (i > 0 && !/\s/.test(value[i - 1]))) return null;
  return BY_LENGTH.find((c) => value.startsWith(c.label, i + 1) && !/[\p{L}\p{N}_-]/u.test(value[i + 1 + c.label.length] ?? '')) ?? null;
}

/** Rebuilds the editable from a plain value. A trailing newline needs a sentinel <br> to show its empty line. */
function paint(ed: HTMLElement, value: string) {
  const nodes: Node[] = [];
  let text = '';
  for (let i = 0; i < value.length; i++) {
    const c = chipAt(value, i);
    if (c) {
      nodes.push(...textNodes(text), makeChip(c));
      text = '';
      i += c.label.length;
    } else text += value[i];
  }
  nodes.push(...textNodes(text));
  if (value.endsWith('\n')) nodes.push(document.createElement('br'));
  ed.replaceChildren(...nodes);
}

function serialize(ed: HTMLElement) {
  let out = '';
  const walk = (n: Node) => {
    n.childNodes.forEach((c) => {
      if (c.nodeType === Node.TEXT_NODE) out += (c as Text).data;
      else if (isChip(c)) out += `@${c.dataset.mention}`;
      else if (c.nodeName === 'BR') out += '\n';
      else {
        if (/^(DIV|P)$/.test(c.nodeName) && out && !out.endsWith('\n')) out += '\n';
        walk(c);
      }
    });
  };
  walk(ed);
  if (ed.lastChild?.nodeName === 'BR') out = out.slice(0, -1);
  return out.replace(/ /g, ' ').replace(/​/g, '');
}

function caretAt(node: Node, offset: number) {
  const sel = window.getSelection();
  if (!sel) return;
  const r = document.createRange();
  r.setStart(node, offset);
  r.collapse(true);
  sel.removeAllRanges();
  sel.addRange(r);
}

function caretAfter(node: Node) {
  const sel = window.getSelection();
  if (!sel) return;
  const r = document.createRange();
  r.setStartAfter(node);
  r.collapse(true);
  sel.removeAllRanges();
  sel.addRange(r);
}

/* ------------------------------------------------------------------ composer */

interface Menu {
  query: string;
  index: number;
  left: number;
  bottom: number;
}

export function MentionComposerView(p: VariantProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const ed = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  /** The value this field last emitted (or painted): anything else in `p.value` came from outside. */
  const last = useRef<string | null>(null);
  /** Where the "@query" being completed sits. */
  const anchor = useRef<{ node: Text; start: number; end: number } | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const listId = useId();

  const q = menu?.query.toLowerCase() ?? '';
  const groups = menu ? GROUPS.map((g) => ({ ...g, items: g.items.filter((c) => c.label.toLowerCase().includes(q)) })).filter((g) => g.items.length) : [];
  const flat = groups.flatMap((g) => g.items);
  const open = !!menu && flat.length > 0;
  const active = open ? Math.min(menu.index, flat.length - 1) : -1;

  // External value (demo typing, clear after send): repaint, chips included. Our own edits never come back here.
  useEffect(() => {
    const el = ed.current;
    if (!el || p.value === last.current) return;
    last.current = p.value;
    paint(el, p.value);
    if (document.activeElement === el) caretAt(el, el.childNodes.length);
    anchor.current = null;
    setMenu(null);
  }, [p.value]);

  useEffect(() => {
    if (active < 0) return;
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const emit = () => {
    const el = ed.current;
    if (!el) return;
    const v = serialize(el);
    // Leave a truly empty node behind so the :empty placeholder shows.
    if (!v && el.childNodes.length) el.replaceChildren();
    last.current = v;
    p.onChange(v);
  };

  const close = () => {
    anchor.current = null;
    setMenu(null);
  };

  /** Opens, updates or closes the menu from the text just before the caret. */
  const detect = () => {
    const el = ed.current;
    const box = wrap.current;
    const sel = window.getSelection();
    if (!el || !box || !sel?.rangeCount || !sel.isCollapsed) return close();
    const r = sel.getRangeAt(0);
    const node = r.startContainer;
    if (node.nodeType !== Node.TEXT_NODE || !el.contains(node)) return close();
    const m = /(^|\s)@([^\s@]{0,24})$/.exec((node as Text).data.slice(0, r.startOffset));
    if (!m) return close();
    const start = r.startOffset - m[2].length - 1;
    anchor.current = { node: node as Text, start, end: r.startOffset };
    // Measure the "@" itself: a non-collapsed range always has a box.
    const at = document.createRange();
    at.setStart(node, start);
    at.setEnd(node, start + 1);
    const rect = at.getBoundingClientRect();
    const outer = box.getBoundingClientRect();
    const left = Math.max(0, Math.min(rect.left - outer.left - 10, outer.width - 264));
    const bottom = outer.bottom - rect.top + 6;
    setMenu((prev) => ({ query: m[2], index: prev && prev.query === m[2] ? prev.index : 0, left, bottom }));
  };

  const pick = (c: Candidate) => {
    const a = anchor.current;
    const el = ed.current;
    if (!a || !el || !el.contains(a.node)) return close();
    const rest = a.node.splitText(Math.min(a.start, a.node.length));
    rest.deleteData(0, Math.min(a.end - a.start, rest.length));
    const space = document.createTextNode(' ');
    rest.before(makeChip(c), space);
    if (!rest.length) rest.remove();
    if (!a.node.length) a.node.remove();
    el.focus();
    caretAt(space, 1);
    close();
    emit();
  };

  /** Replaces the selection with `nodes` and puts the caret after them. */
  const insertNodes = (nodes: Node[]) => {
    const el = ed.current;
    const sel = window.getSelection();
    if (!el || !sel?.rangeCount || !el.contains(sel.getRangeAt(0).startContainer) || !nodes.length) return;
    const r = sel.getRangeAt(0);
    r.deleteContents();
    const frag = document.createDocumentFragment();
    nodes.forEach((n) => frag.appendChild(n));
    const lastNode = nodes[nodes.length - 1];
    r.insertNode(frag);
    if (lastNode.nodeName === 'BR' && el.lastChild === lastNode) el.appendChild(document.createElement('br'));
    caretAfter(lastNode);
    emit();
  };

  const submit = () => {
    if (!p.busy && p.value.trim()) p.onSend(p.value);
  };

  /** The toolbar's @: types an "@" at the caret (or the end) and opens the menu. */
  const mentionButton = () => {
    const el = ed.current;
    const sel = window.getSelection();
    if (!el || !sel) return;
    el.focus();
    if (!sel.rangeCount || !el.contains(sel.getRangeAt(0).startContainer)) caretAt(el, el.childNodes.length);
    const r = sel.getRangeAt(0);
    r.deleteContents();
    const node = r.startContainer;
    const off = r.startOffset;
    const before = node.nodeType === Node.TEXT_NODE ? (node as Text).data[off - 1] : off > 0 ? node.childNodes[off - 1]?.nodeName : undefined;
    const str = before && before !== 'BR' && !/\s/.test(before) ? ' @' : '@';
    if (node.nodeType === Node.TEXT_NODE) {
      (node as Text).insertData(off, str);
      caretAt(node, off + str.length);
    } else {
      const t = document.createTextNode(str);
      r.insertNode(t);
      caretAt(t, str.length);
    }
    emit();
    detect();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const d = e.key === 'ArrowDown' ? 1 : -1;
        setMenu({ ...menu, index: (active + d + flat.length) % flat.length });
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        pick(flat[active]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) insertNodes([document.createElement('br')]);
      else submit();
      return;
    }
    if (e.key === 'Escape' && p.busy) {
      p.onStop?.();
      return;
    }
    if (e.key === 'Backspace') {
      // A chip right before the caret goes as one unit.
      const sel = window.getSelection();
      if (!sel?.rangeCount || !sel.isCollapsed) return;
      const r = sel.getRangeAt(0);
      const c = r.startContainer;
      const prev = c.nodeType === Node.TEXT_NODE ? (r.startOffset === 0 ? c.previousSibling : null) : r.startOffset > 0 ? c.childNodes[r.startOffset - 1] : null;
      if (isChip(prev)) {
        e.preventDefault();
        prev.remove();
        emit();
        detect();
      }
    }
  };

  return (
    <div ref={wrap} className={cn('relative flex w-full flex-col gap-1.5', p.className)}>
      {open && (
        <div
          ref={list}
          id={listId}
          role="listbox"
          aria-label="Mention"
          style={{ left: menu.left, bottom: menu.bottom }}
          className="animate-in fade-in-0 slide-in-from-bottom-1 scrollbar-thin absolute z-30 max-h-64 w-64 overflow-y-auto rounded-xl border border-border-button-default bg-background-primary-default p-1 shadow-dropdown duration-150"
        >
          {groups.map((g) => (
            <div key={g.title} role="group" aria-label={g.title}>
              <div className="px-2 pt-1.5 pb-1 text-caption-1-medium text-text-tertiary">{g.title}</div>
              {g.items.map((c) => {
                const i = flat.indexOf(c);
                return (
                  <div
                    key={c.label}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setMenu({ ...menu, index: i })}
                    onClick={() => pick(c)}
                    className={cn('flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5', i === active && 'bg-background-tertiary-default')}
                  >
                    <span className={cn('grid size-6 shrink-0 place-items-center rounded-md [&_svg]:size-3.5', TINT[c.kind])}>{KIND_ICON[c.kind]}</span>
                    <span className="min-w-0 flex-1 truncate text-body-2-medium text-text-primary">{c.label}</span>
                    <span className="shrink-0 truncate text-caption-1-regular text-text-tertiary">{c.hint}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
      <ComposerLoader active={!!p.busy} radius={22}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          onClick={(e) => e.target === e.currentTarget && ed.current?.focus()}
          className="flex w-full cursor-text flex-col gap-1 p-2"
        >
          <AttachmentStrip attachments={p.att.files} onRemove={p.att.remove} className="px-1 pt-1" />
          <div
            ref={ed}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label="Message"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-activedescendant={open ? `${listId}-${active}` : undefined}
            data-placeholder={p.placeholder}
            onInput={() => {
              emit();
              detect();
            }}
            onKeyDown={onKeyDown}
            onKeyUp={(e) => {
              if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) detect();
            }}
            onMouseUp={detect}
            onBlur={close}
            onPaste={(e) => {
              e.preventDefault();
              insertNodes(textNodes(e.clipboardData.getData('text/plain').replace(/\r\n?/g, '\n')));
            }}
            onDrop={(e) => e.preventDefault()}
            className="scrollbar-thin max-h-48 min-h-10 w-full overflow-y-auto px-2.5 pt-2 pb-1 text-body-regular leading-6 break-words whitespace-pre-wrap text-text-primary caret-text-primary outline-none empty:before:pointer-events-none empty:before:text-text-tertiary empty:before:content-[attr(data-placeholder)]"
          />
          <div className="flex items-center gap-1.5">
            <AddButton onClick={p.att.add} />
            <button
              type="button"
              aria-label="Mention a file, person or source"
              onMouseDown={(e) => e.preventDefault()}
              onClick={mentionButton}
              className="grid size-9 shrink-0 place-items-center rounded-full text-foreground-icon-secondary transition-colors hover:bg-background-tertiary-default hover:text-foreground-icon-primary"
            >
              <AtSign className="size-[18px]" />
            </button>
            {p.tools}
            <span className="ms-auto flex items-center gap-1">
              {p.model}
              <SendButton busy={p.busy} onStop={p.onStop} disabled={!p.value.trim()} />
            </span>
          </div>
        </form>
      </ComposerLoader>
      <Status context={p.context}>{p.status}</Status>
    </div>
  );
}

export const MentionComposer = withAttachments(MentionComposerView);
