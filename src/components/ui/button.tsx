import * as React from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// shadcn Button, restyled with the design system's secondary-button recipe (the gallery's button style).
const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-0.5 whitespace-nowrap text-body-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        outline:
          'rounded-lg border border-border-button-default bg-background-primary-default text-text-primary shadow-xs hover:border-border-button-hover hover:bg-background-primary-hover focus-visible:ring-offset-2',
        ghost: 'rounded-full text-foreground-icon-secondary hover:bg-background-tertiary-default hover:text-foreground-icon-primary',
        primary: 'rounded-lg bg-text-primary text-background-primary-default hover:opacity-90 focus-visible:ring-offset-2',
      },
      size: {
        default: 'h-8 px-2 py-1.5',
        sm: 'h-7 px-2',
        icon: 'size-8',
      },
    },
    defaultVariants: { variant: 'outline', size: 'default' },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button';
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
