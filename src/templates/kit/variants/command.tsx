import { CornerDownLeft, LoaderCircle, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ElapsedTimer } from '../primitives';
import { AttachmentStrip } from '../attachments';
import { withAttachments, Field, Status, useField, type VariantProps } from '../composer-kit';

/* Command (terminal agents): monospace prompt, slash commands, key hints, Esc to interrupt.
 * Use <CommandComposer> on its own, or the view inside a switcher that owns the attachments. */

const COMMANDS = [
  { cmd: '/clear', hint: 'Start a fresh conversation' },
  { cmd: '/model', hint: 'Switch the model' },
  { cmd: '/tools', hint: 'List the tools the agent can call' },
  { cmd: '/summarize', hint: 'Sum up the thread so far' },
];

export function CommandComposerView(p: VariantProps) {
  const field = useField(p);
  const slash = /^\/\S*$/.test(p.value);
  const matches = slash ? COMMANDS.filter((c) => c.cmd.startsWith(p.value)) : [];
  const kbd = 'rounded border border-border-button-default bg-background-tertiary-default px-1 font-mono text-[10.5px] text-text-secondary';
  return (
    <div className={cn('flex w-full flex-col gap-1.5', p.className)}>
      <div className="relative rounded-xl border border-border-button-default bg-background-primary-default font-mono shadow-xs">
        {p.busy && (
          <div className="absolute inset-x-3 -top-px h-px overflow-hidden" aria-hidden>
            <div className="tpl-scan h-full w-1/3 bg-gradient-to-r from-transparent via-accent-500 to-transparent" />
          </div>
        )}
        {matches.length > 0 && (
          <ul role="listbox" className="animate-in fade-in-0 slide-in-from-bottom-1 absolute inset-x-2 bottom-full mb-1.5 overflow-hidden rounded-lg border border-border-button-default bg-dropdown-background py-1 shadow-dropdown duration-150">
            {matches.map((c, i) => (
              <li key={c.cmd}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === 0}
                  onClick={() => {
                    p.onChange(`${c.cmd} `);
                    field.ref.current?.focus();
                  }}
                  className={cn('flex w-full items-baseline gap-3 px-3 py-1.5 text-start text-[12.5px] hover:bg-dropdown-item-hover-background', i === 0 && 'bg-dropdown-item-hover-background')}
                >
                  <span className="text-accent-500">{c.cmd}</span>
                  <span className="font-sans text-caption-1-regular text-text-tertiary">{c.hint}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <AttachmentStrip attachments={p.att.files} onRemove={p.att.remove} className="px-3 pt-3 font-sans" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            field.submit();
          }}
          className="flex items-start gap-2 px-3 pt-2.5 pb-2"
        >
          <span className={cn('pt-px text-[14px] leading-6 select-none', p.busy ? 'text-text-tertiary' : 'text-accent-500')}>❯</span>
          <Field field={field} value={p.value} onChange={p.onChange} placeholder={p.placeholder.toLowerCase()} className="min-h-6 font-mono text-[13.5px] leading-6" />
          <button type="submit" aria-label="Send message" disabled={p.busy || !p.value.trim()} className="mt-0.5 flex h-6 shrink-0 items-center gap-1 rounded-md border border-border-button-default px-1.5 text-[11px] text-text-secondary transition-colors hover:text-text-primary disabled:opacity-40">
            run <CornerDownLeft className="size-3" />
          </button>
        </form>
        <div className="flex min-h-8 items-center gap-3 border-t border-dashed border-border-button-default px-3 py-1 text-[11px] text-text-tertiary">
          {p.busy ? (
            <span className="flex items-center gap-1.5">
              <LoaderCircle className="size-3 animate-spin text-accent-500" /> working <ElapsedTimer className="text-[11px]" /> ·{' '}
              <button type="button" onClick={p.onStop} className="flex items-center gap-1 hover:text-text-primary">
                <span className={kbd}>esc</span> to interrupt
              </button>
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <span><span className={kbd}>⏎</span> send</span>
              <span className="hidden sm:inline"><span className={kbd}>⇧⏎</span> newline</span>
              <span><span className={kbd}>/</span> commands</span>
            </span>
          )}
          <span className="ms-auto flex items-center gap-1 font-sans">
            <button type="button" aria-label="Attach file" onClick={p.att.add} className="grid size-6 place-items-center rounded-md hover:bg-background-tertiary-default dark:hover:bg-background-primary-hover hover:text-text-primary">
              <Paperclip className="size-3.5" />
            </button>
            <span className="[&_button]:h-6 [&_button]:text-caption-1-medium">{p.model}</span>
          </span>
        </div>
      </div>
      {p.tools && <div className="flex flex-wrap items-center gap-1.5 px-1">{p.tools}</div>}
      <Status context={p.context} className="font-mono text-[11.5px]">{p.status}</Status>
    </div>
  );
}

export const CommandComposer = withAttachments(CommandComposerView);
