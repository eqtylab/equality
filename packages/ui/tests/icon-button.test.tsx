import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { IconButton } from '@/components/icon-button/icon-button';

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
});
