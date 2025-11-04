import * as React from 'react';

import styles from '@/components/textarea/textarea.module.css';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return <textarea className={cn(styles['textarea'], className)} ref={ref} {...props} />;
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
