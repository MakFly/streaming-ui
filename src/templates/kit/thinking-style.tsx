import { createContext, lazy, Suspense, useContext, useSyncExternalStore, type ComponentProps, type CSSProperties, type ReactNode } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { storage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { OrbState } from '@/components/thinking-orb/types';
import { AgentThinking, ElapsedTimer } from './primitives';

/* How a template shows that the agent is thinking: the kit's dot grid, or one of the nine thinking orbs
 * (Jakub Antalik, libraries.dev/orbs). Saved and shared like the composer choice: other same-origin frames
 * follow through the storage event, this frame through THINKING_EVENT, and `?thinking=<state>` forces one.
 * The orb engine is loaded only once an orb is picked. */

export const THINKING_ORBS: { id: OrbState; name: string }[] = [
  { id: 'working', name: 'Working' },
  { id: 'searching', name: 'Searching' },
  { id: 'solving', name: 'Solving' },
  { id: 'listening', name: 'Listening' },
  { id: 'connecting', name: 'Connecting' },
  { id: 'weaving', name: 'Weaving' },
  { id: 'composing', name: 'Composing' },
  { id: 'breathing', name: 'Breathing' },
  { id: 'shaping', name: 'Shaping' },
];

export type ThinkingStyle = 'dots' | OrbState;

const KEY = 'tpl-thinking';
const THINKING_EVENT = 'sui-thinking-style';
const isStyle = (v: string | null): v is ThinkingStyle => v === 'dots' || THINKING_ORBS.some((o) => o.id === v);

function read(): ThinkingStyle {
  const forced = new URLSearchParams(window.location.search).get('thinking');
  if (isStyle(forced)) return forced;
  const saved = storage.get(KEY, 'dots');
  return isStyle(saved) ? saved : 'dots';
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && onChange();
  window.addEventListener('storage', onStorage);
  window.addEventListener(THINKING_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(THINKING_EVENT, onChange);
  };
}

const Scope = createContext<{ value: ThinkingStyle; onChange?: (s: ThinkingStyle) => void } | null>(null);

/**
 * A thinking style for what is inside only (the /playground chat): indicators and pickers below it read and set
 * this value, and the shared choice of the templates stays as it is.
 */
export function ThinkingStyleScope({ value, onChange, children }: { value: ThinkingStyle; onChange?: (s: ThinkingStyle) => void; children: ReactNode }) {
  return <Scope.Provider value={{ value, onChange }}>{children}</Scope.Provider>;
}

export function useThinkingStyle(): [ThinkingStyle, (s: ThinkingStyle) => void] {
  const scope = useContext(Scope);
  const shared = useSyncExternalStore(subscribe, read);
  if (scope) return [scope.value, (s) => scope.onChange?.(s)];
  const set = (s: ThinkingStyle) => {
    storage.set(KEY, s);
    window.dispatchEvent(new Event(THINKING_EVENT));
  };
  return [shared, set];
}

const ThinkingOrb = lazy(() => import('@/components/thinking-orb/ThinkingOrb').then((m) => ({ default: m.ThinkingOrb })));

function Orb({ state, size }: { state: OrbState; size: 20 | 32 }) {
  return (
    <Suspense fallback={<span className="shrink-0" style={{ width: size, height: size }} />}>
      <ThinkingOrb state={state} size={size} aria-hidden className="shrink-0" />
    </Suspense>
  );
}

/** Agent Thinking in the picked style: same label shimmer and timer, the dot grid swapped for an orb. */
export function ThinkingIndicator(props: ComponentProps<typeof AgentThinking>) {
  const [style] = useThinkingStyle();
  if (style === 'dots') return <AgentThinking {...props} />;
  const { label = 'Thinking', showTimer = true, small, className } = props;
  return (
    <div role="status" className={cn('flex items-center gap-2.5 text-text-secondary', className)} style={{ '--sui-agent-thinking-tone': 'var(--color-text-secondary)' } as CSSProperties}>
      <Orb state={style} size={20} />
      <span className={cn('sui-agent-thinking-label', small ? 'text-body-2-medium' : 'text-body-medium')}>{label}</span>
      {showTimer && <ElapsedTimer />}
    </div>
  );
}

/** Swaps the thinking indicator of every template and composer demo (saved, shared with the preview frames). */
export function ThinkingPicker({ className }: { className?: string }) {
  const [style, setStyle] = useThinkingStyle();
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Thinking style"
              className={cn(
                'grid size-7 shrink-0 place-items-center rounded-md text-foreground-icon-tertiary transition-colors outline-none hover:bg-background-tertiary-default hover:text-foreground-icon-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring data-[state=open]:bg-background-tertiary-default',
                className,
              )}
            >
              {style === 'dots' ? <Sparkles className="size-4" /> : <Orb state={style} size={20} />}
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Thinking style</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="scrollbar-thin max-h-[min(70vh,600px)] w-64 overflow-y-auto p-1.5">
        <p className="px-2 pt-1 pb-2 text-caption-1-medium text-text-tertiary">Thinking · applies to every template</p>
        <DropdownMenuItem onSelect={() => setStyle('dots')} className="flex items-center gap-3 rounded-lg py-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-background-tertiary-default text-text-secondary">
            <Sparkles className="size-4" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-body-2-medium text-text-primary">Dots</span>
            <span className="truncate text-caption-1-regular text-text-tertiary">The kit's dot grid (default)</span>
          </span>
          {style === 'dots' && <Check className="size-4 shrink-0 text-text-primary" />}
        </DropdownMenuItem>
        <p className="px-2 pt-2 pb-1 text-caption-2-medium text-text-tertiary">Thinking orbs by Jakub Antalik</p>
        {THINKING_ORBS.map((o) => (
          <DropdownMenuItem key={o.id} onSelect={() => setStyle(o.id)} className="flex items-center gap-3 rounded-lg py-2">
            <span className="grid size-8 shrink-0 place-items-center">
              <Orb state={o.id} size={32} />
            </span>
            <span className="min-w-0 flex-1 text-body-2-medium text-text-primary">{o.name}</span>
            {style === o.id && <Check className="size-4 shrink-0 text-text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Which thinking indicator the demos and templates show: the dot grid or a thinking orb. */
export function ThinkingChoice() {
  const [style, setStyle] = useThinkingStyle();
  return (
    <p className="flex flex-wrap items-center gap-2 text-body-2-regular text-text-tertiary">
      Thinking shown as
      <span className="rounded-md bg-background-tertiary-default px-1.5 py-0.5 text-body-2-medium text-text-primary">
        {style === 'dots' ? 'dots' : `${THINKING_ORBS.find((o) => o.id === style)?.name} orb`}
      </span>
      <ThinkingPicker className="size-8 rounded-lg border border-border-button-default" />
      {style !== 'dots' && (
        <button type="button" onClick={() => setStyle('dots')} className="text-body-2-medium text-text-secondary underline underline-offset-2 hover:text-text-primary">
          Reset
        </button>
      )}
    </p>
  );
}
