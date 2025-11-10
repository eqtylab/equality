import { BgGradient } from "@eqtylab/equality";

export const BgGradientDemo = ({
  variant = "lilac",
}: {
  variant?: "gold" | "blue" | "lilac";
}) => {
  return (
    <div className="relative h-150 w-full *:size-full">
      <BgGradient theme={variant} />
    </div>
  );
};
