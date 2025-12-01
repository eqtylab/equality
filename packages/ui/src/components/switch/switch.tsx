import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { Icon } from '@/components/icon/icon';
import styles from '@/components/switch/switch.module.css';
import { cn } from '@/lib/utils';

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'danger';
  thumbIcon?: React.ReactElement | string;
}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, size = 'md', variant = 'default', thumbIcon, ...props }, ref) => {
    console.log(thumbIcon);
    return (
      <SwitchPrimitives.Root
        className={cn(styles['switch'], styles[size], styles[variant], className)}
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb className={cn(styles['thumb'], styles[size])}>
          {thumbIcon && <Icon icon={thumbIcon} className={styles['thumb-icon']} size="xs" />}
        </SwitchPrimitives.Thumb>
      </SwitchPrimitives.Root>
    );
  }
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
