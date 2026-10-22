import { cn } from '@/lib/utils';
import { ComposerLoader } from '../primitives';
import { AttachmentStrip } from '../attachments';
import { withAttachments, AddButton, Field, MicButton, SendButton, Status, useField, type VariantProps } from '../composer-kit';

/* Box (Textarea): a growing textarea over an action row.
 * Use <BoxComposer> on its own, or the view inside a switcher that owns the attachments. */

export function BoxComposerView(p: VariantProps) {
  const field = useField(p);
  return (
    <div className={cn('flex w-full flex-col gap-1.5', p.className)}>
      <ComposerLoader active={!!p.busy} radius={22}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            field.submit();
          }}
          onClick={(e) => e.target === e.currentTarget && field.ref.current?.focus()}
          className="flex w-full cursor-text flex-col gap-1 p-2"
        >
          <AttachmentStrip attachments={p.att.files} onRemove={p.att.remove} className="px-1 pt-1" />
          <Field field={field} value={p.value} onChange={p.onChange} placeholder={p.placeholder} className="min-h-10 px-2.5 pt-2 pb-1" />
          <div className="flex items-center gap-1.5">
            <AddButton onClick={p.att.add} />
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
