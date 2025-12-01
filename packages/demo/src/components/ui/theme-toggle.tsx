import { usePersistentStore } from "@demo/hooks/use-persistent-store";
import { $theme } from "@demo/stores/theme-store";
import { Switch } from "@eqtylab/equality";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
  const theme = usePersistentStore($theme);
  const displayToggle = !!theme; // Only display the toggle once the theme has initialised, to avoid rendering incorrect state initially

  return displayToggle ? (
    <div className="flex items-center gap-2">
      <Switch
        checked={theme === "dark"}
        size="sm"
        onCheckedChange={(checked) => $theme.set(checked ? "dark" : "light")}
        thumbIcon={theme === "dark" ? <Moon /> : <Sun />}
      />
    </div>
  ) : null;
};
