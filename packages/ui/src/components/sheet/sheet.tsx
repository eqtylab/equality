import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconButton } from '@/components/icon-button/icon-button';
import styles from '@/components/sheet/sheet.module.css';
import { cn, getThemeProviderRoot } from '@/lib/utils';

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = ({ children }: { children: React.ReactNode }) => (
  <SheetPrimitive.Portal container={getThemeProviderRoot()}>{children}</SheetPrimitive.Portal>
);

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay className={cn(styles['sheet-overlay'], className)} {...props} ref={ref} />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(styles['sheet-content'], {
  variants: {
    side: {
      top: styles['sheet-content--side-top'],
      bottom: styles['sheet-content--side-bottom'],
      left: styles['sheet-content--side-left'],
      right: styles['sheet-content--side-right'],
    },
  },
  defaultVariants: {
    side: 'right',
  },
});

interface SheetContainerProps
  extends
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContainer = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContainerProps
>(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContainer.displayName = SheetPrimitive.Content.displayName;

const SheetHeaderIcon = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(styles['sheet-header-icon'], className)} {...props} />
);
SheetHeaderIcon.displayName = 'SheetHeaderIcon';

const SheetHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const childrenArray = React.Children.toArray(children);
  const icon = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === SheetHeaderIcon
  );
  const otherChildren = childrenArray.filter(
    (child) => !(React.isValidElement(child) && child.type === SheetHeaderIcon)
  );

  return (
    <div className={cn(styles['sheet-header'], className)} {...props}>
      {icon}
      <div className={styles['sheet-header-text-content']}>{otherChildren}</div>
      <SheetPrimitive.Close asChild>
        <IconButton name="X" label="Close" className={styles['sheet-close']} />
      </SheetPrimitive.Close>
    </div>
  );
};
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(styles['sheet-footer'], className)} {...props} />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title ref={ref} className={cn(styles['sheet-title'], className)} {...props} />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn(styles['sheet-description'], className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

const SheetContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(styles['sheet-body'], 'styled-vertical-scrollbar', className)} {...props} />
);
SheetContent.displayName = 'SheetContent';

export {
  Sheet,
  SheetClose,
  SheetContainer,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetHeaderIcon,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
