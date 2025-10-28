import { Check, ChevronDown } from 'lucide-react';

import { cn } from '../lib/utils';
import { Button } from './button/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';

export type SortField = 'name' | 'type' | 'createdAt' | 'updatedAt' | 'controls';
export type SortOrder = 'asc' | 'desc';

interface SortSelectorProps {
  sortField: SortField;
  sortOrder: SortOrder;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setCurrentPage?: (page: number) => void;
  showDateOptions?: boolean;
  className?: string;
}

export function SortSelector({
  sortField,
  sortOrder,
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
        <Button
          variant="outline"
          className={cn(
            'flex min-w-32 items-center justify-between rounded-md transition-all duration-200 hover:shadow-sm',
            className
          )}
        >
          <span>{currentLabel}</span>
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-border w-48 border shadow-lg">
        <div className="border-border flex items-center justify-between border-b px-3 pb-2 pt-2">
          <span className="text-foreground text-sm font-semibold">Sort By</span>
          {!isDefaultSort && (
            <Button variant="link" size="sm" onClick={handleReset} className="h-auto p-0">
              Reset
            </Button>
          )}
        </div>
        {filteredOptions.map((option) => {
          const isSelected = currentValue === option.value;

          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isSelected}
              onCheckedChange={() => handleChange(option.value)}
              onSelect={(e) => e.preventDefault()}
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
              <span className="text-foreground">{option.label}</span>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
