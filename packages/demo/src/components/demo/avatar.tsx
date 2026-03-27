import { Avatar, AvatarFallback, AvatarImage } from "@eqtylab/equality";
import avatarSrc from "@demo/assets/avatar.avif";

const IMAGE_SRC = avatarSrc.src;

export const AvatarDemo = ({
  variant = "default",
  size,
  shape,
}: {
  variant?: "default" | "fallback";
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
}) => {
  return (
    <Avatar size={size} shape={shape}>
      <AvatarImage
        src={variant === "default" ? IMAGE_SRC : undefined}
        alt="User avatar"
      />
      <AvatarFallback>RG</AvatarFallback>
    </Avatar>
  );
};

export const AvatarSizesDemo = ({
  variant = "fallback",
  shape,
}: {
  variant?: "default" | "fallback";
  shape?: "circle" | "square";
}) => {
  const sizes = ["sm", "md", "lg", "xl"] as const;
  const labels = { sm: "SM", md: "MD", lg: "LG", xl: "XL" };
  return (
    <div className="flex items-end gap-4">
      {sizes.map((s) => (
        <Avatar key={s} size={s} shape={shape}>
          <AvatarImage
            src={variant === "default" ? IMAGE_SRC : undefined}
            alt="User avatar"
          />
          <AvatarFallback>{labels[s]}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
};

export const AvatarShapeDemo = ({
  variant = "fallback",
  shape,
}: {
  variant?: "default" | "fallback";
  shape: "circle" | "square";
}) => {
  return (
    <div className="flex items-center gap-4">
      <Avatar shape={shape}>
        <AvatarFallback>RG</AvatarFallback>
      </Avatar>
      <Avatar shape={shape}>
        <AvatarImage src={IMAGE_SRC} alt="User avatar" />
        <AvatarFallback>RG</AvatarFallback>
      </Avatar>
    </div>
  );
};
