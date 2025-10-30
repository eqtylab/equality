import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import styles from '@/components/progress/progress.module.css';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, color, ...props }, ref) => (
  <ProgressPrimitive.Root ref={ref} className={cn(styles['progress'], className)} {...props}>
    <ProgressPrimitive.Indicator
      className={cn(styles['progress-indicator'], color ?? styles['progress-indicator--color'])}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
