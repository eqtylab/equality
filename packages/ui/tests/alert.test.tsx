import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Alert } from '@/components/alert/alert';

describe('Alert action', () => {
  it('renders the action right after the title, before the body', () => {
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

    const title = screen.getByRole('heading', { name: "Some agents couldn't be loaded." });
    const retry = screen.getByRole('button', { name: 'Retry' });
    expect(title.nextElementSibling?.contains(retry)).toBe(true);
    expect(retry.compareDocumentPosition(screen.getByText('Results may be incomplete.'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('renders no action wrapper without an action', () => {
    render(<Alert title="Saved" />);

    expect(screen.getByRole('heading', { name: 'Saved' }).nextElementSibling).toBeNull();
  });
});
