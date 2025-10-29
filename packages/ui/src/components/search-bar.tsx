import { Search, X } from 'lucide-react';

import { cn } from '../lib/utils';
import { Button } from './button/button';
import { Input } from './input/input';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  placeholder = 'Search...',
  className,
}: SearchBarProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleChange}
        className="px-10"
      />
      {searchQuery && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="absolute right-2 top-1/2 size-6 -translate-y-1/2"
          aria-label="Clear search"
        >
          <X />
        </Button>
      )}
    </div>
  );
};

export { SearchBar };
