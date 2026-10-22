import { useMemo, useState } from 'react';
import { Popover } from 'radix-ui';
import { RotateCcw } from 'lucide-react';
import { Icon } from './icon';
import { cn } from '@/lib/utils';
import { MaxEffortFx, scatterTicks } from './max-effort-fx';

/* Model picker for the multi-agent chat: a
 * 341×282 popover over the trigger with a vertical provider rail (provider logos in ./providers),
 * that provider's models as radio rows, Quick Search across every provider, and an Effort badge on the selected
 * row opening a six-step Faster → Smarter slider. Class strings follow the reference design. */

const logos = import.meta.glob('./providers/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const logo = (file: string) => logos[`./providers/${file}.svg`];

type Provider = { id: string; name: string; file: string; size: 18 | 20; models: string[] };

export const PROVIDERS: Provider[] = [
  { id: 'openai', name: 'OpenAI', file: 'openai', size: 18, models: ['GPT-5.6 Mini', 'GPT-5.6 Terra', 'GPT-5.6 Sol', 'GPT-5.5', 'GPT-5.5 Mini', 'GPT-5.4', 'GPT-5.4 Mini', 'GPT-5.4 Nano', 'o5', 'o5 Mini', 'GPT-OSS 120B', 'GPT-OSS 20B'] },
  { id: 'anthropic', name: 'Anthropic', file: 'anthropic', size: 18, models: ['Fable 5.1', 'Fable 5', 'Opus 5', 'Sonnet 5', 'Haiku 4.5', 'Opus 4.1', 'Sonnet 4.5', 'Opus 4', 'Sonnet 4', 'Haiku 3.5'] },
  { id: 'perplexity', name: 'Perplexity', file: 'perplexity', size: 20, models: ['Sonar Pro', 'Sonar Reasoning Pro', 'Sonar Reasoning', 'Sonar Deep Research', 'Sonar', 'R1 1776', 'Sonar Large', 'Sonar Small'] },
  { id: 'cursor', name: 'Cursor', file: 'cursor', size: 20, models: ['Composer 2.5', 'Composer 2', 'Composer 1.5', 'Composer 1', 'Tab 3', 'Tab 2', 'Apply 2', 'Fast Apply'] },
  { id: 'openrouter', name: 'OpenRouter', file: 'openrouter', size: 20, models: ['Auto Router', 'Llama 4 Maverick', 'Llama 4 Scout', 'Qwen 3.5 Coder', 'Kimi K2.5', 'GLM 5', 'DeepSeek V4', 'Mistral Large 3', 'Hermes 4', 'Nemotron Ultra'] },
  { id: 'deepseek', name: 'DeepSeek', file: 'deepseek', size: 20, models: ['DeepSeek V4', 'DeepSeek R2', 'DeepSeek V3.2', 'DeepSeek V3.1', 'DeepSeek R1', 'DeepSeek V3', 'DeepSeek Coder V3', 'DeepSeek Prover V2', 'Janus Pro'] },
  { id: 'jina', name: 'Jina', file: 'jina', size: 20, models: ['Embeddings v4', 'Embeddings v3', 'Reranker v3', 'Reranker v2', 'CLIP v2', 'ReaderLM v2', 'ColBERT v2', 'Segmenter', 'Classifier'] },
  { id: 'ollama', name: 'Ollama', file: 'ollama', size: 20, models: ['Llama 4 Scout', 'Gemma 4', 'Qwen 3.5', 'Qwen 3.5 Coder', 'Phi 5', 'Mistral Small 4', 'DeepSeek R2', 'GPT-OSS 20B', 'Llama 3.3', 'Nomic Embed v2'] },
  { id: 'google', name: 'Google', file: 'gemini', size: 20, models: ['Gemini 3.5 Pro', 'Gemini 3.5 Flash', 'Gemini 3.5 Flash Lite', 'Gemini 3 Pro', 'Gemini 3 Flash', 'Gemini 3 Flash Lite', 'Gemma 4', 'Gemma 4 Nano', 'Imagen 5', 'Veo 4'] },
  { id: 'meta', name: 'Meta', file: 'meta', size: 20, models: ['Llama 5', 'Llama 4 Behemoth', 'Llama 4 Maverick', 'Llama 4 Scout', 'Llama 3.3 70B', 'Llama 3.2 Vision', 'Llama 3.2 3B', 'Code Llama 2', 'Llama Guard 4'] },
  { id: 'mistral', name: 'Mistral', file: 'mistral', size: 20, models: ['Mistral Large 3', 'Mistral Medium 3.5', 'Magistral Medium', 'Magistral Small', 'Codestral 2', 'Devstral 2', 'Mistral Small 4', 'Ministral 8B', 'Pixtral Large', 'Mistral OCR'] },
  { id: 'xai', name: 'xAI', file: 'xai', size: 20, models: ['Grok 5', 'Grok 4.2', 'Grok 4.1', 'Grok 4 Fast', 'Grok 4 Heavy', 'Grok 4', 'Grok Code Fast', 'Grok 3', 'Grok 3 Mini'] },
  { id: 'qwen', name: 'Qwen', file: 'qwen', size: 20, models: ['Qwen 3.5 Max', 'Qwen 3.5 Plus', 'Qwen 3.5 Flash', 'Qwen 3.5 Coder', 'Qwen 3.5 VL', 'Qwen 3 235B', 'Qwen 3 32B', 'Qwen 3 Omni', 'QwQ 32B'] },
  { id: 'groq', name: 'Groq', file: 'groq', size: 20, models: ['Llama 4 Scout', 'Llama 4 Maverick', 'Kimi K2', 'GPT-OSS 120B', 'GPT-OSS 20B', 'Qwen 3 32B', 'Llama 3.3 70B', 'Llama 3.1 8B', 'Gemma 2 9B'] },
  { id: 'cohere', name: 'Cohere', file: 'cohere', size: 20, models: ['Command A', 'Command A Reasoning', 'Command A Vision', 'Command R+', 'Command R', 'Command R7B', 'Embed v4', 'Rerank v3.5', 'Aya Expanse 32B'] },
  { id: 'moonshot', name: 'Moonshot', file: 'moonshot', size: 20, models: ['Kimi K2.5', 'Kimi K2 Thinking', 'Kimi K2', 'Kimi K1.5', 'Kimi VL', 'Kimi Dev 72B', 'Moonshot v1 128K', 'Moonshot v1 32K'] },
  { id: 'zhipu', name: 'Zhipu', file: 'zhipu', size: 20, models: ['GLM 5', 'GLM 4.6', 'GLM 4.5', 'GLM 4.5 Air', 'GLM 4.5V', 'GLM 4 Plus', 'GLM 4 Flash', 'CogView 4', 'CodeGeeX 4'] },
  { id: 'amazon', name: 'Amazon', file: 'aws', size: 20, models: ['Nova Premier', 'Nova Pro', 'Nova Lite', 'Nova Micro', 'Nova Canvas', 'Nova Reel', 'Nova Sonic', 'Titan Text Premier', 'Titan Embed v2'] },
];

export const EFFORTS = ['Low', 'Medium', 'Balanced', 'High', 'Very High', 'Max'] as const;
const DEFAULT_EFFORT = 1;

/**
 * Models that offer a fast mode: the same model served for faster output at a higher price (Claude's fast mode,
 * OpenAI's priority processing…). Mock catalogue, per provider; models elsewhere never show the toggle.
 */
const FAST: Record<string, string[]> = {
  anthropic: ['Fable 5.1', 'Fable 5', 'Opus 5'],
  openai: ['GPT-5.6 Sol', 'GPT-5.6 Terra', 'GPT-5.5'],
  google: ['Gemini 3.5 Pro', 'Gemini 3 Pro'],
  xai: ['Grok 5', 'Grok 4.2'],
  cursor: ['Composer 2.5', 'Composer 2'],
  mistral: ['Mistral Large 3'],
};
export const hasFastMode = (providerId: string, model: string) => FAST[providerId]?.includes(model) ?? false;

/**
 * The bolt slid in by width (grid 0fr → 1fr) rather than inserted: what it pushes, and the popovers anchored
 * to it, glide over 200 ms instead of jumping 16px when fast mode flips.
 */
function BoltSlot({ on, className }: { on: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn('grid transition-[grid-template-columns,opacity,filter] duration-200 ease-out', on ? 'grid-cols-[1fr] opacity-100 blur-0' : 'grid-cols-[0fr] opacity-0 blur-[2px]', className)}>
      <span className="min-w-0 overflow-hidden">
        <Bolt className="me-0.5 size-3.5 text-accent-500" />
      </span>
    </span>
  );
}

