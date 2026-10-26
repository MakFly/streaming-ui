import { Reply, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/* Reply to an answer: the quote it carries and the bar pinned above the composer while it is written.
 * Its own file so <Composer> (composers.tsx) can show the bar without importing parts.tsx, which imports it,
 * and so the installable `composer` item ships it whole (the engine re-exports ReplyRef from here). */

/** A message quoted by a reply: which one, and the excerpt shown with it. */
export interface ReplyRef {
  id: string;
  text: string;
  /** Who is quoted ("Assistant" when unset): a model name on Model compare, "Report"… */
  label?: string;
}

/** The quote a reply carries: accent bar, reply icon, one truncated line. */
export function Quote({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn('flex min-w-0 items-center gap-1.5 border-s-2 border-accent-500 ps-2 text-body-2-regular text-text-tertiary', className)}>
      <Reply className="size-3.5 shrink-0" />
      <span className="truncate">{text}</span>
    </span>
  );
}

/** Pinned above the composer while a reply is being written: what it answers, and × to drop it. */
export function ReplyChip({ reply, onClear, className }: { reply: ReplyRef; onClear: () => void; className?: string }) {
  return (
    <div className={cn('animate-in fade-in-0 slide-in-from-bottom-1 flex items-center gap-2 rounded-xl bg-background-tertiary-default py-1.5 ps-2.5 pe-1 duration-200', className)}>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-caption-1-medium text-text-secondary">Replying to {reply.label ?? 'Assistant'}</span>
        <Quote text={reply.text} className="border-s-0 ps-0" />
      </span>
      <button
        type="button"
        aria-label="Cancel reply"
        title="Cancel reply"
        onClick={onClear}
        className="grid size-7 shrink-0 place-items-center rounded-md text-foreground-icon-tertiary transition-[color,background-color,scale] outline-none hover:bg-background-tertiary-hover hover:text-foreground-icon-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring active:scale-90"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
