import { Check, ChevronDown } from 'lucide-react';

import { cn } from '../lib/utils';
import { Button } from './button/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';

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

export const FilterDropdown = ({
  label,
  options,
  selectedFilters,
  onToggleFilter,
  onClearAll,
  className,
  contentWidth = 'w-56',
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
            'flex min-w-32 items-center justify-between rounded-md transition-all duration-200 hover:shadow-sm',
            hasSelectedFilters && 'border-lilac/30 bg-lilac/5 shadow-sm',
            className
          )}
        >
          <span className="flex items-center gap-1">
            {label}
            {hasSelectedFilters && (
              <span className="bg-lilac/20 text-lilac rounded-full px-2 py-0.5 text-xs font-medium">
                {selectedFilters.length}
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
          <span className="text-foreground text-sm font-semibold">Filters</span>
          {hasSelectedFilters && (
            <Button variant="link" size="sm" onClick={onClearAll} className="h-auto p-0">
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
              className="hover:bg-lilac-button focus:bg-lilac-button relative cursor-pointer px-3 py-1.5 pl-9 text-sm transition-colors [&>span:first-child]:hidden"
            >
              <span className="absolute left-3 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center">
                <div
                  className={cn(
                    'flex size-4 items-center justify-center rounded-sm border transition-colors',
                    isSelected ? 'border-lilac bg-lilac' : 'border-muted-foreground bg-muted/30'
                  )}
                >
                  {isSelected && <Check className="text-background size-4" />}
                </div>
              </span>
              <span className="text-foreground">{option.label}</span>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
