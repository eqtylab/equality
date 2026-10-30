import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MotionCollapsibleContent } from '@/components/motion-collapsible/motion-collapsible';

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
});
