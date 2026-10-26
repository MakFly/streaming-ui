import { useEffect, useId, useRef, useState } from 'react';
import { MENTION_QUERY, MentionMenu, findMentions, mentionMatches, type MentionCandidate } from './mention-menu';

/* The @mention field shared by Mention and Box (with `mentions`): a contentEditable whose mentions are atomic
 * chips, so they can have real padding and margins, which a textarea cannot (react-mentions' overlay only tints
 * the text under it). Typing "@" opens the menu at the caret; picking one drops a chip, drawn by the composer.
 * The value stays plain text: a chip serializes to "@label", and an external value (the demo typing, the clear
 * after send) is re-parsed into chips wherever a known label appears. */

/* ------------------------------------------------------------------ DOM <-> plain text */

const isChip = (n: Node | null | undefined): n is HTMLElement => !!n && n.nodeType === Node.ELEMENT_NODE && (n as HTMLElement).dataset.mention !== undefined;

/** Text with newlines as <br>s. */
function textNodes(s: string): Node[] {
  const out: Node[] = [];
  s.split('\n').forEach((line, i) => {
    if (i) out.push(document.createElement('br'));
    if (line) out.push(document.createTextNode(line));
  });
  return out;
}

/** Rebuilds the editable from a plain value. A trailing newline needs a sentinel <br> to show its empty line. */
function paint(ed: HTMLElement, value: string, chip: (c: MentionCandidate) => HTMLElement) {
  const nodes: Node[] = [];
  let at = 0;
  for (const m of findMentions(value)) {
    nodes.push(...textNodes(value.slice(at, m.start)), chip(m.c));
    at = m.end;
  }
  nodes.push(...textNodes(value.slice(at)));
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

/* ------------------------------------------------------------------ field */

interface Menu {
  query: string;
  index: number;
  left: number;
  bottom: number;
}

/**
 * The field, its menu and the toolbar's @ action. Put `wrap` on the composer's positioned outer box (the menu
 * opens above the caret, inside it), `menu` anywhere in that box and `field` where the text goes.
 */
export function useMentionField(p: { value: string; onChange: (v: string) => void; onSend: (v: string) => void; onStop?: () => void; busy?: boolean; placeholder: string; chip: (c: MentionCandidate) => HTMLElement }) {
  const wrap = useRef<HTMLDivElement>(null);
  const ed = useRef<HTMLDivElement>(null);
  /** The value this field last emitted (or painted): anything else in `p.value` came from outside. */
  const last = useRef<string | null>(null);
  /** Where the "@query" being completed sits. */
  const anchor = useRef<{ node: Text; start: number; end: number } | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const listId = useId();

  const matches = mentionMatches(menu?.query ?? '');
  const flat = matches.flat;
  const open = !!menu && flat.length > 0;
  const active = open ? Math.min(menu.index, flat.length - 1) : -1;

  // External value (demo typing, clear after send): repaint, chips included. Our own edits never come back here.
  useEffect(() => {
    const el = ed.current;
    if (!el || p.value === last.current) return;
    last.current = p.value;
    paint(el, p.value, p.chip);
    if (document.activeElement === el) caretAt(el, el.childNodes.length);
    anchor.current = null;
    setMenu(null);
  }, [p.value, p.chip]);

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
    const m = MENTION_QUERY.exec((node as Text).data.slice(0, r.startOffset));
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

  const pick = (c: MentionCandidate) => {
    const a = anchor.current;
    const el = ed.current;
    if (!a || !el || !el.contains(a.node)) return close();
    const rest = a.node.splitText(Math.min(a.start, a.node.length));
    rest.deleteData(0, Math.min(a.end - a.start, rest.length));
    const space = document.createTextNode(' ');
    rest.before(p.chip(c), space);
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
  const mention = () => {
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

  const field = (
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
  );
  const menuEl = open ? <MentionMenu id={listId} matches={matches} active={active} onPick={pick} onActive={(index) => setMenu({ ...menu, index })} style={{ left: menu.left, bottom: menu.bottom }} /> : null;

  return { wrap, field, menu: menuEl, mention, submit, focus: () => ed.current?.focus() };
}
