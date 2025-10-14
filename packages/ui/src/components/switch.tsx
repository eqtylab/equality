import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '../lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    variant?: 'default' | 'small';
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer focus-visible:ring-ring focus-visible:ring-offset-background inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
      variant === 'default' &&
        'data-[state=checked]:bg-lilac data-[state=unchecked]:bg-lilac-button h-6 w-11',
      variant === 'small' &&
        'data-[state=checked]:bg-lilac data-[state=unchecked]:bg-lilac-button h-5 w-9',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'bg-background pointer-events-none block rounded-full shadow-lg ring-0 transition-transform',
        variant === 'default' &&
          'h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        variant === 'small' &&
          'h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
