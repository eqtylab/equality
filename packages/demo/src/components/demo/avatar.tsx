import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  ELEVATION,
  type Elevation,
} from "@eqtylab/equality";

export const AvatarDemo = ({
  variant = "default",
  size,
  shape,
  elevation = ELEVATION.RAISED,
}: {
  variant?: "default" | "fallback";
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  elevation?: Elevation;
}) => {
  return (
    <Avatar size={size} shape={shape}>
      <AvatarImage
        src={
          variant === "default"
            ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            : undefined
        }
      />
      <AvatarFallback elevation={elevation}>RG</AvatarFallback>
    </Avatar>
  );
};
