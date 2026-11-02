import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Alert } from '@/components/alert/alert';

describe('Alert action', () => {
  it('renders the action after the body, so the message is read first', () => {
    render(
      <Alert
        as="aside"
        variant="warning"
        title="Some agents couldn't be loaded."
        action={<button>Retry</button>}
      >
        <p>Results may be incomplete.</p>
      </Alert>
    );

    const retry = screen.getByRole('button', { name: 'Retry' });
    expect(screen.getByText('Results may be incomplete.').compareDocumentPosition(retry)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('renders no action wrapper without an action', () => {
    render(<Alert title="Saved" />);

    expect(screen.getByRole('heading', { name: 'Saved' }).nextElementSibling).toBeNull();
  });
});
