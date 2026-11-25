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
  /** The block's title. Without one, trailing items still sit at the end of the row. */
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
        <div className={styles.stack}>
          <div className={styles.line}>
            {title && (
              <Title id={titleId} className={styles.title}>
                {title}
              </Title>
            )}
          </div>
          {description && <p className={styles.description}>{description}</p>}
          {children}
        </div>
        {(trailing || actions) && (
          <div className={styles.end}>
            {trailing && <div className={styles.trailing}>{trailing}</div>}
            {actions && <div className={styles.actions}>{actions}</div>}
          </div>
        )}
      </div>
    </TitleBlockSizeContext.Provider>
  )
);
TitleBlock.displayName = 'TitleBlock';

export interface TitleBlockMarkProps {
  /** A Lucide icon name or a React element, shown on a tile sized to the TitleBlock. */
  icon: React.ReactElement | string;
  /** Classes added to the tile. */
  className?: string;
}

const TitleBlockMark = forwardRef<HTMLSpanElement, TitleBlockMarkProps>(
  ({ icon, className }, ref) => {
    const size = React.useContext(TitleBlockSizeContext);

    return (
      <Icon
        ref={ref}
        icon={icon}
        background="square"
        elevation="overlay"
        aria-hidden
        className={cn(styles.mark, styles[`mark-${size}`], className)}
      />
    );
  }
);
TitleBlockMark.displayName = 'TitleBlockMark';

export interface TitleBlockSkeletonProps {
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
  /** The mark's shape: a square tile, a round avatar, or none. */
  mark?: 'square' | 'round' | false;
  /** Classes added to the root. */
  className?: string;
}

function TitleBlockSkeleton({
  size = 'md',
  titleWidth,
  descriptionWidth,
  trailing,
  actions,
  mark = 'square',
  className,
}: TitleBlockSkeletonProps) {
  return (
    <div
      className={cn(
        styles['title-block'],
        styles[`size-${size}`],
        mark && styles['with-mark'],
        actions && styles['with-actions'],
        descriptionWidth && styles['with-description'],
        className
      )}
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
  );
}

export { TitleBlock, TitleBlockMark, TitleBlockSkeleton };
