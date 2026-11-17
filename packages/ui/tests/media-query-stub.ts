import { afterEach } from 'vitest';

// jsdom has no matchMedia, so a query matches only while a test lists it
let matching: string[] = [];

export function setMatchingMediaQueries(...queries: string[]) {
  matching = queries;
}

afterEach(() => {
  matching = [];
});

window.matchMedia = (query: string) =>
  ({
    matches: matching.includes(query),
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }) as MediaQueryList;
