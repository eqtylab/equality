import { useSyncExternalStore } from 'react';

import { getCurrentThemeState, setTheme, subscribeToThemeChange } from '@/theme/lib/utils';

const useTheme = () => {
  const getServerSnapshot = () => {
    // Default SSR value before hydration
    return undefined; // use undefined to indicate no server snapshot available if not using SSR
  };

  const theme = useSyncExternalStore(
    subscribeToThemeChange,
    getCurrentThemeState,
    getServerSnapshot
  );
  return [theme, setTheme] as const;
};

export { useTheme };
