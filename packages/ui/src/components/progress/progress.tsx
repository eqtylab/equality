import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import styles from '@/components/progress/progress.module.css';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  color?: 'primary' | 'secondary' | 'green' | 'red' | 'gold';
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, color = 'primary', ...props }, ref) => (
    <ProgressPrimitive.Root ref={ref} className={cn(styles['progress'], className)} {...props}>
      <ProgressPrimitive.Indicator
        className={cn(styles['progress-indicator'], styles[color])}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
