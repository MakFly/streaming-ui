import { lazy, Suspense, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { getDemo, promptRefs } from '@/engine/registry';
import { createPrompt, slug as slugify } from '@/engine/prompt.js';
import { getTemplate } from '@/templates/registry';
import { paths } from '@/lib/paths';

// highlight.js and the raw sources only load when a prompt is opened.
const PromptDialog = lazy(() => import('@/components/prompt-dialog'));

/**
 * Child route that renders the Prompt dialog over its parent page:
 *   /responses/prompt/:slug, /responses/library/:library/prompt/:slug  → over the gallery
 *   /demo/:slug/prompt                                                   → over the demo page
 *   /templates/:slug/prompt                                              → over a template preview
 * Closing navigates back to the parent URL, keeping the query string and scroll position.
 */
export function PromptRoute({ from }: { from: 'gallery' | 'demo' | 'template' }) {
  const { slug, library } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const parent = from === 'demo' && slug ? paths.demo(slug) : from === 'template' && slug ? paths.template(slug) : paths.gallery(library);
  const close = () => navigate({ pathname: parent, search }, { preventScrollReset: true });

  const demo = from === 'template' ? undefined : getDemo(slug);
  const template = from === 'template' ? getTemplate(slug) : undefined;
  const load = useCallback(async () => {
    if (demo) return (await createPrompt(demo, promptRefs)).prompt;
    if (template) return (await import('@/templates/prompt')).buildTemplatePrompt(template);
    return '';
  }, [demo, template]);

  if (demo)
    return (
      <Suspense fallback={null}>
        <PromptDialog
          title={`${demo.title} · ${demo.group}`}
          fileName={`${slugify(demo.title)}.prompt.md`}
          downloadName={`${slugify(demo.group)}-${slugify(demo.title)}.prompt.md`}
          load={load}
          onClose={close}
        />
      </Suspense>
    );
  if (template)
    return (
      <Suspense fallback={null}>
        <PromptDialog
          title={`${template.name} · Chat template`}
          hrefLabel={`src/templates/${template.file}`}
          fileName={`${template.slug}.template.prompt.md`}
          downloadName={`${template.slug}.template.prompt.md`}
          load={load}
          onClose={close}
        />
      </Suspense>
    );
  return null;
}
