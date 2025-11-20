import * as React from 'react';
import { Search, X } from 'lucide-react';

import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import styles from '@/components/search-bar/search-bar.module.css';
import { cn } from '@/lib/utils';

const SearchIcon = Search as React.ComponentType<{ className?: string }>;
const XIcon = X as React.ComponentType<{ className?: string }>;

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
      <SearchIcon className={styles['search-icon']} />
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleChange}
        className={styles['input']}
      />
      {searchQuery && (
        <Button
          variant="tertiary"
          size="sm"
          onClick={handleClear}
          className={styles['clear-button']}
          aria-label="Clear search"
        >
          <XIcon />
        </Button>
      )}
    </div>
  );
};

export { SearchBar };
