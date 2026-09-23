import * as React from 'react';

export type ListSearchState = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  visible: boolean;
  reveal: (seed: string) => void;
  query: string;
  setQuery: (value: string) => void;
  focusSignal: number;
  requestFocus: () => void;
  registerItem: (id: string, matches: boolean) => void;
  unregisterItem: (id: string) => void;
  matchCount: number;
  resetForOpen: () => void;
};

export function useListSearchState(): ListSearchState {
  const [enabled, setEnabled] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const [focusSignal, setFocusSignal] = React.useState(0);
  const requestFocus = React.useCallback(() => setFocusSignal((n) => n + 1), []);

  const itemsRef = React.useRef<Map<string, boolean>>(new Map());
  const [matchCount, setMatchCount] = React.useState(0);
  const recount = React.useCallback(() => {
    let count = 0;
    itemsRef.current.forEach((matches) => {
      if (matches) count += 1;
    });
    setMatchCount(count);
  }, []);
  const registerItem = React.useCallback(
    (id: string, matches: boolean) => {
      itemsRef.current.set(id, matches);
      recount();
    },
    [recount]
  );
  const unregisterItem = React.useCallback(
    (id: string) => {
      itemsRef.current.delete(id);
      recount();
    },
    [recount]
  );

  const reveal = React.useCallback((seed: string) => {
    setVisible(true);
    setQuery(seed);
  }, []);

  // Call on open, never on close, or the list re-expands during its exit animation
  const resetForOpen = React.useCallback(() => {
    setVisible(false);
    setQuery('');
  }, []);

  return React.useMemo(
    () => ({
      enabled,
      setEnabled,
      visible,
      reveal,
      query,
      setQuery,
      focusSignal,
      requestFocus,
      registerItem,
      unregisterItem,
      matchCount,
      resetForOpen,
    }),
    [
      enabled,
      visible,
      reveal,
      query,
      focusSignal,
      requestFocus,
      registerItem,
      unregisterItem,
      matchCount,
      resetForOpen,
    ]
  );
}

export const isSearchActive = (state: ListSearchState | null | undefined) =>
  !!state && state.query.trim().length > 0;

export const isSearchEmpty = (state: ListSearchState) =>
  isSearchActive(state) && state.matchCount === 0;

export const formatResultCount = (count: number) =>
  `${count} result${count === 1 ? '' : 's'} available`;

export function getNodeText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return getNodeText(node.props.children);
  }
  return '';
}

export function useFilterableItem(
  state: ListSearchState | null,
  textValue: string | undefined,
  children: React.ReactNode
): boolean {
  const id = React.useId();
  const query = state?.query.trim().toLowerCase() ?? '';
  const matches = !query || (textValue ?? getNodeText(children)).toLowerCase().includes(query);

  const enabled = state?.enabled ?? false;
  const registerItem = state?.registerItem;
  const unregisterItem = state?.unregisterItem;

  // Depends on the stable callbacks only, so it re-runs just when the match flips
  React.useEffect(() => {
    if (!enabled || !registerItem || !unregisterItem) return;
    registerItem(id, matches);
    return () => unregisterItem(id);
  }, [enabled, registerItem, unregisterItem, id, matches]);

  return matches;
}

export function useSearchInput(state: ListSearchState, alwaysVisible: boolean) {
  const { setEnabled, reveal, visible, focusSignal } = state;
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setEnabled(true);
    return () => setEnabled(false);
  }, [setEnabled]);

  React.useEffect(() => {
    if (!visible) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }, [visible, focusSignal]);

  React.useEffect(() => {
    if (alwaysVisible && !visible) reveal('');
  }, [alwaysVisible, visible, reveal]);

  return { inputRef, isRendered: alwaysVisible || visible };
}

export const isPrintableKey = (event: React.KeyboardEvent) =>
  event.key.length === 1 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.altKey &&
  /\S/.test(event.key);

// Plain assignment, not a cleanup-returning callback ref: React 18 ignores those cleanups
export function assignRefs<T>(node: T | null, ...refs: (React.Ref<T> | undefined)[]) {
  refs.forEach((ref) => {
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
  });
}
