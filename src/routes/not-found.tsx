import { useEffect, useRef, useState } from 'react';
import { Link, isRouteErrorResponse, useLocation, useNavigate, useRouteError } from 'react-router';
import { ArrowLeft, Check, ChevronDown, Copy, FileQuestion, RefreshCw, RotateCw, ServerCrash, ShieldX, TriangleAlert } from 'lucide-react';
import { SiteNav } from '@/components/site-nav';
import { cn } from '@/lib/utils';
import { applyHead } from '@/seo/routes';

/* One error screen for every failure: 404, 401/403, other 4xx, 5xx or a crash while rendering, and the stale-module
 * case (the code changed while the tab was open). Inside the site it sits under the navbar; on /preview (template
 * iframes and Live preview) it stands alone. */

type Kind = { code: string; title: string; body: string; icon: typeof FileQuestion; tone: string; retry: boolean };

/** A lazy page whose module changed or vanished since the tab loaded it (a deploy, or a dev-server edit): a reload fixes it. */
const STALE = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|does not provide an export named|ChunkLoadError|Loading chunk \S+ failed/i;

function describe(status: number | null, stale: boolean): Kind {
  if (status === 404) return { code: '404', title: 'Page not found', body: 'This page, response or template does not exist. It may have been renamed or moved.', icon: FileQuestion, tone: 'text-text-secondary bg-background-tertiary-default', retry: false };
  if (status === 401 || status === 403) return { code: String(status), title: 'Access denied', body: 'You do not have access to this page. Sign in with another account or ask for access.', icon: ShieldX, tone: 'text-amber-700 bg-amber-500/10 dark:text-amber-400', retry: false };
  if (status && status >= 400 && status < 500) return { code: String(status), title: 'This request could not be handled', body: 'Something about the address or the request is off. Check the link and try again.', icon: TriangleAlert, tone: 'text-amber-700 bg-amber-500/10 dark:text-amber-400', retry: true };
  if (stale) return { code: status ? String(status) : '500', title: 'This page was updated', body: 'A newer version of the code arrived while the tab was open, and this page could not load the old one. Reload to pick it up.', icon: RefreshCw, tone: 'text-blue-700 bg-blue-500/10 dark:text-blue-400', retry: true };
  return { code: status ? String(status) : '500', title: 'This page stopped working', body: 'An error stopped it from rendering. Reload to try again; if it keeps happening, copy the error below and share it with the address.', icon: ServerCrash, tone: 'text-red-700 bg-red-500/10 dark:text-red-400', retry: true };
}

/** The error itself, readable at a glance: its message up front, the stack behind a toggle, the code and address in
 *  the footer. One copy button takes all of it. */
function Details({ summary, stack, code, pathname }: { summary: string; stack?: string; code: string; pathname: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const all = `${summary}${stack ? `\n\n${stack}` : ''}\n\n${code} · ${pathname}`;
  return (
    <section aria-label="Error details" className="w-full overflow-hidden rounded-2xl border border-border-button-default bg-background-primary-default text-start shadow-xs">
      <div className="flex items-start gap-2 py-2.5 ps-4 pe-2">
        <code className="min-w-0 flex-1 py-1 font-mono text-[13px] leading-5 break-words text-text-primary">{summary}</code>
        <button
          type="button"
          aria-label={copied ? 'Copied' : 'Copy the error'}
          title={copied ? 'Copied' : 'Copy the error'}
          onClick={() => {
            void navigator.clipboard?.writeText(all).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          }}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-foreground-icon-secondary outline-none transition-colors hover:bg-background-tertiary-default hover:text-foreground-icon-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </button>
      </div>
      {stack && open && (
        <pre className="scrollbar-thin max-h-56 overflow-auto border-t border-separator-border bg-background-secondary-default px-4 py-2.5 font-mono text-[12px] leading-5 whitespace-pre-wrap text-text-primary/75">{stack}</pre>
      )}
      <div className="flex items-center gap-3 border-t border-separator-border px-4 py-2 font-mono text-caption-1-regular text-text-primary/70">
        <span className="min-w-0 flex-1 truncate">
          {code} · {pathname}
        </span>
        {stack && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="-me-1 flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 font-sans text-caption-1-medium text-text-primary/80 outline-none transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring"
          >
            Stack trace <ChevronDown className={cn('size-3.5 transition-transform duration-200 motion-reduce:transition-none', !open && '-rotate-90')} />
          </button>
        )}
      </div>
    </section>
  );
}

