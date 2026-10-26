import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NavDrill, NavDrillLevel, type NavDrillProps } from '@/components/nav-list/nav-drill';
import { NavList, NavListGroup, NavListItem } from '@/components/nav-list/nav-list';

import { animateCalls, finishAll, setReducedMotion } from './animation-stub';

const SHADOW = '-8px 0 16px rgb(0 0 0 / 0.18)';
const NO_SHADOW = '-8px 0 16px transparent';

function levels() {
  return [
    <NavDrillLevel key="projects" value="projects">
      <NavListGroup>
        <NavListItem label="Ben Project" href="#ben" drill="ben" />
        <NavListItem label="Overview" href="#overview" current />
      </NavListGroup>
    </NavDrillLevel>,
    <NavDrillLevel key="ben" value="ben" parent="projects" label="Ben Project">
      <NavListGroup>
        <NavListItem label="Settings" drill="ben-settings" />
        <NavListItem label="Ben overview" href="#ben-overview" current />
      </NavListGroup>
    </NavDrillLevel>,
    <NavDrillLevel key="ben-settings" value="ben-settings" parent="ben" label="Settings">
      <NavListGroup>
        <NavListItem label="General" href="#general" current />
      </NavListGroup>
    </NavDrillLevel>,
    <NavDrillLevel key="orphan" value="orphan" parent="projects" label="Orphan"></NavDrillLevel>,
  ];
}

function Uncontrolled(props: Omit<NavDrillProps, 'value'>) {
  return (
    <NavList>
      <NavDrill defaultValue="projects" {...props}>
        {levels()}
      </NavDrill>
    </NavList>
  );
}

// Holds `value` in state. `follow` decides whether a request changes it; the "go" buttons change it
// with no request, as a route change would
function Controlled({
  initial = 'projects',
  follow = true,
  onValueChange,
  children = levels(),
  ...props
}: Omit<NavDrillProps, 'value'> & { initial?: string; follow?: boolean }) {
  const [view, setView] = React.useState(initial);
  return (
    <>
      <NavList>
        <NavDrill
          value={view}
          onValueChange={(next, request) => {
            onValueChange?.(next, request);
            if (follow) setView(next);
          }}
          {...props}
        >
          {children}
        </NavDrill>
      </NavList>
      {['projects', 'ben', 'x'].map((target) => (
        <button key={target} type="button" onClick={() => setView(target)}>
          go:{target}
        </button>
      ))}
    </>
  );
}

const ghost = () => document.querySelector<HTMLElement>('[data-slot="nav-drill-ghost"]');
const liveLevels = () =>
  [...document.querySelectorAll<HTMLElement>('[data-slot="nav-drill-level"]')].filter(
    (el) => !ghost()?.contains(el)
  );

