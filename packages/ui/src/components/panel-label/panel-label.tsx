import styles from '@/components/panel-label/panel-label.module.css';
import { cn } from '@/lib/utils';

interface PanelLabelProps {
  className?: string;
  label: string;
}

const PanelLabel = ({ className, label }: PanelLabelProps) => {
  return <div className={cn(styles['panel-label'], className)}>{label}</div>;
};

export { PanelLabel };
