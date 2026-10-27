import { useContext, type ReactNode } from 'react';
import { InDocs } from '@/components/docs/in-docs';

/** Centered page column, as wide as the navbar so their edges line up on every page. Under the docs layout, which
 * already gives the column and its padding, it is just a full-width stack. */
export function PageShell({ children }: { width?: 'wide' | 'narrow'; children: ReactNode }) {
  const docs = useContext(InDocs);
  if (docs) return <div className="flex w-full flex-col">{children}</div>;
  return <div className="mx-auto flex w-full max-w-[1320px] flex-col px-6 pt-10 pb-14 sm:px-10">{children}</div>;
}
