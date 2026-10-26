import type { ReactNode, RefObject } from 'react';
import { cn } from '@/lib/utils';
import { ComposerLoader } from '../primitives';
import { AttachmentStrip } from '../attachments';
import { withAttachments, AddButton, Field, MicButton, SendButton, Status, useField, type VariantProps } from '../composer-kit';
import { MentionButton, mentionLinkElement } from '../mention-menu';
import { useMentionField } from '../mention-field';

/* Box (Textarea): a growing textarea over an action row. With `mentions`, the field becomes the kit's @mention
 * editable (an @ button, and typing "@" opens a menu of files, people, sources and tools), each pick an atomic
 * chip drawn like escape's file link: the type's coloured glyph and the name in a hairline accent box.
 * Use <BoxComposer> on its own, or the view inside a switcher that owns the attachments. */

export function BoxComposerView(p: VariantProps) {
  return p.mentions ? <MentionBox {...p} /> : <TextareaBox {...p} />;
}

function TextareaBox(p: VariantProps) {
  const field = useField(p);
  return (
    <BoxFrame p={p} onSubmit={field.submit} onFocus={() => field.ref.current?.focus()}>
      <Field field={field} value={p.value} onChange={p.onChange} placeholder={p.placeholder} className="min-h-10 px-2.5 pt-2 pb-1" />
    </BoxFrame>
  );
}

function MentionBox(p: VariantProps) {
  const m = useMentionField({ ...p, chip: mentionLinkElement });
  return (
    <BoxFrame p={p} wrap={m.wrap} menu={m.menu} onSubmit={m.submit} onFocus={m.focus} mention={<MentionButton onClick={m.mention} />}>
      {m.field}
    </BoxFrame>
  );
}

/** The card around either field: attachments, the field, then the action row. */
function BoxFrame({ p, wrap, menu, mention, onSubmit, onFocus, children }: { p: VariantProps; wrap?: RefObject<HTMLDivElement | null>; menu?: ReactNode; mention?: ReactNode; onSubmit: () => void; onFocus: () => void; children: ReactNode }) {
  return (
    <div ref={wrap} className={cn('relative flex w-full flex-col gap-1.5', p.className)}>
      {menu}
      <ComposerLoader active={!!p.busy} radius={22}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          onClick={(e) => e.target === e.currentTarget && onFocus()}
          className="flex w-full cursor-text flex-col gap-1 p-2"
        >
          <AttachmentStrip attachments={p.att.files} onRemove={p.att.remove} className="px-1 pt-1" />
          {children}
          <div className="flex items-center gap-1.5">
            <AddButton onClick={p.att.add} />
            {mention}
            {p.tools}
            <span className="ms-auto flex items-center gap-1">
              {p.model}
              <MicButton value={p.value} onChange={p.onChange} />
              <SendButton busy={p.busy} onStop={p.onStop} disabled={!p.value.trim()} />
            </span>
          </div>
        </form>
      </ComposerLoader>
      <Status context={p.context}>{p.status}</Status>
    </div>
  );
}

export const BoxComposer = withAttachments(BoxComposerView);
