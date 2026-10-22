import { useState } from 'react';
import { Link, isRouteErrorResponse, useLocation, useNavigate, useRouteError } from 'react-router';
import { ArrowLeft, Check, ChevronDown, Copy, FileQuestion, LayoutTemplate, RotateCw, ServerCrash, ShieldX, TriangleAlert } from 'lucide-react';
import { SiteNav } from '@/components/site-nav';
import { cn } from '@/lib/utils';

/* One error screen for every failure: 404, 401/403, other 4xx, and 5xx or a crash while rendering.
 * Inside the site it sits under the navbar; on /preview (template iframes and Live preview) it stands alone. */

type Kind = { code: string; title: string; body: string; icon: typeof FileQuestion; tone: string; retry: boolean };

function describe(status: number | null): Kind {
  if (status === 404) return { code: '404', title: 'Page not found', body: 'This page, response or template does not exist. It may have been renamed or moved.', icon: FileQuestion, tone: 'text-text-secondary bg-background-tertiary-default', retry: false };
  if (status === 401 || status === 403) return { code: String(status), title: 'Access denied', body: 'You do not have access to this page. Sign in with another account or ask for access.', icon: ShieldX, tone: 'text-amber-700 bg-amber-500/10 dark:text-amber-400', retry: false };
  if (status && status >= 400 && status < 500) return { code: String(status), title: 'This request could not be handled', body: 'Something about the address or the request is off. Check the link and try again.', icon: TriangleAlert, tone: 'text-amber-700 bg-amber-500/10 dark:text-amber-400', retry: true };
  return { code: status ? String(status) : '500', title: 'Something went wrong', body: 'The page hit an unexpected error. Reloading usually fixes it; if not, the details below help us find the cause.', icon: ServerCrash, tone: 'text-red-700 bg-red-500/10 dark:text-red-400', retry: true };
}

function Details({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border-button-default bg-background-primary-default text-start shadow-xs">
      <div className="flex items-center gap-2 px-3 py-2">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex flex-1 items-center gap-1.5 text-body-2-medium text-text-secondary transition-colors hover:text-text-primary">
          <ChevronDown className={cn('size-4 transition-transform duration-200', !open && '-rotate-90')} /> Error details
        </button>
        <button
          type="button"
          aria-label={copied ? 'Copied' : 'Copy error details'}
          onClick={() => {
            void navigator.clipboard?.writeText(text).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          }}
          className="grid size-7 place-items-center rounded-md text-foreground-icon-tertiary transition-colors hover:bg-background-tertiary-default hover:text-foreground-icon-primary"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      {open && (
        <pre className="scrollbar-thin max-h-56 overflow-auto border-t border-separator-border bg-background-secondary-default px-3 py-2.5 font-mono text-[12px] leading-5 whitespace-pre-wrap text-text-secondary">{text}</pre>
      )}
    </div>
  );
}

export function ErrorScreen({ status, details, bare }: { status: number | null; details?: string; bare?: boolean }) {
  const k = describe(status);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const inTemplates = pathname.startsWith('/preview') || pathname.startsWith('/templates');
  const Icon = k.icon;
  const btn = 'flex h-9 items-center justify-center gap-1.5 rounded-xl px-3.5 text-body-2-medium shadow-xs transition-[background-color,scale] active:scale-[0.98] [&_svg]:size-4';

  return (
    <main className={cn('flex w-full flex-1 items-center justify-center px-6', bare ? 'min-h-dvh bg-background-full py-10 text-text-primary' : 'py-20 sm:py-28')}>
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 flex w-full max-w-[440px] flex-col items-center gap-6 text-center duration-300">
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] leading-none font-semibold tracking-[-0.04em] whitespace-nowrap text-text-primary opacity-[0.05] select-none" aria-hidden>
            {k.code}
          </span>
          <span className={cn('relative grid size-14 place-items-center rounded-2xl shadow-xs', k.tone)}>
            <Icon className="size-6" />
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="rounded-full border border-border-button-default bg-background-primary-default px-2 py-0.5 font-mono text-caption-1-medium text-text-tertiary">Error {k.code}</span>
          <h1 className="text-title-2-semibold tracking-[-0.01em] text-text-primary">{k.title}</h1>
          <p className="max-w-sm text-body-regular text-pretty text-text-secondary">{k.body}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {k.retry ? (
            <button type="button" onClick={() => window.location.reload()} className={cn(btn, 'bg-text-primary text-background-primary-default')}>
              <RotateCw /> Reload
            </button>
          ) : (
            <Link to={inTemplates ? '/templates' : '/responses'} className={cn(btn, 'bg-text-primary text-background-primary-default')}>
              {inTemplates ? <LayoutTemplate /> : <ArrowLeft />} {inTemplates ? 'Every template' : 'Every response'}
            </Link>
          )}
          <button type="button" onClick={() => navigate(-1)} className={cn(btn, 'border border-border-button-default bg-background-primary-default text-text-primary hover:bg-background-primary-hover')}>
            <ArrowLeft /> Go back
          </button>
          {k.retry && (
            <Link to={inTemplates ? '/templates' : '/responses'} className={cn(btn, 'border border-border-button-default bg-background-primary-default text-text-primary hover:bg-background-primary-hover')}>
              {inTemplates ? 'Every template' : 'Every response'}
            </Link>
          )}
        </div>
        {details && <Details text={details} />}
        <p className="font-mono text-caption-2-regular text-text-tertiary">{pathname}</p>
      </div>
    </main>
  );
}

/** Rendered by pages that cannot find what the URL names (inside the root layout, under the navbar). */
export function NotFound() {
  return <ErrorScreen status={404} />;
}

/** errorElement of the root route and of /preview: it replaces the layout, so it brings the navbar itself (except in previews). */
export function RouteError() {
  const error = useRouteError();
  const { pathname } = useLocation();
  const status = isRouteErrorResponse(error) ? error.status : null;
  if (status !== 404) console.error(error);
  const details = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}${error.data ? `\n${typeof error.data === 'string' ? error.data : JSON.stringify(error.data, null, 2)}` : ''}`
    : error instanceof Error
      ? `${error.name}: ${error.message}${error.stack ? `\n\n${error.stack}` : ''}`
      : String(error);
  const bare = pathname.startsWith('/preview');
  return (
    <>
      {!bare && <SiteNav />}
      <ErrorScreen status={status} details={status === 404 ? undefined : details} bare={bare} />
    </>
  );
}
