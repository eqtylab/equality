import { Badge, type BadgeDisplayMode } from '@/components/badge/badge';
import styles from '@/components/control-status-badge/control-status-badge.module.css';

export type ControlStatusBadgeDisplayMode = BadgeDisplayMode;

interface ControlStatusBadgeProps {
  status: string;
  display?: ControlStatusBadgeDisplayMode;
}

const ControlStatusBadge = ({ status, display = 'both' }: ControlStatusBadgeProps) => {
  const config = getStatusConfig(status);

  return (
    <Badge icon={config.icon} display={display} className={config.className} variant={null}>
      {config.label}
    </Badge>
  );
};

// Helper function
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'in-progress':
      return {
        icon: 'Clock',
        className: styles['badge--in-progress'],
        label: 'In Progress',
      };
    case 'not-started':
      return {
        icon: 'Circle',
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
        icon: 'MessageCircle',
        className: styles['badge--comment'],
        label: 'Comment',
      };
    case 'not-applicable':
      return {
        icon: 'MinusCircle',
        className: styles['badge--not-applicable'],
        label: 'Not Applicable',
      };
    case 'accepted':
      return {
        icon: <MessageCircleCheckIcon />,
        className: styles['badge--accepted'],
        label: 'Accepted',
      };
    case 'questioned':
      return {
        icon: 'MessageCircleQuestion',
        className: styles['badge--question'],
        label: 'Questioned',
      };
    case 'general':
      return {
        icon: 'MessageCircle',
        className: styles['badge--comment'],
        label: 'General',
      };
    case 'compliant':
      return {
        icon: 'Check',
        className: styles['badge--compliant'],
        label: 'Compliant',
      };
    case 'non-compliant':
      return {
        icon: 'TriangleAlert',
        className: styles['badge--non-compliant'],
        label: 'Non-compliant',
      };
    default:
      return {
        icon: 'Circle',
        className: styles['badge--not-started'],
        label: status,
      };
  }
};

export { ControlStatusBadge };

// TODO: Remove and replace with Lucide icon once PR #3770 gets merged into their repo.
const MessageCircleCheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
};
