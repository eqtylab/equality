import { useSyncExternalStore } from 'react';

import { getCurrentThemeState, setTheme, subscribeToThemeChange } from '@/shared';

const subscribe = (listener: () => void) => {
  return subscribeToThemeChange(listener);
};

const getSnapshot = () => {
  return getCurrentThemeState();
};

const getServerSnapshot = () => {
  // Default SSR value before hydration
  return undefined; // use undefined to indicate no server snapshot available if not using SSR
};

const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [theme, setTheme] as const;
};

export { useTheme };
