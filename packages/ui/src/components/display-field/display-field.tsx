import { useEffect, useRef, useState } from 'react';
import Truncate from 'react-truncate-inside';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, TriangleAlert } from 'lucide-react';

import { CopyButton } from '@/components/copy-button/copy-button';
import styles from '@/components/display-field/display-field.module.css';
import { cn } from '@/lib/utils';

const displayFieldVariants = cva('', {
  variants: {
    variant: {
      neutral: styles['display-field--neutral'],
      neutralCheck: styles['display-field--neutral'],
      success: styles['display-field--success'],
      failure: styles['display-field--failure'],
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
});

export interface DisplayFieldProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'slot'>,
    VariantProps<typeof displayFieldVariants> {
  variant?: 'neutral' | 'success' | 'neutralCheck' | 'failure';
  prefix?: string;
  truncate?: true | false | 'middle';
  copy?: boolean;
  actions?: React.ReactNode;
  slot?: React.ReactNode;
}

function DisplayField({
  className,
  variant,
  children,
  prefix,
  truncate = false,
  copy = true,
  actions,
  slot,
  ...props
}: DisplayFieldProps) {
  const middleTruncationContainerRef = useRef<HTMLDivElement>(null);
  const [middleTruncationWidth, setMiddleTruncationWidth] = useState<number | undefined>(undefined);

  const getIcon = () => {
    if (variant === 'success' || variant === 'neutralCheck') {
      return <Check className={styles['icon-width']} />;
    }
    if (variant === 'failure') {
      return <TriangleAlert className={styles['icon-width']} />;
    }
    return null;
  };

  const renderContent = () => {
    if (truncate === 'middle' && typeof children === 'string') {
      return (
        <div ref={middleTruncationContainerRef}>
          <Truncate text={children} offset={8} ellipsis="…" width={middleTruncationWidth} />
        </div>
      );
    }
    return children;
  };

  const getTruncateClass = () => {
    if (truncate === 'middle') return styles['overflow-hidden'];
    if (truncate === true) return styles['truncate'];
    return styles['overflow-x-scroll'];
  };

  const getValueForCopy = () => {
    if (typeof children === 'string') {
      return children;
    }
    return '';
  };

  const showActions = copy || actions;

  useEffect(() => {
    // Calculate the width of the middle truncation
    const calcMiddleTruncationWidth = () => {
      let targetW;
      targetW = middleTruncationContainerRef.current?.getBoundingClientRect().width;
      setMiddleTruncationWidth(targetW);
    };

    const observer = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        calcMiddleTruncationWidth();
      }
    });
    if (middleTruncationContainerRef.current) {
      observer.observe(middleTruncationContainerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={cn(styles['display-field'], className)} {...props}>
      <div className={styles['display-field-inner']}>
        {prefix && (
          <div className={cn(styles['prefix'], displayFieldVariants({ variant: variant }))}>
            {getIcon()}
            {prefix}
          </div>
        )}
        <span
          className={cn(styles['content'], getTruncateClass())}
          style={{ scrollbarWidth: 'thin' }}
        >
          {renderContent()}
        </span>
        {showActions && (
          <div className={styles['actions']}>
            {actions}
            {copy && <CopyButton value={getValueForCopy()} size="sm" />}
          </div>
        )}
      </div>
      {slot && (
        <div className={styles['slot']}>
          <div className={styles['slot-inner']}>{slot}</div>
        </div>
      )}
    </div>
  );
}

export { DisplayField, displayFieldVariants };