describe('NavDrill', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('server-renders the current level only', () => {
    const html = renderToString(
      <NavList>
        <NavDrill defaultValue="ben">{levels()}</NavDrill>
      </NavList>
    );
    expect(html).toContain('title="Ben overview"');
    expect(html).not.toContain('title="Overview"');
    expect(html).not.toContain('title="General"');
  });

  it('uncontrolled: a drill row opens its level and ‹ returns to the parent', () => {
    render(<Uncontrolled animate={false} />);
    fireEvent.click(screen.getByRole('link', { name: 'Ben Project' }));
    expect(screen.getByRole('link', { name: 'Ben overview' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Overview' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Ben Project' }));
    expect(screen.getByRole('link', { name: 'Overview' })).toBeTruthy();
  });

  it('controlled: a drill row calls onValueChange(value, "drill") and does not change level by itself', () => {
    const onValueChange = vi.fn();
    render(<Controlled follow={false} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('link', { name: 'Ben Project' }));
    expect(onValueChange).toHaveBeenCalledWith('ben', 'drill');
    expect(screen.getByRole('link', { name: 'Overview' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Ben overview' })).toBeNull();
  });

  it('controlled: ‹ calls onValueChange(parent, "back")', () => {
    const onValueChange = vi.fn();
    render(<Controlled initial="ben" follow={false} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ben Project' }));
    expect(onValueChange).toHaveBeenCalledWith('projects', 'back');
    expect(screen.getByRole('link', { name: 'Ben overview' })).toBeTruthy();
  });

  it('‹ goes to the named parent after a deep link', () => {
    render(<Uncontrolled defaultValue="ben-settings" animate={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('link', { name: 'Ben overview' })).toBeTruthy();
  });

  it('renders no ‹ on a level without a parent', () => {
    render(
      <NavList>
        <NavDrill defaultValue="top">
          <NavDrillLevel value="top" label="Nowhere"></NavDrillLevel>
        </NavDrill>
      </NavList>
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(document.querySelector('hr')).toBeNull();
  });

  it('draws ‹ at the top of a level with a parent, named by its label', () => {
    render(<Uncontrolled defaultValue="ben" />);
    const level = liveLevels()[0];
    const back = screen.getByRole('button', { name: 'Ben Project' });
    expect(level.firstElementChild).toBe(back);
    expect(back.getAttribute('data-slot')).toBe('nav-drill-back');
    expect(back.nextElementSibling?.tagName).toBe('HR');
  });

  it('names ‹ with backLabel when given', () => {
    render(
      <NavList>
        <NavDrill defaultValue="ben">
          <NavDrillLevel value="projects" />
          <NavDrillLevel
            value="ben"
            parent="projects"
            label="Ben Project"
            backLabel="Ben Project, back to Projects"
          />
        </NavDrill>
      </NavList>
    );
    const back = screen.getByRole('button', { name: 'Ben Project, back to Projects' });
    expect(back.textContent).toBe('Ben Project');
  });

  it('slides with exactly two animate calls carrying Studio’s keyframes and 330ms', () => {
    render(<Uncontrolled />);
    fireEvent.click(screen.getByRole('link', { name: 'Ben Project' }));
    expect(animateCalls).toHaveLength(2);
    const [current, previous] = animateCalls;
    expect(current.target).toBe(liveLevels()[0]);
    expect(current.target.textContent).toContain('Ben overview');
    expect(current.keyframes).toEqual([
      { transform: 'translateX(50%)', boxShadow: SHADOW },
      { transform: 'translateX(0)', boxShadow: NO_SHADOW },
    ]);
    expect(previous.target).toBe(ghost());
    expect(previous.keyframes).toEqual([
      { transform: 'translateX(0)', opacity: 1 },
      { transform: 'translateX(-15%)', opacity: 0.55 },
    ]);
    for (const call of animateCalls) {
      expect(call.options).toEqual({ duration: 330, easing: 'cubic-bezier(.2, .8, .2, 1)' });
    }
  });

  it('slides back with the back keyframes and the leaving level above', () => {
    render(<Uncontrolled defaultValue="ben" />);
    fireEvent.click(screen.getByRole('button', { name: 'Ben Project' }));
    const [current, previous] = animateCalls;
    expect(current.keyframes).toEqual([
      { transform: 'translateX(-15%)', opacity: 0.55 },
      { transform: 'translateX(0)', opacity: 1 },
    ]);
    expect(previous.keyframes).toEqual([
      { transform: 'translateX(0)', opacity: 1, boxShadow: SHADOW },
      { transform: 'translateX(50%)', opacity: 0, boxShadow: NO_SHADOW },
    ]);
    expect(ghost()!.getAttribute('data-motion')).toBe('back');
  });

  // A finished animation drops its effect, so the leaving level jumps back to full opacity in
  // place. Going back it sits on top, so it must be hidden before the next paint, not when
  // React gets round to unmounting it
  it('hides the leaving level in the same microtask its animations finish', async () => {
    render(<Uncontrolled defaultValue="ben" />);
    fireEvent.click(screen.getByRole('button', { name: 'Ben Project' }));
    const leaving = ghost()!;
    finishAll();
    for (let i = 0; i < 5; i++) await Promise.resolve();
    expect(leaving.isConnected && leaving.style.visibility !== 'hidden').toBe(false);
    await act(async () => {});
    expect(ghost()).toBeNull();
  });

  it('removes the leaving level once both animations finish', async () => {
    render(<Uncontrolled />);
    fireEvent.click(screen.getByRole('link', { name: 'Ben Project' }));
    expect(ghost()?.textContent).toContain('Overview');
    const root = document.querySelector('[data-slot="nav-drill"]')!;
    expect(root.getAttribute('data-motion')).toBe('drill');
    animateCalls[0].finish();
    await act(async () => {});
    expect(ghost()).not.toBeNull();
    animateCalls[1].finish();
    await waitFor(() => expect(ghost()).toBeNull());
    expect(root.hasAttribute('data-motion')).toBe(false);
  });

  it('swaps without motion when view changes with no request', () => {
    render(<Controlled />);
    fireEvent.click(screen.getByRole('button', { name: 'go:ben' }));
    expect(screen.getByRole('link', { name: 'Ben overview' })).toBeTruthy();
    expect(animateCalls).toHaveLength(0);
    expect(ghost()).toBeNull();
  });

  it('clears the request on any view change', () => {
    render(<Controlled follow={false} />);
    fireEvent.click(screen.getByRole('link', { name: 'Ben Project' }));
    fireEvent.click(screen.getByRole('button', { name: 'go:x' }));
    fireEvent.click(screen.getByRole('button', { name: 'go:ben' }));
    expect(screen.getByRole('link', { name: 'Ben overview' })).toBeTruthy();
    expect(animateCalls).toHaveLength(0);
    expect(ghost()).toBeNull();
  });

  it('enter-on-drill-row-requests', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Uncontrolled onValueChange={onValueChange} />);
    screen.getByRole('link', { name: 'Ben Project' }).focus();
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('ben', 'drill');
    expect(animateCalls).toHaveLength(2);
  });

  it('swaps without motion under reduced motion', () => {
    setReducedMotion(true);
    render(<Uncontrolled />);
    fireEvent.click(screen.getByRole('link', { name: 'Ben Project' }));
    expect(screen.getByRole('link', { name: 'Ben overview' })).toBeTruthy();
    expect(animateCalls).toHaveLength(0);
    expect(ghost()).toBeNull();
  });

  it('swaps without motion when animate={false}', () => {
    render(<Uncontrolled animate={false} />);
    fireEvent.click(screen.getByRole('link', { name: 'Ben Project' }));
    expect(animateCalls).toHaveLength(0);
    expect(ghost()).toBeNull();
  });

  it('one-current-row-mid-slide', () => {
    render(<Uncontrolled />);
    fireEvent.click(screen.getByRole('link', { name: 'Ben Project' }));
    expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    expect(ghost()!.querySelector('[data-current="page"]')?.textContent).toContain('Overview');
    expect(ghost()!.getAttribute('aria-hidden')).toBe('true');
    expect((ghost() as HTMLElement & { inert: boolean }).inert).toBe(true);
  });

  it('second-request-mid-slide', async () => {
    render(<Uncontrolled />);
    fireEvent.click(screen.getByRole('link', { name: 'Ben Project' }));
    const first = animateCalls.slice(0, 2);
    fireEvent.click(screen.getByRole('button', { name: 'Ben Project' }));
    expect(screen.getByRole('link', { name: 'Overview' })).toBeTruthy();
    expect(first.every((call) => call.cancel.mock.calls.length === 1)).toBe(true);
    expect(animateCalls).toHaveLength(4);
    finishAll();
    await waitFor(() => expect(ghost()).toBeNull());
    expect(liveLevels()).toHaveLength(1);
  });

  it('view-without-level-renders-empty', () => {
    render(<Controlled />);
    fireEvent.click(screen.getByRole('button', { name: 'go:x' }));
    expect(document.querySelectorAll('[data-slot="nav-drill-level"]')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'go:ben' }));
    expect(screen.getByRole('link', { name: 'Ben overview' })).toBeTruthy();
  });

  it('resets the nearest [data-nav-scroller] on every view change', () => {
    render(
      <div data-nav-scroller="" data-testid="scroller">
        <Controlled />
      </div>
    );
    const scroller = screen.getByTestId('scroller');
    Object.defineProperty(scroller, 'scrollTop', { value: 120, writable: true });
    fireEvent.click(screen.getByRole('button', { name: 'go:ben' }));
    expect(scroller.scrollTop).toBe(0);
    scroller.scrollTop = 80;
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(scroller.scrollTop).toBe(0);
  });

  it('keeps the leaving level where it was on screen', () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element
    ) {
      const top = this.textContent?.includes('Ben overview') ? 40 : 100;
      return {
        top,
        bottom: top,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: top,
        toJSON() {},
      } as DOMRect;
    });
    render(<Uncontrolled />);
    fireEvent.click(screen.getByRole('link', { name: 'Ben Project' }));
    const leavingLevel = ghost()!.querySelector<HTMLElement>('[data-slot="nav-drill-level"]')!;
    expect(leavingLevel.style.marginTop).toBe('60px');
  });

  it('focuses ‹ after a drill it saw', () => {
    render(<Uncontrolled />);
    fireEvent.click(screen.getByRole('link', { name: 'Ben Project' }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Ben Project' }));
  });

  it('focuses the row you came from after ‹', () => {
    render(<Uncontrolled defaultValue="ben" />);
    fireEvent.click(screen.getByRole('button', { name: 'Ben Project' }));
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Ben Project' }));
  });

  it('focuses the current row after ‹ when no row leads back', () => {
    render(<Uncontrolled defaultValue="orphan" />);
    fireEvent.click(screen.getByRole('button', { name: 'Orphan' }));
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Overview' }));
  });

  it('focuses-row-mounted-later-by-a-child', async () => {
    let release!: () => void;
    function LateRows() {
      const [ready, setReady] = React.useState(false);
      React.useEffect(() => {
        release = () => setReady(true);
      }, []);
      return ready ? (
        <NavListGroup>
          <NavListItem label="Ben Project" href="#ben" drill="ben" />
        </NavListGroup>
      ) : null;
    }
    render(
      <NavList>
        <NavDrill defaultValue="ben">
          <NavDrillLevel value="projects">
            <LateRows />
          </NavDrillLevel>
          <NavDrillLevel value="ben" parent="projects" label="Ben Project"></NavDrillLevel>
        </NavDrill>
      </NavList>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ben Project' }));
    expect(document.activeElement).toBe(document.body);
    act(() => release());
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Ben Project' }))
    );
  });

  it('leaves focus alone after ‹ if focus moved outside the drill', () => {
    render(<Controlled initial="ben" follow={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ben Project' }));
    const outside = screen.getByRole('button', { name: 'go:projects' });
    outside.focus();
    fireEvent.click(outside);
    expect(screen.getByRole('link', { name: 'Overview' })).toBeTruthy();
    expect(document.activeElement).toBe(outside);
  });

  it('leaves focus alone on a view change it did not request', () => {
    render(<Controlled />);
    fireEvent.click(screen.getByRole('button', { name: 'go:ben' }));
    expect(document.activeElement).toBe(document.body);
  });
  it('drops a pending ‹ focus request when the user acts outside the drill', async () => {
    let release!: () => void;
    function LateRows() {
      const [ready, setReady] = React.useState(false);
      React.useEffect(() => {
        release = () => setReady(true);
      }, []);
      return ready ? (
        <NavListGroup>
          <NavListItem label="Ben Project" href="#ben" drill="ben" current />
        </NavListGroup>
      ) : null;
    }
    render(
      <>
        <NavList>
          <NavDrill defaultValue="ben">
            <NavDrillLevel value="projects">
              <LateRows />
            </NavDrillLevel>
            <NavDrillLevel value="ben" parent="projects" label="Ben Project"></NavDrillLevel>
          </NavDrill>
        </NavList>
        <a href="#page">A page link</a>
      </>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ben Project' }));
    fireEvent.pointerDown(screen.getByRole('link', { name: 'A page link' }));
    act(() => release());
    await act(async () => {});
    expect(document.activeElement).toBe(document.body);
  });

  it('drops a pending drill request when the user acts outside the drill', () => {
    render(<Controlled follow={false} />);
    fireEvent.click(screen.getByRole('link', { name: 'Ben Project' }));
    fireEvent.pointerDown(screen.getByRole('button', { name: 'go:ben' }));
    fireEvent.click(screen.getByRole('button', { name: 'go:ben' }));
    expect(screen.getByRole('link', { name: 'Ben overview' })).toBeTruthy();
    expect(animateCalls).toHaveLength(0);
    expect(document.activeElement).toBe(document.body);
  });
});
