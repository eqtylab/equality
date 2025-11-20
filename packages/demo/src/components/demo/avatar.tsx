import { Avatar, AvatarImage, AvatarFallback } from "@eqtylab/equality";

export const AvatarDemo = ({
  variant = "default",
  size,
}: {
  variant?: "default" | "fallback";
  size?: "sm" | "md" | "lg";
}) => {
  return (
    <Avatar size={size}>
      <AvatarImage
        src={
          variant === "default"
            ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            : undefined
        }
      />
      <AvatarFallback>RG</AvatarFallback>
    </Avatar>
  );
};
