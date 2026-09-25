import * as React from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Icon } from '@/components/icon/icon';
import styles from '@/components/segmented-controls/segmented-controls.module.css';
import { cn } from '@/lib/utils';

export type SegmentedControlsDisplay = 'both' | 'text-only' | 'icon-only';
export type SegmentedControlsSize = 'sm' | 'md' | 'lg';

export interface SegmentedControlOption {
  /** Unique value used to identify the option. */
  value: string;
  /** Text label. Mandatory — used as the visible text and as the accessible label when `display="icon-only"`. */
  label: string;
  /** Optional prefix icon: a Lucide icon name or a React element. */
  icon?: React.ReactElement | string;
  /** Optional content rendered after the label. */
  suffix?: React.ReactNode;
}

export interface SegmentedControlsProps {
  options: SegmentedControlOption[];
  value: string;
  onValueChange: (value: string) => void;
  /**
   * Controls what is rendered inside each segment.
   * `icon-only` requires every option to define an `icon` and falls back to `both` otherwise.
   */
  display?: SegmentedControlsDisplay;
  /** Matches the height of a `Button` of the same size. */
  size?: SegmentedControlsSize;
  className?: string;
}

const SegmentedControls = ({
  options,
  value,
  onValueChange,
  display = 'both',
  size = 'md',
  className,
}: SegmentedControlsProps) => {
  const allHaveIcons = options.every((option) => option.icon != null);
  // icon-only is only valid when every option has an icon, otherwise fall back to showing both.
  const effectiveDisplay = display === 'icon-only' && !allHaveIcons ? 'both' : display;
  const isIconOnly = effectiveDisplay === 'icon-only';

  const containerRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });
  const [animateIndicator, setAnimateIndicator] = useState(false);

  const updateIndicator = useCallback(() => {
    const activeSegment = segmentRefs.current[value];
    if (activeSegment) {
      setIndicator({ left: activeSegment.offsetLeft, width: activeSegment.offsetWidth });
    }
  }, [value]);

  // Reposition the indicator whenever the active value, options, or display mode change.
  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, options, effectiveDisplay, size]);

  // Enabling the transition in the same frame as the first measurement makes the indicator slide in from the left edge on mount.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimateIndicator(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Keep the indicator aligned when the control is resized.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateIndicator]);

  return (
    <div
      ref={containerRef}
      className={cn(styles['segmented-controls'], styles[`size--${size}`], className)}
    >
      {options.map((option) => {
        const currentlyActive = option.value === value;
        const showIcon = option.icon != null && effectiveDisplay !== 'text-only';
        const showLabel = effectiveDisplay !== 'icon-only';

        return (
          <button
            key={option.value}
            ref={(el) => {
              segmentRefs.current[option.value] = el;
            }}
            type="button"
            aria-pressed={currentlyActive}
            aria-label={isIconOnly ? option.label : undefined}
            title={isIconOnly ? option.label : undefined}
            className={cn(
              styles['segment'],
              isIconOnly && styles['segment--icon-only'],
              currentlyActive ? styles['segment--active'] : styles['segment--inactive']
            )}
            onClick={() => onValueChange(option.value)}
          >
            {showIcon && <Icon icon={option.icon!} size="xs" className={styles['segment-icon']} />}
            {showLabel && <span>{option.label}</span>}
            {!isIconOnly && option.suffix && (
              <span className={styles['segment-suffix']}>{option.suffix}</span>
            )}
          </button>
        );
      })}
      <div
        className={cn(
          styles['active-segment-indicator'],
          animateIndicator && styles['active-segment-indicator--animated']
        )}
        style={
          {
            transform: `translateX(${indicator.left}px)`,
            '--indicator-width': `${indicator.width}px`,
          } as React.CSSProperties
        }
      />
    </div>
  );
};

export { SegmentedControls };
