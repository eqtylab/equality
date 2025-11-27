import { theme } from "@/stores/themeStore";
import { Switch } from "@eqtylab/equality";
import { useStore } from "@nanostores/react";

export const ThemeToggle = () => {
  const $theme = useStore(theme);

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={$theme === "dark"}
        size="sm"
        onCheckedChange={(checked) => theme.set(checked ? "dark" : "light")}
      />
      Theme
    </div>
  );
};
