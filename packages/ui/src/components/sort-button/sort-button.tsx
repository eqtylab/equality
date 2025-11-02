import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import styles from '@/components/sort-button/sort-button.module.css';

interface SortButtonProps<T extends string> {
  field: T;
  children: React.ReactNode;
  icon?: React.ReactNode;
  sortField: T | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: T) => void;
}

function SortButton<T extends string>({
  field,
  children,
  icon,
  sortField,
  sortDirection,
  onSort,
}: SortButtonProps<T>) {
  const isActive = sortField === field;
  const isAscending = sortDirection === 'asc';

  const handleClick = () => {
    onSort(field);
  };

  return (
    <button type="button" onClick={handleClick} className={styles['sort-button']}>
      {icon}
      {children}
      <div className={styles['arrow-container']}>
        {isActive ? (
          isAscending ? (
            <ArrowUp />
          ) : (
            <ArrowDown />
          )
        ) : (
          <ArrowUpDown className={styles['arrow-up-down-icon']} />
        )}
      </div>
    </button>
  );
}

export { SortButton };
