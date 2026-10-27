import { Fragment, useContext, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { usePlayback } from '@/providers/playback-provider';
import { InDocs, useDocsCrumbs, type Crumb } from '@/components/docs/in-docs';

export type { Crumb };

/** Breadcrumb trail + playback controls (Loop, Replay all), shared by the gallery and demo pages. Under the docs layout
 * the trail goes to the layout's breadcrumb and only the controls stay here. */
export function SiteHeader({ crumbs, children }: { crumbs: Crumb[]; children?: ReactNode }) {
  const { loop, setLoop, replayAll } = usePlayback();
  const trail: Crumb[] = [{ label: 'Streaming', to: '/' }, { label: 'Responses', to: '/responses' }, ...crumbs];
  const docs = useContext(InDocs);
  useDocsCrumbs(crumbs);

  return (
    <header className="flex flex-col gap-4">
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
        <div className="ms-auto flex items-center gap-2">
          <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-border-button-default bg-background-primary-default px-2.5 text-body-medium text-text-primary shadow-xs select-none">
            <Switch checked={loop} onCheckedChange={setLoop} aria-label="Loop every preview" />
            Loop
          </label>
          <Button onClick={replayAll}>
            <span className="px-0.5">Replay all</span>
          </Button>
        </div>
      </div>
      {children}
    </header>
  );
}
