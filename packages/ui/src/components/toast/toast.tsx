import { Icon } from '@/components/icon/icon';
import {
  ToastClose,
  ToastContainer,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/toast/toast-components';
import styles from '@/components/toast/toast.module.css';
import { ToasterToast, useToast } from '@/hooks/use-toast';

interface ToastProps {
  toast: ToasterToast;
}

const Toast = ({ toast }: ToastProps) => {
  const { id, title, description, action, icon, variant, ...props } = toast;

  // Default icons based on variant
  const getDefaultIcon = () => {
    switch (variant) {
      case 'success':
        return 'Check';
      case 'warning':
        return 'AlertOctagon';
      case 'danger':
        return 'AlertTriangle';
      default:
        return 'Info';
    }
  };

  const displayIcon = icon !== undefined ? icon : getDefaultIcon();

  return (
    <ToastContainer {...props} variant={variant}>
      <div className={styles['toast-copy']}>
        {title && (
          <div className={styles['toast-title-container']}>
            {displayIcon && <Icon icon={displayIcon} size="sm" background="transparent" />}
            <ToastTitle>{title}</ToastTitle>
          </div>
        )}
        {description && <ToastDescription>{description}</ToastDescription>}
      </div>
      {action && <div className={styles['toast-action']}>{action}</div>}
      <ToastClose />
    </ToastContainer>
  );
};

const Toaster = () => {
  const { toasts } = useToast();

  return toasts.map(function (toast) {
    return <Toast key={toast.id} toast={toast} />;
  });
};

const ToastRoot = () => {
  return (
    <ToastProvider>
      <Toaster />
      <ToastViewport />
    </ToastProvider>
  );
};

export { Toast, Toaster, ToastRoot };
