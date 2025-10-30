import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

import styles from '@/components/separator/separator.module.css';
import { cn } from '@/lib/utils';

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      styles['separator'],
      orientation === 'horizontal'
        ? styles['separator--horizontal']
        : styles['separator--vertical'],
      className
    )}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
