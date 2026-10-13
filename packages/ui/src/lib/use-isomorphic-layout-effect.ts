import { useEffect, useLayoutEffect } from 'react';

// React 18 warns on every server render that calls useLayoutEffect
export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;
