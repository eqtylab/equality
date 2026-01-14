import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/button/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import styles from '@/components/sort-selector/sort-selector.module.css';
import { cn } from '@/lib/utils';

const ChevronDownIcon = ChevronDown as React.ComponentType<{ className?: string }>;

export type SortField = 'name' | 'type' | 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';
export type SortMode = 'created' | 'updated';

interface SortSelectorProps {
  sortField: SortField;
  defaultSortField?: SortField;
  sortOrder: SortOrder;
  defaultSortOrder?: SortOrder;
  sortMode?: SortMode;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setCurrentPage?: (page: number) => void;
  showDateOptions?: boolean;
  className?: string;
}

function SortSelector({
  sortField,
  defaultSortField = 'name',
  sortOrder,
  defaultSortOrder = 'asc',
  sortMode = 'created',
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
      ? sortMode === 'created'
        ? [
            { value: 'createdAt-desc', label: 'Recently Created' },
            { value: 'createdAt-asc', label: 'Oldest Created' },
          ]
        : [
            { value: 'updatedAt-desc', label: 'Recently Updated' },
            { value: 'updatedAt-asc', label: 'Oldest Updated' },
          ]
      : []),
  ] as const;

  const currentValue = `${sortField}-${sortOrder}`;
  const currentLabel = options.find((option) => option.value === currentValue)?.label || 'Sort';
  const isDefaultSort = sortField === defaultSortField && sortOrder === defaultSortOrder;

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
    setSortField(defaultSortField);
    setSortOrder(defaultSortOrder);
    setCurrentPage?.(1);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="tertiary" className={cn(styles['sort-selector-trigger'], className)}>
          <span>{currentLabel}</span>
          <ChevronDownIcon className={styles['chevron-down-icon']} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={styles['dropdown-menu-content']}>
        <DropdownMenuLabel>
          Sort
          {!isDefaultSort && (
            <Button variant="link" size="sm" onClick={handleReset}>
              Reset
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {filteredOptions.map((option) => {
          const isSelected = currentValue === option.value;

          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isSelected}
              onCheckedChange={() => handleChange(option.value)}
              onSelect={(e) => e.preventDefault()}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { SortSelector };
