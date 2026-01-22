import * as React from 'react';
import { VariantProps } from 'class-variance-authority';

import styles from '@/components/card/card.module.css';
import { ELEVATION, generateElevationVariants } from '@/lib/elevations';
import { cn } from '@/lib/utils';

const cardElevationVariants = generateElevationVariants(styles, 'card', ELEVATION.RAISED);

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { hoverGradientClassName?: string } & VariantProps<
      typeof cardElevationVariants
    >
>(({ className, hoverGradientClassName, elevation = ELEVATION.RAISED, ...props }, ref) => {
  // If the card should have a hover style
  const shouldHaveHoverStyle = props.onClick !== undefined;
  return (
    <div
      ref={ref}
      className={cn(
        styles.card,
        shouldHaveHoverStyle && styles['card--hover'],
        cardElevationVariants({ elevation }),
        className
      )}
      {...props}
    >
      {shouldHaveHoverStyle && (
        <div className={cn(styles['card-hover-gradient'], hoverGradientClassName)} />
      )}
      {props.children}
    </div>
  );
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(styles['card-header'], className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(styles['card-title'], className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(styles['card-description'], className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(styles['card-content'], className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(styles['card-footer'], className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
