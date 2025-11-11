import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';

import { Button } from '@/components/button/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import styles from '@/components/filter-dropdown-menu/filter-dropdown-menu.module.css';
import { cn } from '@/lib/utils';

const CheckIcon = Check as React.ComponentType<{ className?: string }>;
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
  className?: string;
  contentWidth?: string;
}

const FilterDropdown = ({
  label,
  options,
  selectedFilters,
  onToggleFilter,
  onClearAll,
  className,
  contentWidth = 'w-56', // TODO: Sort out - should be a className
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
        <Button
          variant="outline"
          className={cn(
            styles['selector-button'],
            hasSelectedFilters && styles['selector-button--selected'],
            className
          )}
        >
          <span className={styles['selector-button-inner']}>
            {label}
            {hasSelectedFilters && (
              <span className={styles['selected-filters-count']}>{selectedFilters.length}</span>
            )}
          </span>
          <ChevronDownIcon className={styles['text-muted-foreground']} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(styles['dropdown-menu-content'], contentWidth)}
      >
        <div className={styles['dropdown-menu-content-header']}>
          <span className={styles['header-title']}>Filters</span>
          {hasSelectedFilters && (
            <Button variant="link" size="sm" onClick={onClearAll} className={styles['clear-btn']}>
              Clear all
            </Button>
          )}
        </div>
        {filteredOptions.map((option) => {
          const isSelected = selectedFilters.includes(option.value);

          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isSelected}
              onCheckedChange={() => onToggleFilter(option.value)}
              onSelect={(e) => e.preventDefault()}
              className={styles['dropdown-menu-item']}
            >
              <span className={styles['dropdown-menu-item-indicator']}>
                {/* TODO: Check if this extra wrapper is needed */}
                <div
                  className={cn(
                    styles['indicator-inner'],
                    isSelected
                      ? styles['indicator-inner--selected']
                      : styles['indicator-inner--not-selected']
                  )}
                >
                  {isSelected && <CheckIcon className={styles['check-icon']} />}
                </div>
              </span>
              <span className={styles['dropdown-menu-item-label']}>{option.label}</span>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { FilterDropdown };
