import * as React from 'react';

import { isSearchActive, matchesQuery, type ListSearchState } from '@/lib/list-search';

export const DropdownMenuSearchContext = React.createContext<ListSearchState | null>(null);

export const useDropdownMenuSearch = () => React.useContext(DropdownMenuSearchContext);

// For consumers acting on the matches, such as a "Select all" that selects only what's shown
export const useDropdownMenuSearchQuery = () => {
  const ctx = useDropdownMenuSearch();
  if (!ctx) {
    throw new Error('useDropdownMenuSearchQuery must be used within a DropdownMenu');
  }
  const { query } = ctx;
  const isSearching = isSearchActive(ctx);
  return React.useMemo(
    () => ({
      query,
      isSearching,
      matches: (textValue: string) => matchesQuery(query, textValue, null),
    }),
    [query, isSearching]
  );
};
