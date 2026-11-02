import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Banner } from '@/components/banner/banner';

describe('Banner', () => {
  it('renders its message and action without a live region', () => {
    render(
      <Banner variant="warning" icon="Archive" action={<button>View</button>}>
        This project has been archived.
      </Banner>
    );

    expect(screen.getByText('This project has been archived.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'View' })).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('is a complementary landmark as an aside', () => {
    render(
      <Banner as="aside" variant="danger" icon="Ban" aria-label="Certification revoked">
        This certification was revoked.
      </Banner>
    );

    expect(screen.getByRole('complementary', { name: 'Certification revoked' })).toBeTruthy();
  });
});
