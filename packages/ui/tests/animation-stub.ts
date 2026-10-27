import { afterEach, vi } from 'vitest';

// jsdom has neither the Web Animations API nor matchMedia. Each animate call is recorded with a
// `finished` promise the test resolves, as the browser would after the duration
export interface RecordedAnimation {
  target: Element;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  cancel: ReturnType<typeof vi.fn>;
  finish(): void;
}

export const animateCalls: RecordedAnimation[] = [];

let reducedMotion = false;

export function setReducedMotion(value: boolean) {
  reducedMotion = value;
}

export function finishAll() {
  animateCalls.forEach((animation) => animation.finish());
}

Element.prototype.animate = function (this: Element, keyframes, options) {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const finished = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  finished.catch(() => {});
  const cancel = vi.fn(() => reject(new DOMException('Aborted', 'AbortError')));
  animateCalls.push({
    target: this,
    keyframes: keyframes as Keyframe[],
    options: options as KeyframeAnimationOptions,
    cancel,
    finish: resolve,
  });
  return { finished, cancel } as unknown as Animation;
};

window.matchMedia = (query: string) =>
  ({
    matches: query.includes('prefers-reduced-motion: reduce') ? reducedMotion : false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

afterEach(() => {
  animateCalls.length = 0;
  reducedMotion = false;
});
