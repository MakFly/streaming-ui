import { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router';
import { SiteHeader } from '@/components/site-header';
import { PageShell } from '@/components/page-shell';
import { DemoActions, DemoMeta } from '@/components/demo-card';
import { DemoStage, type DemoStageHandle } from '@/components/demo-stage';
import { Icon } from '@/components/icon';
import { demos, getDemo } from '@/engine/registry';
import type { Demo } from '@/engine/types';
import { paths } from '@/lib/paths';
import { applyHead, isPromptPath } from '@/seo/routes';
import { NotFound } from '@/routes/not-found';

function Neighbour({ demo, dir }: { demo?: Demo; dir: 'prev' | 'next' }) {
  if (!demo) return <span className="flex-1" aria-hidden="true" />;
  const next = dir === 'next';
  return (
    <Link
      to={paths.demo(demo.slug)}
      className={`group flex min-w-0 flex-1 flex-col gap-1 rounded-2xl border border-border-button-default bg-background-primary-default px-4 py-3 shadow-xs transition-colors hover:bg-background-primary-hover outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring ${next ? 'items-end text-end' : ''}`}
    >
      <span className="inline-flex items-center gap-1 text-caption-1-medium text-text-tertiary">
        {!next && <Icon name="arrow-left-s-line" className="size-4" />}
        {next ? 'Next' : 'Previous'}
        {next && <Icon name="arrow-right-s-line" className="size-4" />}
      </span>
      <span className="max-w-full truncate text-body-medium text-text-primary">{demo.title}</span>
      <span className="text-caption-1-regular text-text-tertiary">{demo.group}</span>
    </Link>
  );
}

/** `/demo/:slug` — one response on its own page, with previous / next across the whole gallery. */
export function DemoPage() {
  const { slug } = useParams();
  const demo = getDemo(slug);
  const stage = useRef<DemoStageHandle>(null);

  const { pathname } = useLocation();
  useEffect(() => {
    if (!demo) return;
    applyHead({
      title: `${demo.title} · ${demo.group} · Streaming UI`,
      description: demo.desc,
      path: paths.demo(demo.slug),
      robots: isPromptPath(pathname) ? 'noindex, follow' : 'index, follow',
    });
  }, [demo, pathname]);

  if (!demo) return <NotFound />;
  const i = demo.index - 1;

  return (
    <PageShell width="narrow">
      <SiteHeader crumbs={[{ label: demo.group, to: paths.gallery(demo.library.slug) }, { label: demo.title }]} />
      <section className="mt-8 flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <DemoMeta demo={demo} titleAs="h1" />
          <DemoActions promptTo={paths.demoPrompt(demo.slug)} onRestart={() => stage.current?.restart()} />
        </div>
        {/* key: a new slug mounts a fresh stage instead of reusing the previous demo's DOM */}
        <DemoStage key={demo.slug} ref={stage} demo={demo} />
      </section>
      <nav aria-label="More responses" className="mt-10 flex gap-3">
        <Neighbour demo={demos[i - 1]} dir="prev" />
        <Neighbour demo={demos[i + 1]} dir="next" />
      </nav>
      <Outlet />
    </PageShell>
  );
}
