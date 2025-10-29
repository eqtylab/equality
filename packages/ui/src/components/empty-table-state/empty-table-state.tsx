import type { ReactNode } from 'react';

import { Button } from '@/components/button/button';
import styles from '@/components/empty-table-state/empty-table-state.module.css';
import { cn } from '@/lib/utils';

interface EmptyTableStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  showClearButton?: boolean;
  onClear?: () => void;
  className?: string;
}

export const EmptyTableState = ({
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
        {/* TODO: Add icon component */}
        <div className={styles['icon-container']}>
          <span className={styles['icon']}>{icon}</span>
        </div>
        <span className={styles['title']}>{title}</span>
      </div>

      {description && <span className={styles['description']}>{description}</span>}

      {showButton && (
        <Button variant="outline" size="sm" onClick={onClear} className={styles['clear-button']}>
          Clear Filters
        </Button>
      )}
    </div>
  );
};
