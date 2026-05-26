import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { Icon } from '@/components/icon/icon';
import styles from '@/components/progress-indicator/progress-indicator.module.css';
import { Progress } from '@/components/progress/progress';
import { cn } from '@/lib/utils';

type ProgressIndicatorLayout = 'horizontal' | 'vertical';
type ProgressIndicatorStatus = 'editing' | 'empty' | 'neutral' | 'success' | 'info' | 'danger';

/* Each status maps to a lucide icon */
const STATUS_ICONS: Record<ProgressIndicatorStatus, string> = {
  editing: 'SquarePen',
  empty: 'CircleDashed',
  neutral: 'Circle',
  success: 'CircleCheck',
  info: 'Info',
  danger: 'TriangleAlert',
};

/* Visually-hidden text so the status is conveyed to assistive tech. */
const STATUS_LABELS: Record<ProgressIndicatorStatus, string> = {
  editing: 'In progress',
  empty: 'Not started',
  neutral: '',
  success: 'Completed',
  info: 'Information',
  danger: 'Error',
};

const layoutVariants = cva(styles['progress-indicator'], {
  variants: {
    layout: {
      horizontal: styles['progress-indicator--horizontal'],
      vertical: styles['progress-indicator--vertical'],
    },
  },
  defaultVariants: {
    layout: 'horizontal',
  },
});

const markerVariants = cva(styles['progress-indicator-step-marker'], {
  variants: {
    status: {
      editing: '',
      empty: '',
      neutral: '',
      info: '',
      success: styles['progress-indicator-step-marker--success'],
      danger: styles['progress-indicator-step-marker--danger'],
    },
    active: {
      true: styles['progress-indicator-step-marker--active'],
      false: '',
    },
  },
  defaultVariants: {
    status: 'neutral',
    active: false,
  },
});

export interface ProgressIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof layoutVariants> {
  layout?: ProgressIndicatorLayout;
  /** Index of the current step. Each step compares its own index to this. */
  currentIndex: number;
  children: React.ReactNode;
}

function ProgressIndicator({
  layout = 'horizontal',
  currentIndex = 0,
  className,
  children,
  'aria-label': ariaLabel = 'Progress',
  ...props
}: ProgressIndicatorProps) {
  const stepChildren = React.Children.toArray(children);
  const stepCount = stepChildren.length;
  const hasActive = currentIndex >= 0 && currentIndex < stepCount;
  const segmentSize = stepCount > 0 ? 100 / stepCount : 0;

  // Pass each step its own array index plus the current index so it can work
  // out whether it is the active step. Only ProgressIndicatorStep children are
  // allowed.
  const steps = stepChildren.map((child, index) => {
    if (!React.isValidElement(child) || child.type !== ProgressIndicatorStep) {
      throw new Error('ProgressIndicator only accepts <ProgressIndicatorStep> children.');
    }

    return React.cloneElement(child as React.ReactElement<ProgressIndicatorStepProps>, {
      index,
      currentIndex,
    });
  });

  return (
    <div className={cn(layoutVariants({ layout }), className)} {...props}>
      {/* The rail spans the full length of the steps, the fill is constrained
          to one segment and offset to sit over the active step with CSS */}
      <div className={styles['progress-indicator-track']} aria-hidden="true">
        <Progress
          value={100}
          color="primary"
          className={styles['progress-indicator-rail']}
          style={
            {
              '--pi-segment-size': hasActive ? `${segmentSize}%` : '0%',
              '--pi-active-index': hasActive ? `${currentIndex}` : '0',
            } as React.CSSProperties
          }
        />
      </div>
      <ul className={styles['progress-indicator-steps']} aria-label={ariaLabel}>
        {steps}
      </ul>
    </div>
  );
}

export interface ProgressIndicatorStepProps extends Omit<
  React.LiHTMLAttributes<HTMLLIElement>,
  'onClick'
> {
  name: string;
  description?: string;
  status?: ProgressIndicatorStatus;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  /** @internal Injected by ProgressIndicator — this step's array index. */
  index?: number;
  /** @internal Injected by ProgressIndicator — the current step's index. */
  currentIndex?: number;
}

function ProgressIndicatorStep({
  name,
  description,
  status = 'neutral',
  href,
  onClick,
  className,
  index,
  currentIndex,
  ...props
}: ProgressIndicatorStepProps) {
  const statusIcon = STATUS_ICONS[status];
  const statusLabel = STATUS_LABELS[status];
  const interactive = Boolean(href || onClick);
  const active = index !== undefined && index === currentIndex;

  const content = (
    <>
      <Icon
        icon={statusIcon}
        background="circle"
        size="md"
        aria-hidden="true"
        className={markerVariants({ status, active })}
      />
      <span className={styles['progress-indicator-step-text']}>
        <span className={styles['progress-indicator-step-name']}>{name}</span>
        {description && (
          <span className={styles['progress-indicator-step-description']}>{description}</span>
        )}
        {statusLabel && (
          <span className={styles['progress-indicator-step-status']}>{statusLabel}</span>
        )}
      </span>
    </>
  );

  const innerClassName = cn(
    styles['progress-indicator-step-inner'],
    interactive && styles['progress-indicator-step-inner--interactive']
  );

  let inner: React.ReactNode;
  if (href) {
    inner = (
      <a href={href} className={innerClassName} aria-current={active ? 'step' : undefined}>
        {content}
      </a>
    );
  } else if (onClick) {
    inner = (
      <button
        type="button"
        onClick={onClick}
        className={innerClassName}
        aria-current={active ? 'step' : undefined}
      >
        {content}
      </button>
    );
  } else {
    // Non-interactive steps render as a <div> so future/disabled steps are not focusable
    inner = (
      <div className={innerClassName} aria-current={active ? 'step' : undefined}>
        {content}
      </div>
    );
  }

  return (
    <li
      className={cn(
        styles['progress-indicator-step'],
        active && styles['progress-indicator-step--active'],
        className
      )}
      {...props}
    >
      {inner}
    </li>
  );
}

export { ProgressIndicator, ProgressIndicatorStep };
