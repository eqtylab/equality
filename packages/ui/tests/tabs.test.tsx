import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Tabs } from '@/components/tabs/tabs';

const ITEMS = [
  { label: 'Declarations', value: 'declarations', content: <p>Declarations content</p> },
  { label: 'Reviews', value: 'reviews', content: <p>Reviews content</p> },
];

// jsdom has no layout, so give each trigger a position derived from its label
let LAYOUT: Record<string, { left: number; width: number }>;

const observed = new Set<Element>();
let resize: () => void = () => {};

class RecordingResizeObserver {
  constructor(callback: () => void) {
    resize = callback;
  }
  observe(element: Element) {
    observed.add(element);
  }
  unobserve() {}
  disconnect() {
    observed.clear();
  }
}

const originalResizeObserver = globalThis.ResizeObserver;
const originalOffsetLeft = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetLeft');
const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');

beforeEach(() => {
  LAYOUT = {
    Declarations: { left: 0, width: 120 },
    Reviews: { left: 120, width: 80 },
  };
  globalThis.ResizeObserver = RecordingResizeObserver as unknown as typeof ResizeObserver;
  Object.defineProperty(HTMLElement.prototype, 'offsetLeft', {
    configurable: true,
    get(this: HTMLElement) {
      return LAYOUT[this.textContent ?? '']?.left ?? 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get(this: HTMLElement) {
      return LAYOUT[this.textContent ?? '']?.width ?? 0;
    },
  });
});

afterEach(() => {
  globalThis.ResizeObserver = originalResizeObserver;
  Object.defineProperty(HTMLElement.prototype, 'offsetLeft', originalOffsetLeft!);
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth!);
});

const sharedIndicator = () => {
  const indicators = Array.from(screen.getByRole('tablist').children).filter(
    (child) => child.getAttribute('role') !== 'tab'
  );
  expect(indicators).toHaveLength(1);
  return indicators[0] as HTMLElement;
};

describe('Tabs', () => {
  it('slides one shared indicator to the selected tab', async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} />);

    for (const tab of screen.getAllByRole('tab')) {
      expect(tab.querySelector('span')).toBeNull();
    }
    expect(sharedIndicator().style.transform).toBe('translateX(0px)');
    expect(sharedIndicator().style.getPropertyValue('--indicator-width')).toBe('120px');

    await user.click(screen.getByRole('tab', { name: 'Reviews' }));

    expect(sharedIndicator().style.transform).toBe('translateX(120px)');
    expect(sharedIndicator().style.getPropertyValue('--indicator-width')).toBe('80px');
  });

  it('follows a trigger that resizes while the list does not', async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} />);
    await user.click(screen.getByRole('tab', { name: 'Reviews' }));

    for (const tab of screen.getAllByRole('tab')) {
      expect(observed.has(tab)).toBe(true);
    }

    LAYOUT.Declarations.width = 150;
    LAYOUT.Reviews = { left: 150, width: 80 };
    act(() => resize());

    expect(sharedIndicator().style.transform).toBe('translateX(150px)');
  });

  it('ships an indicator inside every trigger when rendered statically', () => {
    render(<Tabs items={ITEMS} staticRender />);

    for (const tab of screen.getAllByRole('tab')) {
      expect(tab.querySelector('span')).not.toBeNull();
    }
    expect(
      Array.from(screen.getByRole('tablist').children).every(
        (child) => child.getAttribute('role') === 'tab'
      )
    ).toBe(true);
  });
});
