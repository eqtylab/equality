import * as React from 'react';
import { ChevronLeft } from 'lucide-react';

import { NavDrillContext } from '@/components/nav-list/nav-drill-context';
import styles from '@/components/nav-list/nav-list.module.css';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';
import { cn } from '@/lib/utils';

type NavDrillRequest = 'drill' | 'back';

// The leaving level is gone in the first third, so the two levels' rows never read as doubled text
const motion = (direction: NavDrillRequest, nudge: number) => {
  const sign = direction === 'drill' ? 1 : -1;
  return {
    current: [
      { transform: `translateX(${sign * nudge}px)`, opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 },
    ],
    previous: [
      { transform: 'translateX(0)', opacity: 1 },
      { opacity: 0, offset: 0.35 },
      { transform: `translateX(${-sign * nudge}px)`, opacity: 0 },
    ],
  };
};

// Folder groups animate in CSS from the same variables; reading them here keeps the two in step
function navMotion(element: Element) {
  const style = getComputedStyle(element);
  const read = (name: string) => style.getPropertyValue(name).trim();
  const duration = read('--eq-nav-motion-duration');
  const ms = duration.endsWith('ms') ? parseFloat(duration) : parseFloat(duration) * 1000;
  const nudge = parseFloat(read('--eq-nav-motion-nudge'));
  return {
    nudge: Number.isFinite(nudge) ? nudge : 12,
    timing: {
      duration: Number.isFinite(ms) ? ms : 300,
      easing: read('--eq-nav-motion-ease') || 'cubic-bezier(.2, .8, .2, 1)',
    },
  };
}

const LEVEL = '[data-slot="nav-drill-level"]';

interface PendingRequest {
  view: string;
  direction: NavDrillRequest;
  // The level on show when the request was made, which slides away if the request lands
  element: React.ReactElement | null;
  top: number;
  slide: boolean;
}

interface Leaving {
  element: React.ReactElement;
  direction: NavDrillRequest;
  top: number;
  id: number;
}

interface FocusRequest {
  direction: NavDrillRequest;
  view: string;
  from: string | undefined;
  landed: boolean;
}

const NavDrillBackContext = React.createContext<(parent: string) => void>(() => {});

const LEAVING_DRILL_CONTEXT = { requestDrill: () => {}, leaving: true };
const NO_BACK = () => {};

interface NavDrillProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Controlled: the `value` of the level on show */
  value?: string;
  /** Uncontrolled: the `value` of the first level */
  defaultValue?: string;
  /** Called when a drill row or ‹ asks for a level; a controlled caller sets `value` from it */
  onValueChange?: (value: string, request: NavDrillRequest) => void;
  /** Slides levels in and out after a drill row or ‹; off swaps them at once */
  animate?: boolean;
}

