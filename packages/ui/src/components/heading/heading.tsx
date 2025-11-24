import { forwardRef, HTMLAttributes } from 'react';

import styles from '@/components/heading/heading.module.css';
import { cn } from '@/lib/utils';

type HeadingTagType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  as: HeadingTagType;
  displayAs?: HeadingTagType;
  children: string | React.ReactNode;
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as, displayAs, children, ...props }, ref) => {
    const displayClasses = {
      h1: styles['h1'],
      h2: styles['h2'],
      h3: styles['h3'],
      h4: styles['h4'],
      h5: styles['h5'],
      h6: styles['h6'],
    };

    const displayClass =
      displayClasses[displayAs as keyof typeof displayClasses] || displayClasses[as];
    const HeadingTag = as as HeadingTagType;

    return (
      <HeadingTag ref={ref} className={cn(displayClass, className)} {...props}>
        {children}
      </HeadingTag>
    );
  }
);

Heading.displayName = 'Heading';

export { Heading };
