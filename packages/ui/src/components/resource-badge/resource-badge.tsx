import { Badge } from '@/components/badge/badge';
import styles from '@/components/resource-badge/resource-badge.module.css';
import { cn } from '@/lib/utils';

export type ResourceType =
  | 'agent'
  | 'benchmark'
  | 'code'
  | 'compute'
  | 'database'
  | 'dataset'
  | 'document'
  | 'guard'
  | 'inference'
  | 'model'
  | 'prompt'
  | 'token'
  | 'tools'
  | 'unknown';

export type ResourceDisplayMode = 'textonly' | 'icononly' | 'both';

interface ResourceBadgeProps {
  type: ResourceType;
  display?: ResourceDisplayMode;
}

const ResourceBadge = ({ type, display = 'both' }: ResourceBadgeProps) => {
  const config = getTypeConfig(type);
  const hideIcon = display === 'textonly';
  const hideLabel = display === 'icononly';

  return (
    <Badge
      icon={!hideIcon ? config.icon : undefined}
      className={cn(config.className, hideLabel && styles['badge--no-label'])}
    >
      {!hideLabel ? config.label : ''}
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
        icon: 'MessageSquare',
        className: styles['badge--prompt'],
        label: 'Prompt',
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
    case 'unknown':
      return {
        icon: 'HelpCircle',
        className: styles['badge--unknown'],
        label: 'Unknown',
      };
  }
};

export { ResourceBadge };
