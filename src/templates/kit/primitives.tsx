import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* The agentic primitives (Agent Thinking, Composer Loader, the agent-log trail),
 * kept to the variants the templates use. Keyframes live in styles/templates.css. */

const TONES = {
  subtle: 'var(--color-text-tertiary)',
  default: 'var(--color-text-secondary)',
  primary: 'var(--color-text-primary)',
};

/* ------------------------------------------------------------------ Agent Thinking */

const DOTS_GRID = 3;
const DOTS_SIZE = 4;
const DOTS_TRAIL = 0.3;
const DOTS_MIN = 0.12;
const DOTS_SEED = [0.55, 0.3, 0.15, 0.85, 0.55, 0.3, 1, 0.85, 0.55];

function dotOpacities(phase: number) {
  const m = DOTS_GRID - 1;
  return Array.from({ length: DOTS_GRID * DOTS_GRID }, (_, i) => {
    // Diagonal wavefront, top-left → bottom-right; the scalar is compressed so the wrap reads as re-entry.
    const s = (((i % DOTS_GRID) + Math.floor(i / DOTS_GRID)) / (2 * m)) * (DOTS_GRID / (DOTS_GRID + 1));
    const behind = (phase - s + 1) % 1;
    return DOTS_MIN + (1 - DOTS_MIN) * Math.max(0, 1 - behind / DOTS_TRAIL) ** 1.5;
  });
}

function WaveDots() {
  const [opacities, setOpacities] = useState(DOTS_SEED);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let phase = 0;
    const id = window.setInterval(() => {
      phase = (phase + 1 / 8) % 1;
      setOpacities(dotOpacities(phase));
    }, 80);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span aria-hidden className="grid shrink-0" style={{ gridTemplateColumns: `repeat(${DOTS_GRID}, ${DOTS_SIZE}px)`, gap: 2 }}>
      {opacities.map((o, i) => (
        <span key={i} className="rounded-[1px] bg-current" style={{ width: DOTS_SIZE, height: DOTS_SIZE, opacity: o, transition: 'opacity 220ms ease' }} />
      ))}
    </span>
  );
}

const STARS = [
  { x: 50, y: 46, s: 1 },
  { x: 18, y: 22, s: 0.55 },
  { x: 82, y: 26, s: 0.45 },
  { x: 78, y: 76, s: 0.55 },
  { x: 22, y: 78, s: 0.4 },
];

function Stars() {
  const box = 21;
  return (
    <span aria-hidden className="sui-agent-thinking-stars relative block shrink-0" style={{ width: box, height: box }}>
      {STARS.map((st, i) => {
        const size = 14 * st.s;
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className="sui-agent-thinking-star absolute"
            style={{ width: size, height: size, left: `${st.x}%`, top: `${st.y}%`, marginLeft: -size / 2, marginTop: -size / 2, animationDuration: '1.4s', animationDelay: `${(i * 1.4 * 0.7) / 5}s` }}
          >
            <path d="M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z" fill="currentColor" />
          </svg>
        );
      })}
    </span>
  );
}

export function ElapsedTimer({ className }: { className?: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const started = performance.now();
    const id = window.setInterval(() => setElapsed((performance.now() - started) / 1000), 100);
    return () => window.clearInterval(id);
  }, []);
  return <span className={cn('font-mono text-caption-1-regular text-text-tertiary tabular-nums', className)}>{elapsed.toFixed(1)}s</span>;
}

/** Dot-grid (wave) or sparkles (stars) indicator, a shimmering label and an elapsed timer. */
export function AgentThinking({
  variant = 'wave',
  label = 'Thinking',
  tone,
  showTimer = true,
  small,
  className,
}: {
  variant?: 'wave' | 'stars';
  label?: ReactNode;
  tone?: keyof typeof TONES;
  showTimer?: boolean;
  small?: boolean;
  className?: string;
}) {
  const color = TONES[tone ?? (variant === 'stars' ? 'subtle' : 'default')];
  return (
    <div role="status" className={cn('flex items-center gap-2.5', className)} style={{ color, '--sui-agent-thinking-tone': color } as CSSProperties}>
      {variant === 'wave' ? <WaveDots /> : <Stars />}
      <span className={cn('sui-agent-thinking-label', small ? 'text-body-2-medium' : 'text-body-medium')}>{label}</span>
      {showTimer && <ElapsedTimer />}
    </div>
  );
}

/* ------------------------------------------------------------------ Composer surface */

/**
 * The composer's surface: border, background and shadow, drawn behind the wrapped composer so it stays
 * transparent. `radius` defaults to a full pill. Busy is shown by the composer itself (Stop, Agent Thinking),
 * so `active` paints nothing; it stays in the signature for the composers that pass it.
 */
export function ComposerLoader({ radius, children, className, surfaceClassName }: { active: boolean; radius?: number; children: ReactNode; className?: string; surfaceClassName?: string }) {
  return (
    <div className={cn('group/cl relative', className)}>
      <span
        aria-hidden
        className={cn('absolute inset-0 border border-border-button-default bg-background-primary-default shadow-xs transition-[border-color,box-shadow] duration-200 group-focus-within/cl:border-border-button-hover group-focus-within/cl:shadow-sm', surfaceClassName)}
        style={{ borderRadius: radius ?? 9999 }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ Agent Log */

/**
 * The agent-log trail: each row blurs in under a curved guide that branches off a 1px trunk.
 * Rows are plain children; the last row's trunk stops at its branch.
 */
export function AgentLog({ children, className }: { children: ReactNode[]; className?: string }) {
  return (
    <ul className={cn('flex flex-col', className)}>
      {children.map((child, i) => (
        <li key={i} className="tpl-reveal relative ps-4">
          <span aria-hidden className="absolute inset-y-0 start-0 w-3 text-foreground-icon-quaternary">
            <svg width="12" height="15" viewBox="0 0 12 15" fill="none" className="absolute top-0 start-0">
              <path d="M0.5 0 V8 Q0.5 14 6.5 14 H11.5" stroke="currentColor" pathLength={1} className="tpl-guide" />
            </svg>
            {i < children.length - 1 && <span className="absolute top-2 bottom-0 start-0 w-px origin-top bg-current" />}
          </span>
          <div className="py-[3px]">{child}</div>
        </li>
      ))}
    </ul>
  );
}
