import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { Badge } from '@/components/badge/badge';
import { Button, buttonVariants } from '@/components/button/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuEmpty,
  DropdownMenuItem,
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

  const clearAll = (className: string) => (
    // An empty textValue keeps this out of search results, so Enter can't clear every filter
    <DropdownMenuItem textValue="" onSelect={onClearAll} className={className}>
      <span className={buttonVariants({ variant: 'link', size: 'sm' })}>Clear all</span>
    </DropdownMenuItem>
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
            <DropdownMenuSearch alwaysVisible placeholder={searchPlaceholder} aria-label={label} />
            <DropdownMenuEmpty>{emptyPlaceholder}</DropdownMenuEmpty>
          </>
        )}
        {!searchable && (
          <>
            <DropdownMenuLabel className={styles['filters-header']}>
              Filters
              {hasSelectedFilters && clearAll(styles['clear-all-inline'])}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
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
        {searchable && hasSelectedFilters && (
          <div className={styles['clear-all-footer']}>
            <DropdownMenuSeparator />
            {clearAll(styles['clear-all'])}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { FilterDropdown };
