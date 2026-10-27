import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Logo } from '@/components/logo';
import { DemoPreview } from '@/components/landing/demo-preview';
import { DemoStage } from '@/components/demo-stage';
import { ComposerPlayground } from '@/components/landing/composer-playground';
import { ScaledFrame } from '@/components/scaled-frame';
import { PROMPT_POINTS, PromptSample } from '@/components/prompt-sample';
import { templates } from '@/templates/registry';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { demos, getDemo, libraries } from '@/engine/registry';
import type { Demo } from '@/engine/types';
import { paths } from '@/lib/paths';
import { HOME, applyHead } from '@/seo/routes';
import { cn } from '@/lib/utils';

const pick = (slugs: string[]) => slugs.map(getDemo).filter((d): d is Demo => Boolean(d));

const SHOWCASE = pick(['agent-web-search', 'agent-task-list', 'agent-agent-progress', 'stream-streaming-response', 'transitions-banner-stacking']);
const TILES = pick([
  'stream-reasoning-text',
  'chat-thinking-state',
  'assist-reasoning-tool',
  'motion-text-shimmer-wave',
  'dots-dots-loaders',
  'research-research-timeline',
  'transitions-skeleton-loader-and-reveal',
  'tool-cards-plan',
]);
const COMPOSER = getDemo('agent-composer-loader');
const STACK = ['React 19', 'Vite 7', 'Tailwind CSS v4', 'shadcn/ui', 'React Router 7'];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-caption-1-medium tracking-[0.12em] text-text-tertiary uppercase">{children}</p>;
}

function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center gap-3 text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-display-4-semibold tracking-[-0.02em] text-balance text-text-primary sm:text-display-3-semibold">{title}</h2>
      {children && <p className="text-headline-regular text-balance text-text-secondary">{children}</p>}
    </div>
  );
}

/** Hero window: a live response with registry-style chrome (breadcrumb, registry handle, tabs). */
function Showcase() {
  const [active, setActive] = useState(SHOWCASE[0]);
  return (
    <div className="rounded-[28px] border border-border-button-default bg-background-primary-default p-1.5 shadow-card">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <div className="flex min-w-0 items-center gap-1.5 text-caption-1-medium text-text-tertiary">
          <span className="hidden sm:inline">Responses</span>
          <span className="hidden sm:inline">/</span>
          <span>{active.group}</span>
          <span>/</span>
          <span className="truncate text-text-primary">{active.title}</span>
        </div>
        <code className="hidden rounded-md bg-background-tertiary-default px-1.5 py-0.5 font-mono text-caption-2-regular text-text-secondary md:inline">@{active.library.slug}/{active.slug.replace(`${active.library.slug}-`, '')}</code>
        <div className="ms-auto flex items-center gap-1.5">
          <Button asChild size="sm">
            <Link to={paths.demoPrompt(active.slug)}>
              <Icon name="markdown-line" className="size-4" />
              <span className="px-0.5">Prompt</span>
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to={paths.demo(active.slug)}>
              <span className="px-0.5">Open</span>
              <Icon name="arrow-right-up-line" className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="scrollbar-none flex gap-1.5 overflow-x-auto px-3 pb-2" role="tablist" aria-label="Featured responses">
        {SHOWCASE.map((d) => {
          const on = d.slug === active.slug;
          return (
            <button
              key={d.slug}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(d)}
              className={cn(
                'inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-body-2-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring',
                on ? 'border-transparent bg-text-primary text-background-primary-default' : 'border-border-button-default text-text-secondary hover:bg-background-primary-hover',
              )}
            >
              {d.title}
              <span className="text-caption-2-regular opacity-60">{d.group}</span>
            </button>
          );
        })}
      </div>
      <div className="overflow-hidden rounded-[22px] border border-border-component-detail-container bg-background-full" role="tabpanel">
        {/* key: switching tab mounts a fresh stage */}
        <DemoStage key={active.slug} demo={active} frame={false} className="min-h-[540px] sm:min-h-[580px]" />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="landing-dots absolute inset-0 -z-10" />
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-4 pt-16 pb-14 text-center sm:px-6 sm:pt-24">
        <Link
          to={paths.gallery('transitions')}
          className="inline-flex items-center gap-2 rounded-full border border-border-button-default bg-background-primary-default py-1 ps-1 pe-3 text-body-2-medium text-text-secondary shadow-xs transition-colors hover:text-text-primary"
        >
          <Badge variant="new">New</Badge>
          10 transition scenes, staged as real replies
          <Icon name="arrow-right-s-line" className="size-4" />
        </Link>
        <h1 className="max-w-[900px] text-[40px] leading-[1.08] font-semibold tracking-[-0.035em] text-balance text-text-primary sm:text-[64px]">
          Every way an AI response can <span className="landing-shimmer">arrive</span>
        </h1>
        <p className="max-w-[620px] text-title-3-regular text-balance text-text-secondary">
          {demos.length} streaming, thinking and agent states in {libraries.length} collections, each in its own theme. Watch them play, then
          copy a prompt that rebuilds any of them 1:1.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="primary" className="h-10 rounded-xl px-4 text-body-semibold">
            <Link to={paths.gallery()}>
              Browse {demos.length} responses
              <Icon name="arrow-right-s-line" className="size-4" />
            </Link>
          </Button>
          <Button asChild className="h-10 rounded-xl px-4">
            <Link to={paths.galleryPrompt('agent-web-search')}>
              <Icon name="markdown-line" className="size-4" />
              <span className="px-0.5">See a rebuild prompt</span>
            </Link>
          </Button>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-body-2-medium text-text-tertiary" aria-label="Built with">
          {STACK.map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-accent-500" />
              {s}
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto max-w-[1200px] px-4 pb-20 sm:px-6">
        <Showcase />
      </div>
    </section>
  );
}

