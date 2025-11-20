import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import styles from '@/components/switch/switch.module.css';
import { cn } from '@/lib/utils';

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'danger';
}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, size = 'md', variant = 'default', ...props }, ref) => (
    <SwitchPrimitives.Root
      className={cn(styles['switch'], styles[size], styles[variant], className)}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb className={cn(styles['thumb'], styles[size])} />
    </SwitchPrimitives.Root>
  )
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