const NavDrill = React.forwardRef<HTMLDivElement, NavDrillProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      animate = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [ownView, setOwnView] = React.useState(defaultValue);
    const view = valueProp ?? ownView;
    const [shownView, setShownView] = React.useState(view);
    const [request, setRequest] = React.useState<PendingRequest | null>(null);
    const [leaving, setLeaving] = React.useState<Leaving | null>(null);
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const ghostRef = React.useRef<HTMLDivElement | null>(null);
    const running = React.useRef<Animation[]>([]);
    const focusRequest = React.useRef<FocusRequest | null>(null);
    const observer = React.useRef<MutationObserver | null>(null);
    const previousView = React.useRef(view);

    const level =
      React.Children.toArray(children).find(
        (child): child is React.ReactElement<NavDrillLevelProps> =>
          React.isValidElement<NavDrillLevelProps>(child) && child.props.value === view
      ) ?? null;

    // Only a change that lands on the level the last request asked for slides; any change
    // clears the request, so Back, Forward, deep links and redirects swap at once
    if (view !== shownView) {
      setShownView(view);
      setRequest(null);
      setLeaving(
        request?.slide && request.view === view && request.element && level
          ? {
              element: request.element,
              direction: request.direction,
              top: request.top,
              id: (leaving?.id ?? 0) + 1,
            }
          : null
      );
    }

    const liveLevel = () =>
      rootRef.current?.querySelector<HTMLElement>(`:scope > ${LEVEL}`) ?? null;

    const tryFocus = () => {
      const pending = focusRequest.current;
      const root = rootRef.current;
      if (!pending?.landed || !root) return;
      const active = document.activeElement;
      if (active && active !== document.body && !root.contains(active)) {
        focusRequest.current = null;
        return;
      }
      const live = liveLevel();
      const target =
        pending.direction === 'drill'
          ? (live?.querySelector<HTMLElement>('[data-slot="nav-drill-back"]') ??
            live?.querySelector<HTMLElement>('[data-slot="nav-list-item"]'))
          : (live?.querySelector<HTMLElement>(`[data-drill="${CSS.escape(pending.from ?? '')}"]`) ??
            live?.querySelector<HTMLElement>('[aria-current="page"]'));
      if (!target) return;
      focusRequest.current = null;
      observer.current?.disconnect();
      // focus() alone centres the row in the window; "nearest" moves the list first
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'nearest' });
    };

    const makeRequest = (target: string, direction: NavDrillRequest) => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setRequest({
        view: target,
        direction,
        element: level,
        top: liveLevel()?.getBoundingClientRect().top ?? 0,
        slide: animate && !reduced,
      });
      focusRequest.current = { direction, view: target, from: view, landed: false };
      observer.current?.disconnect();
      // ‹ may land before the parent's rows exist, and a child component can mount them later
      // without NavDrill rendering again
      if (direction === 'back' && rootRef.current) {
        observer.current ??= new MutationObserver(() => tryFocus());
        observer.current.observe(rootRef.current, { childList: true, subtree: true });
      }
      if (valueProp === undefined) setOwnView(target);
      onValueChange?.(target, direction);
    };

    const makeRequestRef = React.useRef(makeRequest);
    useIsomorphicLayoutEffect(() => {
      makeRequestRef.current = makeRequest;
    });
    const drillContext = React.useMemo(
      () => ({
        requestDrill: (target: string) => makeRequestRef.current(target, 'drill'),
        leaving: false,
      }),
      []
    );
    const requestBack = React.useCallback(
      (parent: string) => makeRequestRef.current(parent, 'back'),
      []
    );

    useIsomorphicLayoutEffect(() => {
      if (previousView.current === view) return;
      previousView.current = view;
      const pending = focusRequest.current;
      if (pending && !pending.landed && pending.view === view) pending.landed = true;
      else {
        focusRequest.current = null;
        observer.current?.disconnect();
      }
      // As a fresh panel would: a drill-in from far down a list shows the new rows' top
      const scroller = rootRef.current?.closest<HTMLElement>('[data-nav-scroller]');
      if (scroller) scroller.scrollTop = 0;
    }, [view]);

    useIsomorphicLayoutEffect(() => {
      running.current.forEach((animation) => animation.cancel());
      running.current = [];
      const live = liveLevel();
      const ghost = ghostRef.current;
      const ghostLevel = ghost?.querySelector<HTMLElement>(LEVEL);
      if (!leaving || !live || !ghost || !ghostLevel) return;
      // The old rows leave from where the user saw them: neither the scroll reset nor a tighter
      // header moves them. A margin, because the slide owns transform
      ghostLevel.style.marginTop = `${leaving.top - live.getBoundingClientRect().top}px`;
      const { nudge, timing } = navMotion(live);
      const frames = motion(leaving.direction, nudge);
      const animations = [
        live.animate(frames.current, timing),
        ghost.animate(frames.previous, timing),
      ];
      running.current = animations;
      Promise.all(animations.map((animation) => animation.finished)).then(
        () => {
          // A finished animation drops its effect, so the leaving level is back at full opacity
          // in place. Going back it is on top: hide it now, before the next paint, or it
          // flashes for a frame until React unmounts it
          ghost.style.visibility = 'hidden';
          setLeaving((current) => (current === leaving ? null : current));
        },
        // Cancelled by a later change, which owns the ghost now
        () => {}
      );
    }, [leaving]);

    React.useEffect(() => {
      tryFocus();
    });

    // NavDrill cannot see the caller's routing. A page link or anything else the user does
    // outside the drill is a different intent, so it drops what a drill row or ‹ asked for:
    // neither the slide nor the focus may land on a later, unrelated change
    React.useEffect(() => {
      const dropOutside = (event: Event) => {
        if (rootRef.current?.contains(event.target as Node)) return;
        focusRequest.current = null;
        observer.current?.disconnect();
        setRequest((current) => (current ? null : current));
      };
      const events = ['pointerdown', 'keydown', 'focusin'] as const;
      events.forEach((type) => document.addEventListener(type, dropOutside, true));
      return () => {
        events.forEach((type) => document.removeEventListener(type, dropOutside, true));
        running.current.forEach((animation) => animation.cancel());
        observer.current?.disconnect();
      };
    }, []);

    const setRootRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const setGhostRef = React.useCallback((node: HTMLDivElement | null) => {
      ghostRef.current = node;
      // Through the DOM so it works in React 18, which drops an `inert` prop
      if (node) node.inert = true;
    }, []);

    return (
      <div
        ref={setRootRef}
        data-slot="nav-drill"
        data-motion={leaving?.direction}
        className={cn(styles['nav-drill'], className)}
        {...props}
      >
        <NavDrillContext.Provider value={drillContext}>
          <NavDrillBackContext.Provider value={requestBack}>
            {level && <React.Fragment key={view}>{level}</React.Fragment>}
          </NavDrillBackContext.Provider>
        </NavDrillContext.Provider>
        {leaving && (
          <div
            key={leaving.id}
            ref={setGhostRef}
            data-slot="nav-drill-ghost"
            data-motion={leaving.direction}
            aria-hidden="true"
            className={styles['nav-drill-ghost']}
          >
            <NavDrillContext.Provider value={LEAVING_DRILL_CONTEXT}>
              <NavDrillBackContext.Provider value={NO_BACK}>
                {leaving.element}
              </NavDrillBackContext.Provider>
            </NavDrillContext.Provider>
          </div>
        )}
      </div>
    );
  }
);
NavDrill.displayName = 'NavDrill';

