// hooks/use-persistent-store.js
import type { Store } from "nanostores";
import { useSyncExternalStore } from "react";

export function usePersistentStore(store: Store, initialValue?: string) {
  const getSnapshot = () => store.get();
  const subscribe = (callback: any) => store.subscribe(callback);

  const getServerSnapshot = () => {
    // Default SSR value before hydration
    return initialValue; // use undefined to indicate no server snapshot available if not using SSR
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
