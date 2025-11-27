import { theme } from "@/stores/themeStore";
import { Icon, Switch } from "@eqtylab/equality";
import { useStore } from "@nanostores/react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
  const $theme = useStore(theme);

  return (
    <div className="flex items-center gap-2">
      <Icon icon={<Sun />} aria-label="Light" />
      <Switch
        checked={$theme === "dark"}
        size="sm"
        onCheckedChange={(checked) => theme.set(checked ? "dark" : "light")}
      />
      <Icon icon={<Moon />} aria-label="Dark" />
    </div>
  );
};
