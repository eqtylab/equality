import { Loader2 } from 'lucide-react';

import styles from '@/components/loading-overlay/loading-overlay.module.css';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message = 'Loading...' }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={styles['loading-overlay']}>
      <div className={styles['content']}>
        <Loader2 className={styles['icon']} />
        <p className={styles['message']}>{message}</p>
      </div>
    </div>
  );
}
