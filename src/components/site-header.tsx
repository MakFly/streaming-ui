import { Fragment, useContext, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@/components/icon';
import { usePlayback } from '@/providers/playback-provider';
import { InDocs, useDocsCrumbs, type Crumb } from '@/components/docs/in-docs';

export type { Crumb };

/** Loop + Replay all: the playback controls for every preview on the page. */
export function PlaybackControls() {
  const { loop, setLoop, replayAll } = usePlayback();
  return (
    <div className="flex items-center gap-2">
      <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-border-button-default bg-background-primary-default px-2.5 text-body-medium text-text-primary shadow-xs select-none">
        <Switch checked={loop} onCheckedChange={setLoop} aria-label="Loop every preview" />
        Loop
      </label>
      <Button onClick={replayAll} aria-label="Replay all">
        <span className="inline-flex items-center justify-center px-0.5">
          <Icon name="refresh-line" className="size-[18px]" />
        </span>
        <span className="px-0.5 max-sm:hidden">Replay all</span>
      </Button>
    </div>
  );
}

/** Breadcrumb trail + playback controls, shared by the gallery and demo pages. Under the docs layout the trail goes to
 * the layout's breadcrumb. `controls={false}` when the page places PlaybackControls itself (the gallery's toolbar). */
export function SiteHeader({ crumbs, controls = true, children }: { crumbs: Crumb[]; controls?: boolean; children?: ReactNode }) {
  const trail: Crumb[] = [{ label: 'Streaming', to: '/' }, { label: 'Responses', to: '/responses' }, ...crumbs];
  const docs = useContext(InDocs);
  useDocsCrumbs(crumbs);

  return (
    <header className="flex flex-col gap-4">
      {(!docs || controls) && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
          {!docs && (
            <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              {trail.map((c, i) => {
                const last = i === trail.length - 1;
                const cls = last ? 'text-caption-1-medium text-text-secondary' : 'text-caption-1-medium text-text-tertiary';
                return (
                  <Fragment key={`${c.label}-${i}`}>
                    {i > 0 && <span className="text-caption-1-regular text-text-tertiary">›</span>}
                    {c.to && !last ? (
                      <Link to={c.to} className={`${cls} transition-colors hover:text-text-primary`}>
                        {c.label}
                      </Link>
                    ) : (
                      <span className={`${cls} truncate`} aria-current={last ? 'page' : undefined}>
                        {c.label}
                      </span>
                    )}
                  </Fragment>
                );
              })}
            </nav>
          )}
          {controls && (
            <div className="ms-auto">
              <PlaybackControls />
            </div>
          )}
        </div>
      )}
      {children}
    </header>
  );
}
