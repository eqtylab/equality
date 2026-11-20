import type { ReactElement } from 'react';

import { Badge, type BadgeDisplayMode } from '@/components/badge/badge';
import styles from '@/components/control-status-badge/control-status-badge.module.css';
import { Icon } from '@/components/icon/icon';
import { cn } from '@/lib/utils';

export type ControlStatusBadgeDisplayMode = BadgeDisplayMode;

interface ControlStatusBadgeProps {
  status: string;
  display?: ControlStatusBadgeDisplayMode;
}

interface StatusConfig {
  icon: string | ReactElement;
  className: string;
  label: string;
  // When present, the badge renders as a segmented pill: a filled status
  // segment ("In Review") followed by a border-only sub-status segment.
  subLabel?: string;
}

const ControlStatusBadge = ({ status, display = 'both' }: ControlStatusBadgeProps) => {
  const config = getStatusConfig(status);

  // "In Review" statuses split into a filled status + a border-only sub-status.
  if (config.subLabel) {
    // Icon-only collapses to just the filled "In Review" indicator.
    if (display === 'icon-only') {
      return (
        <Badge icon={config.icon} display="icon-only" className={config.className} variant={null}>
          {config.label}
        </Badge>
      );
    }

    return (
      <div className={cn(styles['split-badge'], config.className)}>
        <span className={styles['split-badge__status']}>
          {display !== 'text-only' && (
            <Icon icon={config.icon} size="xs" className={styles['icon']} />
          )}
          {config.label}
        </span>
        <span className={styles['split-badge__sub-status']}>{config.subLabel}</span>
      </div>
    );
  }

  return (
    <Badge icon={config.icon} display={display} className={config.className} variant={null}>
      {config.label}
    </Badge>
  );
};

// Helper function
const getStatusConfig = (status: string): StatusConfig => {
  switch (status) {
    case 'in-progress':
      return {
        icon: 'FilePenLine',
        className: styles['badge--in-progress'],
        label: 'In Progress',
      };
    case 'not-started':
      return {
        icon: 'CircleDashed',
        className: styles['badge--not-started'],
        label: 'Not Started',
      };
    case 'ready-for-review':
      return {
        icon: 'ClipboardCheck',
        className: styles['badge--ready-for-review'],
        label: 'Ready for Review',
      };
    case 'in-review':
      return {
        icon: 'Eye',
        className: styles['badge--in-review'],
        label: 'In Review',
      };
    case 'comment':
      return {
        icon: 'Eye',
        className: styles['badge--comment'],
        label: 'In Review',
        subLabel: 'General',
      };
    case 'not-applicable':
      return {
        icon: 'MinusCircle',
        className: styles['badge--not-applicable'],
        label: 'Not Applicable',
      };
    case 'accepted':
      return {
        icon: 'Eye',
        className: styles['badge--accepted'],
        label: 'In Review',
        subLabel: 'Accepted',
      };
    case 'questioned':
      return {
        icon: 'Eye',
        className: styles['badge--question'],
        label: 'In Review',
        subLabel: 'Questioned',
      };
    case 'compliant':
      return {
        icon: 'Check',
        className: styles['badge--compliant'],
        label: 'Compliant',
      };
    case 'non-compliant':
      return {
        icon: 'X',
        className: styles['badge--non-compliant'],
        label: 'Non-compliant',
      };
    default:
      return {
        icon: 'CircleDashed',
        className: styles['badge--not-started'],
        label: status,
      };
  }
};

export { ControlStatusBadge };
