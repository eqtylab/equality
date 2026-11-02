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

  it('renders no action wrapper without an action', () => {
    render(
      <Banner variant="warning" icon="Archive">
        This project has been archived.
      </Banner>
    );

    const lead = screen.getByText('This project has been archived.').parentElement;
    expect(lead?.nextElementSibling).toBeNull();
  });

  it('draws its rule on the bottom by default and on the top with border="top"', () => {
    const { rerender } = render(
      <Banner data-testid="banner" icon="Archive">
        This project has been archived.
      </Banner>
    );
    expect(screen.getByTestId('banner').className).toMatch(/banner--border-bottom/);

    rerender(
      <Banner data-testid="banner" icon="Archive" border="top">
        This project has been archived.
      </Banner>
    );
    const banner = screen.getByTestId('banner');
    expect(banner.className).toMatch(/banner--border-top/);
    expect(banner.className).not.toMatch(/banner--border-bottom/);
  });
});
