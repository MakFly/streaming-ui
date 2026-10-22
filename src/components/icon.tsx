import { REMIX_ICONS } from '@/engine/icons.js';
import { cn } from '@/lib/utils';

/** Remix Icon glyph from the shared icon set (the same paths the demos use). */
export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" className={cn('remixicon shrink-0', className)}>
      <path d={REMIX_ICONS[name]} />
    </svg>
  );
}
