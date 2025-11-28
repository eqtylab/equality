import { getInitialTheme } from "@demo/lib/utils";
import { persistentAtom } from "@nanostores/persistent";

type Theme = "light" | "dark";
const DEFAULT_THEME = "dark";

export const $theme = persistentAtom<Theme>(
  "theme",
  (getInitialTheme() as Theme | undefined) ?? DEFAULT_THEME,
);
