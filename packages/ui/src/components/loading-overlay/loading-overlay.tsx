import styles from '@/components/loading-overlay/loading-overlay.module.css';
import { Spinner } from '@/components/spinner/spinner';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

function LoadingOverlay({ isVisible, message = 'Loading...' }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={styles['loading-overlay']}>
      <div className={styles['content']}>
        <Spinner color="primary" />
        <p className={styles['message']}>{message}</p>
      </div>
    </div>
  );
}

export { LoadingOverlay };
