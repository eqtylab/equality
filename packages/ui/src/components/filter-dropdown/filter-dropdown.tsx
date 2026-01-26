import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { Badge } from '@/components/badge/badge';
import { Button } from '@/components/button/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import styles from '@/components/filter-dropdown/filter-dropdown.module.css';
import { cn } from '@/lib/utils';

const ChevronDownIcon = ChevronDown as React.ComponentType<{ className?: string }>;

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedFilters: string[];
  onToggleFilter: (value: string) => void;
  onClearAll: () => void;
  buttonClassName?: string;
  contentClassName?: string;
}

const FilterDropdown = ({
  label,
  options,
  selectedFilters,
  onToggleFilter,
  onClearAll,
  buttonClassName,
  contentClassName,
}: FilterDropdownProps) => {
  const hasSelectedFilters = selectedFilters.length > 0;
  const filteredOptions = options
    .filter(
      (option) =>
        option.value && option.value.trim() !== '' && option.label && option.label.trim() !== ''
    )
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="tertiary" className={cn(styles['selector-button'], buttonClassName)}>
          <span className={styles['selector-button-inner']}>
            {label}
            {hasSelectedFilters && <Badge variant="primary">{selectedFilters.length}</Badge>}
          </span>
          <ChevronDownIcon className={styles['chevron-icon']} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(styles['dropdown-menu-content'], contentClassName)}
      >
        <DropdownMenuLabel>
          Filters
          {hasSelectedFilters && (
            <Button variant="link" size="sm" onClick={onClearAll}>
              Clear all
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {filteredOptions.map((option) => {
          const isSelected = selectedFilters.includes(option.value);

          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isSelected}
              onCheckedChange={() => onToggleFilter(option.value)}
              onSelect={(e) => e.preventDefault()}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { FilterDropdown };
