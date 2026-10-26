import type { KeyboardEvent } from 'react';

// Radix selects by typeahead while the list is closed, which in a switcher navigates; a letter
// typed on the trigger, where focus lands after a switch, must not change the page (WCAG 3.2.2)
export const blockClosedTypeahead = (event: KeyboardEvent<HTMLButtonElement>) => {
  const typed = event.key.length === 1 && event.key !== ' ';
  if (typed && !event.ctrlKey && !event.metaKey && !event.altKey) event.preventDefault();
};
