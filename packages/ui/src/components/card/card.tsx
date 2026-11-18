import * as React from 'react';
import { VariantProps } from 'class-variance-authority';

import styles from '@/components/card/card.module.css';
import { ELEVATION, generateElevationVariants } from '@/lib/elevations';
import { cn } from '@/lib/utils';

const cardElevationVariants = generateElevationVariants(styles, 'card', ELEVATION.RAISED);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardElevationVariants> {
  /** Classes for the hover gradient, which renders on a clickable card that isn't a choice */
  hoverGradientClassName?: string;
  /** Makes the card a choice in a set, such as a radio card: a grey hover, and the current-item fill and a primary border while `true` */
  selected?: boolean;
  /** Tints the border and background with a status colour */
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      hoverGradientClassName,
      elevation = ELEVATION.RAISED,
      selected,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const isClickable = props.onClick !== undefined;
    const isChoice = selected !== undefined;
    // If the card should have a hover style
    const shouldHaveHoverStyle = isClickable && !isChoice;
    return (
      <div
        ref={ref}
        className={cn(
          styles.card,
          shouldHaveHoverStyle && styles['card--hover'],
          cardElevationVariants({ elevation }),
          isChoice && isClickable && styles['card--choice'],
          selected && styles['card--selected'],
          variant !== 'default' && styles[`card--${variant}`],
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
  }
);
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
