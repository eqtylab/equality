import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import styles from '@/components/avatar/avatar.module.css';
import { cn } from '@/lib/utils';

type AvatarSize = 'line' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  /** How large the avatar is: `line` is as tall as the line of text it sits in, and `xs` to `lg` are as tall as the control of that size, and `xl` is the largest, for a profile or page hero */
  size?: AvatarSize;
  /** Whether the avatar is round or a rounded square */
  shape?: 'circle' | 'square';
}

const AvatarSizeContext = React.createContext<AvatarSize>('line');

const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(
  ({ className, size = 'line', shape = 'circle', ...props }, ref) => (
    <AvatarSizeContext.Provider value={size}>
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(styles.avatar, styles[`size-${size}`], styles[shape], className)}
        {...props}
      />
    </AvatarSizeContext.Provider>
  )
);
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn(styles['avatar-image'], className)} {...props} />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

type GraphemeSegmenter = new () => {
  segment(text: string): Iterable<{ segment: string }>;
};

const Segmenter = (Intl as { Segmenter?: GraphemeSegmenter }).Segmenter;
const segmenter = Segmenter ? new Segmenter() : null;

const INITIAL_LETTERS = /^[\p{L}\p{M}\s]+$/u;

function shortenInitials(children: React.ReactNode, count: number) {
  const parts = React.Children.toArray(children);
  if (!parts.every((part) => typeof part === 'string' || typeof part === 'number')) return null;
  const text = parts.join('').trim();
  if (!INITIAL_LETTERS.test(text)) return null;
  const letters = text.replace(/\s+/g, '');
  const graphemes = segmenter
    ? Array.from(segmenter.segment(letters), ({ segment }) => segment)
    : Array.from(letters);
  if (graphemes.length <= count && letters === text) return { drawn: text, full: text };
  return { drawn: graphemes.slice(0, count).join(''), full: text };
}

const INITIALS: Record<AvatarSize, number> = { line: 1, xs: 1, sm: 1, md: 2, lg: 2, xl: 2 };

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, children, ...props }, ref) => {
  const size = React.useContext(AvatarSizeContext);
  const initials = shortenInitials(children, INITIALS[size]);
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(styles['avatar-fallback'], className)}
      {...props}
    >
      {!initials ? (
        children
      ) : initials.drawn === initials.full ? (
        initials.full
      ) : (
        <>
          <span aria-hidden="true">{initials.drawn}</span>
          <span className={styles['avatar-initials-full']}>{initials.full}</span>
        </>
      )}
    </AvatarPrimitive.Fallback>
  );
});
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarFallback, AvatarImage };
