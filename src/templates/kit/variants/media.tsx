import { useState, type ReactNode } from 'react';
import { Popover } from 'radix-ui';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComposerLoader } from '../primitives';
import { AttachmentStrip } from '../attachments';
import { withAttachments, AddButton, Field, SendButton, Status, useField, type VariantProps } from '../composer-kit';
import { defineCopy, useCopy } from '../i18n';

const COPY = defineCopy({
  en: {
    styles: { auto: 'Auto', photo: 'Photo', illustration: 'Illustration', '3d': '3D', anime: 'Anime' },
    drop: 'Drop reference images',
    aspect: 'Aspect ratio',
    stylize: 'Stylize',
    chaos: 'Chaos',
    stylizeChaos: (s: number, c: number) => `Stylize ${s}, chaos ${c}`,
    stylizeHint: "Low follows the prompt closely; high leans on the model's own taste.",
    variety: 'Variety (chaos)',
    varietyHint: 'How different the images in one batch are from each other.',
    style: 'Style',
    perPrompt: 'Images per prompt',
  },
  fr: {
    styles: { auto: 'Auto', photo: 'Photo', illustration: 'Illustration', '3d': '3D', anime: 'Anime' },
    drop: 'Déposez les images de référence',
    aspect: 'Format',
    stylize: 'Stylisation',
    chaos: 'Chaos',
    stylizeChaos: (s: number, c: number) => `Stylisation ${s}, chaos ${c}`,
    stylizeHint: 'Une valeur basse suit le prompt de près, une valeur haute laisse parler le goût du modèle.',
    variety: 'Variété (chaos)',
    varietyHint: 'À quel point les images d\'un même lot diffèrent les unes des autres.',
    style: 'Style',
    perPrompt: 'Images par prompt',
  },
});

/* Media composer — an image-generation prompt bar. References use the Composer
 * Attachments strip above the prompt (press + or drop images on the card), then a row
 * of parameter chips that always show their value: aspect ratio (a grid of ratio boxes drawn to scale), stylize
 * and chaos sliders, style swatches and a ×1/×2/×4 batch switch. Sending appends the parameters as
 * command-line style flags: "a koi pond at dawn --ar 16:9 --stylize 250 --chaos 10 --style photo --n 4". */

/* ------------------------------------------------------------------ parameters */

const RATIOS = [
  { id: '1:1', w: 1, h: 1 },
  { id: '4:5', w: 4, h: 5 },
  { id: '3:2', w: 3, h: 2 },
  { id: '16:9', w: 16, h: 9 },
  { id: '9:16', w: 9, h: 16 },
  { id: '21:9', w: 21, h: 9 },
] as const;
type Ratio = (typeof RATIOS)[number]['id'];

const STYLES = [
  { id: 'auto', swatch: 'bg-gradient-to-br from-text-tertiary/40 via-background-tertiary-default to-text-tertiary/20' },
  { id: 'photo', swatch: 'bg-gradient-to-br from-amber-200 via-orange-400 to-sky-700' },
  { id: 'illustration', swatch: 'bg-gradient-to-br from-rose-300 via-fuchsia-300 to-indigo-300' },
  { id: '3d', swatch: 'bg-gradient-to-br from-cyan-300 via-blue-500 to-violet-700' },
  { id: 'anime', swatch: 'bg-gradient-to-br from-pink-300 via-sky-300 to-emerald-300' },
] as const;
type Style = (typeof STYLES)[number]['id'];

const BATCHES = [1, 2, 4] as const;
type Batch = (typeof BATCHES)[number];

interface Params {
  ar: Ratio;
  stylize: number;
  chaos: number;
  style: Style;
  n: Batch;
}

const DEFAULTS: Params = { ar: '1:1', stylize: 100, chaos: 0, style: 'auto', n: 4 };

/** The prompt followed by its parameters as flags (`--style` only when not Auto). */
export const withFlags = (prompt: string, p: Params) => `${prompt.trim()} --ar ${p.ar} --stylize ${p.stylize} --chaos ${p.chaos}${p.style === 'auto' ? '' : ` --style ${p.style}`} --n ${p.n}`;

