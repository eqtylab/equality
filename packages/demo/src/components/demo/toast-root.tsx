import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  useToast,
} from "@eqtylab/equality";

function Toaster() {
  const { toasts } = useToast();

  return (
    <>
      {toasts.map(function (toast) {
        const { id, title, description, action, ...props } = toast;
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title != null && <ToastTitle>{title as any}</ToastTitle>}
              {description != null && (
                <ToastDescription>{description as any}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
    </>
  );
}

export const ToastRootDemo = () => {
  return (
    <ToastProvider>
      <Toaster />
      <ToastViewport />
    </ToastProvider>
  );
};
