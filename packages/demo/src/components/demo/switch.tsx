import { useState } from "react";
import { Switch } from "@eqtylab/equality";

interface SwitchDemoProps {
  variant:
    | "default-off"
    | "default-on"
    | "small"
    | "medium"
    | "large"
    | "disabled-off"
    | "disabled-on"
    | "default"
    | "danger";
}

export function SwitchDemo({ variant = "default-off" }: SwitchDemoProps) {
  const [switchStates, setSwitchStates] = useState({
    defaultUnchecked: false,
    defaultChecked: true,
    small: false,
    medium: false,
    large: false,
    disabledUnchecked: false,
    disabledChecked: true,
    default: false,
    danger: false,
  });

  if (variant === "default-off") {
    return <Switch checked={switchStates.defaultUnchecked} />;
  }

  if (variant === "default-on") {
    return <Switch checked={switchStates.defaultChecked} />;
  }

  if (variant === "small") {
    return (
      <Switch
        size="sm"
        checked={switchStates.small}
        onCheckedChange={(checked) =>
          setSwitchStates((prev) => ({ ...prev, small: checked }))
        }
      />
    );
  }

  if (variant === "medium") {
    return (
      <Switch
        size="md"
        checked={switchStates.medium}
        onCheckedChange={(checked) =>
          setSwitchStates((prev) => ({ ...prev, medium: checked }))
        }
      />
    );
  }

  if (variant === "large") {
    return (
      <Switch
        size="lg"
        checked={switchStates.large}
        onCheckedChange={(checked) =>
          setSwitchStates((prev) => ({ ...prev, large: checked }))
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

  if (variant === "default") {
    return (
      <Switch
        checked={switchStates.default}
        onCheckedChange={(checked) =>
          setSwitchStates((prev) => ({ ...prev, default: checked }))
        }
      />
    );
  }

  if (variant === "danger") {
    return (
      <Switch
        variant="danger"
        checked={switchStates.danger}
        onCheckedChange={(checked) =>
          setSwitchStates((prev) => ({ ...prev, danger: checked }))
        }
      />
    );
  }

  return null;
}
