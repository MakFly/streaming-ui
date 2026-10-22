import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Check, ExternalLink } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { ComposerThreadDemo } from '@/components/composers/composer-thread-demo';
import { ComposerCompare, ComposerSpec } from '@/components/composers/composer-spec';
import { InstallButton } from '@/components/composers/install-button';
import { Icon } from '@/components/icon';
import { COMPOSER_VARIANTS, ComposerVariantProvider, useComposerChoice, type ComposerVariant } from '@/templates/kit/composer-variant';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';

/* `/composers` — the five interchangeable composers of the chat templates, each typing into its own live
 * thread, with its anatomy and usage beside it and a comparison at the end. "Use in every template" sets the
 * same shared choice as the picker in the template headers. The demos lock their variant, so that choice
 * never changes what this page shows. */

/** The section currently in view, for the sticky jump bar. */
function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-120px 0px -60% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const PromptDialog = lazy(() => import('@/components/prompt-dialog'));

/** The composer's rebuild prompt (sources, install, usage), in the same dialog as demos and templates. */
function ComposerPrompt({ variant }: { variant: (typeof COMPOSER_VARIANTS)[number] }) {
  const [open, setOpen] = useState(false);
  const load = useCallback(() => import('@/templates/composer-prompt').then((m) => m.buildComposerPrompt(variant.id)), [variant.id]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex h-8 items-center gap-1.5 rounded-lg border border-border-button-default bg-background-primary-default px-2.5 text-body-2-medium text-text-primary shadow-xs transition-colors hover:bg-background-primary-hover">
        <Icon name="markdown-line" className="size-4" /> Prompt
      </button>
      {open && (
        <Suspense fallback={null}>
          <PromptDialog
            title={`${variant.name} composer`}
            fileName={`${variant.id}-composer.prompt.md`}
            downloadName={`${variant.id}-composer.prompt.md`}
            load={load}
            onClose={() => setOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}

function UseEverywhere({ variant }: { variant: ComposerVariant }) {
  const { choice, setChoice } = useComposerChoice();
  const on = choice === variant;
  return (
    <button
      type="button"
      onClick={() => setChoice(on ? 'auto' : variant)}
      aria-pressed={on}
      className={cn(
        'flex h-8 items-center gap-1.5 rounded-lg px-3 text-body-2-medium shadow-xs transition-colors',
        on ? 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-400' : 'border border-border-button-default bg-background-primary-default text-text-primary hover:bg-background-primary-hover',
      )}
    >
      {on && <Check className="size-4" />}
      {on ? 'Used in every template' : 'Use in every template'}
    </button>
  );
}

function Content() {
  const ids = COMPOSER_VARIANTS.map((v) => v.id);
  const active = useActiveSection(ids);
  const { choice, setChoice } = useComposerChoice();

  // A deep link (#dock, #compare) lands before the page renders, so the browser cannot jump to it itself.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const raf = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <PageShell width="wide">
      <header className="flex flex-col items-start gap-3 pb-2">
        <p className="font-mono text-caption-1-medium tracking-[0.12em] text-text-tertiary uppercase">Composers</p>
        <h1 className="text-display-4-semibold tracking-[-0.02em] text-text-primary">Eleven composers, one interface</h1>
        <p className="max-w-[720px] text-headline-regular text-text-secondary">
          Every chat template can wear any of these. Each one below types into its own live thread, so you can watch it work, then try it yourself. Pick one for every
          template at once, or keep each template's own. Every composer installs into your own project with the shadcn CLI.
        </p>
        <p className="flex flex-wrap items-center gap-2 text-body-2-regular text-text-tertiary">
          Templates currently use
          <span className="rounded-md bg-background-tertiary-default px-1.5 py-0.5 text-body-2-medium text-text-primary">{choice === 'auto' ? 'their own composer' : COMPOSER_VARIANTS.find((v) => v.id === choice)?.name}</span>
          {choice !== 'auto' && (
            <button type="button" onClick={() => setChoice('auto')} className="text-body-2-medium text-text-secondary underline underline-offset-2 hover:text-text-primary">
              Reset
            </button>
          )}
        </p>
        <InstallButton item="composer" label="Install all eleven" />
      </header>

      {/* Jump bar: sticks right under the 57px site nav while the sections scroll past. */}
      <nav aria-label="Composers" className="scrollbar-none sticky top-[57px] z-20 -mx-6 mt-6 flex gap-1 overflow-x-auto bg-background-full/85 px-6 py-3 backdrop-blur-md sm:-mx-10 sm:px-10">
        {COMPOSER_VARIANTS.map((v, i) => (
          <a
            key={v.id}
            href={`#${v.id}`}
            aria-current={active === v.id ? 'true' : undefined}
            className={cn('flex h-8 shrink-0 items-center gap-2 rounded-full px-3 text-body-2-medium transition-colors', active === v.id ? 'bg-text-primary text-background-primary-default' : 'text-text-secondary hover:bg-background-tertiary-default hover:text-text-primary')}
          >
            <span className="font-mono text-caption-1-regular opacity-60">{String(i + 1).padStart(2, '0')}</span>
            {v.name}
          </a>
        ))}
        <a href="#compare" className="ms-auto flex h-8 shrink-0 items-center rounded-full px-3 text-body-2-medium text-text-secondary hover:bg-background-tertiary-default hover:text-text-primary">
          Compare
        </a>
      </nav>

      <div className="flex flex-col gap-20 pt-8">
        {COMPOSER_VARIANTS.map((v, i) => (
          <section key={v.id} id={v.id} className="flex scroll-mt-32 flex-col gap-5">
            <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
              <div className="flex min-w-0 flex-1 basis-72 flex-col gap-1">
                <span className="font-mono text-caption-1-medium text-text-tertiary">
                  {String(i + 1).padStart(2, '0')} · {v.from}
                </span>
                <h2 className="text-title-1-semibold tracking-[-0.01em] text-text-primary">{v.name}</h2>
                <p className="text-body-regular text-text-secondary">{v.hint}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`${paths.templatePreview('assistant')}?composer=${v.id}`} className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-body-2-medium text-text-secondary transition-colors hover:bg-background-tertiary-default hover:text-text-primary">
                  <ExternalLink className="size-4" /> Try in Assistant
                </Link>
                <UseEverywhere variant={v.id} />
                <ComposerPrompt variant={v} />
                <InstallButton item={`composer-${v.id}`} />
              </div>
            </div>
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <ComposerThreadDemo variant={v.id} active={active === v.id} />
              <ComposerSpec variant={v.id} />
            </div>
          </section>
        ))}

        <section id="compare" className="flex scroll-mt-32 flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-caption-1-medium text-text-tertiary">Side by side</span>
            <h2 className="text-title-1-semibold tracking-[-0.01em] text-text-primary">Compare the composers</h2>
          </div>
          <ComposerCompare />
        </section>
      </div>
    </PageShell>
  );
}

/** `/composers` — wrapped in the shared choice so "Use in every template" reaches the templates. */
export function ComposersPage() {
  useEffect(() => {
    document.title = 'Composers · Streaming UI';
  }, []);
  return (
    <ComposerVariantProvider>
      <Content />
    </ComposerVariantProvider>
  );
}
