import * as React from 'react';
import { LucideIcon } from 'lucide-react';

import { IconCircle } from '@/components/icon-circle/icon-circle';
import styles from '@/components/metric-card/metric-card.module.css';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'primary' | 'danger' | 'success' | 'warning';

interface MetricCardProps {
  value: string | number;
  label: string;
  icon: LucideIcon;
  variant?: Variant;
  className?: string;
}

const VARIANTS: Record<Variant, { text: string; iconBg: string }> = {
  default: {
    text: styles['text-default'],
    iconBg: styles['bg-default'],
  },
  primary: {
    text: styles['text-primary'],
    iconBg: styles['bg-primary'],
  },
  danger: {
    text: styles['text-danger'],
    iconBg: styles['bg-danger'],
  },
  success: {
    text: styles['text-success'],
    iconBg: styles['bg-success'],
  },
  warning: {
    text: styles['text-warning'],
    iconBg: styles['bg-warning'],
  },
};

const MetricCard = ({ value, label, icon, variant = 'default', className }: MetricCardProps) => {
  const variantStyles = VARIANTS[variant];
  const IconComponent = icon as React.ElementType;

  return (
    <div className={cn(styles['metric-card'], className)}>
      <div className={styles['value-container']}>
        <p className={cn(styles.value, variantStyles.text)}>{value}</p>
        <IconCircle
          icon={IconComponent}
          size="md"
          className={cn(variantStyles.iconBg, variantStyles.text)}
        />
      </div>
      <p className={styles.label}>{label}</p>
    </div>
  );
};

export { MetricCard };
