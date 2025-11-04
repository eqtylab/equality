import * as React from 'react';

import styles from '@/components/input/input.module.css';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return <input type={type} className={cn(styles['input'], className)} ref={ref} {...props} />;
  }
);
Input.displayName = 'Input';

export { Input };
