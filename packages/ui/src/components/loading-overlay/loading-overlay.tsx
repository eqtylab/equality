import * as React from 'react';
import { Loader2 } from 'lucide-react';

import styles from '@/components/loading-overlay/loading-overlay.module.css';

const Loader2Icon = Loader2 as React.ComponentType<{ className?: string }>;

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

function LoadingOverlay({ isVisible, message = 'Loading...' }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={styles['loading-overlay']}>
      <div className={styles['content']}>
        <Loader2Icon className={styles['icon']} />
        <p className={styles['message']}>{message}</p>
      </div>
    </div>
  );
}

export { LoadingOverlay };
