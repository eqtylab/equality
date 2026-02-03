import * as React from 'react';
import { Search } from 'lucide-react';

import { IconButton } from '@/components/icon-button/icon-button';
import { Input } from '@/components/input/input';
import styles from '@/components/search-bar/search-bar.module.css';
import { cn } from '@/lib/utils';

const SearchIcon = Search as React.ComponentType<{ className?: string }>;

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
    <search className={cn(styles['search-bar'], className)}>
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleChange}
        className={styles['input']}
        prefix={<SearchIcon className={styles['search-icon']} />}
        suffix={
          searchQuery && (
            <IconButton
              name="XIcon"
              onClick={handleClear}
              className={styles['clear-button']}
              label="Clear search"
            ></IconButton>
          )
        }
      />
    </search>
  );
};

export { SearchBar };