/** Collection index: every collection with its count, each one a filtered gallery. */
function Libraries() {
  return (
    <section id="libraries" className="scroll-mt-20 border-t border-separator-border py-20">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 sm:px-6">
        <SectionTitle eyebrow="Collections" title={<>{demos.length} responses across {libraries.length} collections</>}>
          Each collection renders in its own theme, so the differences stay visible.
        </SectionTitle>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {libraries.map((l) => (
            <li key={l.slug}>
              <Link
                to={paths.gallery(l.slug)}
                className="group flex h-12 items-center gap-3 rounded-xl border border-border-button-default bg-background-primary-default px-4 transition-colors hover:border-border-button-hover hover:bg-background-primary-hover"
              >
                <span className="text-body-medium text-text-primary">{l.name}</span>
                <span className="rounded-full bg-background-tertiary-default px-1.5 text-caption-1-medium tabular-nums text-text-secondary">{l.count}</span>
                <Icon name="arrow-right-s-line" className="ms-auto size-4 text-foreground-icon-tertiary transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Catalogue: live thumbnails with a name and one line each. */
function Tiles() {
  return (
    <section className="border-t border-separator-border bg-background-secondary-default py-20">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 sm:px-6">
        <div className="flex flex-col items-center gap-5">
          <p className="font-mono text-body-2-regular text-accent-500">
            npx shadcn@latest add @stream/streaming-response<span className="sui-caret">|</span>
          </p>
          <SectionTitle eyebrow="Catalogue" title="Thinking, streaming, tools and agents">
            Reasoning blocks, shimmering status lines, tool calls, skeletons, dot-grid loaders and full agent timelines, all playing live.
          </SectionTitle>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="primary" className="px-3">
              <Link to={paths.gallery()}>Browse all responses</Link>
            </Button>
            <Button asChild className="px-3">
              <Link to={`${paths.gallery()}?view=list`}>Open the list view</Link>
            </Button>
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map((d) => (
            // Demos simulate clicks inside their stage, so the preview must not sit inside the <Link>:
            // a stretched link (after:inset-0) makes the whole tile clickable instead.
            <li key={d.slug} className="group relative flex flex-col gap-3">
              <DemoPreview
                demo={d}
                scale={0.62}
                className="h-[220px] rounded-2xl border border-border-component-detail-container bg-background-full transition-shadow group-hover:shadow-card"
              />
              <div className="flex flex-col gap-0.5 px-0.5">
                <Link
                  to={paths.demo(d.slug)}
                  className="flex items-center gap-2 rounded-sm text-body-medium text-text-primary outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-border-focus-ring"
                >
                  {d.title}
                  <span className="text-caption-1-regular text-text-tertiary">{d.group}</span>
                </Link>
                <span className="line-clamp-2 text-body-2-regular text-text-secondary">{d.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** "Whole apps" band: live template thumbnails. */
function Templates() {
  return (
    <section id="templates" className="scroll-mt-20 border-t border-separator-border py-20">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 sm:px-6">
        <SectionTitle eyebrow="Chat templates" title="Whole chats, not just components">
          {templates.length} complete AI chat apps built from the same pieces. Each preview below is live: it plays a real conversation and answers what you type.
        </SectionTitle>
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {templates.slice(0, 3).map((t) => (
            <li key={t.slug} className="group relative flex flex-col gap-3">
              <ScaledFrame
                src={paths.templatePreview(t.slug)}
                title={`${t.name} template preview`}
                className="rounded-2xl border border-border-button-default bg-background-full shadow-xs transition-shadow group-hover:shadow-card"
              />
              <Link to={paths.template(t.slug)} className="flex flex-col gap-0.5 px-0.5 outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-border-focus-ring">
                <span className="text-body-medium text-text-primary">{t.name}</span>
                <span className="text-body-2-regular text-text-secondary">{t.tagline}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex justify-center gap-3">
          <Button asChild variant="primary" className="px-3">
            <Link to={paths.templates()}>Browse all {templates.length} templates</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Prompts() {
  return (
    <section id="prompts" className="scroll-mt-20 border-t border-separator-border py-20">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col items-start gap-5">
          <Eyebrow>Rebuild prompt</Eyebrow>
          <h2 className="text-display-4-semibold tracking-[-0.02em] text-text-primary sm:text-display-3-semibold">One prompt per response, rebuilt 1:1</h2>
          <p className="text-headline-regular text-text-secondary">
            Every card has a Prompt button. It assembles a Markdown brief an agent can follow without guessing, so the copy comes out identical instead of
            inspired.
          </p>
          <ul className="flex flex-col gap-2.5">
            {PROMPT_POINTS.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-body-regular text-text-primary">
                <span className="grid size-5 place-items-center rounded-full bg-badge-new-background text-badge-new-text">
                  <Icon name="check-line" className="size-3.5" />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <Button asChild variant="primary" className="px-3">
            <Link to={paths.galleryPrompt('stream-streaming-response')}>Open a prompt</Link>
          </Button>
        </div>
        <PromptSample />
      </div>
    </section>
  );
}

function ComposerShowcase() {
  if (!COMPOSER) return null;
  return (
    <section className="border-t border-separator-border py-20">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-10 px-4 sm:px-6">
        <SectionTitle eyebrow="Agent · Composer Loader" title="A composer that stays out of the way">
          While the agent works, Agent Thinking sits above the composer and Send turns into Stop. Type, send, stop: it is a real composer.
        </SectionTitle>
        <Button asChild variant="primary" className="px-3">
          <Link to={paths.demo(COMPOSER.slug)}>Open Composer Loader</Link>
        </Button>
        <div className="w-full max-w-[760px]">
          <ComposerPlayground />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-separator-border">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-2">
          <Logo className="size-6" />
          <span className="text-body-semibold text-text-primary">Streaming UI</span>
        </div>
        <p className="text-body-2-regular text-text-tertiary">
          Thinking, streaming and agent states, rebuilt as live React components. Free and open source,{' '}
          <a href="https://github.com/MakFly/streaming-ui/blob/main/LICENSE" className="underline underline-offset-2 hover:text-text-primary">MIT license</a>.
        </p>
        <nav aria-label="Footer" className="flex gap-4 sm:ms-auto">
          <Link to={paths.gallery()} className="text-body-2-medium text-text-secondary hover:text-text-primary">Responses</Link>
          <Link to={paths.collections()} className="text-body-2-medium text-text-secondary hover:text-text-primary">Collections</Link>
          <Link to={paths.prompts()} className="text-body-2-medium text-text-secondary hover:text-text-primary">Prompts</Link>
        </nav>
      </div>
    </footer>
  );
}

/** `/` — the landing: hero + live showcase, collection index, catalogue, prompts, composer, footer. */
export function LandingPage() {
  const { hash } = useLocation();

  useEffect(() => {
    applyHead(HOME);
  }, []);

  // In-page anchors (/#libraries, /#prompts): the router does not scroll to hashes on its own.
  useEffect(() => {
    if (!hash) return;
    const id = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    return () => clearTimeout(id);
  }, [hash]);

  return (
    <div className="min-h-full">
      <main>
        <Hero />
        <Libraries />
        <Tiles />
        <Templates />
        <Prompts />
        <ComposerShowcase />
      </main>
      <Footer />
    </div>
  );
}
