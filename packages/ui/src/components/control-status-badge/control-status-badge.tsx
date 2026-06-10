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
        icon: 'Clock',
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
        icon: <CircleCheckFillIcon />,
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

// Custom filled icon — intentionally uses a fill, which Lucide's icon set never does.
const CircleCheckFillIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM15.707 9.29297C15.3165 8.90245 14.6835 8.90244 14.293 9.29297L11 12.5859L9.70703 11.293C9.31651 10.9024 8.68349 10.9024 8.29297 11.293C7.90244 11.6835 7.90245 12.3165 8.29297 12.707L10.293 14.707C10.6835 15.0976 11.3165 15.0976 11.707 14.707L15.707 10.707C16.0976 10.3165 16.0976 9.68349 15.707 9.29297Z" />
    </svg>
  );
};
