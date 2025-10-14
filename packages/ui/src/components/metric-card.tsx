import { LucideIcon } from 'lucide-react';

import { cn } from '../lib/utils';
import { IconCircle } from './icon-circle';

type ColorVariant = 'default' | 'red' | 'lilac' | 'green' | 'yellow';

interface MetricCardProps {
  value: string | number;
  label: string;
  icon: LucideIcon;
  colorVariant?: ColorVariant;
  className?: string;
}

const COLOR_VARIANTS: Record<ColorVariant, { text: string; iconBg: string; iconText: string }> = {
  default: {
    text: 'text-foreground',
    iconBg: 'bg-foreground/20',
    iconText: 'text-foreground',
  },
  red: {
    text: 'text-non-compliant',
    iconBg: 'bg-non-compliant-secondary',
    iconText: 'text-non-compliant',
  },
  lilac: {
    text: 'text-lilac',
    iconBg: 'bg-lilac/20',
    iconText: 'text-lilac',
  },
  green: {
    text: 'text-compliant',
    iconBg: 'bg-compliant-secondary',
    iconText: 'text-compliant',
  },
  yellow: {
    text: 'text-yellow',
    iconBg: 'bg-yellow/20',
    iconText: 'text-yellow',
  },
};

const MetricCard = ({
  value,
  label,
  icon,
  colorVariant = 'default',
  className,
}: MetricCardProps) => {
  const variant = COLOR_VARIANTS[colorVariant];

  return (
    <div className={cn('bg-foreground/5 flex flex-col justify-between rounded-md p-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className={cn('text-2xl font-medium', variant.text)}>{value}</p>
        <IconCircle icon={icon} className={cn(variant.iconBg, variant.iconText)} />
      </div>
      <p className="text-sm">{label}</p>
    </div>
  );
};

export { MetricCard };
