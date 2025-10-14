import * as React from 'react';

import { cn } from '../lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { hoverGradientClassName?: string }
>(({ className, hoverGradientClassName, ...props }, ref) => {
  // If the card should have a hover style
  const shouldHaveHoverStyle = props.onClick !== undefined;
  return (
    <div
      ref={ref}
      className={cn(
        'group border-border bg-card/2 text-foreground @container/card relative overflow-hidden rounded-lg border shadow-sm',
        shouldHaveHoverStyle &&
          'hover:border-highlight active:border-highlight cursor-pointer transition-colors',
        className
      )}
      {...props}
    >
      {shouldHaveHoverStyle && (
        <div
          className={cn(
            'from-highlight/0 to-highlight/10 pointer-events-none absolute inset-0 bg-linear-to-br opacity-0',
            'transition-opacity duration-700 group-hover:opacity-100 group-active:opacity-100',
            hoverGradientClassName
          )}
        />
      )}
      {props.children}
    </div>
  );
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 px-3 py-4', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-2xl font-medium', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-muted-foreground text-sm', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-3', className)} {...props} />
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-3 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
