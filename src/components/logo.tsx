import { cn } from '@/lib/utils';

/** Brand mark: three bars of uneven length, a response arriving line by line. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('grid size-7 shrink-0 place-items-center rounded-lg bg-text-primary text-background-primary-default', className)} aria-hidden="true">
      <svg viewBox="0 0 16 16" className="size-4" fill="currentColor">
        <rect x="2" y="3" width="12" height="2" rx="1" />
        <rect x="2" y="7" width="9" height="2" rx="1" />
        <rect x="2" y="11" width="5" height="2" rx="1" opacity="0.55" />
      </svg>
    </span>
  );
}
