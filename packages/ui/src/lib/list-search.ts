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

export type PopperSide = 'top' | 'right' | 'bottom' | 'left';

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
  lockedSide: PopperSide | undefined;
  lockSide: (side: PopperSide) => void;
  markInteracted: () => void;
  interactedSinceOpen: () => boolean;
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
  const [lockedSide, setLockedSide] = React.useState<PopperSide | undefined>(undefined);

  // A ref, not state: an item's pointermove focus lands before a re-render would
  const interactedRef = React.useRef(false);
  const markInteracted = React.useCallback(() => {
    interactedRef.current = true;
  }, []);
  const interactedSinceOpen = React.useCallback(() => interactedRef.current, []);

  const [focusSignal, setFocusSignal] = React.useState(0);
  const requestFocus = React.useCallback(() => setFocusSignal((n) => n + 1), []);

  const { registerItem, unregisterItem, matchCount } = useMatchRegistry();

  const reveal = React.useCallback((seed: string) => {
    setVisible(true);
    setQuery(seed);
  }, []);

  const resetStateForOpen = React.useCallback(() => {
    setVisible(false);
    setQuery('');
    setLockedSide(undefined);
  }, []);

  // Call on open, never on close, or the list re-expands during its exit animation
  const resetForOpen = React.useCallback(() => {
    resetStateForOpen();
    interactedRef.current = false;
  }, [resetStateForOpen]);

  // A controlled `open` can flip without onOpenChange(true), which would keep the last query
  const [previousOpen, setPreviousOpen] = React.useState(open);
  if (open !== previousOpen) {
    setPreviousOpen(open);
    if (open) resetStateForOpen();
  }

  // The ref half of that reset, which can't run during render
  React.useEffect(() => {
    if (open) interactedRef.current = false;
  }, [open]);

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
      lockedSide,
      lockSide: setLockedSide,
      markInteracted,
      interactedSinceOpen,
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
      lockedSide,
      markInteracted,
      interactedSinceOpen,
    ]
  );
}

/*
 * Filtering resizes the list, and a flip then sticks because the popper's size cap follows the
 * new side, so the side it was placed on holds from the first query until the list reopens.
 * Collisions stay on: turning them off also drops the shift that keeps the list on screen
 */
export function useSearchSideLock(
  state: ListSearchState | null | undefined,
  contentRef: React.RefObject<HTMLElement | null>,
  {
    side,
    avoidCollisions,
    enabled = true,
  }: { side?: PopperSide; avoidCollisions?: boolean; enabled?: boolean }
) {
  const searching = isSearchActive(state);
  const lockedSide = state?.lockedSide;
  const lockSide = state?.lockSide;

  React.useEffect(() => {
    if (!enabled || !searching || lockedSide) return;
    const placed = contentRef.current?.dataset.side as PopperSide | undefined;
    if (placed) lockSide?.(placed);
  }, [enabled, searching, lockedSide, lockSide, contentRef]);

  return { side: lockedSide && enabled ? lockedSide : side, avoidCollisions };
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
  // `??`, not `||`: an empty textValue must match nothing
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
  { group, persistent = false }: { group?: MatchRegistry | null; persistent?: boolean } = {}
): boolean {
  const id = React.useId();
  const matches = persistent || matchesQuery(state?.query ?? '', textValue, children);
  const enabled = state?.enabled ?? false;

  useRegisterMatch(state, enabled && !persistent, id, matches);
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

export function useSearchQuery(state: ListSearchState) {
  const { query } = state;
  const isSearching = isSearchActive(state);
  return React.useMemo(
    () => ({
      query,
      isSearching,
      matches: (textValue: string) => matchesQuery(query, textValue, null),
    }),
    [query, isSearching]
  );
}

/*
 * The arrows must be checked ahead of the defaultPrevented bail-out: DropdownMenu's roving focus
 * group has already prevented them by the time the event bubbles up here
 */
export function handleListKeyDown(
  state: ListSearchState | null,
  event: React.KeyboardEvent<HTMLElement>,
  { searchSelector, itemSelector }: { searchSelector: string; itemSelector: string }
) {
  if (!state?.enabled) return;

  const target = event.target as HTMLElement | null;
  if (target?.closest(searchSelector)) return;

  if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && state.visible) {
    const items = event.currentTarget.querySelectorAll(itemSelector);
    const edgeItem = event.key === 'ArrowUp' ? items[0] : items[items.length - 1];
    if (edgeItem && edgeItem === target?.closest(itemSelector)) {
      event.preventDefault();
      // The sticky search is always in view, so focusing it never scrolls the list back up
      if (event.key === 'ArrowDown') {
        for (let el: HTMLElement | null = target; el; el = el.parentElement) {
          el.scrollTop = 0;
          if (el === event.currentTarget) break;
        }
      }
      state.requestFocus();
      return;
    }
  }

  if (event.defaultPrevented) return;

  if (event.key === 'Backspace' && state.visible && state.query) {
    event.preventDefault();
    state.setQuery(state.query.slice(0, -1));
    state.requestFocus();
    return;
  }

  if (!isPrintableKey(event)) return;

  event.preventDefault();
  if (!state.visible) {
    state.reveal(event.key);
  } else {
    state.setQuery(state.query + event.key);
    state.requestFocus();
  }
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
