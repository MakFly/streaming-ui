import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Centered page column: wide for the grid, narrow for the list and single demo pages. */
export function PageShell({ width, children }: { width: 'wide' | 'narrow'; children: ReactNode }) {
  return (
    <div className={cn('mx-auto flex w-full flex-col px-6 pt-10 pb-14 sm:px-10', width === 'wide' ? 'max-w-[1320px]' : 'max-w-[900px]')}>
      {children}
    </div>
  );
}