/** Remix flashlight-fill: the bolt that marks fast mode. */
const Bolt = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" className={cn('remixicon shrink-0', className)}>
    <path d="M13 10H20L11 23V14H4L13 1V10Z" />
  </svg>
);

/** The provider a model name belongs to (first match: names like "Llama 4 Scout" exist at several hosts). */
const providerOf = (model: string) => PROVIDERS.find((p) => p.models.includes(model)) ?? PROVIDERS[1];

const popoverCls =
  'z-50 outline-none transition duration-150 ease-out data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=top]:origin-bottom-left data-[side=bottom]:origin-top-left';

/** Radio: 14px, 0.875px border at rest; an accent gradient and a 5px dot that scales in when checked. */
function Radio({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" className="relative flex size-3.5 shrink-0 items-center justify-center rounded-full">
      <span className={cn('ease absolute inset-0 rounded-full border-[0.875px] border-border-checkbox-default bg-background-primary-default shadow-xs transition-opacity duration-200', on && 'opacity-0')} />
      <span className={cn('ease absolute inset-0 rounded-full bg-gradient-to-b from-accent-500 to-accent-600 shadow-[inset_0px_0px_0px_0.875px_var(--color-accent-500),inset_0px_1.75px_0px_0px_rgba(255,255,255,0.25)] transition-opacity duration-200', !on && 'opacity-0')} />
      <span className={cn('ease absolute top-1/2 left-1/2 size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-control-indicator-background transition-[scale,opacity] duration-200', on ? 'scale-100 opacity-100' : 'scale-0 opacity-0')} />
    </span>
  );
}

