import { forwardRef } from 'react';

import { cn } from '../lib/utils';

export interface RadialGraphProps {
  percentage: number;
  displayLabel?: string;
  className?: string;
  labelClassName?: string;
  subLabel?: string;
}

const RadialGraph = forwardRef<HTMLDivElement, RadialGraphProps>(
  ({ percentage, displayLabel, className, labelClassName, subLabel, ...props }, ref) => {
    const bars = Array.from({ length: 100 });
    const label = displayLabel ?? `${Math.round(percentage)}%`;

    return (
      <div ref={ref} className={cn('relative aspect-square w-full', className)} {...props}>
        <div className="absolute inset-0 translate-x-1/2">
          {bars.map((_, i) => {
            const isActive = i < percentage;
            const delay = `${i * 10}ms`;

            return (
              <div
                key={i}
                className="absolute h-1/2 w-[2px] origin-bottom"
                style={{
                  transform: `rotate(${i * 3.6}deg)`,
                }}
              >
                <div
                  className={cn(
                    'absolute top-0 right-0 left-0 h-3/4 overflow-hidden rounded-full transition-transform',
                    isActive
                      ? 'animate-grow-in scale-y-100 will-change-transform'
                      : 'scale-y-[0.75]'
                  )}
                  style={{
                    transitionDelay: delay,
                    animationDelay: delay,
                  }}
                >
                  <div className="from-muted-foreground/50 absolute inset-0 bg-linear-to-b to-50%" />
                  <div
                    className={cn(
                      'from-highlight absolute inset-0 bg-linear-to-b to-50% transition-opacity',
                      isActive ? 'will-change-opacity animate-fade-in opacity-100' : 'opacity-0'
                    )}
                    style={{
                      transitionDelay: delay,
                      animationDelay: delay,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className={cn('text-5xl font-medium', labelClassName)}>{label}</p>
          {subLabel && <p className="text-sm">{subLabel}</p>}
        </div>
      </div>
    );
  }
);
RadialGraph.displayName = 'RadialGraph';

export { RadialGraph };
