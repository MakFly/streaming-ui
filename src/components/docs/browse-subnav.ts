import { libraries } from '@/engine/registry';
import { templates } from '@/templates/registry';
import { paths } from '@/lib/paths';
import type { SubnavLink } from '@/components/docs/in-docs';

/** The Browse entries' sub-links on every docs page, so their dropdowns never depend on the page being open. The
 * docs layout loads this module on its own: it pulls the response registry, which must stay out of the layout's chunk.
 * A page that publishes its own sub-links (useDocsSubnav) replaces these for its entry. */
export const BROWSE_SUBNAV: Record<string, Omit<SubnavLink, 'on'>[]> = {
  Responses: libraries.map((l) => ({ label: l.name, to: paths.gallery(l.slug), count: l.count })),
  Templates: templates.map((t) => ({ label: t.name, to: paths.template(t.slug) })),
};
