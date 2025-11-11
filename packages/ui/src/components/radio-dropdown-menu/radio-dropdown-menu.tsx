import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';

import { Button } from '@/components/button/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import styles from '@/components/radio-dropdown-menu/radio-dropdown-menu.module.css';
import { cn } from '@/lib/utils';

const CheckIcon = Check as React.ComponentType<{ className?: string }>;
const ChevronDownIcon = ChevronDown as React.ComponentType<{ className?: string }>;

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface RadioDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  className?: string;
  contentWidth?: string;
}

const RadioDropdown = ({
  label,
  options,
  selectedValue,
  onSelect,
  className,
  contentWidth = 'min-w-36 w-auto', // TODO: check this
}: RadioDropdownProps) => {
  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const hasSelectedCount = selectedOption?.count !== undefined;

  const filteredOptions = options.filter(
    (option) =>
      option.value && option.value.trim() !== '' && option.label && option.label.trim() !== ''
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn(styles['selector-button'], className)}>
          <span className={styles['selector-button-inner']}>
            {selectedOption?.label || label}
            {hasSelectedCount && (
              <span className={styles['selected-count']}>{selectedOption.count}</span>
            )}
          </span>
          <ChevronDownIcon className={styles['chevron-icon']} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(styles['dropdown-menu-content'], contentWidth)}
      >
        <div className={styles['dropdown-menu-content-header']}>
          <span className={styles['header-title']}>{label}</span>
        </div>
        {filteredOptions.map((option) => {
          const isSelected = selectedValue === option.value;
          const hasCount = option.count !== undefined;

          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isSelected}
              onCheckedChange={() => onSelect(option.value)}
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
                  {isSelected && <CheckIcon className={styles['check-icon']} />}
                </div>
              </span>
              <span className={styles['dropdown-menu-item-label']}>
                {option.label}
                {hasCount && ` (${option.count})`}
              </span>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { RadioDropdown };
