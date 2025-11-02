import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import styles from '@/components/popover/popover.module.css';
import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & { arrow?: boolean }
>(({ className, align = 'center', sideOffset = 4, arrow = false, children, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(styles['popover-content'], className)}
      {...props}
    >
      {arrow && <PopoverPrimitive.Arrow className={styles['popover-arrow']} />}
      {children}
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverContent, PopoverTrigger };
