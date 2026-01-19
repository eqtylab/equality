import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/button/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import styles from '@/components/radio-dropdown/radio-dropdown.module.css';
import { ELEVATION, Elevation } from '@/lib/elevations';

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
  dropdownElevation?: Elevation;
  onSelect: (value: string) => void;
  className?: string;
}

const RadioDropdown = ({
  label,
  options,
  selectedValue,
  dropdownElevation = ELEVATION.OVERLAY,
  onSelect,
  className,
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
        <Button variant="tertiary" className={className}>
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
        className={styles['dropdown-menu-content']}
        elevation={dropdownElevation}
      >
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={selectedValue} onValueChange={onSelect}>
          {filteredOptions.map((option) => {
            const isSelected = selectedValue === option.value;
            const hasCount = option.count !== undefined;

            return (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
                {hasCount && ` (${option.count})`}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { RadioDropdown };
