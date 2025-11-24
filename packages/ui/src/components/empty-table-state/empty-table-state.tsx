import { Button } from '@/components/button/button';
import styles from '@/components/empty-table-state/empty-table-state.module.css';
import { Icon } from '@/components/icon/icon';
import { cn } from '@/lib/utils';

interface EmptyTableStateProps {
  icon: React.ReactElement | string;
  title: string;
  description?: string;
  showClearButton?: boolean;
  onClear?: () => void;
  className?: string;
}

const EmptyTableState = ({
  icon,
  title,
  description,
  showClearButton = false,
  onClear,
  className,
}: EmptyTableStateProps) => {
  const showButton = showClearButton && onClear;

  return (
    <div className={cn(styles['empty-table-state'], className)}>
      <div className={styles['icon-and-title-container']}>
        <Icon icon={icon} size="md" background="circle" />
        <span className={styles['title']}>{title}</span>
      </div>

      {description && <span className={styles['description']}>{description}</span>}

      {showButton && (
        <Button variant="tertiary" size="sm" onClick={onClear} className={styles['clear-button']}>
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export { EmptyTableState };
