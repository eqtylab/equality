import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { Badge } from '@/components/badge/badge';
import { Button } from '@/components/button/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuEmpty,
  DropdownMenuLabel,
  DropdownMenuSearch,
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
  disabled?: boolean;
  /* Opt in to in-menu search */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyPlaceholder?: string;
}

const FilterDropdown = ({
  label,
  options,
  selectedFilters,
  onToggleFilter,
  onClearAll,
  buttonClassName,
  contentClassName,
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Search filters...',
  emptyPlaceholder = 'No filters found',
}: FilterDropdownProps) => {
  const hasSelectedFilters = selectedFilters.length > 0;
  const filteredOptions = options.filter(
    (option) =>
      option.value && option.value.trim() !== '' && option.label && option.label.trim() !== ''
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="tertiary"
          disabled={disabled}
          className={cn(styles['selector-button'], buttonClassName)}
        >
          <span className={styles['selector-button-content']}>
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
        {searchable && (
          <>
            <DropdownMenuSearch placeholder={searchPlaceholder} />
            <DropdownMenuEmpty>{emptyPlaceholder}</DropdownMenuEmpty>
          </>
        )}
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
