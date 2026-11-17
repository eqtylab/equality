import { render, screen, within } from '@testing-library/react';
import { Check, Clock } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { Timeline, TimelineItem, TimelineSection } from '@/components/timeline/timeline';

const renderTimeline = () =>
  render(
    <Timeline aria-label="Control timeline">
      <TimelineSection label="Events while in progress" icon={<Clock />}>
        <TimelineItem id="event-1">Declared</TimelineItem>
        <TimelineItem>Evidence attached</TimelineItem>
      </TimelineSection>
      <TimelineSection label="Events while compliant" icon={<Check />} variant="success">
        <TimelineItem>Accepted</TimelineItem>
      </TimelineSection>
    </Timeline>
  );

describe('Timeline', () => {
  it('is a named list of sections, each a named list of its entries', () => {
    renderTimeline();

    const timeline = screen.getByRole('list', { name: 'Control timeline' });
    expect(timeline.tagName).toBe('OL');

    const inProgress = within(timeline).getByRole('list', { name: 'Events while in progress' });
    expect(within(inProgress).getAllByRole('listitem')).toHaveLength(2);

    const compliant = within(timeline).getByRole('list', { name: 'Events while compliant' });
    expect(within(compliant).getAllByRole('listitem')).toHaveLength(1);
  });

  it('hides each marker from assistive technology, as the label says what it marks', () => {
    renderTimeline();

    const section = screen.getByRole('list', { name: 'Events while in progress' }).parentElement;
    const rail = section?.firstElementChild;
    expect(rail?.getAttribute('aria-hidden')).toBe('true');
    expect(rail?.querySelector('svg')).toBeTruthy();
  });

  it('takes its name from a visible heading, and leaves a section unnamed without a label', () => {
    render(
      <>
        <h2 id="history">History</h2>
        <Timeline aria-labelledby="history">
          <TimelineSection icon={<Clock />}>
            <TimelineItem>In progress: evidence attached</TimelineItem>
          </TimelineSection>
        </Timeline>
      </>
    );

    const timeline = screen.getByRole('list', { name: 'History' });
    const [section] = within(timeline).getAllByRole('list');
    expect(section.hasAttribute('aria-label')).toBe(false);
    expect(within(section).getByRole('listitem').textContent).toBe(
      'In progress: evidence attached'
    );
  });

  it("draws Badge's icon for success, warning and danger unless given one", () => {
    render(
      <Timeline>
        <TimelineSection label="Success" variant="success">
          <TimelineItem>Accepted</TimelineItem>
        </TimelineSection>
        <TimelineSection label="Warning" variant="warning">
          <TimelineItem>Flagged</TimelineItem>
        </TimelineSection>
        <TimelineSection label="Danger" variant="danger">
          <TimelineItem>Rejected</TimelineItem>
        </TimelineSection>
        <TimelineSection label="Overridden" variant="success" icon={<Clock />}>
          <TimelineItem>Pending</TimelineItem>
        </TimelineSection>
      </Timeline>
    );

    const marker = (name: string) =>
      screen.getByRole('list', { name }).parentElement?.firstElementChild;
    expect(marker('Success')?.querySelector('.lucide-check')).toBeTruthy();
    expect(marker('Warning')?.querySelector('.lucide-octagon-alert')).toBeTruthy();
    expect(marker('Danger')?.querySelector('.lucide-triangle-alert')).toBeTruthy();
    expect(marker('Overridden')?.querySelector('.lucide-clock')).toBeTruthy();
    expect(marker('Overridden')?.querySelector('.lucide-check')).toBeNull();
  });

  it("passes an entry's id through, so a link can lead to it", () => {
    renderTimeline();

    expect(screen.getByText('Declared').id).toBe('event-1');
    expect(screen.getByText('Evidence attached').hasAttribute('id')).toBe(false);
  });

  it('defaults to md and neutral, and takes a size and a variant', () => {
    const { rerender } = renderTimeline();

    const timeline = screen.getByRole('list', { name: 'Control timeline' });
    expect(timeline.className).toMatch(/timeline--md/);

    const section = (name: string) => screen.getByRole('list', { name }).parentElement;
    expect(section('Events while in progress')?.className).not.toMatch(/timeline-section--/);
    expect(section('Events while compliant')?.className).toMatch(/timeline-section--success/);

    rerender(
      <Timeline aria-label="Control timeline" size="sm">
        <TimelineSection label="Events while in progress" icon={<Clock />}>
          <TimelineItem>Declared</TimelineItem>
        </TimelineSection>
      </Timeline>
    );
    expect(screen.getByRole('list', { name: 'Control timeline' }).className).toMatch(
      /timeline--sm/
    );
  });
});
