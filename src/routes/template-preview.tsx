import { Suspense, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, X } from 'lucide-react';
import { getTemplate } from '@/templates/registry';
import { ErrorScreen } from '@/routes/not-found';
import { ComposerVariantProvider } from '@/templates/kit/composer-variant';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';

/** True when this document is the top window (Live preview), false inside the gallery / page iframes. */
const isTopWindow = () => {
  try {
    return window.self === window.top;
  } catch {
    return false;
  }
};

/**
 * Floating exit control for the full-window Live preview: Back returns to where you came from
 * (or to the template page when the preview was opened directly), Esc does the same.
 * It shrinks to a single button after a moment so it stays out of the template's way; on phones it is a
 * small tab on the left edge, where no template keeps controls.
 */
function ExitBar({ slug, name }: { slug: string; name: string }) {
  const navigate = useNavigate();
  const [compact, setCompact] = useState(false);

  const exit = useCallback(() => {
    // React Router keeps the in-app history index on history.state: go back only if there is somewhere to go.
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(paths.template(slug), { replace: true });
  }, [navigate, slug]);

  useEffect(() => {
    const id = setTimeout(() => setCompact(true), 3000);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) exit();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [exit]);

  return (
    <div
      className="group fixed z-[100] max-sm:top-1/2 max-sm:left-0 max-sm:-translate-y-1/2 sm:top-3 sm:left-1/2 sm:-translate-x-1/2"
      onMouseEnter={() => setCompact(false)}
      onMouseLeave={() => setCompact(true)}
      onFocus={() => setCompact(false)}
      onBlur={() => setCompact(true)}
    >
      <div
        className={cn(
          'flex items-center rounded-full border border-border-button-default bg-background-primary-default/90 p-1 shadow-dropdown backdrop-blur-md transition-[gap] duration-300 max-sm:rounded-s-none max-sm:border-s-0',
          compact ? 'gap-0' : 'gap-1',
        )}
      >
        <button
          type="button"
          onClick={exit}
          aria-label={`Exit the live preview and go back`}
          className="flex h-8 items-center gap-1.5 rounded-full px-2.5 text-body-2-medium text-text-primary transition-colors outline-none hover:bg-background-tertiary-default focus-visible:ring-2 focus-visible:ring-border-focus-ring"
        >
          <ArrowLeft className="size-4 shrink-0" />
          <span className={cn('overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300', compact ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100')}>Back</span>
        </button>
        <span className={cn('overflow-hidden whitespace-nowrap text-body-2-regular text-text-secondary transition-[max-width,opacity] duration-300', compact ? 'max-w-0 opacity-0' : 'max-w-60 opacity-100')}>
          {name} · Live preview
          <kbd className="ms-2 rounded-md border border-border-button-default px-1 font-sans text-caption-2-regular text-text-tertiary">Esc</kbd>
        </span>
        <button
          type="button"
          onClick={() => navigate(paths.templates())}
          aria-label="Close and show every template"
          className={cn(
            'grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full text-foreground-icon-secondary transition-[width,opacity] duration-300 outline-none hover:bg-background-tertiary-default focus-visible:ring-2 focus-visible:ring-border-focus-ring',
            compact && 'w-0 opacity-0',
          )}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

/** `/preview/:slug` — the bare template filling the window. Inside an iframe it shows nothing else;
 *  opened as the page itself (Live preview) it adds the floating exit control. */
export function TemplatePreview() {
  const { slug } = useParams();
  const t = getTemplate(slug);
  const [top] = useState(isTopWindow);

  useEffect(() => {
    if (t) document.title = `${t.name} · Live preview`;
  }, [t]);

  // A preview never shows a scrollbar (styles/scrollbars.css): it reads as the app, not as a page.
  useEffect(() => {
    document.documentElement.classList.add('no-scrollbars');
    return () => document.documentElement.classList.remove('no-scrollbars');
  }, []);

  if (!t) return <ErrorScreen status={404} bare />;
  return (
    <div className="h-dvh">
      <Suspense fallback={<div className="h-full bg-background-full" />}>
        <ComposerVariantProvider>
          <t.Component />
        </ComposerVariantProvider>
      </Suspense>
      {top && <ExitBar slug={t.slug} name={t.name} />}
    </div>
  );
}
