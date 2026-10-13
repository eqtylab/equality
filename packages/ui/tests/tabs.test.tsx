import { renderToString } from 'react-dom/server';
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
let observersCreated = 0;

class RecordingResizeObserver {
  constructor(callback: () => void) {
    resize = callback;
    observersCreated += 1;
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
  observersCreated = 0;
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

const INDICATOR = '[data-slot="tabs-indicator"]';

const sharedIndicator = () => {
  const indicators = Array.from(screen.getByRole('tablist').children).filter((child) =>
    child.matches(INDICATOR)
  );
  expect(indicators).toHaveLength(1);
  return indicators[0] as HTMLElement;
};

const triggerIndicators = (root: ParentNode = document) =>
  Array.from(root.querySelectorAll('[role="tab"]')).map((tab) => tab.querySelector(INDICATOR));

describe('Tabs', () => {
  it('slides one shared indicator to the selected tab', async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} />);

    expect(triggerIndicators()).toEqual([null, null]);
    expect(sharedIndicator().style.transform).toBe('translateX(0px)');
    expect(sharedIndicator().style.getPropertyValue('--indicator-width')).toBe('120px');

    await user.click(screen.getByRole('tab', { name: 'Reviews' }));

    expect(sharedIndicator().style.transform).toBe('translateX(120px)');
    expect(sharedIndicator().style.getPropertyValue('--indicator-width')).toBe('80px');
  });

  it('takes 250ms for a one-tab move and longer for a longer one', async () => {
    LAYOUT = {
      Alpha: { left: 0, width: 100 },
      Beta: { left: 100, width: 60 },
      Gamma: { left: 160, width: 140 },
    };
    const user = userEvent.setup();
    render(
      <Tabs
        items={['Alpha', 'Beta', 'Gamma'].map((label) => ({
          label,
          value: label.toLowerCase(),
          content: label,
        }))}
      />
    );

    const duration = () =>
      parseInt(sharedIndicator().style.getPropertyValue('--indicator-duration'), 10);

    await user.click(screen.getByRole('tab', { name: 'Gamma' }));
    expect(duration()).toBeGreaterThan(250);
    expect(duration()).toBeLessThanOrEqual(400);

    await user.click(screen.getByRole('tab', { name: 'Beta' }));
    expect(duration()).toBe(250);
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

  it('keeps its resize observer when re-rendered with equal items', () => {
    const { rerender } = render(<Tabs items={ITEMS} />);
    const created = observersCreated;

    rerender(<Tabs items={[...ITEMS]} />);

    expect(observersCreated).toBe(created);
  });

  it('puts the indicator in the active trigger in server HTML', () => {
    const host = document.createElement('div');
    host.innerHTML = renderToString(<Tabs items={ITEMS} tabsListBackground="filled" />);

    expect(triggerIndicators(host).map(Boolean)).toEqual([true, false]);
    expect(
      Array.from(host.querySelector('[role="tablist"]')!.children).some((child) =>
        child.matches(INDICATOR)
      )
    ).toBe(false);
  });

  it('keeps the indicator in the active trigger while the list is hidden', () => {
    LAYOUT = {};
    render(<Tabs items={ITEMS} />);

    expect(triggerIndicators().map(Boolean)).toEqual([true, false]);
    expect(screen.getByRole('tablist').querySelectorAll(INDICATOR)).toHaveLength(1);
  });

  it('drops the indicator when the active tab is removed', () => {
    const { rerender } = render(<Tabs items={ITEMS} defaultValue="reviews" />);

    rerender(<Tabs items={ITEMS.slice(0, 1)} defaultValue="reviews" />);

    expect(document.querySelectorAll(INDICATOR)).toHaveLength(0);
  });

  it('ships an indicator inside every trigger when rendered statically', () => {
    render(<Tabs items={ITEMS} staticRender />);

    expect(triggerIndicators().map(Boolean)).toEqual([true, true]);
    expect(screen.getByRole('tablist').querySelectorAll(INDICATOR)).toHaveLength(2);
  });
});
