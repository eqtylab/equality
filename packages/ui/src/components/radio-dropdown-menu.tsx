import { Check, ChevronDown } from 'lucide-react';

import { cn } from '../lib/utils';
import { Button } from './button/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu/dropdown-menu';

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

export const RadioDropdown = ({
  label,
  options,
  selectedValue,
  onSelect,
  className,
  contentWidth = 'min-w-36 w-auto',
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
        <Button
          variant="outline"
          className={cn(
            'min-w-auto flex items-center justify-between rounded-md transition-all duration-200 hover:shadow-sm',
            className
          )}
        >
          <span className="flex items-center gap-1 capitalize">
            {selectedOption?.label || label}
            {hasSelectedCount && (
              <span className="bg-lilac/20 text-lilac rounded-full px-2 py-0.5 text-xs font-medium">
                {selectedOption.count}
              </span>
            )}
          </span>
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn('border-border max-h-80 overflow-auto border shadow-lg', contentWidth)}
      >
        <div className="border-border flex items-center justify-between border-b px-3 pb-2 pt-2">
          <span className="text-foreground text-sm font-semibold">{label}</span>
        </div>
        {filteredOptions.map((option) => {
          const isSelected = selectedValue === option.value;
          const hasCount = option.count !== undefined;

          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isSelected}
              onCheckedChange={() => onSelect(option.value)}
              className="hover:bg-lilac-button focus:bg-lilac-button relative cursor-pointer px-3 py-1.5 pl-9 text-sm transition-colors [&>span:first-child]:hidden"
            >
              <span className="absolute left-3 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center">
                <div
                  className={cn(
                    'flex size-4 items-center justify-center rounded-full border-2 transition-colors',
                    isSelected ? 'border-lilac bg-lilac' : 'border-muted-foreground bg-muted/30'
                  )}
                >
                  {isSelected && <Check className="text-background size-3" />}
                </div>
              </span>
              <span className="text-foreground">
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
