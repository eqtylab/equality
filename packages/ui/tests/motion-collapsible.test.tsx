import { renderToString } from 'react-dom/server';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MotionCollapsibleContent } from '@/components/motion-collapsible/motion-collapsible';

const panel = () => screen.queryByText('Error text')?.parentElement?.parentElement ?? null;

describe('MotionCollapsibleContent', () => {
  it('renders open content at full height, so it does not grow on load', () => {
    const html = renderToString(
      <MotionCollapsibleContent isOpen>
        <p>Error text</p>
      </MotionCollapsibleContent>
    );
    expect(html).toContain('Error text');
    expect(html).not.toMatch(/height:\s*0/);
  });

  it('clips content that opens again after a close', async () => {
    const { rerender } = render(
      <MotionCollapsibleContent isOpen>
        <p>Error text</p>
      </MotionCollapsibleContent>
    );
    rerender(
      <MotionCollapsibleContent isOpen={false}>
        <p>Error text</p>
      </MotionCollapsibleContent>
    );
    await waitFor(() => expect(panel()).toBeNull(), { timeout: 2000 });

    const classes: string[] = [];
    const observer = new MutationObserver((records) =>
      records.forEach((record) => classes.push(record.oldValue ?? ''))
    );
    observer.observe(document.body, {
      subtree: true,
      attributeFilter: ['class'],
      attributeOldValue: true,
    });
    rerender(
      <MotionCollapsibleContent isOpen>
        <p>Error text</p>
      </MotionCollapsibleContent>
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    observer.disconnect();
    expect([...classes, panel()?.className].join(' ')).not.toMatch(/settled/);
  });
});
