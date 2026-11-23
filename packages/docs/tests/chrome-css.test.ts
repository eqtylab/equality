import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const read = (file: string) => readFile(new URL(`../src/runtime/${file}`, import.meta.url), 'utf8');

test('the docs header is a default control plus 8 above and below: 52', async () => {
  assert.match(await read('styles/chrome.css'), /--eq-docs-header-height:\s*3\.25rem;/);
});

test('the docs header draws its bottom line inside its height', async () => {
  const [css, header] = await Promise.all([read('styles/chrome.css'), read('chrome/Header.astro')]);
  assert.doesNotMatch(header, /\bborder-b\b/);
  assert.match(css, /header\[data-eq-chrome\]::after\s*\{[^}]*height:\s*1px;[^}]*\}/);
});

test('a one-line footer is as tall as the header, with its top line inside', async () => {
  const [css, footer] = await Promise.all([
    read('styles/chrome.css'),
    read('chrome/AppFooter.astro'),
  ]);
  assert.doesNotMatch(footer, /\bborder-t\b/);
  assert.match(footer, /\bpx-6 py-4\b/);
  assert.match(css, /footer\[data-eq-chrome\]::before\s*\{[^}]*height:\s*1px;[^}]*\}/);
});
