import { memo, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { DemoStage, type DemoStageHandle } from '@/components/demo-stage';
import type { Demo } from '@/engine/types';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';


/** Title, library badge, description, docs link, then the Prompt / Run again actions. */
export function DemoMeta({ demo, compact, titleAs: Title = 'h2', linkTitle }: {
  demo: Demo;
  compact?: boolean;
  titleAs?: 'h1' | 'h2';
  linkTitle?: boolean;
}) {
  return (
    <div className="flex min-w-0 grow basis-64 flex-col gap-1">
      <Title className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-text-primary', Title === 'h1' ? 'text-title-1-semibold' : 'text-headline-medium')}>
        <span className="font-mono text-caption-1-regular text-text-tertiary">{String(demo.index).padStart(2, '0')}</span>
        {linkTitle ? (
          <Link to={paths.demo(demo.slug)} className="rounded-sm outline-none hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-border-focus-ring">
            {demo.title}
          </Link>
        ) : (
          demo.title
        )}
        <Badge asChild variant={demo.group === 'Agent' ? 'new' : 'neutral'}>
          <Link to={paths.gallery(demo.library.slug)} preventScrollReset aria-label={`Show every ${demo.group} response`}>
            {demo.group}
          </Link>
        </Badge>
      </Title>
      <p className={cn('text-body-regular text-text-secondary', compact && 'line-clamp-2')} title={demo.desc}>
        {demo.desc}
      </p>
    </div>
  );
}

export function DemoActions({ promptTo, onRestart }: { promptTo: string; onRestart: () => void }) {
  // Read the query string at click time instead of subscribing to the location: a location hook here re-rendered
  // every card on each search keystroke. (useNavigate is stable in a data router.)
  const navigate = useNavigate();
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button asChild>
        <Link
          to={promptTo}
          preventScrollReset
          aria-label="Show the rebuild prompt for this response"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            navigate({ pathname: promptTo, search: window.location.search }, { preventScrollReset: true });
          }}
        >
          <span className="inline-flex items-center justify-center px-0.5">
            <Icon name="markdown-line" className="size-[18px]" />
          </span>
          <span className="px-0.5">Prompt</span>
        </Link>
      </Button>
      <Button onClick={onRestart}>
        <span className="inline-flex items-center justify-center px-0.5">
          <Icon name="refresh-line" className="size-[18px]" />
        </span>
        <span className="px-0.5">Run again</span>
      </Button>
    </div>
  );
}

/** One gallery entry: header + live stage. The title opens the demo's own page. Memoized: props are stable. */
export const DemoCard = memo(function DemoCard({ demo, compact, library }: { demo: Demo; compact: boolean; library?: string }) {
  const stage = useRef<DemoStageHandle>(null);
  const promptTo = paths.galleryPrompt(demo.slug, library);
  return (
    <section id={demo.slug} className="flex min-w-0 scroll-mt-28 flex-col gap-2 pt-10">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <DemoMeta demo={demo} compact={compact} linkTitle />
        <DemoActions promptTo={promptTo} onRestart={() => stage.current?.restart()} />
      </div>
      <div className="mt-auto">
        <DemoStage ref={stage} demo={demo} />
      </div>
    </section>
  );
});
