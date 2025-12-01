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
  thumbIcon?: React.ReactElement | string;
  thumbIconChecked?: React.ReactElement | string;
}

export function SwitchDemo({
  variant = "default-off",
  thumbIcon,
  thumbIconChecked,
}: SwitchDemoProps) {
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
    return (
      <Switch
        thumbIcon={
          switchStates.default ? thumbIconChecked || thumbIcon : thumbIcon
        }
        checked={switchStates.defaultUnchecked}
      />
    );
  }

  if (variant === "default-on") {
    return (
      <Switch
        thumbIcon={
          switchStates.default ? thumbIconChecked || thumbIcon : thumbIcon
        }
        checked={switchStates.defaultChecked}
      />
    );
  }

  if (variant === "small") {
    return (
      <Switch
        size="sm"
        thumbIcon={
          switchStates.default ? thumbIconChecked || thumbIcon : thumbIcon
        }
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
        thumbIcon={
          switchStates.default ? thumbIconChecked || thumbIcon : thumbIcon
        }
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
        thumbIcon={
          switchStates.default ? thumbIconChecked || thumbIcon : thumbIcon
        }
        checked={switchStates.large}
        onCheckedChange={(checked) =>
          setSwitchStates((prev) => ({ ...prev, large: checked }))
        }
      />
    );
  }

  if (variant === "disabled-off") {
    return (
      <Switch
        thumbIcon={
          switchStates.default ? thumbIconChecked || thumbIcon : thumbIcon
        }
        checked={switchStates.disabledUnchecked}
        disabled
      />
    );
  }

  if (variant === "disabled-on") {
    return (
      <Switch
        thumbIcon={
          switchStates.default ? thumbIconChecked || thumbIcon : thumbIcon
        }
        checked={switchStates.disabledChecked}
        disabled
      />
    );
  }

  if (variant === "default") {
    return (
      <Switch
        thumbIcon={
          switchStates.default ? thumbIconChecked || thumbIcon : thumbIcon
        }
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
        thumbIcon={
          switchStates.default ? thumbIconChecked || thumbIcon : thumbIcon
        }
        checked={switchStates.danger}
        onCheckedChange={(checked) =>
          setSwitchStates((prev) => ({ ...prev, danger: checked }))
        }
      />
    );
  }

  return null;
}
