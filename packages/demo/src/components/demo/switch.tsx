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
    | "red"
    | "lilac"
    | "blue"
    | "green"
    | "yellow";
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
    red: false,
    lilac: false,
    blue: false,
    green: false,
    yellow: false,
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

  if (variant === "red") {
    return (
      <Switch
        color="red"
        checked={switchStates.red}
        onCheckedChange={(checked) =>
          setSwitchStates((prev) => ({ ...prev, red: checked }))
        }
      />
    );
  }

  if (variant === "lilac") {
    return (
      <Switch
        color="lilac"
        checked={switchStates.lilac}
        onCheckedChange={(checked) =>
          setSwitchStates((prev) => ({ ...prev, lilac: checked }))
        }
      />
    );
  }

  if (variant === "blue") {
    return (
      <Switch
        color="blue"
        checked={switchStates.blue}
        onCheckedChange={(checked) =>
          setSwitchStates((prev) => ({ ...prev, blue: checked }))
        }
      />
    );
  }

  if (variant === "green") {
    return (
      <Switch
        color="green"
        checked={switchStates.green}
        onCheckedChange={(checked) =>
          setSwitchStates((prev) => ({ ...prev, green: checked }))
        }
      />
    );
  }

  if (variant === "yellow") {
    return (
      <Switch
        color="yellow"
        checked={switchStates.yellow}
        onCheckedChange={(checked) =>
          setSwitchStates((prev) => ({ ...prev, yellow: checked }))
        }
      />
    );
  }

  return null;
}