interface NavDrillLevelBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The `NavDrill` value that shows this level; must be a direct child of `NavDrill` */
  value: string;
}

interface NavDrillChildLevelProps extends NavDrillLevelBaseProps {
  /** The `value` ‹ returns to; draws the ‹ row at the top of the level */
  parent?: string;
  /** Names where you are, on the ‹ row */
  label: string;
  /** The ‹ row's accessible name; must start with `label` (WCAG 2.5.3). @default "{label}, back" */
  backLabel?: string;
}

interface NavDrillTopLevelProps extends NavDrillLevelBaseProps {
  parent?: undefined;
  label?: undefined;
  backLabel?: undefined;
}

type NavDrillLevelProps = NavDrillChildLevelProps | NavDrillTopLevelProps;

const NavDrillLevel = React.forwardRef<HTMLDivElement, NavDrillLevelProps>(
  ({ value, parent, label, backLabel, className, children, ...props }, ref) => {
    const requestBack = React.useContext(NavDrillBackContext);

    React.useEffect(() => {
      if (
        typeof process !== 'undefined' &&
        process.env.NODE_ENV !== 'production' &&
        parent !== undefined &&
        backLabel &&
        label &&
        !backLabel.startsWith(label)
      ) {
        console.warn(
          `NavDrillLevel: backLabel "${backLabel}" must start with label "${label}", so voice users can say what they see (WCAG 2.5.3)`
        );
      }
    }, [parent, label, backLabel]);

    return (
      <div
        ref={ref}
        data-slot="nav-drill-level"
        data-value={value}
        className={cn(styles['nav-drill-level'], className)}
        {...props}
      >
        {parent !== undefined && (
          <>
            <button
              type="button"
              data-slot="nav-drill-back"
              aria-label={backLabel ?? `${label}, back`}
              className={cn(styles['nav-list-item'], styles['nav-list-item--back'])}
              onClick={() => requestBack(parent)}
            >
              <span
                className={cn(styles['nav-list-item-prefix'], styles['nav-list-item-muted'])}
                aria-hidden="true"
              >
                <ChevronLeft />
              </span>
              <span className={styles['nav-list-item-label']} title={label}>
                {label}
              </span>
            </button>
            <hr className={styles['nav-drill-rule']} />
          </>
        )}
        {children}
      </div>
    );
  }
);
NavDrillLevel.displayName = 'NavDrillLevel';

export { NavDrill, NavDrillLevel };
export type { NavDrillLevelProps, NavDrillProps, NavDrillRequest };
