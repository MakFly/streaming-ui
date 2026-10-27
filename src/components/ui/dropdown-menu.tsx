import * as React from 'react';
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

// shadcn DropdownMenu on Streaming UI tokens (floating panel = shadow-dropdown).
function DropdownMenu(props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}
function DropdownMenuTrigger(props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}
/* Which input came last. A menu closed with the mouse doesn't hand focus back to its trigger (that left a focus
 * ring on the button after every pick); closed from the keyboard it still does, so keyboard use is unchanged. */
let lastInput: 'pointer' | 'keyboard' = 'pointer';
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', () => (lastInput = 'pointer'), true);
  window.addEventListener('keydown', () => (lastInput = 'keyboard'), true);
}

function DropdownMenuContent({ className, sideOffset = 6, onCloseAutoFocus, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        onCloseAutoFocus={(e) => {
          onCloseAutoFocus?.(e);
          if (lastInput === 'pointer') e.preventDefault();
        }}
        className={cn(
          'z-50 min-w-48 overflow-hidden rounded-xl border border-border-button-default bg-dropdown-background p-1 text-text-primary shadow-dropdown data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}
function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-body-2-medium text-text-primary outline-none select-none data-[highlighted]:bg-dropdown-item-hover-background [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-foreground-icon-secondary',
        className,
      )}
      {...props}
    />
  );
}
function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-separator-border', className)} {...props} />;
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator };
