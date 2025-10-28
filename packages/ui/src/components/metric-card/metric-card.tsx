import { LucideIcon } from 'lucide-react';

import { cn } from '../../lib/utils';
import { IconCircle } from '../icon-circle/icon-circle';
import styles from './metric-card.module.css';

type ColorVariant = 'default' | 'red' | 'lilac' | 'green' | 'yellow';

interface MetricCardProps {
  value: string | number;
  label: string;
  icon: LucideIcon;
  colorVariant?: ColorVariant;
  className?: string;
}

const COLOR_VARIANTS: Record<ColorVariant, { text: string; iconBg: string }> = {
  default: {
    text: styles['text-default'],
    iconBg: styles['bg-default'],
  },
  red: {
    text: styles['text-red'],
    iconBg: styles['bg-red'],
  },
  lilac: {
    text: styles['text-lilac'],
    iconBg: styles['bg-lilac'],
  },
  green: {
    text: styles['text-green'],
    iconBg: styles['bg-green'],
  },
  yellow: {
    text: styles['text-yellow'],
    iconBg: styles['bg-yellow'],
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
    <div className={cn(styles.container, className)}>
      <div className={styles['value-container']}>
        <p className={cn(styles.value, variant.text)}>{value}</p>
        <IconCircle icon={icon} className={cn(variant.iconBg, variant.text)} />
      </div>
      <p className={styles.label}>{label}</p>
    </div>
  );
};

export { MetricCard };
