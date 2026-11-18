import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { IconButton } from '@/components/icon-button/icon-button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/tooltip/tooltip';

describe('IconButton', () => {
  it('passes its ref to the button', () => {
    const ref = React.createRef<HTMLButtonElement | HTMLAnchorElement>();
    render(<IconButton ref={ref} name="X" label="Close" />);
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Close' }));
  });

  it('passes its ref to the link when it has href', () => {
    const ref = React.createRef<HTMLButtonElement | HTMLAnchorElement>();
    render(<IconButton ref={ref} name="ExternalLink" label="Open" href="/docs" />);
    expect(ref.current).toBe(screen.getByRole('link', { name: 'Open' }));
  });

  it('takes a tooltip trigger’s props when it has href', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <IconButton name="ExternalLink" label="Open" href="/docs" />
          </TooltipTrigger>
          <TooltipContent>Open the docs</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getByRole('link', { name: 'Open' }).getAttribute('data-state')).toBe('closed');
  });

  it('draws an extra-small button with a 14px icon', () => {
    render(<IconButton name="X" label="Clear" size="xs" />);
    const button = screen.getByRole('button', { name: 'Clear' });

    expect(button.className).toMatch(/size--xs/);
    expect(button.getAttribute('data-icon-button')).toBe('xs');
    expect(button.querySelector('svg')!.getAttribute('width')).toBe('14');
  });
});