/** The six-step Faster → Smarter slider; a transparent range input on top keeps keyboard and pointer access. */
function EffortSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const max = value === EFFORTS.length - 1;
  // New random flight paths each time the slider reaches Max (re-rolled per ignition).
  const scatter = useMemo(() => scatterTicks(EFFORTS.length), [max]);
  return (
    <div className="relative h-[27px] w-full overflow-hidden rounded-lg bg-background-secondary-default has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-border-focus-ring">
      <div className="absolute inset-y-0 start-0 rounded-lg bg-background-tertiary-hover transition-[width] duration-150 ease-out" style={{ width: `calc(${value * 20}% + ${21 - value * 4.2}px)` }} />
      <div className="absolute inset-x-[9px] top-[7px] flex h-[13px] items-center justify-between">
        {EFFORTS.map((_, i) => {
          const s = scatter[i];
          return (
            <span
              key={i}
              className="h-full w-[3px] rounded-[2px] bg-foreground-icon-tertiary"
              // At Max the ticks are blown off to the left over 1.6 s; below it they settle back in 0.3 s.
              style={
                max
                  ? { transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rotate}deg)`, opacity: 0, transition: `transform 1.6s cubic-bezier(0.22,0.5,0.5,1) ${s.delay}s, opacity 1.6s cubic-bezier(0.22,0.5,0.5,1) ${s.delay}s` }
                  : { transform: 'none', opacity: i <= value ? 1 : 0.3, transition: 'transform 0.3s ease-out, opacity 0.3s ease-out' }
              }
            />
          );
        })}
      </div>
      <MaxEffortFx active={max} />
      <div className="absolute inset-x-[10.5px] inset-y-0">
        <div className="pointer-events-none absolute top-1/2 h-[27px] w-[21px] -translate-x-1/2 -translate-y-1/2 rounded-[7px] border border-border-checkbox-default bg-background-primary-default shadow-xs transition-[left] duration-150 ease-out" style={{ left: `${value * 20}%` }} />
      </div>
      <input
        type="range"
        min={0}
        max={5}
        step={1}
        value={value}
        aria-label="Effort"
        aria-valuetext={EFFORTS[value]}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 size-full cursor-grab opacity-0 active:cursor-grabbing"
      />
    </div>
  );
}

type FastProps = { canFast: boolean; fast: boolean; onFast: (v: boolean) => void };

/**
 * Every effort label stacked in one grid cell, only the current one visible: the box always has the width of
 * the longest ("Very High"), so dragging the slider never resizes the badge or shifts what is anchored to it.
 * The visible label settles in with a short blur instead of being remounted from transparent.
 */
function EffortLabel({ effort, className }: { effort: number; className?: string }) {
  return (
    <span className={cn('inline-grid', className)}>
      {EFFORTS.map((l, i) => (
        <span key={l} aria-hidden={i !== effort} className={cn('col-start-1 row-start-1 whitespace-nowrap transition-[opacity,filter] duration-150 ease-out', i === effort ? 'opacity-100 blur-0' : 'opacity-0 blur-[2px]')}>
          {l}
        </span>
      ))}
    </span>
  );
}

function EffortBadge({ effort, onEffort, canFast, fast, onFast }: { effort: number; onEffort: (v: number) => void } & FastProps) {
  const [open, setOpen] = useState(false);
  const on = canFast && fast;
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={`Effort: ${EFFORTS[effort]}${on ? ', fast mode' : ''}`}
        className="ease flex shrink-0 cursor-pointer items-center gap-0.5 rounded-full bg-background-tertiary-default py-1 ps-2 pe-1 outline-none transition-colors duration-150 hover:bg-background-tertiary-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      >
        <BoltSlot on={on} />
        {/* The popover anchors to the label, not the badge: the label's left edge stays put when the bolt
            appears, and its width is fixed, so the popover never jumps while the effort changes. */}
        <Popover.Anchor className="flex">
          <EffortLabel effort={effort} className="text-body-2-medium text-text-secondary" />
        </Popover.Anchor>
        <Icon name="arrow-down-s-line" className={cn('ease size-[18px] text-foreground-icon-secondary transition-transform duration-200', open ? 'rotate-0' : '-rotate-90')} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content updatePositionStrategy="always" side="bottom" align="start" alignOffset={-8} sideOffset={14} collisionPadding={16} className={cn(popoverCls, 'w-[266px] max-w-[calc(100vw-32px)] rounded-2xl border border-border-button-default bg-background-primary-default p-1 shadow-dropdown')}>
          <section aria-label="Effort" className="flex flex-col pt-1 outline-none">
            {/* Fast toggle on the left (only for models that offer it), reset on the right. */}
            <div className="-mb-0.5 flex items-center gap-1 ps-2 pe-0.5">
              {canFast && (
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label="Fast mode"
                  title={on ? 'Fast mode on' : 'Fast mode'}
                  onClick={() => onFast(!on)}
                  className={cn('-ms-1.5 grid size-6 shrink-0 cursor-pointer place-items-center rounded-md outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-border-focus-ring', on ? 'bg-accent-500/12 text-accent-500' : 'text-foreground-icon-tertiary hover:bg-background-tertiary-default dark:hover:bg-background-primary-hover hover:text-foreground-icon-secondary')}
                >
                  <Bolt className="size-4" />
                </button>
              )}
              <p className="min-w-0 flex-1 truncate text-body-medium text-text-secondary">
                {on ? 'Fast' : 'Effort'} <EffortLabel effort={effort} className={cn('align-bottom transition-colors duration-150', on ? 'text-accent-500' : 'text-text-primary')} />
              </p>
              {(effort !== DEFAULT_EFFORT || on) && (
                <button
                  type="button"
                  aria-label="Reset effort"
                  title="Reset"
                  onClick={() => {
                    onEffort(DEFAULT_EFFORT);
                    onFast(false);
                  }}
                  className="animate-in fade-in-0 grid size-6 shrink-0 cursor-pointer place-items-center rounded-md text-foreground-icon-tertiary outline-none transition-colors duration-150 hover:bg-background-tertiary-default hover:text-foreground-icon-secondary focus-visible:ring-2 focus-visible:ring-border-focus-ring"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              )}
            </div>
            {on && <p className="animate-in fade-in-0 slide-in-from-top-1 ps-2 pt-1.5 text-caption-1-regular text-text-tertiary duration-200">Same model, faster output · billed at a higher rate</p>}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between px-2 pt-2 pb-[3px] text-body-2-medium text-text-secondary">
                <span>Faster</span>
                <span>Smarter</span>
              </div>
              <div className="px-2 pb-2">
                <EffortSlider value={effort} onChange={onEffort} />
              </div>
            </div>
          </section>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function ModelRow({ provider, model, on, showProvider, effort, onEffort, fast, onFast, onPick }: { provider: Provider; model: string; on: boolean; showProvider: boolean; effort: number; onEffort: (v: number) => void; fast: boolean; onFast: (v: boolean) => void; onPick: () => void }) {
  const canFast = hasFastMode(provider.id, model);
  return (
    <div className={cn('relative flex h-9 w-full shrink-0 items-center rounded-2lg px-2 transition-colors', on ? 'bg-background-primary-hover' : 'hover:bg-background-primary-hover')}>
      <button type="button" role="radio" aria-checked={on} aria-label={`${provider.name} ${model}`} onClick={onPick} className="absolute inset-0 cursor-pointer rounded-2lg outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-inset" />
      <span className="pointer-events-none relative flex min-w-0 flex-1 items-center gap-3">
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <img alt="" aria-hidden="true" width={16} height={16} src={logo(provider.file)} className="size-4 shrink-0 dark:invert" />
          <span className="min-w-0 flex-1 truncate text-body-medium whitespace-nowrap">
            <span className="text-text-primary">{model}</span>
            {showProvider && <span className="ms-1.5 text-text-tertiary">{provider.name}</span>}
          </span>
          {/* Unselected rows that offer fast mode carry a faint bolt, so it can be found before picking. */}
          {!on && canFast && <Bolt className="size-3.5 text-foreground-icon-quaternary" />}
          {on && (
            <span className="pointer-events-auto flex shrink-0">
              <EffortBadge effort={effort} onEffort={onEffort} canFast={canFast} fast={fast} onFast={onFast} />
            </span>
          )}
        </span>
        <Radio on={on} />
      </span>
    </div>
  );
}

/**
 * Drop-in model picker for the composers: `value` is a model name ("Fable 5"), `onChange` gets the new one.
 * Effort is kept here unless the caller controls it.
 */
export function ModelPicker({
  value,
  onChange,
  effort: effortProp,
  onEffortChange,
  fast: fastProp,
  onFastChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  effort?: number;
  onEffortChange?: (v: number) => void;
  /** Fast mode, for models that offer it; kept here unless the caller controls it. */
  fast?: boolean;
  onFastChange?: (v: boolean) => void;
  className?: string;
}) {
  const [ownFast, setOwnFast] = useState(false);
  const fastWanted = fastProp ?? ownFast;
  const setFast = onFastChange ?? setOwnFast;
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(() => providerOf(value).id);
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');
  const [ownEffort, setOwnEffort] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  
  // The same model name can live at several hosts ("Llama 4 Scout"): remember which one was picked.
  const [pickedAt, setPickedAt] = useState<string | null>(null);
  const effort = effortProp ?? ownEffort;
  const setEffort = onEffortChange ?? setOwnEffort;
  const selected = PROVIDERS.find((p) => p.id === pickedAt && p.models.includes(value)) ?? providerOf(value);
  // Fast mode only applies where the current model offers it; the wish is kept for when you come back.
  const fastOn = fastWanted && hasFastMode(selected.id, value);

  const rows = useMemo(() => {
    if (searching && q.trim()) {
      // The whole query as one phrase, against the model or its provider: "llama 4" gives 8 rows.
      const needle = q.trim().toLowerCase();
      return PROVIDERS.flatMap((p) => p.models.filter((m) => m.toLowerCase().includes(needle) || p.name.toLowerCase().includes(needle)).map((m) => ({ p, m })));
    }
    const p = PROVIDERS.find((x) => x.id === tab)!;
    return p.models.map((m) => ({ p, m }));
  }, [searching, q, tab]);

  const closeSearch = () => {
    setSearching(false);
    setQ('');
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setTab(selected.id);
        else closeSearch();
      }}
    >
      <Popover.Trigger
        className={cn(
          'ease flex h-8 shrink-0 cursor-pointer items-center justify-center gap-0.5 rounded-xl bg-background-primary-default py-1.5 ps-2 pe-1 outline-none transition-colors duration-150 hover:bg-background-primary-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring',
          className,
        )}
      >
        <BoltSlot on={fastOn} className="ms-0.5" />
        <span className="px-0.5 text-body-medium whitespace-nowrap text-text-secondary">{value}</span>
        <Icon name="arrow-down-s-line" className={cn('ease size-[18px] text-foreground-icon-secondary transition-transform duration-200', open && 'rotate-180')} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          // Follow the trigger every frame: it slides when the fast bolt appears, and a popover that only
          // re-measures on resize would catch up later in a single jump.
          updatePositionStrategy="always"
          side="top"
          align="start"
          sideOffset={8}
          collisionPadding={16}
          aria-label="Models"
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(popoverCls, 'relative h-[282px] w-[341px] max-w-[calc(100vw-32px)] overflow-clip rounded-[20px] border border-border-button-default bg-background-primary-default shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.02)]')}
        >
          <div className="size-full">
            <div role="tablist" aria-label="Providers" aria-orientation="vertical" className="absolute start-0.5 top-0.5 h-[276px] w-[42px] overflow-y-auto rounded-[17px] bg-composer-panel-rail-background p-[3px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-9 flex-col gap-1.5">
                {PROVIDERS.map((p) => {
                  const on = !searching && tab === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      aria-label={p.name}
                      title={p.name}
                      onClick={() => {
                        closeSearch();
                        setTab(p.id);
                      }}
                      className={cn('ease flex h-[30px] w-9 shrink-0 cursor-pointer items-center justify-center rounded-[50px] outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-border-focus-ring', on ? 'bg-background-tertiary-default' : 'hover:bg-background-tertiary-default/50')}
                    >
                      <img alt="" aria-hidden="true" width={p.size} height={p.size} src={logo(p.file)} className="shrink-0 dark:invert" style={{ width: p.size, height: p.size }} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="absolute start-[52px] end-2 top-2 bottom-0 flex flex-col">
              <div className="flex h-5 items-center justify-between gap-[5px] px-0.5">
                {searching ? (
                  <>
                    <input
                      autoFocus
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape' && q) {
                          e.preventDefault();
                          setQ('');
                        }
                      }}
                      placeholder="Search models"
                      aria-label="Search models"
                      className="h-5 min-w-0 flex-1 bg-transparent text-body-medium text-text-primary caret-accent-500 outline-none placeholder:text-text-tertiary"
                    />
                    <button type="button" aria-label="Close search" onClick={closeSearch} className="flex shrink-0 cursor-pointer items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
                      <Icon name="close-line" className="size-4 text-foreground-icon-secondary" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-body-medium text-text-tertiary">Models</span>
                    <button type="button" onClick={() => setSearching(true)} className="ease flex cursor-pointer items-center gap-[5px] rounded-sm opacity-50 outline-none transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-border-focus-ring">
                      <span className="text-body-medium whitespace-nowrap text-text-secondary">Quick Search</span>
                      <Icon name="search-line" className="size-4 text-foreground-icon-secondary" />
                    </button>
                  </>
                )}
              </div>

              <div className="relative mt-1 flex min-h-0 flex-1 flex-col">
                {/* Progressive blur fading the list under the header once it scrolls. */}
                <div aria-hidden="true" className={cn('pointer-events-none absolute inset-x-0 top-0 z-10 h-8 transition-opacity duration-200 ease-out', scrolled ? 'opacity-100' : 'opacity-0')}>
                  <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,black_45%,transparent_100%)] backdrop-blur-[1px]" />
                  <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,black_25%,transparent_75%)] backdrop-blur-[3px]" />
                  <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,transparent_50%)] backdrop-blur-[8px]" />
                  <div className="absolute inset-0 bg-linear-to-b from-background-primary-default via-background-primary-default/70 to-transparent" />
                </div>
                <div
                  role="radiogroup"
                  aria-label={searching && q.trim() ? 'Matching models' : `${PROVIDERS.find((p) => p.id === tab)?.name} models`}
                  onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 2)}
                  className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {rows.map(({ p, m }) => (
                    <ModelRow
                      key={`${p.id}-${m}`}
                      provider={p}
                      model={m}
                      on={m === value && p.id === selected.id}
                      showProvider={searching && !!q.trim()}
                      effort={effort}
                      onEffort={setEffort}
                      fast={fastWanted}
                      onFast={setFast}
                      onPick={() => {
                        setPickedAt(p.id);
                        onChange(m);
                      }}
                    />
                  ))}
                  {rows.length === 0 && <p className="px-2 py-2 text-body-medium text-text-tertiary">No models match</p>}
                </div>
              </div>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
