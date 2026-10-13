import { useCallback, useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react';

import { Icon } from '@/components/icon/icon';
import {
  TabsContainer,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/tabs/tabs-components';
import styles from '@/components/tabs/tabs.module.css';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';
import { cn } from '@/lib/utils';

interface IndicatorPosition {
  left: number;
  width: number;
  duration: number;
}

interface TabsProps {
  /** @deprecated No longer used. The active indicator is positioned without it. */
  id?: string;
  items: {
    label: string;
    value: string;
    icon?: React.ReactElement | string;
    suffix?: React.ReactNode;
    content: React.ReactNode;
    /* The `data-` signature is required: React allows data attributes in JSX but not in a
       standalone typed object, forwarding without one is a type error. */
    triggerProps?: Omit<ComponentPropsWithoutRef<typeof TabsTrigger>, 'value'> & {
      [key: `data-${string}`]: string | number | boolean | undefined;
    };
  }[];
  className?: string;
  tabsListBackground?: 'transparent' | 'filled';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  // Render for an environment where React never runs on the client (statically rendered sites).
  staticRender?: boolean;
}

const Tabs = ({
  items,
  className,
  tabsListBackground = 'transparent',
  value,
  defaultValue,
  onValueChange,
  staticRender = false,
}: TabsProps) => {
  const [uncontrolledTab, setUncontrolledTab] = useState(defaultValue ?? items[0].value);
  const activeTab = value ?? uncontrolledTab;

  const isFilled = tabsListBackground === 'filled';

  const listRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<IndicatorPosition | null>(null);
  const [animateIndicator, setAnimateIndicator] = useState(false);
  const itemValues = items.map((item) => item.value).join('\0');

  // A one-tab hop matches SegmentedControls' 250ms; longer jumps take a little longer, up to 400ms.
  const updateIndicator = useCallback(() => {
    const activeTrigger = triggerRefs.current[activeTab];
    const width = activeTrigger?.offsetWidth ?? 0;
    if (!activeTrigger || width === 0) {
      setIndicator(null);
      return;
    }
    const left = activeTrigger.offsetLeft;
    setIndicator((previous) => {
      if (previous?.left === left && previous.width === width) return previous;
      const hops = previous
        ? Math.abs(left + width / 2 - (previous.left + previous.width / 2)) /
          ((width + previous.width) / 2)
        : 0;
      const duration = Math.min(400, Math.max(250, 250 + (hops - 1) * 100));
      return { left, width, duration };
    });
  }, [activeTab]);

  useIsomorphicLayoutEffect(() => {
    if (!staticRender) updateIndicator();
  }, [updateIndicator, itemValues, staticRender]);

  // Enabling the transition in the same frame as the first measurement makes the indicator slide in from the left edge on mount.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimateIndicator(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // The list is full width, so a trigger can change size (a suffix count, a late web font) without it.
  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    if (!list || staticRender) return;
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(list);
    for (const trigger of Object.values(triggerRefs.current)) {
      if (trigger) observer.observe(trigger);
    }
    return () => observer.disconnect();
  }, [updateIndicator, itemValues, staticRender]);

  /*
    Radix requests a tab on mousedown and again on the focus that follows, in the same task.
    A controlled parent that commits later (React Router navigates in a transition) has not
    updated `value` by then, so without this every click reports twice and pushes a
    duplicate history entry.
  */
  const requestedTab = useRef<string | null>(null);

  const handleValueChange = (newTab: string) => {
    if (newTab === requestedTab.current) return;
    requestedTab.current = newTab;
    setTimeout(() => {
      requestedTab.current = null;
    });
    setUncontrolledTab(newTab);
    onValueChange?.(newTab);
  };

  const renderIcon = (icon?: React.ReactElement | string) => {
    if (icon) {
      return <Icon icon={icon} size="sm" className={styles['tabs-icon']} />;
    }
    return null;
  };

  const indicatorClass = cn(
    styles['active-tab-indicator'],
    isFilled ? styles['active-tab-indicator--filled'] : styles['active-tab-indicator--transparent']
  );

  /*
    Static mode has no React on the page, so switching tabs is an attribute flip: the
    indicator has to ship in every trigger and be revealed by `data-state`.
    Until the shared indicator is measured (server HTML before hydration, or a hidden list)
    the active trigger carries its own. Without it a filled tab's white label sits on the
    bare track.
  */
  const renderTriggerIndicator = (value: string) => {
    if (staticRender) {
      return (
        <span
          aria-hidden
          data-slot="tabs-indicator"
          className={cn(indicatorClass, styles['active-tab-indicator--static'])}
        />
      );
    }
    if (!indicator && value === activeTab) {
      return <span aria-hidden data-slot="tabs-indicator" className={indicatorClass} />;
    }
    return null;
  };

  return (
    <TabsContainer
      value={activeTab}
      onValueChange={handleValueChange}
      className={cn(styles['tabs'], className)}
    >
      <TabsList
        ref={listRef}
        className={cn(
          styles['tabs-list'],
          isFilled ? styles['tabs-list--filled'] : styles['tabs-list--transparent']
        )}
      >
        {items.map(({ label, value, icon, suffix, triggerProps }) => {
          return (
            <TabsTrigger
              {...triggerProps}
              key={value}
              ref={(el) => {
                triggerRefs.current[value] = el;
              }}
              value={value}
              className={cn(
                styles['tabs-trigger'],
                isFilled ? styles['tabs-trigger--filled'] : styles['tabs-trigger--transparent'],
                triggerProps?.className
              )}
            >
              {renderIcon(icon)}
              {label}
              {suffix}
              {renderTriggerIndicator(value)}
            </TabsTrigger>
          );
        })}
        {!staticRender && indicator && (
          <span
            aria-hidden
            data-slot="tabs-indicator"
            className={cn(
              indicatorClass,
              styles['active-tab-indicator--shared'],
              animateIndicator && styles['active-tab-indicator--animated']
            )}
            style={
              {
                transform: `translateX(${indicator.left}px)`,
                '--indicator-width': `${indicator.width}px`,
                '--indicator-duration': `${indicator.duration}ms`,
              } as React.CSSProperties
            }
          />
        )}
      </TabsList>

      {items.map(({ value, content }) => (
        <TabsContent
          value={value}
          key={value}
          className={styles['content']}
          /* Radix is `present={forceMount || isSelected}`, so without this an inactive panel
             is absent from the HTML entirely. CSS hides it instead; see tabs.module.css. */
          forceMount={staticRender || undefined}
        >
          {content}
        </TabsContent>
      ))}
    </TabsContainer>
  );
};

export { Tabs };
