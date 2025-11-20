import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

import styles from '@/components/checkbox/checkbox.module.css';
import { cn } from '@/lib/utils';

const CheckIcon = Check as React.ComponentType<{ className?: string }>;

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  icon?: React.ElementType;
  size?: 'sm' | 'md';
}

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, icon: Icon, size = 'md', ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(styles.checkbox, styles[size], className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={styles.indicator}>
        <CheckIcon className={styles.check} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