/** A ratio drawn to scale inside a `max`-pixel square. */
function RatioBox({ w, h, max, className }: { w: number; h: number; max: number; className?: string }) {
  const r = w / h;
  return <span aria-hidden="true" className={cn('block shrink-0 rounded-[3px] border-[1.5px] border-current', className)} style={{ width: r >= 1 ? max : Math.round(max * r), height: r >= 1 ? Math.round(max / r) : max }} />;
}

/* ------------------------------------------------------------------ chips */

const chip =
  'flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border-button-default px-2.5 text-body-2-medium whitespace-nowrap text-text-secondary outline-none transition-colors hover:bg-background-primary-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring data-[state=open]:bg-background-tertiary-default data-[state=open]:text-text-primary [&_svg]:size-4 [&_svg]:text-foreground-icon-secondary';
const panel =
  'z-50 max-w-[calc(100vw-32px)] rounded-2xl border border-border-button-default bg-dropdown-background p-3 text-text-primary shadow-dropdown outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0';
const heading = 'text-caption-1-medium tracking-wide text-text-tertiary uppercase';

function ChipPopover({ label, trigger, children, className }: { label: string; trigger: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Popover.Root>
      <Popover.Trigger aria-label={label} className={chip}>
        {trigger}
        <ChevronDown className="size-3.5! opacity-70" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content side="top" align="start" sideOffset={10} collisionPadding={16} className={cn(panel, className)}>
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function Slider({ label, value, min, max, step, onChange, hint }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; hint: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-body-2-medium text-text-primary">{label}</span>
        <span className="font-mono text-caption-1-regular text-text-secondary tabular-nums">{value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-1.5 w-full cursor-pointer accent-accent-500" />
      <span className="text-caption-1-regular text-text-tertiary">{hint}</span>
    </label>
  );
}

/* ------------------------------------------------------------------ composer */

export function MediaComposerView(p: VariantProps) {
  const t = useCopy(COPY);
  const [params, setParams] = useState<Params>(DEFAULTS);
  const set = <K extends keyof Params>(k: K, v: Params[K]) => setParams((s) => ({ ...s, [k]: v }));
  const field = useField({ value: p.value, busy: p.busy, onStop: p.onStop, onSend: (v) => p.onSend(withFlags(v, params)) });
  const [drag, setDrag] = useState(false);
  const style = STYLES.find((s) => s.id === params.style)!;
  const styleLabel = t.styles[style.id];
  const ratio = RATIOS.find((r) => r.id === params.ar)!;

  return (
    <div className={cn('flex w-full flex-col gap-1.5', p.className)}>
      <ComposerLoader active={!!p.busy} radius={22}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            field.submit();
          }}
          onClick={(e) => e.target === e.currentTarget && field.ref.current?.focus()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDrag(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            // Uploads are simulated: each dropped file queues one sample tile.
            const n = Math.max(1, Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/')).length);
            for (let i = 0; i < n; i++) p.att.add();
          }}
          className={cn('relative flex w-full cursor-text flex-col gap-1 rounded-[22px] p-2 transition-colors', drag && 'bg-accent-500/5')}
        >
          {drag && (
            <div className="pointer-events-none absolute inset-1 z-10 grid place-items-center rounded-xl border-2 border-dashed border-accent-500/60 bg-background-primary-default/80 text-body-2-medium text-accent-500 backdrop-blur-[2px]">
              {t.drop}
            </div>
          )}
          {/* References: the Composer Attachments strip, as in every other composer. */}
          <AttachmentStrip attachments={p.att.files} onRemove={p.att.remove} className="px-1 pt-1" />
          <Field field={field} value={p.value} onChange={p.onChange} placeholder={p.placeholder} className="min-h-10 px-2.5 pt-2 pb-1" />
          <div className="flex items-center gap-1.5">
            <AddButton onClick={p.att.add} />
            <div className="scrollbar-none -mx-0.5 flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto px-0.5 py-0.5">
              <ChipPopover label={`${t.aspect} ${params.ar}`} trigger={<><RatioBox w={ratio.w} h={ratio.h} max={14} className="text-foreground-icon-secondary" /><span className="tabular-nums">{params.ar}</span></>} className="w-[272px]">
                <div className="flex flex-col gap-2">
                  <span className={heading}>{t.aspect}</span>
                  <div role="radiogroup" aria-label={t.aspect} className="grid grid-cols-3 gap-1.5">
                    {RATIOS.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        role="radio"
                        aria-checked={params.ar === r.id}
                        onClick={() => set('ar', r.id)}
                        className={cn(
                          'flex h-[68px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring',
                          params.ar === r.id ? 'border-accent-500/40 bg-accent-500/10 text-accent-500' : 'border-transparent text-text-tertiary hover:bg-background-tertiary-default hover:text-text-secondary',
                        )}
                      >
                        <span className="grid size-8 place-items-center">
                          <RatioBox w={r.w} h={r.h} max={30} />
                        </span>
                        <span className="text-caption-1-medium tabular-nums">{r.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </ChipPopover>
              <ChipPopover
                label={t.stylizeChaos(params.stylize, params.chaos)}
                trigger={
                  <>
                    <SlidersHorizontal />
                    <span className="tabular-nums">{t.stylize} {params.stylize}</span>
                    {params.chaos > 0 && <span className="text-text-tertiary tabular-nums">· {t.chaos} {params.chaos}</span>}
                  </>
                }
                className="flex w-[280px] flex-col gap-4"
              >
                <Slider label={t.stylize} value={params.stylize} min={0} max={1000} step={25} onChange={(v) => set('stylize', v)} hint={t.stylizeHint} />
                <Slider label={t.variety} value={params.chaos} min={0} max={100} step={5} onChange={(v) => set('chaos', v)} hint={t.varietyHint} />
              </ChipPopover>
              <ChipPopover label={`${t.style} ${styleLabel}`} trigger={<><span aria-hidden="true" className={cn('size-4 shrink-0 rounded-full ring-1 ring-border-button-default', style.swatch)} /><span>{styleLabel}</span></>} className="w-[248px]">
                <div className="flex flex-col gap-2">
                  <span className={heading}>{t.style}</span>
                  <div role="radiogroup" aria-label={t.style} className="grid grid-cols-5 gap-1">
                    {STYLES.map((s) => (
                      <button key={s.id} type="button" role="radio" aria-checked={params.style === s.id} onClick={() => set('style', s.id)} className="group/sw flex cursor-pointer flex-col items-center gap-1 rounded-lg p-1 outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
                        <span className={cn('size-9 rounded-lg ring-1 transition-[box-shadow,scale] group-active/sw:scale-95', s.swatch, params.style === s.id ? 'ring-2 ring-accent-500 ring-offset-2 ring-offset-background-primary-default' : 'ring-border-button-default group-hover/sw:ring-border-button-hover')} />
                        <span className={cn('max-w-full truncate text-[10.5px] leading-4 font-medium', params.style === s.id ? 'text-text-primary' : 'text-text-tertiary')}>{t.styles[s.id]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </ChipPopover>
              <div role="radiogroup" aria-label={t.perPrompt} className="flex h-8 shrink-0 items-center gap-0.5 rounded-full bg-background-tertiary-default p-0.5">
                {BATCHES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    role="radio"
                    aria-checked={params.n === b}
                    onClick={() => set('n', b)}
                    className={cn(
                      'h-7 cursor-pointer rounded-full px-2 text-caption-1-medium tabular-nums transition-colors outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring',
                      params.n === b ? 'bg-background-primary-default text-text-primary shadow-xs' : 'text-text-tertiary hover:text-text-secondary',
                    )}
                  >
                    ×{b}
                  </button>
                ))}
              </div>
              {p.tools}
            </div>
            <span className="flex shrink-0 items-center gap-1">
              {p.model}
              <SendButton busy={p.busy} onStop={p.onStop} disabled={!p.value.trim()} />
            </span>
          </div>
        </form>
      </ComposerLoader>
      <Status context={p.context}>{p.status}</Status>
    </div>
  );
}

export const MediaComposer = withAttachments(MediaComposerView);
