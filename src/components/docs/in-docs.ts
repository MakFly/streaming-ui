import { createContext, useContext, useEffect } from 'react';

/** True under the docs layout: PageShell then drops its own column, the layout already gives one. Its own module so
 * pages read it without pulling the layout into their chunk. */
export const InDocs = createContext(false);

export interface Crumb {
  label: string;
  to?: string;
}

/** The docs layout's setter for the crumbs a page adds after its sidebar entry (a collection, a demo, a template). */
export const DocsCrumbs = createContext<((crumbs: Crumb[]) => void) | null>(null);

/** Hand the page's own crumbs to the layout's breadcrumb; cleared when the page unmounts. */
export function useDocsCrumbs(crumbs: Crumb[]) {
  const set = useContext(DocsCrumbs);
  const key = JSON.stringify(crumbs);
  useEffect(() => {
    if (!set) return;
    set(JSON.parse(key) as Crumb[]);
    return () => set([]);
  }, [set, key]);
}
