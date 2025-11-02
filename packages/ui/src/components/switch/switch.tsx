import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import styles from '@/components/switch/switch.module.css';
import { cn } from '@/lib/utils';

// TODO: Use cva for variants
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    variant?: 'default' | 'small';
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      styles['switch'],
      variant === 'default' && styles['switch--default'],
      variant === 'small' && styles['switch--small'],
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        styles['thumb'],
        variant === 'default' && styles['thumb--default'],
        variant === 'small' && styles['thumb--small']
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
