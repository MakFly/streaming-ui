import { memo, useRef, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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

/** Opens the Prompt dialog over the page, keeping the query string. It is read at click time instead of subscribing to
 * the location: a location hook here re-rendered every card on each search keystroke. (useNavigate is stable in a data router.) */
function usePromptClick(promptTo: string) {
  const navigate = useNavigate();
  return (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate({ pathname: promptTo, search: window.location.search }, { preventScrollReset: true });
  };
}

export function DemoActions({ promptTo, onRestart }: { promptTo: string; onRestart: () => void }) {
  const onPrompt = usePromptClick(promptTo);
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button asChild>
        <Link to={promptTo} preventScrollReset aria-label="Show the rebuild prompt for this response" onClick={onPrompt}>
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

/** The tile's two actions as icon buttons, named by their tooltip and aria-label. */
function TileActions({ promptTo, onRestart }: { promptTo: string; onRestart: () => void }) {
  const onPrompt = usePromptClick(promptTo);
  return (
    <div className="-me-1.5 flex shrink-0 items-center gap-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="ghost" size="icon">
            <Link to={promptTo} preventScrollReset aria-label="Show the rebuild prompt" onClick={onPrompt}>
              <Icon name="markdown-line" className="size-[18px]" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Prompt</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={onRestart} aria-label="Run this response again">
            <Icon name="refresh-line" className="size-[18px]" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Run again</TooltipContent>
      </Tooltip>
    </div>
  );
}

/**
 * One gallery tile: the live demo first, then its caption (title, collection, description, actions). The title opens
 * the demo's own page. Memoized: props are stable.
 */
export const DemoCard = memo(function DemoCard({ demo, compact, library }: { demo: Demo; compact: boolean; library?: string }) {
  const stage = useRef<DemoStageHandle>(null);
  const promptTo = paths.galleryPrompt(demo.slug, library);
  return (
    // content-visibility: the browser skips style, layout and paint for tiles far from the viewport (249 on the
    // page); `auto 480px` holds a grid tile's height until one has rendered, then its real one, so the scrollbar holds.
    <article
      id={demo.slug}
      // isolate: a demo's own z-indexes stay inside the tile instead of rising over the sticky toolbar.
      className="isolate flex min-w-0 scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-border-component-detail-container bg-background-secondary-default [contain-intrinsic-size:auto_480px] [content-visibility:auto]"
    >
      {/* flex-1: tiles in a grid row share the tallest one's height, the stage takes the slack so captions line up. */}
      <div className="flex flex-1 bg-background-full">
        <DemoStage ref={stage} demo={demo} frame={false} />
      </div>
      <div className="flex items-start gap-3 border-t border-border-component-detail-container px-4 pt-3 pb-3.5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="flex min-w-0 items-center gap-2 text-headline-medium text-text-primary">
            <Link
              to={paths.demo(demo.slug)}
              className="truncate rounded-sm outline-none hover:underline hover:decoration-text-tertiary hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-border-focus-ring"
            >
              {demo.title}
            </Link>
            <Badge asChild variant={demo.group === 'Agent' ? 'new' : 'neutral'}>
              <Link to={paths.gallery(demo.library.slug)} aria-label={`Show every ${demo.group} response`}>
                {demo.group}
              </Link>
            </Badge>
          </h2>
          <p className={cn('text-body-2-regular text-text-secondary', compact && 'line-clamp-1')} title={demo.desc}>
            {demo.desc}
          </p>
        </div>
        <TileActions promptTo={promptTo} onRestart={() => stage.current?.restart()} />
      </div>
    </article>
  );
});
