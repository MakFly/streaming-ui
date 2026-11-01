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

export interface SubnavLink {
  label: string;
  to: string;
  count?: number;
  on: boolean;
}

/** Links a page nests under its own sidebar entry (the gallery's collections under Responses). */
export interface Subnav {
  /** The sidebar entry they hang under, by label. */
  item: string;
  links: SubnavLink[];
}

/** The docs layout's setter for the page's sidebar sub-links. The page owns the data, so the sidebar never imports it. */
export const DocsSubnav = createContext<((subnav: Subnav | null) => void) | null>(null);

/** Hand the page's sub-links to the sidebar; cleared when the page unmounts. */
export function useDocsSubnav(subnav: Subnav) {
  const set = useContext(DocsSubnav);
  const key = JSON.stringify(subnav);
  useEffect(() => {
    if (!set) return;
    set(JSON.parse(key) as Subnav);
    return () => set(null);
  }, [set, key]);
}
