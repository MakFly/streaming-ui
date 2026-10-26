import { useRef, useState } from 'react';
import { Check, Code2, Copy, Download, Link2, Monitor, Plus, RotateCcw, Smartphone, SlidersHorizontal, Tablet, X } from 'lucide-react';
import { ComposerThreadDemo } from '@/components/composers/composer-thread-demo';
import { DemoStage } from '@/components/demo-stage';
import { PMS } from '@/components/composers/install-button';
import { demos, getDemo } from '@/engine/registry';
import { paths } from '@/lib/paths';
import { useTheme } from '@/providers/theme-provider';
import { cn } from '@/lib/utils';
import { CodeBlock } from '@/templates/kit/markdown';
import { COMPOSER_VARIANTS } from '@/templates/kit/composer-variant';
import { ThinkingStyleScope } from '@/templates/kit/thinking-style';
import { DEVICES, installItems, isOrb, type PlaygroundState } from './state';

/* The /playground canvas, after assistant-ui's UI Builder: a 48px toolbar (devices and width, then New Thread,
 * Share, Code and the primary action), and below it the preview. Tablet and mobile put it in a 20px-radius frame
 * with drag handles on both sides; Code swaps the preview for the files that rebuild it. */

const toolBtn = (on = false) =>
  cn('flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors [&_svg]:size-3.5', on ? 'bg-text-primary/6 text-text-primary' : 'text-text-primary/45 hover:text-text-primary/90');

/** Toolbar labels: shown on phones (no sidebar) and from lg; between md and lg the sidebar leaves the canvas too narrow, so icons only. */
const label = 'hidden sm:max-md:inline lg:inline';

const RESTART = { chat: 'New Thread', template: 'Reload', response: 'Replay' } as const;

const DEVICE_ICON = { desktop: Monitor, tablet: Tablet, mobile: Smartphone } as const;

function usageCode(s: PlaygroundState) {
  const name = `${COMPOSER_VARIANTS.find((v) => v.id === s.composer)!.name}Composer`;
  const orb = isOrb(s.thinking);
  return `import { useState } from 'react';
import { ${name} } from '@/components/composer/variants/${s.composer}';${s.model ? "\nimport { ModelPicker } from '@/components/composer/model-picker';" : ''}${orb ? "\nimport { ThinkingOrb } from '@/components/thinking-orb';" : ''}

export function Chat() {
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);${s.model ? "\n  const [model, setModel] = useState('Fable 5');" : ''}
  return (
    <>
      {busy && ${orb ? `<ThinkingOrb state="${s.thinking}" size={20} />` : '<span>Thinking…</span>'}}
      <${name}
        value={draft}
        onChange={setDraft}
        onSend={(text) => {
          setDraft('');
          setBusy(true); // start your request; setBusy(false) when the answer ends
        }}
        onStop={() => setBusy(false)}
        busy={busy}${s.model ? '\n        model={<ModelPicker value={model} onChange={setModel} />}' : ''}${s.composer === 'box' && s.mentions ? '\n        mentions' : ''}
      />
    </>
  );
}`;
}

function installCode(s: PlaygroundState) {
  const urls = installItems(s).map((i) => `${window.location.origin}/r/${i}.json`);
  return `# Every piece of this combination, from this site's shadcn registry
${PMS[0].run} ${urls.join(' \\\n  ')}

# Then import the tokens once in your global CSS, after Tailwind:
#   @import "./styles/streaming-ui.css";`;
}

function CodeView({ state }: { state: PlaygroundState }) {
  const files = [
    { name: 'chat.tsx', lang: 'tsx', code: usageCode(state) },
    { name: 'install.sh', lang: 'bash', code: installCode(state) },
  ];
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const file = files[tab];
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between px-4">
        <div role="tablist" className="flex items-center gap-1">
          {files.map((f, i) => (
            <button key={f.name} type="button" role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className={cn('cursor-pointer rounded-md px-2 py-1 font-mono text-xs transition-colors', tab === i ? 'bg-text-primary/6 text-text-primary' : 'text-text-primary/45 hover:text-text-primary/90')}>
              {f.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(file.code).catch(() => {});
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1400);
          }}
          className={toolBtn()}
        >
          {copied ? <Check className="text-emerald-500" /> : <Copy />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="scrollbar-thin min-h-0 flex-1 overflow-auto px-4 pb-4">
        <CodeBlock key={file.name} lang={file.lang} code={file.code} className="border-0 bg-transparent" />
      </div>
    </div>
  );
}

/** One side handle: drag to resize the frame symmetrically, as the target does. */
function Handle({ side, width, onResize }: { side: 'left' | 'right'; width: number; onResize: (w: number) => void }) {
  const start = useRef<{ x: number; w: number } | null>(null);
  return (
    <div
      aria-hidden
      className="group hidden w-4 shrink-0 cursor-ew-resize touch-none items-center justify-center md:flex"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        start.current = { x: e.clientX, w: width };
      }}
      onPointerMove={(e) => {
        if (!start.current) return;
        const dx = (e.clientX - start.current.x) * (side === 'right' ? 2 : -2);
        onResize(Math.round(Math.max(320, start.current.w + dx)));
      }}
      onPointerUp={() => (start.current = null)}
    >
      <div className="h-12 w-px bg-text-primary/15 transition-colors group-hover:bg-text-primary/30" />
    </div>
  );
}

