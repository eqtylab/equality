import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import styles from '@/components/bar-graph/bar-graph.module.css';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { cn } from '@/lib/utils';

export interface BarGraphSegmentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Proportional value used to compute the segment's width (`value / sum of all values`). */
  value: number;
  /** Any valid CSS color, applied as the segment's background. */
  color: string;
  /**
   * Visible legend label, shown when `showLabels` is set on the parent `BarGraph`.
   * Not announced to screen readers — the segment's accessible name is its `tooltip`.
   */
  label: string;
  /**
   * Tooltip content shown on hover and keyboard focus. Also the segment's accessible
   * name, so it must describe the segment on its own. Required.
   */
  tooltip: React.ReactNode;
}

const BarGraphSegment = React.forwardRef<HTMLDivElement, BarGraphSegmentProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ value, color, label, tooltip, className, style, ...props }, ref) => {
    // The segment's accessible name is the tooltip content.
    // It's announced immediately on focus.
    const tooltipId = React.useId();

    return (
      // Widths are proportional (`value / sum`): each segment grows by its `value`
      // within the flex row, so the parent never needs to know the total.
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={ref}
            tabIndex={0}
            aria-labelledby={tooltipId}
            aria-describedby={undefined}
            className={cn(styles['segment'], className)}
            style={{
              flexGrow: value,
              // Floor every segment at 2px so small (and zero) values stay visible
              // and focusable. This slightly skews the proportions for tiny slices.
              minWidth: 2,
              backgroundColor: color,
              ...style,
            }}
            {...props}
          >
            <div id={tooltipId} className={styles['visually-hidden']}>
              {tooltip}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }
);
BarGraphSegment.displayName = 'BarGraphSegment';

const barVariants = cva(styles['bar'], {
  variants: {
    size: {
      sm: styles['size--sm'],
      md: styles['size--md'],
      lg: styles['size--lg'],
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

/**
 * A single `BarGraphSegment` element. False values are allowed so conditional
 * rendering (`{condition && <BarGraphSegment … />}`) keeps working. Non-segment
 * children are filtered out at runtime — see `BarGraph`.
 */
type BarGraphChild = React.ReactElement<BarGraphSegmentProps> | boolean | null | undefined;

export interface BarGraphProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>, VariantProps<typeof barVariants> {
  /** Render a visible legend (color swatch + label) beneath the bar. Defaults to `false`. */
  showLabels?: boolean;
  /** Bar height. `md` and `lg` use rounded rectangles instead of a full pill. Defaults to `md`. */
  size?: 'sm' | 'md' | 'lg';
  /** One or more `BarGraphSegment` elements. */
  children: BarGraphChild | BarGraphChild[];
}

const BarGraph = React.forwardRef<HTMLDivElement, BarGraphProps>(
  ({ className, children, showLabels = false, size, ...props }, ref) => {
    const validChildren = React.Children.toArray(children).filter(React.isValidElement);
    const segments = validChildren.filter(
      (child): child is React.ReactElement<BarGraphSegmentProps> => child.type === BarGraphSegment
    );

    return (
      <TooltipProvider>
        <div ref={ref} className={cn(styles['bar-graph'], className)} {...props}>
          <div className={barVariants({ size })}>{segments}</div>
          {showLabels && (
            <ul className={styles['legend']} aria-hidden="true">
              {segments.map((child, index) => (
                <li key={index} className={styles['legend-item']}>
                  <span
                    className={styles['legend-swatch']}
                    style={{ backgroundColor: child.props.color }}
                  />
                  <span className={styles['legend-label']}>{child.props.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </TooltipProvider>
    );
  }
);
BarGraph.displayName = 'BarGraph';

export { BarGraph, BarGraphSegment };
