/* Thinking orbs by Jakub Antalik, made with help from Alexandr Brinza (libraries.dev/orbs).
 * The status pill and chip of the libraries.dev/orbs showcase, rebuilt for Streaming UI around the MIT ThinkingOrb. */
import { useEffect, useRef, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { ThinkingOrb } from './ThinkingOrb';
import type { OrbState, OrbTheme } from './types';

export type OrbStatusVariant = 'pill' | 'chip';

export interface OrbStatusProps extends Omit<ComponentProps<'span'>, 'children'> {
  state: OrbState;
  /** What the agent is doing, e.g. "Searching…". Read by screen readers through role="status". */
  label: string;
  /** `pill`: 74px tall, 64px orb drawn at 56px. `chip`: 36px tall, 20px orb. */
  variant?: OrbStatusVariant;
  /** `dark`: translucent dark glass with light ink (default). `light`: light glass with dark ink. `auto`: follows a `.dark` ancestor. */
  theme?: OrbTheme;
  /** Multiplier on the orb's tuned speed. */
  speed?: number;
  /** Sweep a highlight across the label (off for reduced-motion users either way). */
  shimmer?: boolean;
}

const SURFACE = 'inline-flex items-center rounded-[50px]';
const DARK = {
  surface: 'bg-[rgb(29_29_29/0.5)] shadow-[inset_0_0_0_1px_rgb(44_47_54/0.22)]',
  text: 'text-[rgb(251_251_251/0.5)]',
  band: 'bg-[linear-gradient(90deg,transparent_0%,transparent_40%,#fff_50%,transparent_60%,transparent_100%)]',
};
const LIGHT = {
  surface: 'bg-[rgb(255_255_255/0.7)] shadow-[0_1px_3px_0_rgb(0_0_0/0.04),inset_0_0_0_1px_rgb(0_0_0/0.06)]',
  text: 'text-[rgb(23_24_28/0.5)]',
  band: 'bg-[linear-gradient(90deg,transparent_0%,transparent_40%,#17181c_50%,transparent_60%,transparent_100%)]',
};
const AUTO = {
  surface: `${LIGHT.surface} dark:bg-[rgb(29_29_29/0.5)] dark:shadow-[inset_0_0_0_1px_rgb(44_47_54/0.22)]`,
  text: `${LIGHT.text} dark:text-[rgb(251_251_251/0.5)]`,
  band: `${LIGHT.band} dark:bg-[linear-gradient(90deg,transparent_0%,transparent_40%,#fff_50%,transparent_60%,transparent_100%)]`,
};
const INK: Record<OrbTheme, typeof DARK> = { dark: DARK, light: LIGHT, auto: AUTO };
const VARIANT: Record<OrbStatusVariant, string> = {
  pill: 'h-[74px] gap-3 ps-[9px] pe-8 text-[18px] leading-6',
  chip: 'h-9 gap-2 ps-2 pe-3.5 text-[13px] leading-[14px]',
};

/** The label, with a 2s linear highlight band sweeping right to left over a copy of the text. */
function ShimmerText({ text, shimmer, ink }: { text: string; shimmer: boolean; ink: typeof DARK }) {
  const band = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = band.current;
    if (!el || !shimmer || typeof el.animate !== 'function') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const run = el.animate([{ backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0' }], { duration: 2000, easing: 'linear', iterations: Infinity });
    return () => run.cancel();
  }, [shimmer]);
  return (
    <span className={cn('relative inline-block whitespace-nowrap', ink.text)}>
      {text}
      {shimmer && (
        <span
          ref={band}
          aria-hidden="true"
          className={cn('pointer-events-none absolute inset-0 bg-[length:400%_100%] bg-clip-text bg-no-repeat text-transparent', ink.band)}
        >
          {text}
        </span>
      )}
    </span>
  );
}

/** A thinking orb with its status label, as a pill (chat avatar scale) or a chip (inline scale). */
export function OrbStatus({ state, label, variant = 'chip', theme = 'dark', speed = 1, shimmer = true, className, ...rest }: OrbStatusProps) {
  const pill = variant === 'pill';
  const ink = INK[theme];
  return (
    <span role="status" className={cn(SURFACE, ink.surface, VARIANT[variant], className)} {...rest}>
      {pill ? (
        <ThinkingOrb state={state} size={64} theme={theme} speed={speed} aria-hidden style={{ width: 56, height: 56 }} />
      ) : (
        <ThinkingOrb state={state} size={20} theme={theme} speed={speed} aria-hidden />
      )}
      <ShimmerText text={label} shimmer={shimmer} ink={ink} />
    </span>
  );
}
