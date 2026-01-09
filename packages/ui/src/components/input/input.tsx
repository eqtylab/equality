import * as React from 'react';

import styles from '@/components/input/input.module.css';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, prefix, suffix, ...props }, ref) => {
    return (
      <div className={cn(styles['input-wrapper'], className)}>
        {prefix && <span className={styles['input-prefix']}>{prefix}</span>}
        <input type={type} className={styles['input-element']} ref={ref} {...props} />
        {suffix && <span className={styles['input-suffix']}>{suffix}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
