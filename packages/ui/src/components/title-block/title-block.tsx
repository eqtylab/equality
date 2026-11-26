import * as React from 'react';
import { forwardRef } from 'react';

import { Icon } from '@/components/icon/icon';
import { Skeleton } from '@/components/skeleton/skeleton';
import styles from '@/components/title-block/title-block.module.css';
import { cn } from '@/lib/utils';

export type TitleBlockSize = 'sm' | 'md' | 'lg';

const TitleBlockSizeContext = React.createContext<TitleBlockSize>('md');

export interface TitleBlockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** How large the mark and title are. */
  size?: TitleBlockSize;
  /** A `TitleBlockMark` shown before the title. */
  mark?: React.ReactNode;
  /** The block's title. Without one, trailing items still sit at the end of the block. */
  title?: React.ReactNode;
  /** Supporting text under the title. */
  description?: React.ReactNode;
  /** Badges or status at the end of the block, centred on it, before any actions. */
  trailing?: React.ReactNode;
  /** Buttons or a menu at the end of the block, centred on it, after any trailing items. */
  actions?: React.ReactNode;
  /** The element the title renders as, to fit the page's heading outline. */
  titleAs?: 'h2' | 'h3' | 'h4' | 'p';
  /** An id for the title, so a region can take its name with `aria-labelledby`. */
  titleId?: string;
  /** Content shown under the description. */
  children?: React.ReactNode;
}

const TitleBlock = forwardRef<HTMLDivElement, TitleBlockProps>(
  (
    {
      className,
      size = 'md',
      mark,
      title,
      description,
      trailing,
      actions,
      titleAs: Title = 'h3',
      titleId,
      children,
      ...props
    },
    ref
  ) => (
    <TitleBlockSizeContext.Provider value={size}>
      <div
        ref={ref}
        className={cn(
          styles['title-block'],
          styles[`size-${size}`],
          mark && styles['with-mark'],
          actions && styles['with-actions'],
          description && styles['with-description'],
          className
        )}
        {...props}
      >
        {mark && <div className={styles['mark-slot']}>{mark}</div>}
        <div className={styles.body}>
          <div className={styles.stack}>
            {title && (
              <div className={styles.line}>
                <Title id={titleId} className={styles.title}>
                  {title}
                </Title>
              </div>
            )}
            {description && <div className={styles.description}>{description}</div>}
            {children}
          </div>
          {(trailing || actions) && (
            <div className={styles.end}>
              {trailing && <div className={styles.trailing}>{trailing}</div>}
              {actions && <div className={styles.actions}>{actions}</div>}
            </div>
          )}
        </div>
      </div>
    </TitleBlockSizeContext.Provider>
  )
);
TitleBlock.displayName = 'TitleBlock';

export interface TitleBlockMarkProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  /** A Lucide icon name or a React element, shown on a tile sized to the TitleBlock. */
  icon: React.ReactElement | string;
  /** A square tile, or a circle. */
  shape?: 'square' | 'round';
}

const TitleBlockMark = forwardRef<HTMLSpanElement, TitleBlockMarkProps>(
  ({ icon, shape = 'square', className, ...props }, ref) => {
    const size = React.useContext(TitleBlockSizeContext);

    return (
      <Icon
        ref={ref}
        icon={icon}
        background={shape === 'round' ? 'circle' : 'square'}
        elevation="overlay"
        aria-hidden
        className={cn(
          styles.mark,
          styles[`mark-${size}`],
          shape === 'round' && styles['mark-round'],
          className
        )}
        {...props}
      />
    );
  }
);
TitleBlockMark.displayName = 'TitleBlockMark';

export interface TitleBlockSkeletonProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** The size of the TitleBlock it stands in for. */
  size?: TitleBlockSize;
  /** A width class for the title bar, such as `w-40`. */
  titleWidth: string;
  /** A width class for the description bar. Leave it out when the block has no description. */
  descriptionWidth?: string;
  /** Placeholders for the trailing items, such as a `Skeleton` the size of a badge. */
  trailing?: React.ReactNode;
  /** Placeholders for the actions, such as a `Skeleton` the size of a button. */
  actions?: React.ReactNode;
  /** The mark's shape: a square tile, a round mark, or none. */
  mark?: 'square' | 'round' | false;
}

const TitleBlockSkeleton = forwardRef<HTMLDivElement, TitleBlockSkeletonProps>(
  (
    {
      size = 'md',
      titleWidth,
      descriptionWidth,
      trailing,
      actions,
      mark = 'square',
      className,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        styles['title-block'],
        styles[`size-${size}`],
        mark && styles['with-mark'],
        actions && styles['with-actions'],
        descriptionWidth && styles['with-description'],
        className
      )}
      {...props}
    >
      {mark && (
        <div className={styles['mark-slot']}>
          <Skeleton
            className={cn(
              styles.mark,
              styles[`mark-${size}`],
              mark === 'round' && styles['mark-round']
            )}
          />
        </div>
      )}
      <div className={styles.body}>
        <div className={styles.stack}>
          <div className={styles.line}>
            <div className={styles.title}>
              <div className={styles['placeholder-line']}>
                <Skeleton className={cn(styles['placeholder-bar'], titleWidth)} />
              </div>
            </div>
          </div>
          {descriptionWidth && (
            <div className={styles['placeholder-line']}>
              <Skeleton className={cn(styles['placeholder-bar'], descriptionWidth)} />
            </div>
          )}
        </div>
        {(trailing || actions) && (
          <div className={styles.end}>
            {trailing && <div className={styles.trailing}>{trailing}</div>}
            {actions && <div className={styles.actions}>{actions}</div>}
          </div>
        )}
      </div>
    </div>
  )
);
TitleBlockSkeleton.displayName = 'TitleBlockSkeleton';

export { TitleBlock, TitleBlockMark, TitleBlockSkeleton };
