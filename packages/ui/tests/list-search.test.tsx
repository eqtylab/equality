import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  formatResultCount,
  isPrintableKey,
  matchesQuery,
  useListSearchState,
  useMatchRegistry,
  useSearchSideLock,
} from '@/lib/list-search';

const key = (
  value: string,
  modifiers: Partial<Record<'metaKey' | 'ctrlKey' | 'altKey', boolean>> = {}
) => ({
  key: value,
  metaKey: false,
  ctrlKey: false,
  altKey: false,
  ...modifiers,
});

describe('matchesQuery', () => {
  it('matches everything for a blank query', () => {
    expect(matchesQuery('   ', undefined, 'Anything')).toBe(true);
  });

  it('matches a case-insensitive, trimmed substring of the rendered text', () => {
    expect(matchesQuery('  KING ', undefined, 'United Kingdom')).toBe(true);
    expect(matchesQuery('france', undefined, 'United Kingdom')).toBe(false);
  });

  it('prefers textValue over the rendered text', () => {
    expect(matchesQuery('ada', 'Ada Lovelace', <span>AL</span>)).toBe(true);
    expect(matchesQuery('al', 'Ada Lovelace', <span>AL</span>)).toBe(false);
  });

  it('reads text out of nested elements', () => {
    expect(
      matchesQuery('lovelace', undefined, [
        <span key="icon" />,
        <span key="name">
          Ada <strong>Lovelace</strong>
        </span>,
      ])
    ).toBe(true);
  });
});

describe('formatResultCount', () => {
  it('pluralises', () => {
    expect(formatResultCount(1)).toBe('1 result available');
    expect(formatResultCount(3)).toBe('3 results available');
  });
});

describe('isPrintableKey', () => {
  it('accepts single visible characters', () => {
    expect(isPrintableKey(key('a'))).toBe(true);
    expect(isPrintableKey(key('7'))).toBe(true);
  });

  it('rejects whitespace, named keys and shortcuts', () => {
    expect(isPrintableKey(key(' '))).toBe(false);
    expect(isPrintableKey(key('Enter'))).toBe(false);
    expect(isPrintableKey(key('a', { metaKey: true }))).toBe(false);
    expect(isPrintableKey(key('a', { ctrlKey: true }))).toBe(false);
    expect(isPrintableKey(key('a', { altKey: true }))).toBe(false);
  });
});

describe('useMatchRegistry', () => {
  it('counts matching items as they register, flip and unregister', () => {
    const { result } = renderHook(() => useMatchRegistry());

    act(() => {
      result.current.registerItem('a', true);
      result.current.registerItem('b', true);
      result.current.registerItem('c', false);
    });
    expect(result.current.matchCount).toBe(2);

    act(() => result.current.registerItem('b', false));
    expect(result.current.matchCount).toBe(1);

    act(() => result.current.registerItem('a', true));
    expect(result.current.matchCount).toBe(1);

    act(() => {
      result.current.unregisterItem('a');
      result.current.unregisterItem('c');
    });
    expect(result.current.matchCount).toBe(0);
  });
});

describe('useListSearchState', () => {
  it('clears the query when a controlled open flips to true', () => {
    const { result, rerender } = renderHook(({ open }) => useListSearchState(open), {
      initialProps: { open: true },
    });

    act(() => result.current.reveal('jap'));
    expect(result.current.query).toBe('jap');

    rerender({ open: false });
    expect(result.current.query).toBe('jap');

    rerender({ open: true });
    expect(result.current.query).toBe('');
    expect(result.current.visible).toBe(false);
  });

  it('leaves state alone when uncontrolled', () => {
    const { result, rerender } = renderHook(() => useListSearchState());

    act(() => result.current.reveal('jap'));
    rerender();
    expect(result.current.query).toBe('jap');
  });

  it('tracks interaction until the list reopens', () => {
    const { result } = renderHook(() => useListSearchState());
    expect(result.current.interactedSinceOpen()).toBe(false);

    act(() => result.current.markInteracted());
    expect(result.current.interactedSinceOpen()).toBe(true);

    act(() => result.current.resetForOpen());
    expect(result.current.interactedSinceOpen()).toBe(false);
  });

  it('clears interaction when a controlled open flips to true', () => {
    const { result, rerender } = renderHook(({ open }) => useListSearchState(open), {
      initialProps: { open: true },
    });

    act(() => result.current.markInteracted());
    rerender({ open: false });
    expect(result.current.interactedSinceOpen()).toBe(true);

    rerender({ open: true });
    expect(result.current.interactedSinceOpen()).toBe(false);
  });
});

describe('useSearchSideLock', () => {
  it('locks the placed side once a query starts, and keeps collision handling', () => {
    const contentRef = { current: document.createElement('div') };
    contentRef.current.dataset.side = 'top';
    const { result } = renderHook(() => {
      const state = useListSearchState();
      return { state, sideProps: useSearchSideLock(state, contentRef, { side: 'bottom' }) };
    });
    expect(result.current.sideProps).toEqual({ side: 'bottom', avoidCollisions: undefined });

    act(() => result.current.state.setQuery('a'));

    expect(result.current.sideProps).toEqual({ side: 'top', avoidCollisions: undefined });
  });

  it('holds the lock after the query clears, until the list reopens', () => {
    const contentRef = { current: document.createElement('div') };
    contentRef.current.dataset.side = 'top';
    const { result } = renderHook(() => {
      const state = useListSearchState();
      return { state, sideProps: useSearchSideLock(state, contentRef, {}) };
    });

    act(() => result.current.state.setQuery('a'));
    contentRef.current.dataset.side = 'bottom';
    act(() => result.current.state.setQuery(''));
    expect(result.current.sideProps.side).toBe('top');

    act(() => result.current.state.resetForOpen());
    expect(result.current.state.lockedSide).toBeUndefined();
    expect(result.current.sideProps).toEqual({ side: undefined, avoidCollisions: undefined });
  });

  it('leaves the side alone when disabled', () => {
    const contentRef = { current: document.createElement('div') };
    contentRef.current.dataset.side = 'top';
    const { result } = renderHook(() => {
      const state = useListSearchState();
      return {
        state,
        sideProps: useSearchSideLock(state, contentRef, { side: 'left', enabled: false }),
      };
    });

    act(() => result.current.state.setQuery('a'));

    expect(result.current.sideProps).toEqual({ side: 'left', avoidCollisions: undefined });
  });
});
