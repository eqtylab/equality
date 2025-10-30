import { Search, X } from 'lucide-react';

import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import styles from '@/components/search-bar/search-bar.module.css';
import { cn } from '@/lib/utils';

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
    <div className={cn(styles['search-bar'], className)}>
      <Search className={styles['search-icon']} />
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleChange}
        className={styles['input']}
      />
      {searchQuery && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className={styles['clear-button']}
          aria-label="Clear search"
        >
          <X />
        </Button>
      )}
    </div>
  );
};

export { SearchBar };
