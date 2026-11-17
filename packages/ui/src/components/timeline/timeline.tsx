import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { Icon } from '@/components/icon/icon';
import styles from '@/components/timeline/timeline.module.css';
import { cn } from '@/lib/utils';

const timelineVariants = cva(styles['timeline'], {
  variants: {
    /** The markers' size: `sm` an icon-only Badge, `md` as tall as a Button, `lg` for a page's main column */
    size: {
      sm: styles['timeline--sm'],
      md: styles['timeline--md'],
      lg: styles['timeline--lg'],
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const timelineSectionVariants = cva(styles['timeline-section'], {
  variants: {
    /** The status the section's marker and connector report */
    variant: {
      neutral: '',
      primary: styles['timeline-section--primary'],
      success: styles['timeline-section--success'],
      warning: styles['timeline-section--warning'],
      danger: styles['timeline-section--danger'],
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
});

export interface TimelineProps
  extends React.OlHTMLAttributes<HTMLOListElement>, VariantProps<typeof timelineVariants> {
  /** Names the timeline for assistive technology, such as "Control timeline" */
  'aria-label': string;
  /** The `TimelineSection`s, in the order they happened */
  children: React.ReactNode;
}

const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ className, size, children, ...props }, ref) => (
    <ol ref={ref} className={cn(timelineVariants({ size }), className)} {...props}>
      {children}
    </ol>
  )
);
Timeline.displayName = 'Timeline';

export interface TimelineSectionProps
  extends React.LiHTMLAttributes<HTMLLIElement>, VariantProps<typeof timelineSectionVariants> {
  /** Names the section's entries for assistive technology, such as "Events while in review". The marker is decorative, so this is what says the state */
  label: string;
  /** Lucide icon name or element, drawn in the marker. The timeline sizes it */
  icon: React.ReactElement | string;
  /** The section's `TimelineItem`s */
  children: React.ReactNode;
}

const TimelineSection = React.forwardRef<HTMLLIElement, TimelineSectionProps>(
  ({ className, variant, label, icon, children, ...props }, ref) => (
    <li ref={ref} className={cn(timelineSectionVariants({ variant }), className)} {...props}>
      <div className={styles['timeline-rail']} aria-hidden="true">
        <div className={styles['timeline-connector']} />
        <div className={styles['timeline-marker']}>
          <Icon
            icon={icon}
            size="xs"
            background="transparent"
            className={styles['timeline-glyph']}
          />
        </div>
      </div>
      <ol className={styles['timeline-items']} aria-label={label}>
        {children}
      </ol>
    </li>
  )
);
TimelineSection.displayName = 'TimelineSection';

export interface TimelineItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /** Makes the entry a link's target, such as `#event-12` */
  id?: string;
  /** The entry: a card, a line of text, anything */
  children: React.ReactNode;
}

const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn(styles['timeline-item'], className)} {...props} />
  )
);
TimelineItem.displayName = 'TimelineItem';

export { Timeline, TimelineItem, TimelineSection };
