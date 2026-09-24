/**
 * In-place search shared by `SelectSearch` and `DropdownMenuSearch`: query state, item matching,
 * the match count behind the empty state and live region, and the search input's focus handling.
 *
 * Internal and not exported from the package, but every change here reaches `Select`,
 * `DropdownMenu`, and through it `FilterDropdown` and `RadioDropdown`. Their tests in
 * `packages/ui/tests` cover the shared behavior, so run all of them, not just this module's.
 */
import * as React from 'react';

export type MatchRegistry = {
  registerItem: (id: string, matches: boolean) => void;
  unregisterItem: (id: string) => void;
  matchCount: number;
};

export type ListSearchState = MatchRegistry & {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  visible: boolean;
  reveal: (seed: string) => void;
  query: string;
  setQuery: (value: string) => void;
  focusSignal: number;
  requestFocus: () => void;
  resetForOpen: () => void;
  listId: string | undefined;
  setListId: (id: string | undefined) => void;
};

export function useMatchRegistry(): MatchRegistry {
  const itemsRef = React.useRef<Map<string, boolean>>(new Map());
  const [matchCount, setMatchCount] = React.useState(0);

  const registerItem = React.useCallback((id: string, matches: boolean) => {
    const delta = Number(matches) - Number(itemsRef.current.get(id) ?? false);
    itemsRef.current.set(id, matches);
    if (delta) setMatchCount((count) => count + delta);
  }, []);

  const unregisterItem = React.useCallback((id: string) => {
    if (itemsRef.current.get(id)) setMatchCount((count) => count - 1);
    itemsRef.current.delete(id);
  }, []);

  return React.useMemo(
    () => ({ registerItem, unregisterItem, matchCount }),
    [registerItem, unregisterItem, matchCount]
  );
}

export function useListSearchState(open?: boolean): ListSearchState {
  const [enabled, setEnabled] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [listId, setListId] = React.useState<string | undefined>(undefined);

  const [focusSignal, setFocusSignal] = React.useState(0);
  const requestFocus = React.useCallback(() => setFocusSignal((n) => n + 1), []);

  const { registerItem, unregisterItem, matchCount } = useMatchRegistry();

  const reveal = React.useCallback((seed: string) => {
    setVisible(true);
    setQuery(seed);
  }, []);

  // Call on open, never on close, or the list re-expands during its exit animation
  const resetForOpen = React.useCallback(() => {
    setVisible(false);
    setQuery('');
  }, []);

  // A controlled `open` can flip without onOpenChange(true), which would keep the last query
  const [previousOpen, setPreviousOpen] = React.useState(open);
  if (open !== previousOpen) {
    setPreviousOpen(open);
    if (open) resetForOpen();
  }

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
      listId,
      setListId,
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
      listId,
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

export const matchesQuery = (
  query: string,
  textValue: string | undefined,
  children: React.ReactNode
) => {
  const normalized = query.trim().toLowerCase();
  // `??`, not `||`: an empty textValue must match nothing (FilterDropdown's Clear all relies on it)
  return !normalized || (textValue ?? getNodeText(children)).toLowerCase().includes(normalized);
};

function useRegisterMatch(
  registry: MatchRegistry | null | undefined,
  enabled: boolean,
  id: string,
  matches: boolean
) {
  const registerItem = registry?.registerItem;
  const unregisterItem = registry?.unregisterItem;

  React.useEffect(() => {
    if (!enabled || !registerItem || !unregisterItem) return;
    registerItem(id, matches);
    return () => unregisterItem(id);
  }, [enabled, registerItem, unregisterItem, id, matches]);
}

export function useFilterableItem(
  state: ListSearchState | null,
  textValue: string | undefined,
  children: React.ReactNode,
  group?: MatchRegistry | null
): boolean {
  const id = React.useId();
  const matches = matchesQuery(state?.query ?? '', textValue, children);
  const enabled = state?.enabled ?? false;

  useRegisterMatch(state, enabled, id, matches);
  useRegisterMatch(group, enabled, id, matches);

  return matches;
}

export function useSearchInput(
  state: ListSearchState,
  alwaysVisible: boolean,
  forwardedRef: React.Ref<HTMLInputElement>
) {
  const { setEnabled, reveal, visible, focusSignal } = state;
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Stable, or React detaches and reattaches the consumer's ref on every keystroke
  const ref = React.useCallback(
    (node: HTMLInputElement | null) => assignRefs(node, inputRef, forwardedRef),
    [forwardedRef]
  );

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

  return { ref, isRendered: alwaysVisible || visible };
}

export const isPrintableKey = (
  event: Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'altKey'>
) =>
  event.key.length === 1 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.altKey &&
  /\S/.test(event.key);

// Plain assignment, not a cleanup-returning callback ref: React 18 ignores those cleanups
export function assignRefs<T>(node: T | null, ...refs: (React.Ref<T> | undefined)[]) {
  refs.forEach((ref) => {
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.RefObject<T | null>).current = node;
  });
}
