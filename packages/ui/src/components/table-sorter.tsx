import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

interface SortButtonProps<T extends string> {
  field: T;
  children: React.ReactNode;
  icon?: React.ReactNode;
  sortField: T | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: T) => void;
}

export function SortButton<T extends string>({
  field,
  children,
  icon,
  sortField,
  sortDirection,
  onSort,
}: SortButtonProps<T>) {
  const isActive = sortField === field;
  const isAscending = sortDirection === 'asc';

  const handleClick = () => {
    onSort(field);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group hover:text-lilac flex items-center gap-2 text-left font-medium transition-colors [&>svg]:size-4"
    >
      {icon}
      {children}
      <div className="flex items-center [&>svg]:size-3">
        {isActive ? (
          isAscending ? (
            <ArrowUp />
          ) : (
            <ArrowDown />
          )
        ) : (
          <ArrowUpDown className="opacity-0 transition-opacity group-hover:opacity-50" />
        )}
      </div>
    </button>
  );
}
