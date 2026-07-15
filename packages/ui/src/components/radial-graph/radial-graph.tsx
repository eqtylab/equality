import { forwardRef, type HTMLAttributes } from 'react';

import styles from '@/components/radial-graph/radial-graph.module.css';
import { cn } from '@/lib/utils';

export interface RadialGraphProps extends HTMLAttributes<HTMLDivElement> {
  percentage: number;
  displayLabel?: string;
  subLabel?: string;
  graphSize?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'danger' | 'warning';
}

const RadialGraph = forwardRef<HTMLDivElement, RadialGraphProps>(
  (
    {
      percentage,
      displayLabel,
      className,
      subLabel,
      graphSize = 'md',
      variant = 'primary',
      ...props
    },
    ref
  ) => {
    const bars = Array.from({ length: 100 });
    const label = displayLabel ?? `${Math.round(percentage)}%`;

    const value = Math.min(100, Math.max(0, Math.round(percentage)));
    const isNamed = props['aria-label'] != null || props['aria-labelledby'] != null;
    const fallbackName = [displayLabel, subLabel].filter(Boolean).join(' ') || undefined;

    return (
      <div
        ref={ref}
        role="progressbar"
        tabIndex={0}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={isNamed ? undefined : fallbackName}
        className={cn(styles['radial-graph'], styles[graphSize], className)}
        {...props}
      >
        <div className={styles['bars-container']} aria-hidden="true">
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
                      styles[`bar-gradient--${variant}`],
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
        <div className={styles['label-container']} aria-hidden="true">
          <p className={cn(styles['label'], styles[graphSize])}>{label}</p>
          {subLabel && <p className={styles['sub-label']}>{subLabel}</p>}
        </div>
      </div>
    );
  }
);
RadialGraph.displayName = 'RadialGraph';

export { RadialGraph };
