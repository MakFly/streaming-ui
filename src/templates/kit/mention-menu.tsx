import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { AtSign, FileCode, FileImage, FileSpreadsheet, Layers, User, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

/* @mentions, shared by the composers that offer them: the candidates (files, people, sources, tools), their tints,
 * the menu listing what matches the "@query", and the toolbar's @ button. Mention draws a pick as a chip in its
 * editable; Box (with `mentions`) writes it into its textarea as plain "@label". */

export type MentionKind = 'file' | 'person' | 'source' | 'tool';
export interface MentionCandidate {
  label: string;
  kind: MentionKind;
  hint: string;
}

export const MENTION_GROUPS: { title: string; kind: MentionKind; items: MentionCandidate[] }[] = [
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

/** Chip tints, one per kind; literal strings so Tailwind sees them. */
export const MENTION_TINT: Record<MentionKind, string> = {
  file: 'bg-sky-500/10 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300',
  person: 'bg-violet-500/10 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300',
  source: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300',
  tool: 'bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
};
export const MENTION_ICON: Record<MentionKind, ReactNode> = { file: <FileCode />, person: <User />, source: <Layers />, tool: <Wrench /> };

/* A file's look, from escape's FileGlyph (MakFly/escape): a mono mark per language, an icon for tables and
 * images, the plain file icon otherwise, each in its type's colour. People, sources and tools keep their kind's. */
const TONE = {
  sky: { text: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-500/10 dark:bg-sky-400/15' },
  emerald: { text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-500/10 dark:bg-emerald-400/15' },
  amber: { text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-500/10 dark:bg-amber-400/15' },
  violet: { text: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-500/10 dark:bg-violet-400/15' },
  neutral: { text: 'text-text-secondary', bg: 'bg-neutral-500/10 dark:bg-neutral-400/15' },
};
const KIND_TONE: Record<MentionKind, keyof typeof TONE> = { file: 'neutral', person: 'violet', source: 'emerald', tool: 'amber' };

/** Glyph icons: the kinds', plus tables and images. React for the menu and the thread, SVG markup for chips built
 *  in an editable, which live outside React. */
type IconName = MentionKind | 'table' | 'image';
const ICON: Record<IconName, ReactNode> = { ...MENTION_ICON, table: <FileSpreadsheet />, image: <FileImage /> };
const SVG = (d: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const SHEET = '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>';
export const MENTION_SVG: Record<IconName, string> = {
  file: SVG('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/>'),
  person: SVG('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  source: SVG('<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>'),
  tool: SVG('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),
  table: SVG(`${SHEET}<path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>`),
  image: SVG(`${SHEET}<circle cx="10" cy="12" r="2"/><path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22"/>`),
};

/** Per extension: a mono mark (or an icon) and its colour. */
const FILE_MARK: Record<string, [mark: string | { icon: IconName }, tone: keyof typeof TONE]> = {
  ts: ['TS', 'sky'],
  tsx: ['TS', 'sky'],
  js: ['JS', 'amber'],
  jsx: ['JS', 'amber'],
  json: ['{}', 'amber'],
  md: ['M↓', 'emerald'],
  html: ['<>', 'violet'],
  css: ['<>', 'violet'],
  csv: [{ icon: 'table' }, 'sky'],
  tsv: [{ icon: 'table' }, 'sky'],
  png: [{ icon: 'image' }, 'violet'],
  jpg: [{ icon: 'image' }, 'violet'],
  svg: [{ icon: 'image' }, 'violet'],
};
const fileMark = (c: MentionCandidate) => (c.kind === 'file' ? FILE_MARK[c.label.split('.').at(-1)?.toLowerCase() ?? ''] : undefined);
/** The candidate's mark: a file type's mono text, or an icon (its type's, else its kind's). */
const markOf = (c: MentionCandidate): string | { icon: IconName } => fileMark(c)?.[0] ?? { icon: c.kind };

/** The text and tint classes of a candidate: its file type's, or its kind's. */
export function mentionTone(c: MentionCandidate) {
  return TONE[fileMark(c)?.[1] ?? KIND_TONE[c.kind]];
}

const GLYPH = 'inline-flex shrink-0 items-center justify-center font-mono text-[10px] leading-none font-semibold [&_svg]:size-full';

/** The candidate's glyph, sized by the caller (`size-3.5`…). */
export function MentionGlyph({ c, className }: { c: MentionCandidate; className?: string }) {
  const mark = markOf(c);
  return (
    <span aria-hidden="true" className={cn(GLYPH, mentionTone(c).text, className)}>
      {typeof mark === 'string' ? mark : ICON[mark.icon]}
    </span>
  );
}

/** A mention as escape's file link (MakFly/escape thread-file-link): a hairline accent box, the glyph, the name. */
const LINK = 'inline-flex h-5 max-w-full items-center gap-1 rounded-[5px] border border-accent-500/30 bg-accent-500/[0.07] px-[5px] align-baseline text-[12px] leading-none whitespace-nowrap text-text-primary';
const LINK_GLYPH = 'size-3 text-[9px]';

/** The same link as DOM, for an editable field: atomic (contentEditable false), read back by `data-mention`. */
export function mentionLinkElement(c: MentionCandidate) {
  const el = document.createElement('span');
  el.contentEditable = 'false';
  el.dataset.mention = c.label;
  el.title = c.hint;
  // A hair of margin, so the box never touches the words around it.
  el.className = cn(LINK, 'mx-0.5 select-none');
  const glyph = document.createElement('span');
  glyph.setAttribute('aria-hidden', 'true');
  glyph.className = cn(GLYPH, mentionTone(c).text, LINK_GLYPH);
  const mark = markOf(c);
  if (typeof mark === 'string') glyph.textContent = mark;
  else glyph.innerHTML = MENTION_SVG[mark.icon];
  const label = document.createElement('span');
  label.textContent = c.label;
  el.append(glyph, label);
  return el;
}

const BY_LENGTH = MENTION_GROUPS.flatMap((g) => g.items).sort((a, b) => b.label.length - a.label.length);

/** Known "@label" mentions in plain text (after a start or a space, not running into a word), in order. */
export function findMentions(text: string) {
  const found: { start: number; end: number; c: MentionCandidate }[] = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '@' || (i > 0 && !/\s/.test(text[i - 1]))) continue;
    const c = BY_LENGTH.find((x) => text.startsWith(x.label, i + 1) && !/[\p{L}\p{N}_-]/u.test(text[i + 1 + x.label.length] ?? ''));
    if (!c) continue;
    found.push({ start: i, end: i + 1 + c.label.length, c });
    i += c.label.length;
  }
  return found;
}

/** Plain text with each known mention swapped for `render(candidate)`. */
export function splitMentions(text: string, render: (c: MentionCandidate, key: number) => ReactNode): ReactNode[] {
  const out: ReactNode[] = [];
  let at = 0;
  for (const m of findMentions(text)) {
    out.push(text.slice(at, m.start), render(m.c, m.start));
    at = m.end;
  }
  out.push(text.slice(at));
  return out;
}

/** A mention in a sent message, like escape's thread file link: a hairline box with the glyph and the name. */
export const MentionLink = ({ c }: { c: MentionCandidate }) => (
  <span title={c.hint} className={LINK}>
    <MentionGlyph c={c} className={LINK_GLYPH} />
    <span className="min-w-0 truncate">{c.label}</span>
  </span>
);

/** Sent text with its mentions as links (a thread's `decorate`). */
export const renderMentionLinks = (text: string) => splitMentions(text, (c, key) => <MentionLink key={key} c={c} />);

/** The "@query" being typed right before the caret, if any. */
export const MENTION_QUERY = /(^|\s)@([^\s@]{0,24})$/;

export type MentionMatches = ReturnType<typeof mentionMatches>;
/** The groups (and the flat list, for the keyboard) whose labels contain the query. */
export function mentionMatches(query: string) {
  const q = query.toLowerCase();
  const groups = MENTION_GROUPS.map((g) => ({ ...g, items: g.items.filter((c) => c.label.toLowerCase().includes(q)) })).filter((g) => g.items.length);
  return { groups, flat: groups.flatMap((g) => g.items) };
}

/** The listbox of matches. The field keeps focus (and aria-activedescendant points at `${id}-${active}`). */
export function MentionMenu({ id, matches, active, onPick, onActive, style }: { id: string; matches: MentionMatches; active: number; onPick: (c: MentionCandidate) => void; onActive: (index: number) => void; style?: CSSProperties }) {
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);
  return (
    <div
      ref={list}
      id={id}
      role="listbox"
      aria-label="Mention"
      style={style}
      className="animate-in fade-in-0 slide-in-from-bottom-1 scrollbar-thin absolute z-30 max-h-64 w-64 overflow-y-auto rounded-xl border border-border-button-default bg-background-primary-default p-1 shadow-dropdown duration-150"
    >
      {matches.groups.map((g) => (
        <div key={g.title} role="group" aria-label={g.title}>
          <div className="px-2 pt-1.5 pb-1 text-caption-1-medium text-text-tertiary">{g.title}</div>
          {g.items.map((c) => {
            const i = matches.flat.indexOf(c);
            return (
              <div
                key={c.label}
                id={`${id}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => onActive(i)}
                onClick={() => onPick(c)}
                // The kit's row highlight on a primary surface (as in the model picker): in dark, tertiary is the
                // surface's own colour, so it would not show.
                className={cn('flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5', i === active && 'bg-background-tertiary-default dark:bg-background-primary-hover')}
              >
                <span className={cn('grid size-6 shrink-0 place-items-center rounded-md', mentionTone(c).bg)}>
                  <MentionGlyph c={c} className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1 truncate text-body-2-medium text-text-primary">{c.label}</span>
                <span className="shrink-0 truncate text-caption-1-regular text-text-tertiary">{c.hint}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** The toolbar's @: keeps the field's focus and selection, and lets the composer type the "@". */
export const MentionButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    aria-label="Mention a file, person or source"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className="grid size-9 shrink-0 place-items-center rounded-full text-foreground-icon-secondary transition-colors hover:bg-background-tertiary-default hover:text-foreground-icon-primary"
  >
    <AtSign className="size-[18px]" />
  </button>
);
