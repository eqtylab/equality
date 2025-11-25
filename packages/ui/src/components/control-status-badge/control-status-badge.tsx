import { Badge, type BadgeDisplayMode } from '@/components/badge/badge';
import styles from '@/components/control-status-badge/control-status-badge.module.css';

interface ControlStatusBadgeProps {
  status: string;
  hideIcon?: boolean;
  hideLabel?: boolean;
}

const ControlStatusBadge = ({
  status,
  hideIcon = false,
  hideLabel = false,
}: ControlStatusBadgeProps) => {
  const config = getStatusConfig(status);

  // Convert hideIcon/hideLabel to display mode
  const getDisplayMode = (): BadgeDisplayMode => {
    if (hideIcon && hideLabel) return 'both'; // fallback
    if (hideIcon) return 'textonly';
    if (hideLabel) return 'icononly';
    return 'both';
  };

  return (
    <Badge icon={config.icon} display={getDisplayMode()} className={config.className}>
      {config.label}
    </Badge>
  );
};

// Helper function
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'In Progress':
      return {
        icon: 'Clock',
        className: styles['badge--in-progress'],
        label: 'In Progress',
      };
    case 'Not Started':
      return {
        icon: 'Circle',
        className: styles['badge--not-started'],
        label: 'Not Started',
      };
    case 'Ready For Review':
      return {
        icon: 'ClipboardCheck',
        className: styles['badge--ready-for-review'],
        label: 'Ready for Review',
      };
    case 'In Review':
      return {
        icon: 'Eye',
        className: styles['badge--in-review'],
        label: 'In Review',
      };
    case 'COMMENT':
      return {
        icon: 'MessageCircle',
        className: styles['badge--comment'],
        label: 'Comment',
      };
    case 'FAILED':
      return {
        icon: 'XCircle',
        className: styles['badge--non-compliant'],
        label: 'Failed',
      };
    case 'Not Applicable':
    case 'NOT_APPLICABLE':
      return {
        icon: 'MinusCircle',
        className: styles['badge--not-applicable'],
        label: 'Not Applicable',
      };
    case 'ACCEPTED':
      return {
        icon: <MessageCircleCheckIcon />,
        className: styles['badge--accepted'],
        label: 'Accepted',
      };
    case 'QUESTIONED':
      return {
        icon: 'MessageCircleQuestion',
        className: styles['badge--question'],
        label: 'Questioned',
      };
    case 'GENERAL':
      return {
        icon: 'MessageCircle',
        className: styles['badge--comment'],
        label: 'General',
      };
    case 'Compliant':
    case 'compliant':
    case 'COMPLIANT':
      return {
        icon: 'CheckCircle2',
        className: styles['badge--compliant'],
        label: 'Compliant',
      };
    case 'Non-Compliant':
    case 'non-compliant':
    case 'NON_COMPLIANT':
      return {
        icon: 'XCircle',
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

const MessageCircleCheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M7.9 20C9.80858 20.9791 12.0041 21.2443 14.0909 20.7478C16.1777 20.2514 18.0186 19.0259 19.2818 17.2922C20.545 15.5586 21.1474 13.4308 20.9806 11.2922C20.8137 9.15366 19.8886 7.14502 18.3718 5.62824C16.855 4.11146 14.8464 3.1863 12.7078 3.01946C10.5693 2.85263 8.44147 3.45509 6.70782 4.71829C4.97417 5.98149 3.74869 7.82236 3.25222 9.90916C2.75575 11.996 3.02094 14.1915 4 16.1L2 22L7.9 20Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.8 9L9.3 15.5L8 14.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
