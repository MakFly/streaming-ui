import { Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PALETTES, useTheme } from '@/providers/theme-provider';
import { cn } from '@/lib/utils';

/** Three overlapping dots: background, surface, accent. */
function Swatches({ colors, className }: { colors: readonly string[]; className?: string }) {
  return (
    <span className={cn('flex items-center -space-x-1.5', className)} aria-hidden>
      {colors.map((c, i) => (
        <span key={i} className="size-3.5 rounded-full ring-2 ring-background-primary-default" style={{ backgroundColor: c }} />
      ))}
    </span>
  );
}

/** Picks the colour palette for the whole site; the choice is saved and the template previews follow it. */
export function PalettePicker({ className }: { className?: string }) {
  const { palette, setPalette } = useTheme();
  const current = PALETTES.find((p) => p.id === palette) ?? PALETTES[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Colour palette: ${current.name}`}
        className={cn('grid size-9 shrink-0 place-items-center rounded-2lg outline-none transition-colors hover:bg-background-tertiary-default focus-visible:ring-2 focus-visible:ring-border-focus-ring data-[state=open]:bg-background-tertiary-default', className)}
      >
        <Swatches colors={current.swatches} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-1.5">
        <p className="px-2 pt-1 pb-1.5 text-caption-1-medium text-text-tertiary">Colour palette</p>
        {PALETTES.map((p) => (
          <DropdownMenuItem key={p.id} onSelect={() => setPalette(p.id)} className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Swatches colors={p.swatches} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-body-2-medium text-text-primary">{p.name}</span>
              <span className="truncate text-caption-1-regular text-text-tertiary">{p.hint}</span>
            </span>
            {p.id === palette && <Check className="size-4 text-text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
