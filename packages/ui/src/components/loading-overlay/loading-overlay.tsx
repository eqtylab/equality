import * as DialogPrimitive from '@radix-ui/react-dialog';

import styles from '@/components/loading-overlay/loading-overlay.module.css';
import { Spinner } from '@/components/spinner/spinner';
import { getThemeProviderRoot } from '@/lib/utils';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

function LoadingOverlay({ isVisible, message = 'Loading...' }: LoadingOverlayProps) {
  // Built on a modal Radix Dialog so the overlay traps focus, makes the
  // background inert to keyboard and screen reader users while loading, locks
  // scroll, and restores focus once it hides. Visibility is driven by `isVisible`
  return (
    <DialogPrimitive.Root open={isVisible}>
      <DialogPrimitive.Portal container={getThemeProviderRoot()}>
        <DialogPrimitive.Overlay className={styles['loading-overlay']}>
          <DialogPrimitive.Content
            onEscapeKeyDown={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            aria-describedby={undefined}
          >
            <div aria-hidden="true" className={styles['content']}>
              <Spinner variant="primary" />
              <DialogPrimitive.Title asChild>
                <p className={styles['message']}>{message}</p>
              </DialogPrimitive.Title>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export { LoadingOverlay };
