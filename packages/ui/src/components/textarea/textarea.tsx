import * as React from 'react';

import styles from '@/components/textarea/textarea.module.css';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.ComponentProps<'textarea'> {
  /** `bare` sits inside a frame that draws its own edge: no border, background, radius or focus ring */
  variant?: 'default' | 'bare';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <textarea
        className={cn(
          styles['textarea'],
          variant === 'bare' && styles['textarea--bare'],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
