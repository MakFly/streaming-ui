import { useState } from 'react';
import { Bot, ListChecks, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from '../icon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ComposerLoader } from '../primitives';
import { AttachmentStrip } from '../attachments';
import { ContextMeter } from '../agent-limits';
import { withAttachments, AddButton, Field, SendButton, Status, useDictation, useField, type VariantProps } from '../composer-kit';

/* Panel (Rail): the box on a rail with branch, project, context ring and permission modes.
 * Use <PanelComposer> on its own, or the view inside a switcher that owns the attachments. */

const MODES = [
  { id: 'ask', label: 'Ask before edits', icon: <MessageCircle /> },
  { id: 'plan', label: 'Plan mode', icon: <ListChecks /> },
  { id: 'auto', label: 'Accept edits', icon: <Bot /> },
  { id: 'bypass', label: 'Bypass all', icon: <Icon name="shield-check-line" /> },
] as const;

/**
 * The Composer Panel: a tab rail tucked behind the card's
 * top edge with branch, project and the context ring; then the card: attachment strip, prompt, and a bar with
 * add, permission mode, model, voice and send.
 */
export function PanelComposerView(p: VariantProps) {
  const field = useField(p);
  const dictation = useDictation(p.value, p.onChange);
  const [mode, setMode] = useState<(typeof MODES)[number]['id']>('bypass');
  const current = MODES.find((m) => m.id === mode)!;
  const rail = p.branch || p.project || p.context !== undefined;
  return (
    <div className={cn('flex w-full flex-col', p.className)}>
      {rail && (
        <div className="mx-7 flex h-[34px] items-center justify-between gap-3 rounded-t-2xl bg-composer-panel-tab-background px-2 py-1">
          <div className="flex min-w-0 items-center gap-3">
            {p.branch && (
              <span className="flex min-w-0 items-center gap-1">
                <Icon name="git-branch-line" className="size-4 -scale-y-100 text-foreground-icon-secondary" />
                <span className="truncate text-body-2-medium whitespace-nowrap text-text-secondary">{p.branch}</span>
              </span>
            )}
            {p.project && (
              <span className="flex min-w-0 items-center gap-1">
                <Icon name="folder-line" className="size-4 text-foreground-icon-secondary" />
                <span className="truncate text-body-2-medium whitespace-nowrap text-text-secondary">{p.project}</span>
              </span>
            )}
          </div>
          {p.context !== undefined && <ContextMeter percent={p.context} />}
        </div>
      )}
      <ComposerLoader active={!!p.busy} radius={24} surfaceClassName="border-transparent shadow-[0_1px_0.5px_rgba(0,0,0,0.02),0_4px_2px_rgba(0,0,0,0.02)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            field.submit();
          }}
          onClick={(e) => e.target === e.currentTarget && field.ref.current?.focus()}
          className="flex w-full cursor-text flex-col p-2.5"
        >
          <AttachmentStrip attachments={p.att.files} onRemove={p.att.remove} />
          <div className="flex flex-col gap-5 pt-1.5">
            <div className="px-1.5">
              <Field field={field} value={p.value} onChange={p.onChange} placeholder={p.placeholder} className="block p-0 leading-5 caret-accent-500" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <AddButton onClick={p.att.add} className="bg-composer-panel-add-background hover:bg-composer-panel-add-hover-background" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" aria-label={`Permission: ${current.label}`} className="ease flex h-[30px] shrink-0 cursor-pointer items-center gap-1 rounded-full py-[5px] ps-2 pe-2.5 outline-none transition-colors duration-150 hover:bg-background-primary-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring [&_svg]:size-4 [&_svg]:text-foreground-icon-secondary">
                      {current.icon}
                      <span className="hidden text-body-medium whitespace-nowrap text-text-secondary sm:inline">{current.label}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="top" className="min-w-48">
                    {MODES.map((m) => (
                      <DropdownMenuItem key={m.id} onSelect={() => setMode(m.id)} className="flex items-center gap-2 [&_svg]:size-4 [&_svg]:text-foreground-icon-secondary">
                        {m.icon}
                        <span className="flex-1">{m.label}</span>
                        {m.id === mode && <Icon name="check-line" className="text-text-primary!" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {p.tools}
              </div>
              <div className="flex shrink-0 items-center gap-4">
                {p.model}
                <div className="flex items-center gap-2">
                  <button type="button" aria-label={dictation.listening ? 'Stop voice input' : 'Voice input'} aria-pressed={dictation.listening} onClick={dictation.toggle} className={cn('ease relative hidden size-9 cursor-pointer items-center justify-center rounded-full border p-2 shadow-xs outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-border-focus-ring sm:flex', dictation.listening ? 'border-red-500/30 bg-red-500/10 hover:bg-red-500/15' : 'border-border-button-default bg-background-primary-default hover:bg-background-primary-hover')}>
                    {dictation.listening && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-red-500/20 motion-reduce:animate-none" />}
                    <Icon name="mic-line" className={cn('relative size-5', dictation.listening ? 'text-red-500' : 'text-foreground-icon-primary')} />
                  </button>
                  <SendButton busy={p.busy} onStop={p.onStop} disabled={!p.value.trim()} className="bg-accent-500 text-white" />
                </div>
              </div>
            </div>
          </div>
        </form>
      </ComposerLoader>
      <Status className="pt-1.5">{p.status}</Status>
    </div>
  );
}

export const PanelComposer = withAttachments(PanelComposerView);
