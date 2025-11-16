import { BgGradient } from "@eqtylab/equality";

import tokens from "../../../../tokens/equality-tokens.json";

export const BgGradientDemo = ({
  variant = "primary",
}: {
  variant?: keyof typeof tokens.Light.color.brand;
}) => {
  return (
    <div className="relative h-150 w-full *:size-full">
      <BgGradient theme={variant} />
    </div>
  );
};
