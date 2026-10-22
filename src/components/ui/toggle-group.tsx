import * as React from 'react';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

// shadcn ToggleGroup styled as the design system's segmented control.
function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn('inline-flex items-center gap-0.5 rounded-2lg bg-segmented-control-background p-1 dark:bg-background-tertiary-default', className)}
      {...props}
    />
  );
}

function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-body-medium text-text-secondary transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring data-[state=on]:bg-segmented-control-selected-background data-[state=on]:text-text-primary data-[state=on]:shadow-2xs',
        className,
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
