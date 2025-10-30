import { forwardRef } from 'react';

import styles from '@/components/radial-graph/radial-graph.module.css';
import { cn } from '@/lib/utils';

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
      <div ref={ref} className={cn(styles['radial-graph'], className)} {...props}>
        <div className={styles['bars-container']}>
          {bars.map((_, i) => {
            const isActive = i < percentage;
            const delay = `${i * 10}ms`;

            return (
              <div
                key={i}
                className={styles['bar']}
                style={{
                  transform: `rotate(${i * 3.6}deg)`,
                }}
              >
                <div
                  className={cn(
                    styles['bar-inner'],
                    isActive ? styles['bar-inner--active'] : styles['bar-inner--inactive']
                  )}
                  style={{
                    transitionDelay: delay,
                    animationDelay: delay,
                  }}
                >
                  <div className={styles['bar-background']} />
                  <div
                    className={cn(
                      styles['bar-gradient'],
                      isActive ? styles['bar-gradient--active'] : styles['bar-gradient--inactive']
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
        <div className={styles['label-container']}>
          <p className={cn(styles['label'], labelClassName)}>{label}</p>
          {subLabel && <p className={styles['sub-label']}>{subLabel}</p>}
        </div>
      </div>
    );
  }
);
RadialGraph.displayName = 'RadialGraph';

export { RadialGraph };