export function ErrorScreen({ status, error, bare }: { status: number | null; error?: { summary: string; stack?: string }; bare?: boolean }) {
  const stale = !!error && STALE.test(error.summary);
  const k = describe(status, stale);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const inTemplates = pathname.startsWith('/preview') || pathname.startsWith('/templates');
  // Inside a preview iframe, leaving goes to the whole window: the site must not open inside the frame.
  const framed = typeof window !== 'undefined' && window.top !== window.self;
  const [canGoBack] = useState(() => typeof window !== 'undefined' && (window.history.state?.idx ?? 0) > 0);
  const Icon = k.icon;
  const heading = useRef<HTMLHeadingElement>(null);
  const btn =
    'flex h-9 items-center justify-center gap-1.5 rounded-xl px-3.5 text-body-2-medium shadow-xs outline-none transition-[background-color,scale] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background-full [&_svg]:size-4';
  const secondary = cn(btn, 'border border-border-button-default bg-background-primary-default text-text-primary hover:bg-background-primary-hover');
  const primary = cn(btn, 'bg-text-primary text-background-primary-default hover:opacity-90');
  const home = inTemplates ? { to: '/templates', label: 'Every template' } : { to: '/responses', label: 'Every response' };

  useEffect(() => {
    applyHead({ title: `${k.title} · Streaming UI`, description: k.body, path: pathname, robots: 'noindex, nofollow' });
  }, [k.title, k.body, pathname]);
  // The screen replaced the page: move focus to its title so it is announced and keyboard users start from it.
  useEffect(() => heading.current?.focus({ preventScroll: true }), []);

  return (
    <main className={cn('flex w-full flex-1 items-center justify-center px-6', bare ? 'min-h-dvh bg-background-full py-10 text-text-primary' : 'py-20 sm:py-28')}>
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 flex w-full max-w-[480px] flex-col items-center gap-6 text-center duration-300 motion-reduce:animate-none">
        <span className={cn('grid size-12 place-items-center rounded-2xl', k.tone)}>
          <Icon className="size-6" aria-hidden />
        </span>
        <div className="flex flex-col items-center gap-2">
          <h1 ref={heading} tabIndex={-1} className="text-title-2-semibold tracking-[-0.01em] text-balance text-text-primary outline-none">
            {k.title}
          </h1>
          <p className="max-w-[44ch] text-body-regular text-pretty text-text-primary/75">
            {k.body}
            {!error && (
              <>
                {' '}
                <span className="font-mono text-[13px] break-all text-text-primary/75">{pathname}</span>
              </>
            )}
          </p>
        </div>
        {error && <Details summary={error.summary} stack={error.stack} code={k.code} pathname={pathname} />}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {k.retry ? (
            <button type="button" onClick={() => window.location.reload()} className={primary}>
              <RotateCw /> Reload
            </button>
          ) : (
            <Link to={home.to} target={framed ? '_top' : undefined} className={primary}>
              {home.label}
            </Link>
          )}
          {canGoBack && (
            <button type="button" onClick={() => navigate(-1)} className={secondary}>
              <ArrowLeft /> Go back
            </button>
          )}
          {k.retry && (
            <Link
              to={home.to}
              target={framed ? '_top' : undefined}
              className="rounded-md px-2 py-2 text-body-2-medium text-text-primary/80 underline decoration-text-primary/30 underline-offset-4 outline-none transition-colors hover:text-text-primary hover:decoration-text-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring"
            >
              {home.label}
            </Link>
          )}
        </div>
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
    ? { summary: `${error.status} ${error.statusText}`.trim(), stack: error.data ? (typeof error.data === 'string' ? error.data : JSON.stringify(error.data, null, 2)) : undefined }
    : error instanceof Error
      ? // The stack repeats the message on its first line: keep only the frames under it.
        { summary: `${error.name}: ${error.message}`, stack: error.stack?.split('\n').slice(error.stack.startsWith(`${error.name}`) ? 1 : 0).join('\n').trim() || undefined }
      : { summary: String(error) };
  const bare = pathname.startsWith('/preview');
  return (
    <>
      {!bare && <SiteNav />}
      <ErrorScreen status={status} error={status === 404 ? undefined : details} bare={bare} />
    </>
  );
}
