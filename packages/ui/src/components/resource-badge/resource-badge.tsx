import { Badge, type BadgeDisplayMode } from '@/components/badge/badge';
import styles from '@/components/resource-badge/resource-badge.module.css';

// These are all asset types from integrity-py.
// If you want to add a resource type here, it should exist there first.

export type ResourceType =
  | 'agent'
  | 'benchmark'
  | 'benchmark-result'
  | 'binary'
  | 'code'
  | 'compute'
  | 'database'
  | 'dataset'
  | 'document'
  | 'media'
  | 'skill'
  | 'guardrail'
  | 'model'
  | 'prompt'
  | 'system-prompt'
  | 'reasoning'
  | 'config'
  | 'token'
  | 'tool'
  | 'unknown';

export type ResourceDisplayMode = BadgeDisplayMode;

interface ResourceBadgeProps {
  type: ResourceType;
  display?: ResourceDisplayMode;
}

const ResourceBadge = ({ type, display = 'both' }: ResourceBadgeProps) => {
  const config = getTypeConfig(type);

  return (
    <Badge icon={config.icon} display={display} className={config.className} variant={null}>
      {config.label}
    </Badge>
  );
};

// Helper function
const getTypeConfig = (type: ResourceType): { icon: string; className: string; label: string } => {
  switch (type) {
    case 'agent':
      return {
        icon: 'Bot',
        className: styles['badge--agent'],
        label: 'Agent',
      };
    case 'benchmark':
      return {
        icon: 'LineChart',
        className: styles['badge--benchmark'],
        label: 'Benchmark',
      };
    case 'benchmark-result':
      return {
        icon: 'FileChartLine',
        className: styles['badge--benchmark-result'],
        label: 'Benchmark Result',
      };
    case 'code':
      return {
        icon: 'Code',
        className: styles['badge--code'],
        label: 'Code',
      };
    case 'binary':
      return {
        icon: 'Binary',
        className: styles['badge--binary'],
        label: 'Binary',
      };
    case 'compute':
      return {
        icon: 'Cpu',
        className: styles['badge--compute'],
        label: 'Compute',
      };
    case 'database':
      return {
        icon: 'Database',
        className: styles['badge--database'],
        label: 'Database',
      };
    case 'dataset':
      return {
        icon: 'Table',
        className: styles['badge--dataset'],
        label: 'Dataset',
      };
    case 'document':
      return {
        icon: 'FileText',
        className: styles['badge--document'],
        label: 'Document',
      };
    case 'skill':
      return {
        icon: 'FileCog',
        className: styles['badge--skill'],
        label: 'Skill',
      };
    case 'media':
      return {
        icon: 'FileImage',
        className: styles['badge--media'],
        label: 'Media',
      };
    case 'guardrail':
      return {
        icon: 'Fence',
        className: styles['badge--guardrail'],
        label: 'Guardrail',
      };
    case 'model':
      return {
        icon: 'Brain',
        className: styles['badge--model'],
        label: 'Model',
      };
    case 'prompt':
      return {
        icon: 'MessageSquareText',
        className: styles['badge--prompt'],
        label: 'Prompt',
      };
    case 'system-prompt':
      return {
        icon: 'MessageSquareCode',
        className: styles['badge--system-prompt'],
        label: 'System Prompt',
      };
    case 'reasoning':
      return {
        icon: 'MessageSquareMore',
        className: styles['badge--reasoning'],
        label: 'Reasoning',
      };
    case 'token':
      return {
        icon: 'Coins',
        className: styles['badge--token'],
        label: 'Token',
      };
    case 'tool':
      return {
        icon: 'Wrench',
        className: styles['badge--tool'],
        label: 'Tool',
      };
    case 'config':
      return {
        icon: 'Settings2',
        className: styles['badge--config'],
        label: 'Configuration',
      };
    case 'unknown':
    default:
      return {
        icon: 'Box',
        className: styles['badge--unknown'],
        label: 'Unknown',
      };
  }
};

export { ResourceBadge };
