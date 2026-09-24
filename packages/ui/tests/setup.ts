import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom lacks the layout and pointer APIs Radix's popper and select rely on
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
Element.prototype.scrollIntoView ??= function () {};
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.setPointerCapture ??= function () {};
Element.prototype.releasePointerCapture ??= function () {};

afterEach(cleanup);
