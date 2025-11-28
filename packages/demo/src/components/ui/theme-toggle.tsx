import { usePersistentStore } from "@demo/hooks/use-persistent-store";
import { $theme } from "@demo/stores/theme-store";
import { Icon, Switch } from "@eqtylab/equality";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
  const theme = usePersistentStore($theme);

  return (
    <div className="flex items-center gap-2">
      <Icon icon={<Sun />} aria-label="Light" />
      <Switch
        checked={theme === "dark"}
        size="sm"
        onCheckedChange={(checked) => $theme.set(checked ? "dark" : "light")}
      />
      <Icon icon={<Moon />} aria-label="Dark" />
    </div>
  );
};
