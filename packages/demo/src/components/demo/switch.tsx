import { useState } from "react";
import { Switch } from "@eqtylab/equality";

interface SwitchDemoProps {
  variant:
    | "default-off"
    | "default-on"
    | "small"
    | "disabled-off"
    | "disabled-on";
}

export function SwitchDemo({ variant = "default-off" }: SwitchDemoProps) {
  const [switchStates, setSwitchStates] = useState({
    default: false,
    defaultChecked: true,
    small: false,
    smallChecked: true,
    disabledUnchecked: false,
    disabledChecked: true,
  });

  if (variant === "default-off") {
    return (
      <Switch
        checked={switchStates.default}
        onCheckedChange={(checked) =>
          setSwitchStates((prev) => ({ ...prev, default: checked }))
        }
      />
    );
  }

  if (variant === "default-on") {
    return (
      <Switch
        checked={switchStates.defaultChecked}
        onCheckedChange={(checked) =>
          setSwitchStates((prev) => ({ ...prev, defaultChecked: checked }))
        }
      />
    );
  }

  if (variant === "small") {
    return (
      <Switch
        variant="small"
        checked={switchStates.small}
        onCheckedChange={(checked) =>
          setSwitchStates((prev) => ({ ...prev, small: checked }))
        }
      />
    );
  }

  if (variant === "disabled-off") {
    return <Switch checked={switchStates.disabledUnchecked} disabled />;
  }

  if (variant === "disabled-on") {
    return <Switch checked={switchStates.disabledChecked} disabled />;
  }

  return null;
}
