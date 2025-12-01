import { useSyncExternalStore } from 'react';

import {
  FALLBACK_THEME,
  getCurrentThemeState,
  setTheme,
  subscribeToThemeChange,
} from '@/theme/lib/utils';

const subscribe = (listener: () => void) => {
  return subscribeToThemeChange(listener);
};

const getSnapshot = () => {
  return getCurrentThemeState();
};

const getServerSnapshot = () => {
  // Default SSR value before hydration
  return FALLBACK_THEME; // use undefined to indicate no server snapshot available if not using SSR
};

const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [theme, setTheme] as const;
};

export { useTheme };
