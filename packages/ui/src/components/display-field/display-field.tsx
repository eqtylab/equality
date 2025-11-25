import * as React from 'react';
import Truncate from 'react-truncate-inside';
import { cva, type VariantProps } from 'class-variance-authority';
import { CircleCheck, CircleX } from 'lucide-react';

import { CopyButton } from '@/components/copy-button/copy-button';
import styles from '@/components/display-field/display-field.module.css';
import { cn } from '@/lib/utils';

const CircleCheckIcon = CircleCheck as React.ComponentType<{ className?: string }>;
const CircleXIcon = CircleX as React.ComponentType<{ className?: string }>;

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
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof displayFieldVariants> {
  variant?: 'neutral' | 'success' | 'neutralCheck' | 'failure';
  prefix?: string;
  truncate?: true | false | 'middle';
  copy?: boolean;
  actions?: React.ReactNode;
}

function DisplayField({
  className,
  variant,
  children,
  prefix,
  truncate = false,
  copy = true,
  actions,
  ...props
}: DisplayFieldProps) {
  const getIcon = () => {
    if (variant === 'success' || variant === 'neutralCheck') {
      return <CircleCheckIcon className={styles['icon-width']} />;
    }
    if (variant === 'failure') {
      return <CircleXIcon className={styles['icon-width']} />;
    }
    return null;
  };

  const renderContent = () => {
    if (truncate === 'middle' && typeof children === 'string') {
      return (
        <div>
          <Truncate text={children} offset={8} ellipsis="…" />
        </div>
      );
    }
    return children;
  };

  const getTruncateClass = () => {
    if (truncate === 'middle') return 'overflow-hidden';
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

  return (
    <div className={cn(styles['display-field'], className)} {...props}>
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
          {copy && <CopyButton value={getValueForCopy()} size="sm" />}
          {actions}
        </div>
      )}
    </div>
  );
}

export { DisplayField, displayFieldVariants };
