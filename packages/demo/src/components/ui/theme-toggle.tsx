import { Switch, useTheme } from "@eqtylab/equality";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
  const [theme, setTheme] = useTheme();
  const displayToggle = !!theme; // Only display the toggle once the theme has initialised, to avoid rendering incorrect state initially

  return (
    <div className="flex items-center gap-2">
      {displayToggle && (
        <Switch
          checked={theme === "dark"}
          size="sm"
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          thumbIcon={theme === "dark" ? <Moon /> : <Sun />}
        />
      )}
    </div>
  );
};