function Preview({ state, thread, framed }: { state: PlaygroundState; thread: number; framed: boolean }) {
  if (state.view === 'template') {
    const src = `${paths.templatePreview(state.template)}?${new URLSearchParams({ composer: state.composer, thinking: state.thinking })}`;
    return <iframe key={`${src}#${thread}`} src={src} title="Template preview" className="size-full border-0" />;
  }
  if (state.view === 'response') {
    const demo = getDemo(state.response) ?? demos[0];
    return (
      <div className="scrollbar-thin flex size-full items-center justify-center overflow-auto p-6 max-md:p-2">
        <DemoStage key={`${demo.slug}#${thread}`} demo={demo} frame={false} className="w-full max-w-3xl" />
      </div>
    );
  }
  // A device frame narrower than the window: the kit's breakpoints follow the viewport, so the thread runs in
  // an iframe at the frame's width (as the templates do) to look like it does on that device.
  if (framed) {
    const src = `${paths.composerPreview(state.composer)}?${new URLSearchParams({ thinking: state.thinking, ...(state.model ? { model: '1' } : {}), ...(state.coach ? {} : { tools: '0' }), ...(state.mentions ? { mentions: '1' } : {}) })}`;
    return <iframe key={`${src}#${thread}`} src={src} title="Composer preview" className="size-full border-0" />;
  }
  return (
    <ThinkingStyleScope value={state.thinking}>
      {/* Flat in the frame, like the target's thread: no card radius, hairline or tint of its own; a 44rem column. */}
      <ComposerThreadDemo key={thread} variant={state.composer} modelPicker={state.model} tools={state.coach} mentions={state.mentions} autoplay={false} width="max-w-[44rem]" className="h-full rounded-none! bg-background-full! [--chat-glass:var(--color-background-full)] shadow-none! sm:rounded-none! [&>header]:rounded-none!" />
    </ThinkingStyleScope>
  );
}

export function PlaygroundCanvas({ state, set, onCustomize, customizing }: { state: PlaygroundState; set: (patch: Partial<PlaygroundState>) => void; onCustomize: () => void; customizing: boolean }) {
  const { theme, palette } = useTheme();
  const [thread, setThread] = useState(0);
  const [code, setCode] = useState(false);
  const [shared, setShared] = useState(false);
  const deviceWidth = DEVICES.find((d) => d.id === state.device)!.width;
  const width = state.width ?? deviceWidth;

  const share = () => {
    // The address is the combination; palette and theme are the site's, so the link carries them too.
    const url = new URL(window.location.href);
    url.searchParams.set('palette', palette);
    url.searchParams.set('theme', theme);
    void navigator.clipboard?.writeText(url.toString()).catch(() => {});
    setShared(true);
    window.setTimeout(() => setShared(false), 1400);
  };

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-text-primary/10 px-4">
        <div className="hidden items-center gap-0.5 md:flex">
          {DEVICES.map((d) => {
            const Icon = DEVICE_ICON[d.id];
            return (
              <button key={d.id} type="button" aria-label={d.name} title={d.name} aria-pressed={state.device === d.id} onClick={() => set({ device: d.id, width: null })} className={toolBtn(state.device === d.id)}>
                <Icon /> <span className="hidden lg:inline">{d.name}</span>
              </button>
            );
          })}
          <span className="ms-1.5 text-xs text-text-primary/30 tabular-nums">{width ? `${width}px` : '100%'}</span>
        </div>
        <button type="button" onClick={onCustomize} aria-expanded={customizing} className={cn(toolBtn(customizing), 'md:hidden')}>
          <SlidersHorizontal /> Customize
        </button>
        <div className="flex items-center gap-0.5">
          {/* Starts the preview over: a new chat thread, a reloaded template, a replayed response. */}
          <button type="button" aria-label={RESTART[state.view]} title={RESTART[state.view]} onClick={() => setThread((t) => t + 1)} className={toolBtn()}>
            {state.view === 'chat' ? <Plus /> : <RotateCcw />} <span className={label}>{RESTART[state.view]}</span>
          </button>
          <button type="button" aria-label="Share" onClick={share} title="Copy shareable link" className={toolBtn()}>
            {shared ? <Check className="text-emerald-500" /> : <Link2 />} <span className={label}>{shared ? 'Copied' : 'Share'}</span>
          </button>
          <button type="button" aria-label={code ? 'Close code' : 'Code'} title={code ? 'Close' : 'Code'} onClick={() => setCode((c) => !c)} aria-pressed={code} className={toolBtn()}>
            {code ? <X /> : <Code2 />} <span className={label}>{code ? 'Close' : 'Code'}</span>
          </button>
          <button
            type="button"
            onClick={() => setCode(true)}
            className="ms-1 inline-flex h-7 cursor-pointer items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-transparent bg-background-tertiary-default px-2.5 text-[0.8rem] font-medium whitespace-nowrap text-text-primary transition-colors hover:bg-background-tertiary-hover [&_svg]:size-3.5"
          >
            <Download /> Install
          </button>
        </div>
      </div>

      {code ? (
        <div className="min-h-0 flex-1 bg-text-primary/[0.025]">
          <CodeView state={state} />
        </div>
      ) : (
        // Desktop runs edge to edge; a device width sits on the tinted canvas in its 20px frame.
        <div className={cn('relative min-h-0 flex-1 overflow-hidden', width && 'bg-text-primary/[0.025] px-4 py-4 max-md:px-2 max-md:py-2')}>
          <div className="flex h-full items-stretch justify-center">
            {width && <Handle side="left" width={width} onResize={(w) => set({ width: w })} />}
            <div
              className={cn('relative h-full overflow-hidden bg-background-full max-md:!w-full', width ? 'rounded-[20px] border border-text-primary/10' : 'w-full')}
              style={width ? { width, maxWidth: '100%' } : undefined}
            >
              <Preview state={state} thread={thread} framed={!!width} />
            </div>
            {width && <Handle side="right" width={width} onResize={(w) => set({ width: w })} />}
          </div>
        </div>
      )}
    </div>
  );
}
