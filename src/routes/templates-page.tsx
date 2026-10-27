import { useEffect } from 'react';
import { TEMPLATES, applyHead } from '@/seo/routes';
import { Link } from 'react-router';
import { Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { PageShell } from '@/components/page-shell';
import { ScaledFrame } from '@/components/scaled-frame';
import { templates, type TemplateMeta } from '@/templates/registry';
import { paths } from '@/lib/paths';
import { ThinkingChoice } from '@/templates/kit/thinking-style';
import { cn } from '@/lib/utils';

export function TemplateCard({ t, featured }: { t: TemplateMeta; featured?: boolean }) {
  return (
    <article className={cn('flex flex-col gap-4', featured && 'lg:col-span-2')}>
      <div className="overflow-hidden rounded-[20px] border border-border-button-default bg-background-primary-default p-1.5 shadow-xs transition-shadow hover:shadow-card">
        <div className="flex items-center gap-1.5 px-2 pt-0.5 pb-1.5">
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} className="size-2.5 rounded-full opacity-80" style={{ backgroundColor: c }} />
          ))}
          <span className="ms-2 truncate font-mono text-caption-2-regular text-text-tertiary">{paths.templatePreview(t.slug)}</span>
          <span className="ms-auto flex items-center gap-1 text-caption-2-regular text-text-tertiary">
            <span className="size-1.5 animate-pulse rounded-full bg-[#16a34a]" /> Live · try it
          </span>
        </div>
        {/* Interactive: the thumbnail is the real app, scaled — click, type and send right here. */}
        <ScaledFrame interactive src={paths.templatePreview(t.slug)} title={`${t.name} template preview`} className="rounded-[14px] border border-border-component-detail-container bg-background-full" />
      </div>
      <div className="flex flex-wrap items-start gap-x-4 gap-y-3 px-1">
        <div className="flex min-w-0 flex-1 basis-64 flex-col gap-1">
          <h2 className="flex items-center gap-2 text-headline-semibold text-text-primary">
            <Link to={paths.template(t.slug)} className="rounded-sm outline-none hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-border-focus-ring">
              {t.name}
            </Link>
            <span className="text-body-2-regular text-text-tertiary">{t.tagline}</span>
          </h2>
          <p className="text-body-2-regular text-text-secondary">{t.description}</p>
          <ul className="flex flex-wrap gap-1.5 pt-1">
            {t.tags.map((tag) => (
              <li key={tag} className="rounded-md bg-background-tertiary-default px-1.5 py-0.5 text-caption-1-medium text-text-secondary">
                {tag}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild>
            <Link to={paths.templatePrompt(t.slug)}>
              <Icon name="markdown-line" className="size-4" />
              <span className="px-0.5">Prompt</span>
            </Link>
          </Button>
          <Button asChild className="gap-1.5 px-2.5">
            <Link to={paths.templatePreview(t.slug)} target="_blank" rel="noreferrer">
              <Maximize2 className="size-4" /> Live preview
            </Link>
          </Button>
          <Button asChild variant="primary" className="px-3">
            <Link to={paths.template(t.slug)}>Open</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

/** `/templates` — every chat template, each thumbnail a live, playing preview. */
export function TemplatesPage() {
  useEffect(() => {
    applyHead(TEMPLATES);
  }, []);
  return (
    <PageShell width="wide">
      <header className="flex flex-col items-start gap-3 pb-4">
        <p className="font-mono text-caption-1-medium tracking-[0.12em] text-text-tertiary uppercase">Templates</p>
        <h1 className="text-display-4-semibold tracking-[-0.02em] text-text-primary">AI chat templates, playing live</h1>
        <p className="max-w-[680px] text-headline-regular text-text-secondary">
          Whole chat apps built from the streaming components: each one plays a real conversation, then answers what you type. Open one full screen, switch
          devices, or copy the prompt that rebuilds it.
        </p>
        <ThinkingChoice />
      </header>
      <div className="grid grid-cols-1 gap-x-8 gap-y-14 pt-6 lg:grid-cols-2">
        {templates.map((t, i) => (
          <TemplateCard key={t.slug} t={t} featured={i === 0} />
        ))}
      </div>
    </PageShell>
  );
}
