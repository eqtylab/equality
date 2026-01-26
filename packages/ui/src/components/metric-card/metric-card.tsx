import { VariantProps } from 'class-variance-authority';

import { Icon } from '@/components/icon/icon';
import styles from '@/components/metric-card/metric-card.module.css';
import { ELEVATION, generateElevationVariants } from '@/lib/elevations';
import { cn } from '@/lib/utils';

const metricCardElevationVariants = generateElevationVariants(
  styles,
  'metric-card',
  ELEVATION.RAISED
);

type Variant = 'default' | 'primary' | 'danger' | 'success' | 'warning';

interface MetricCardProps extends VariantProps<typeof metricCardElevationVariants> {
  value: string | number;
  label: string;
  icon: React.ReactElement | string;
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

const MetricCard = ({
  value,
  label,
  icon,
  variant = 'default',
  elevation = ELEVATION.RAISED,
  className,
}: MetricCardProps) => {
  const variantStyles = VARIANTS[variant];

  return (
    <div className={cn(metricCardElevationVariants({ elevation }), className)}>
      <div className={styles['value-container']}>
        <p className={cn(styles.value)}>{value}</p>
        {/* TODO: these status based icon styles are incompatible with the elevation system.  Refactor them into the icon component as variants and make icon a slot instead of a hardcoded element with a property in metric card (this component) */}
        <Icon
          icon={icon}
          size="md"
          background="circle"
          className={cn(variantStyles.iconBg, variantStyles.text)}
        />
      </div>
      <p className={styles.label}>{label}</p>
    </div>
  );
};

export { MetricCard };
