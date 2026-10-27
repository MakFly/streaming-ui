import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';

export type DocsSection = { id: string; title: string; lead?: ReactNode; children: ReactNode };

/** The section currently in view, for the "On this page" rail. */
function useActive(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-80px 0px -60% 0px' },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [ids]);
  return active;
}

/** Bordered stage a component demo sits on (BoardUI's component-detail container). */
export function DocsPreview({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex min-h-[327px] items-center justify-center rounded-3xl border border-border-component-detail-container p-8 max-sm:p-4', className)}>{children}</div>;
}

/**
 * One component's page, laid out like BoardUI's component detail: title and description, then titled sections,
 * with an "On this page" rail from xl. Sits inside the docs layout, under its breadcrumb bar.
 */
export function DocsPage({ title, description, actions, sections }: { title: string; description: ReactNode; actions?: ReactNode; sections: DocsSection[] }) {
  const [ids] = useState(() => sections.map((s) => s.id));
  const active = useActive(ids);
  return (
    <div className="flex w-full justify-center gap-12">
      <article className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-col gap-3">
          <h1 className="text-title-1-medium text-text-primary">{title}</h1>
          <p className="text-headline-medium text-text-secondary">{description}</p>
          {actions && <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
        </header>
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className={cn('flex scroll-mt-14 flex-col gap-4', i === 0 ? 'pt-8' : 'pt-10')}>
            <div className="flex flex-col gap-1">
              <h2 id={`${s.id}-title`} className="text-title-2-medium text-text-primary">
                {s.title}
              </h2>
              {s.lead && <p className="text-body-regular text-text-secondary">{s.lead}</p>}
            </div>
            {s.children}
          </section>
        ))}
      </article>
      <aside className="hidden w-[220px] shrink-0 xl:block">
        <div className="sticky top-10 translate-y-0.5">
          <nav aria-label="On this page" className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-body-medium text-text-primary">
              <Icon name="menu-2-line" className="size-4 text-foreground-icon-secondary" />
              On this page
            </p>
            <ul className="flex flex-col border-s border-border-button-default">
              {sections.map((s) => (
                <li key={s.id} className="flex">
                  <a
                    href={`#${s.id}`}
                    aria-current={active === s.id ? 'location' : undefined}
                    className={cn(
                      '-ms-px border-s-2 py-1.5 ps-4 text-body-medium transition-colors duration-150 ease',
                      active === s.id ? 'border-text-primary text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary',
                    )}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  );
}
