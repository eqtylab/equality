import { Button, useToast, ToastAction } from "@eqtylab/equality";

export const ToastDemo = ({
  variant = "default",
}: {
  variant?:
    | "default"
    | "danger"
    | "warning"
    | "success"
    | "with-title"
    | "with-action";
}) => {
  const { toast } = useToast();

  if (variant === "default") {
    return (
      <Button
        size="sm"
        onClick={() => {
          toast({
            variant: "default",
            description: "This is a default toast notification.",
          });
        }}
      >
        Show Default Toast
      </Button>
    );
  }

  if (variant === "danger") {
    return (
      <Button
        size="sm"
        onClick={() => {
          toast({
            variant: "danger",
            title: "Error",
            description: "Something went wrong. Please try again.",
          });
        }}
      >
        Show danger Toast
      </Button>
    );
  }

  if (variant === "warning") {
    return (
      <Button
        size="sm"
        onClick={() => {
          toast({
            variant: "warning",
            title: "Warning",
            description: "Please review your changes before proceeding.",
          });
        }}
      >
        Show Warning Toast
      </Button>
    );
  }

  if (variant === "success") {
    return (
      <Button
        size="sm"
        onClick={() => {
          toast({
            variant: "success",
            title: "Success",
            description: "Your changes have been saved successfully.",
          });
        }}
      >
        Show Success Toast
      </Button>
    );
  }

  if (variant === "with-title") {
    return (
      <Button
        size="sm"
        onClick={() => {
          toast({
            variant: "default",
            title: "Notification",
            description: "This toast includes both a title and description.",
          });
        }}
      >
        Show Toast with Title
      </Button>
    );
  }

  if (variant === "with-action") {
    return (
      <Button
        size="sm"
        onClick={() => {
          toast({
            variant: "default",
            title: "Action Required",
            description: "This toast includes an action button.",
            action: <ToastAction altText="Undo">Undo</ToastAction>,
          });
        }}
      >
        Show Toast with Action
      </Button>
    );
  }

  return null;
};
