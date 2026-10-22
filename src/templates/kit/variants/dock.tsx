import { useState } from 'react';
import { AtSign, Globe, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComposerLoader } from '../primitives';
import { AttachmentStrip } from '../attachments';
import { withAttachments, Field, SendButton, Status, useField, type VariantProps } from '../composer-kit';

/* Dock (Floating toolbar): a floating glass toolbar with grouped tools and an accent send.
 * Use <DockComposer> on its own, or the view inside a switcher that owns the attachments. */

export function DockComposerView(p: VariantProps) {
  const field = useField(p);
  const [web, setWeb] = useState(false);
  const tool = 'grid size-8 shrink-0 place-items-center rounded-[10px] text-foreground-icon-secondary transition-colors hover:bg-background-tertiary-default hover:text-foreground-icon-primary [&_svg]:size-[18px]';
  return (
    // A container, not a viewport, query: the same dock sits in full-width threads and 400px side panels.
    <div className={cn('@container flex w-full flex-col items-stretch gap-1', p.className)}>
      <ComposerLoader active={!!p.busy} radius={18} surfaceClassName="bg-background-primary-default/85 shadow-dropdown backdrop-blur-xl">
        <AttachmentStrip attachments={p.att.files} onRemove={p.att.remove} className="px-2 pt-2" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            field.submit();
          }}
          className="flex min-h-12 w-full items-end gap-1 p-1.5"
        >
          <div className="flex shrink-0 items-center gap-0.5 rounded-xl bg-background-tertiary-default/70 p-0.5">
            <button type="button" aria-label="Add attachment" onClick={p.att.add} className={tool}>
              <Plus />
            </button>
            <button
              type="button"
              aria-label="Mention"
              onClick={() => {
                p.onChange(p.value && !/s$/.test(p.value) ? `${p.value} @` : `${p.value}@`);
                field.ref.current?.focus();
              }}
              className={cn(tool, 'hidden @md:grid')}
            >
              <AtSign />
            </button>
            <button type="button" aria-label="Search the web" aria-pressed={web} onClick={() => setWeb((w) => !w)} className={cn(tool, web && 'bg-accent-500/15 text-accent-500 hover:bg-accent-500/20 hover:text-accent-500')}>
              <Globe />
            </button>
          </div>
          <Field field={field} value={p.value} onChange={p.onChange} placeholder={p.placeholder} className="min-h-9 px-2.5 py-1.5 text-body-2-regular leading-6" />
          {p.tools && <span className="hidden shrink-0 items-center gap-1 self-center @2xl:flex">{p.tools}</span>}
          <span className="flex shrink-0 items-center self-center">{p.model}</span>
          <SendButton busy={p.busy} onStop={p.onStop} disabled={!p.value.trim()} className="size-9 rounded-xl bg-accent-500 text-white" stopClassName="size-9 rounded-xl" />
        </form>
      </ComposerLoader>
      {p.tools && <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 @2xl:hidden">{p.tools}</div>}
      <Status context={p.context} className="h-6 justify-center gap-5 text-caption-1-medium">{p.status}</Status>
    </div>
  );
}

export const DockComposer = withAttachments(DockComposerView);
