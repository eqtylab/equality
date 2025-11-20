import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import styles from '@/components/tooltip/tooltip.module.css';
import { cn, getThemeProviderRoot } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipPortal = ({ children }: { children: React.ReactNode }) => (
  <TooltipPrimitive.Portal container={getThemeProviderRoot()}>{children}</TooltipPrimitive.Portal>
);

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPortal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(styles['tooltip-content'], className)}
      {...props}
    >
      {props.children}
      <TooltipPrimitive.Arrow width={18} height={6} className={styles['tooltip-arrow']} />
    </TooltipPrimitive.Content>
  </TooltipPortal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
