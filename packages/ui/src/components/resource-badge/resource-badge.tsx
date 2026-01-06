import { Badge, type BadgeDisplayMode } from '@/components/badge/badge';
import styles from '@/components/resource-badge/resource-badge.module.css';

export type ResourceType =
  | 'agent'
  | 'benchmark'
  | 'code'
  | 'compute'
  | 'database'
  | 'dataset'
  | 'document'
  | 'guard'
  | 'guardrail'
  | 'inference'
  | 'model'
  | 'prompt'
  | 'system-prompt'
  | 'context'
  | 'reasoning'
  | 'system-parameters'
  | 'token'
  | 'tools'
  | 'unknown';

export type ResourceDisplayMode = BadgeDisplayMode;

interface ResourceBadgeProps {
  type: ResourceType;
  display?: ResourceDisplayMode;
}

const ResourceBadge = ({ type, display = 'both' }: ResourceBadgeProps) => {
  const config = getTypeConfig(type);

  return (
    <Badge icon={config.icon} display={display} className={config.className} variant={null as any}>
      {config.label}
    </Badge>
  );
};

// Helper function
const getTypeConfig = (type: ResourceType) => {
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
    case 'code':
      return {
        icon: 'Code',
        className: styles['badge--code'],
        label: 'Code',
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
    case 'guard':
      return {
        icon: 'Shield',
        className: styles['badge--guard'],
        label: 'Guard',
      };
    case 'guardrail':
      return {
        icon: 'Fence',
        className: styles['badge--guardrail'],
        label: 'Guardrail',
      };
    case 'inference':
      return {
        icon: 'Zap',
        className: styles['badge--inference'],
        label: 'Inference',
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
    case 'context':
      return {
        icon: 'MessageSquareQuote',
        className: styles['badge--context'],
        label: 'Context',
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
    case 'tools':
      return {
        icon: 'Wrench',
        className: styles['badge--tools'],
        label: 'Tools',
      };
    case 'system-parameters':
      return {
        icon: 'Settings2',
        className: styles['badge--system-parameters'],
        label: 'System Parameters',
      };
    case 'unknown':
      return {
        icon: 'Box',
        className: styles['badge--unknown'],
        label: 'Unknown',
      };
  }
};

export { ResourceBadge };
