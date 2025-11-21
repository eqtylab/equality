import { Icon } from '@/components/icon/icon';
import styles from '@/components/metric-card/metric-card.module.css';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'primary' | 'danger' | 'success' | 'warning';

interface MetricCardProps {
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

const MetricCard = ({ value, label, icon, variant = 'default', className }: MetricCardProps) => {
  const variantStyles = VARIANTS[variant];

  return (
    <div className={cn(styles['metric-card'], className)}>
      <div className={styles['value-container']}>
        <p className={cn(styles.value, variantStyles.text)}>{value}</p>
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
