import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ComposerLoader } from '../primitives';
import { AttachmentStrip } from '../attachments';
import { withAttachments, AddButton, SendButton, Status, type VariantProps } from '../composer-kit';
import { MENTION_GROUPS, MENTION_ICON, MENTION_SVG, MENTION_TINT, MentionButton, type MentionCandidate } from '../mention-menu';
import { useMentionField } from '../mention-field';

/* Mention composer (Mentions): a Box-like card whose field is the kit's @mention editable (mention-field), with
 * chips tinted by kind. Typing "@" opens a menu at the caret with files, people, sources and tools. */

/* ------------------------------------------------------------------ chips */

type Candidate = MentionCandidate;

const ALL = MENTION_GROUPS.flatMap((g) => g.items);
/** Longest first, so a label never loses to one of its own prefixes. */
const BY_LENGTH = [...ALL].sort((a, b) => b.label.length - a.label.length);

const TINT = MENTION_TINT;
const CHIP = 'mx-px inline-flex items-center gap-1 rounded-md px-1.5 align-baseline text-body-2-medium leading-5 whitespace-nowrap select-none [&_svg]:size-3.5 [&_svg]:shrink-0';

/* ------------------------------------------------------------------ thread rendering */

/** The same chip as in the field, for text already sent: user bubbles and answers show mentions in their tint. */
function MentionChip({ c }: { c: Candidate }) {
  return (
    <span data-mention={c.label} className={cn(CHIP, TINT[c.kind])}>
      {MENTION_ICON[c.kind]}
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

/* ------------------------------------------------------------------ composer */

/** A chip as DOM, for the editable: atomic (contentEditable false), read back by `data-mention`. */
function makeChip(c: Candidate) {
  const el = document.createElement('span');
  el.contentEditable = 'false';
  el.dataset.mention = c.label;
  el.dataset.kind = c.kind;
  el.className = cn(CHIP, TINT[c.kind]);
  el.innerHTML = MENTION_SVG[c.kind];
  const label = document.createElement('span');
  label.textContent = c.label;
  el.appendChild(label);
  return el;
}

export function MentionComposerView(p: VariantProps) {
  const m = useMentionField({ ...p, chip: makeChip });
  return (
    <div ref={m.wrap} className={cn('relative flex w-full flex-col gap-1.5', p.className)}>
      {m.menu}
      <ComposerLoader active={!!p.busy} radius={22}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            m.submit();
          }}
          onClick={(e) => e.target === e.currentTarget && m.focus()}
          className="flex w-full cursor-text flex-col gap-1 p-2"
        >
          <AttachmentStrip attachments={p.att.files} onRemove={p.att.remove} className="px-1 pt-1" />
          {m.field}
          <div className="flex items-center gap-1.5">
            <AddButton onClick={p.att.add} />
            <MentionButton onClick={m.mention} />
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
