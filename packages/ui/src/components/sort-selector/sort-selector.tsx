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
import { Elevation, ELEVATION } from '@/lib/elevations';
import { cn } from '@/lib/utils';

const ChevronDownIcon = ChevronDown as React.ComponentType<{ className?: string }>;

export type SortField = 'name' | 'type' | 'createdAt' | 'updatedAt' | 'controls';
export type SortOrder = 'asc' | 'desc';

interface SortSelectorProps {
  sortField: SortField;
  sortOrder: SortOrder;
  dropdownElevation?: Elevation;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setCurrentPage?: (page: number) => void;
  showDateOptions?: boolean;
  className?: string;
}

function SortSelector({
  sortField,
  sortOrder,
  dropdownElevation = ELEVATION.OVERLAY,
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
        <Button variant="tertiary" className={cn(styles['sort-selector-trigger'], className)}>
          <span>{currentLabel}</span>
          <ChevronDownIcon className={styles['chevron-down-icon']} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" elevation={dropdownElevation}>
        <DropdownMenuLabel>
          Sort By
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
