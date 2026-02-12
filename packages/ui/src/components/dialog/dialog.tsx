import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import styles from '@/components/dialog/dialog.module.css';
import { IconButton } from '@/components/icon-button/icon-button';
import { cn, getThemeProviderRoot } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = ({ children }: { children: React.ReactNode }) => (
  <DialogPrimitive.Portal container={getThemeProviderRoot()}>{children}</DialogPrimitive.Portal>
);

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(styles['dialog-overlay'], className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

type DialogContainerProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  size?: 'sm' | 'md' | 'lg';
};

const DialogContainer = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContainerProps
>(({ className, children, size = 'md', ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(styles['dialog-content'], styles[`dialog-content--size-${size}`], className)}
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        document.body.style.pointerEvents = '';
      }}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContainer.displayName = DialogPrimitive.Content.displayName;

const DialogHeaderIcon = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(styles['dialog-header-icon'], className)} {...props} />
);
DialogHeaderIcon.displayName = 'DialogHeaderIcon';

const DialogHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const childrenArray = React.Children.toArray(children);
  const icon = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === DialogHeaderIcon
  );
  const otherChildren = childrenArray.filter(
    (child) => !(React.isValidElement(child) && child.type === DialogHeaderIcon)
  );

  return (
    <div className={cn(styles['dialog-header'], className)} {...props}>
      {icon}
      <div className={styles['dialog-header-content']}>{otherChildren}</div>
      <DialogPrimitive.Close asChild>
        <IconButton name="X" label="Close" size="sm" />
      </DialogPrimitive.Close>
    </div>
  );
};
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(styles['dialog-footer'], className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn(styles['dialog-title'], className)} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(styles['dialog-description'], className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(styles['dialog-body'], 'styled-vertical-scrollbar', className)} {...props} />
);
DialogContent.displayName = 'DialogContent';

export {
  Dialog,
  DialogClose,
  DialogContainer,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogHeaderIcon,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
