import { Check, ChevronDown } from 'lucide-react';

import { Button } from '@/components/button/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import styles from '@/components/sort-selector/sort-selector.module.css';
import { cn } from '@/lib/utils';

export type SortField = 'name' | 'type' | 'createdAt' | 'updatedAt' | 'controls';
export type SortOrder = 'asc' | 'desc';

interface SortSelectorProps {
  sortField: SortField;
  sortOrder: SortOrder;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setCurrentPage?: (page: number) => void;
  showDateOptions?: boolean;
  className?: string;
}

function SortSelector({
  sortField,
  sortOrder,
  setSortField,
  setSortOrder,
  setCurrentPage,
  showDateOptions = true,
  className,
}: SortSelectorProps) {
  const options = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    ...(showDateOptions
      ? [
          { value: 'createdAt-desc', label: 'Recently Created' },
          { value: 'createdAt-asc', label: 'Oldest Created' },
        ]
      : []),
  ] as const;

  const currentValue = `${sortField}-${sortOrder}`;
  const currentLabel = options.find((option) => option.value === currentValue)?.label || 'Sort';
  const isDefaultSort = sortField === 'name' && sortOrder === 'asc';

  const filteredOptions = options.filter(
    (option) =>
      option.value && option.value.trim() !== '' && option.label && option.label.trim() !== ''
  );

  const handleChange = (value: string) => {
    const [field, order] = value.split('-') as [SortField, SortOrder];
    setSortField(field);
    setSortOrder(order);
    setCurrentPage?.(1);
  };

  const handleReset = () => {
    setSortField('name');
    setSortOrder('asc');
    setCurrentPage?.(1);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn(styles['sort-selector-trigger'], className)}>
          <span>{currentLabel}</span>
          <ChevronDown className={styles['chevron-down-icon']} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={styles['dropdown-menu-content']}>
        <div className={styles['dropdown-menu-content-header']}>
          <span className={styles['header-title']}>Sort By</span>
          {!isDefaultSort && (
            <Button variant="link" size="sm" onClick={handleReset} className={styles['reset-btn']}>
              Reset
            </Button>
          )}
        </div>
        {filteredOptions.map((option) => {
          const isSelected = currentValue === option.value;

          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isSelected}
              onCheckedChange={() => handleChange(option.value)}
              onSelect={(e) => e.preventDefault()}
              className={styles['dropdown-menu-item']}
            >
              <span className={styles['dropdown-menu-item-indicator']}>
                <div
                  className={cn(
                    styles['indicator-inner'],
                    isSelected
                      ? styles['indicator-inner--selected']
                      : styles['indicator-inner--not-selected']
                  )}
                >
                  {isSelected && <Check className={styles['check-icon']} />}
                </div>
              </span>
              <span className={styles['dropdown-menu-item-label']}>{option.label}</span>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { SortSelector };
