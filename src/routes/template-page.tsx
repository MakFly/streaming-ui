import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Code, Copy, Download, ExternalLink, Eye, FileText, Maximize2, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BrowserFrame, type Device } from '@/components/browser-frame';
import { getTemplate, templates } from '@/templates/registry';
import { paths } from '@/lib/paths';
import { NotFound } from '@/routes/not-found';

const TemplateCode = lazy(() => import('@/components/template-code'));
const buildPrompt = async (slug: string) => (await import('@/templates/prompt')).buildTemplatePrompt(getTemplate(slug)!);

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

/**
 * `/templates/:slug` — the template page: title, Preview / Code, device switcher, Live preview
 * (the bare template, full window, same tab — its Back button returns here), Copy prompt with more options, then a playable browser-framed preview.
 */
export function TemplatePage() {
  const { slug } = useParams();
  const t = getTemplate(slug);
  const navigate = useNavigate();
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [device, setDevice] = useState<Device>('desktop');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (t) document.title = `${t.name} · Chat templates`;
    setTab('preview');
  }, [t]);

  if (!t) return <NotFound />;
  const i = templates.indexOf(t);
  const prev = templates[i - 1];
  const next = templates[i + 1];

  const copyPrompt = async () => {
    await copyText(await buildPrompt(t.slug));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const download = async () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([await buildPrompt(t.slug)], { type: 'text/markdown' }));
    a.download = `${t.slug}.template.prompt.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col px-6 pt-10 pb-16 sm:px-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-caption-1-medium text-text-tertiary">
        <Link to="/" className="hover:text-text-primary">Streaming</Link>
        <span>›</span>
        <Link to={paths.templates()} className="hover:text-text-primary">Templates</Link>
        <span>›</span>
        <span className="text-text-secondary">{t.name}</span>
      </nav>

      <header className="mt-6 flex flex-col gap-3">
        <h1 className="text-title-1-semibold text-text-primary">{t.name}</h1>
        <p className="max-w-[820px] text-headline-regular text-text-secondary">{t.description}</p>
      </header>

      {/* Toolbar — view tabs, device switcher, live preview and the prompt */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <ToggleGroup type="single" value={tab} onValueChange={(v) => v && setTab(v as 'preview' | 'code')} aria-label="View">
          <ToggleGroupItem value="preview"><Eye className="size-4" /> Preview</ToggleGroupItem>
          <ToggleGroupItem value="code"><Code className="size-4" /> Code</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="single" value={device} onValueChange={(v) => v && setDevice(v as Device)} aria-label="Device" className={tab === 'code' ? 'pointer-events-none opacity-40' : ''}>
          <ToggleGroupItem value="desktop"><Monitor className="size-4" /> <span className="hidden sm:inline">Desktop</span></ToggleGroupItem>
          <ToggleGroupItem value="tablet"><Tablet className="size-4" /> <span className="hidden sm:inline">Tablet</span></ToggleGroupItem>
          <ToggleGroupItem value="mobile"><Smartphone className="size-4" /> <span className="hidden sm:inline">Mobile</span></ToggleGroupItem>
        </ToggleGroup>
        {/* Same tab: the preview's Back button (or Esc) returns here. */}
        <Button asChild className="h-9 gap-1.5 px-3">
          <Link to={paths.templatePreview(t.slug)}>
            <Maximize2 className="size-4" /> Live preview
          </Link>
        </Button>
        <div className="flex">
          <Button className="h-9 gap-1.5 rounded-e-none px-3" onClick={copyPrompt}>
            {copied ? <Check className="size-4 text-[#16a34a]" /> : <Copy className="size-4" />}
            <span aria-live="polite">{copied ? 'Copied' : 'Copy prompt'}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-9 rounded-s-none border-s-0 px-2" aria-label="More prompt options">
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => navigate(paths.templatePrompt(t.slug), { preventScrollReset: true })}>
                <FileText /> View prompt
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={download}>
                <Download /> Download .md
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={paths.templatePreview(t.slug)} target="_blank" rel="noreferrer">
                  <ExternalLink /> Open in a new tab
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-4">
        {tab === 'preview' ? (
          <BrowserFrame src={paths.templatePreview(t.slug)} title={t.name} device={device} height={760} />
        ) : (
          <Suspense fallback={<div className="h-[760px] rounded-[22px] border border-border-button-default bg-docs-code-background" />}>
            <TemplateCode file={t.file} />
          </Suspense>
        )}
      </div>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="text-title-3-semibold text-text-primary">Try it</h2>
        <p className="text-body-regular text-text-secondary">
          The preview is a real app. Wait for the opening conversation or interrupt it with Stop, then send your own message. These show off each template:
        </p>
        <ul className="flex flex-wrap gap-2">
          {t.tryIt.map((q) => (
            <li key={q} className="rounded-full border border-border-button-default bg-background-primary-default px-3 py-1.5 text-body-2-medium text-text-secondary shadow-xs">
              “{q}”
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="text-title-3-semibold text-text-primary">What’s included</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {t.features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border-button-default bg-background-primary-default p-4">
              <p className="text-body-medium text-text-primary">{f.title}</p>
              <p className="mt-1 text-body-2-regular text-text-secondary">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <nav aria-label="More templates" className="mt-14 grid grid-cols-2 gap-3">
        {prev ? (
          <Link to={paths.template(prev.slug)} className="flex flex-col gap-1 rounded-2xl border border-border-button-default bg-background-primary-default px-4 py-3 shadow-xs hover:bg-background-primary-hover">
            <span className="flex items-center gap-1 text-caption-1-medium text-text-tertiary"><ChevronLeft className="size-3.5" /> Previous</span>
            <span className="text-body-medium text-text-primary">{prev.name}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link to={paths.template(next.slug)} className="flex flex-col items-end gap-1 rounded-2xl border border-border-button-default bg-background-primary-default px-4 py-3 text-end shadow-xs hover:bg-background-primary-hover">
            <span className="flex items-center gap-1 text-caption-1-medium text-text-tertiary">Next <ChevronRight className="size-3.5" /></span>
            <span className="text-body-medium text-text-primary">{next.name}</span>
          </Link>
        ) : <span />}
      </nav>
      <Outlet />
    </div>
  );
}
