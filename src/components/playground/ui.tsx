import type { ReactNode } from 'react';
import { Check, ChevronDown, Moon, Sun } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/* The /playground sidebar's building blocks, after assistant-ui's playground: dashed sections, 28px rows with
 * the label left and the control right, ghost selects, an 18×32 switch. Its `foreground/x` alphas are our
 * text-primary at the same alpha, so the system follows every palette and both themes. */

export function Section({ title, theme, children }: { title: string; theme?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-2 border-t border-dashed border-text-primary/10 pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-tertiary">{title}</span>
        {theme}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export function Row({ label, children, indent }: { label: ReactNode; children: ReactNode; indent?: boolean }) {
  return (
    <div className={cn('flex h-7 items-center justify-between gap-3', indent && 'ps-4')}>
      <span className="flex min-w-0 items-center gap-2 truncate text-sm text-text-primary">{label}</span>
      {children}
    </div>
  );
}

export interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
  icon?: ReactNode;
}

/** Ghost select: the value and a chevron, a menu of options with a check on the current one. */
export function Select<T extends string>({ value, options, onChange, label, placeholder = 'Custom', className }: { value: T; options: Option<T>[]; onChange: (v: T) => void; label: string; /** Shown when the value is none of the options. */ placeholder?: string; className?: string }) {
  const current = options.find((o) => o.value === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        className={cn(
          'flex h-7 w-fit max-w-[60%] min-w-0 cursor-pointer items-center gap-2 rounded-lg bg-transparent px-2 text-xs whitespace-nowrap text-text-primary outline-none transition-colors hover:bg-background-tertiary-default focus-visible:ring-1 focus-visible:ring-border-focus-ring data-[state=open]:bg-background-tertiary-default',
          className,
        )}
      >
        {current?.icon}
        <span className="truncate">{current?.label ?? placeholder}</span>
        <ChevronDown className="size-4 shrink-0 text-text-tertiary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="scrollbar-thin max-h-[min(60vh,420px)] min-w-44 overflow-y-auto p-1">
        {options.map((o) => (
          <DropdownMenuItem key={o.value} onSelect={() => onChange(o.value)} className="flex items-center gap-2 rounded-md py-1.5 text-xs">
            {o.icon}
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-text-primary">{o.label}</span>
              {o.hint && <span className="truncate text-text-tertiary">{o.hint}</span>}
            </span>
            {o.value === value && <Check className="size-3.5 shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-[18px] w-8 shrink-0 cursor-pointer items-center rounded-full border outline-none transition-all after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-1 focus-visible:ring-border-focus-ring',
        checked ? 'border-text-primary bg-text-primary' : 'border-text-primary/20 bg-transparent hover:border-text-primary/35',
      )}
    >
      <span className={cn('pointer-events-none block size-3 rounded-full transition-transform duration-200', checked ? 'translate-x-4 bg-background-full' : 'translate-x-0.5 bg-text-tertiary')} />
    </button>
  );
}

/** Read-only colour chips (the target's swatches): 20px, 6px radius, an inset hairline. */
export function Swatches({ colors }: { colors: readonly string[] }) {
  return (
    <span className="flex gap-1" aria-hidden>
      {colors.map((c) => (
        <span key={c} className="size-5 rounded-md ring-1 ring-black/10 ring-inset" style={{ backgroundColor: c }} />
      ))}
    </span>
  );
}

/** The sun / moon pair in a section header: the current theme is lit, the other one switches to it. */
export function ThemePair({ theme, onToggle }: { theme: 'light' | 'dark'; onToggle: () => void }) {
  const icon = (t: 'light' | 'dark') => (
    <button
      type="button"
      aria-label={t === 'light' ? 'Light theme' : 'Dark theme'}
      aria-pressed={theme === t}
      onClick={() => theme !== t && onToggle()}
      className={cn('flex size-5 cursor-pointer items-center justify-center rounded-sm transition-colors', theme === t ? 'text-text-primary' : 'text-text-primary/30 hover:text-text-primary/70')}
    >
      {t === 'light' ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
    </button>
  );
  return (
    <div className="flex gap-1">
      {icon('light')}
      {icon('dark')}
    </div>
  );
}
