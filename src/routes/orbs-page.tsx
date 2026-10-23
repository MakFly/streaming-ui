import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { ThinkingOrb, type OrbSize, type OrbState } from '@/components/thinking-orb';
import { OrbStatus } from '@/components/thinking-orb/orb-status';
import { InstallButton } from '@/components/composers/install-button';
import { ORBS, applyHead } from '@/seo/routes';

/* `/orbs`: the thinking orbs of Jakub Antalik (libraries.dev/orbs, MIT), installable from our registry as
 * `thinking-orb` and `orb-status`. The nine-state showcase, then a playground to pick a state and a size.
 * Layout, surfaces and the label shimmer are measured on libraries.dev/orbs. */

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const HERO_PILLS: { state: OrbState; label: string }[] = [
  { state: 'solving', label: 'Solving….' },
  { state: 'composing', label: 'Thinking….' },
];

// Row-major auto-placement over 151px rows: this order of 1- and 2-row spans tiles five rows with no gap.
const GRID_STATES: OrbState[] = ['listening', 'working', 'searching', 'connecting', 'weaving', 'breathing', 'shaping'];
const LARGE = new Set<OrbState>(['working', 'searching', 'connecting']);
const COPY: Partial<Record<OrbState, string>> = { weaving: 'planning', breathing: 'thinking', connecting: 'solving' };

const STATES: OrbState[] = ['working', 'searching', 'solving', 'listening', 'connecting', 'composing', 'breathing', 'weaving', 'shaping'];
const SIZES: OrbSize[] = [64, 20, 32];

function Showcase() {
  const cell = 'flex items-center justify-center overflow-hidden rounded-2xl bg-(--orbs-cell) max-[860px]:min-h-[200px]';
  return (
    <section aria-label="States" className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 max-[860px]:grid-cols-1">
        {HERO_PILLS.map((p) => (
          <div key={p.state} className={`${cell} h-[314px] px-10 py-12 max-[860px]:h-auto`}>
            <OrbStatus state={p.state} label={p.label} variant="pill" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 auto-rows-[151px] gap-3 max-[860px]:auto-rows-auto max-[860px]:grid-cols-1">
        {GRID_STATES.map((state) => {
          const large = LARGE.has(state);
          const copy = COPY[state] ?? state;
          return (
            <div key={state} className={`${cell} p-8 ${large ? 'row-span-2' : ''} max-[860px]:row-auto`}>
              <OrbStatus state={state} label={large ? `${cap(copy)}….` : `Agent ${copy}…`} variant={large ? 'pill' : 'chip'} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Choice<T extends string | number>({ label, options, value, onChange, format }: { label: string; options: T[]; value: T; onChange: (v: T) => void; format: (v: T) => string }) {
  return (
    <div className="flex flex-col gap-2">
      <span id={`orbs-${label}`} className="text-body-2-regular leading-[14px] text-(--orbs-label)">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={`orbs-${label}`} className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={o === value} onClick={() => onChange(o)} className="orbs-tab text-body-2-medium leading-4">
            {format(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

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

function Snippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <div className="relative rounded-2xl bg-(--orbs-stage) p-5 pe-14">
      <pre className="scrollbar-none overflow-x-auto font-mono text-caption-1-regular leading-6 text-text-primary">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        aria-label="Copy playground snippet"
        onClick={() => void copyText(code).then(() => setCopied(true))}
        className="absolute end-3 top-3 grid size-8 place-items-center rounded-lg text-text-tertiary transition-colors hover:bg-background-tertiary-default hover:text-text-primary"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}

function Playground() {
  const [state, setState] = useState<OrbState>('listening');
  const [size, setSize] = useState<OrbSize>(64);
  const [playing, setPlaying] = useState(false);
  // The path `shadcn add …/r/thinking-orb.json` installs to, not the upstream npm package name.
  const code = `import { ThinkingOrb } from '@/components/thinking-orb';\n\n<ThinkingOrb state="${state}" size={${size}} />`;
  return (
    <section aria-labelledby="orbs-playground" className="flex flex-col gap-3">
      <p id="orbs-playground" className="text-body-2-medium leading-[14px] text-(--orbs-title)">
        Playground
      </p>
      <div className="grid grid-cols-[minmax(0,1fr)_244px] gap-3 max-[860px]:grid-cols-1">
        <div className="relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-2xl bg-(--orbs-stage) min-[861px]:h-[586px]">
          <ThinkingOrb state={state} size={size} paused={!playing} />
          <button type="button" onClick={() => setPlaying((p) => !p)} aria-pressed={playing} className="orbs-play absolute bottom-5 left-1/2 z-[5] -translate-x-1/2 text-body-2-medium leading-4">
            {playing ? 'Pause' : 'Play'}
          </button>
        </div>
        <div className="orbs-panel flex flex-col gap-4 self-start rounded-2xl p-4">
          <Choice label="State" options={STATES} value={state} onChange={setState} format={cap} />
          <Choice label="Size" options={SIZES} value={size} onChange={setSize} format={(s) => `${s}px`} />
        </div>
      </div>
      <Snippet code={code} />
    </section>
  );
}

const link = 'text-text-primary underline decoration-text-tertiary underline-offset-2 transition-colors hover:decoration-text-primary';

/** Who made the orbs. Shown on the page, not only in the notices: the design and the engine are theirs. */
function Credits() {
  return (
    <section aria-labelledby="orbs-credits" className="flex flex-col gap-2 rounded-2xl border border-border-button-default p-5">
      <h2 id="orbs-credits" className="text-headline-semibold text-text-primary">
        Credits
      </h2>
      <p className="text-body-regular text-text-secondary">
        The thinking orbs are designed and built by{' '}
        <a href="https://x.com/jakubantalik" className={link}>
          Jakub Antalik
        </a>
        , made with help from{' '}
        <a href="https://x.com/a_brinza" className={link}>
          Alexandr Brinza
        </a>
        . The original lives on{' '}
        <a href="https://libraries.dev/orbs" className={link}>
          libraries.dev/orbs
        </a>{' '}
        and ships as the MIT package{' '}
        <a href="https://github.com/Jakubantalik/Libraries.dev/tree/main/packages/thinking-orbs" className={link}>
          thinking-orbs
        </a>
        . Streaming UI redistributes its engine with the MIT license and this credit in every installed file; the status pill and chip
        are rebuilt here from the showcase on his site.
      </p>
    </section>
  );
}

export function OrbsPage() {
  useEffect(() => {
    applyHead(ORBS);
  }, []);
  return (
    <div className="orbs-page">
      <PageShell width="wide">
        <div className="flex w-full flex-col gap-6">
          <header className="flex flex-col items-start gap-3">
            <p className="font-mono text-caption-1-medium tracking-[0.12em] text-text-tertiary uppercase">Orbs</p>
            <h1 className="text-display-4-semibold tracking-[-0.02em] text-text-primary">Thinking orbs</h1>
            <p className="max-w-[720px] text-headline-regular text-text-secondary">
              Thought-orb loading indicators for AI interfaces, with nine hand-tuned animated states, drawn on a plain 2D canvas.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <InstallButton item="thinking-orb" label="Install ThinkingOrb" />
              <InstallButton item="orb-status" label="Install OrbStatus" className="bg-background-tertiary-default text-text-primary" />
            </div>
          </header>
          <Showcase />
          <Playground />
          <Credits />
        </div>
      </PageShell>
    </div>
  );
}
