import { BgGradient } from "@eqtylab/equality";

import tokens from "../../../../tokens/equality-tokens.json";

export const BgGradientDemo = ({
  variant = "primary",
  placement = "full",
}: {
  variant?: keyof typeof tokens.Light.color.brand;
  placement?: "full" | "top";
}) => {
  return (
    <div className="relative h-150 w-full *:size-full">
      <BgGradient theme={variant} placement={placement} />
    </div>
  );
};
