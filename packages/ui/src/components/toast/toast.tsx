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
  const { id, title, description, action, ...props } = toast;

  return (
    <ToastContainer {...props}>
      <div className={styles['toast-copy']}>
        {title && <ToastTitle>{title}</ToastTitle>}
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
