import { getInitialTheme } from "@demo/lib/utils";
import { persistentAtom } from "@nanostores/persistent";

type Theme = "light" | "dark";
const DEFAULT_THEME = "dark";

export const $theme = persistentAtom<Theme>(
  "theme",
  (getInitialTheme() as Theme | undefined) ?? DEFAULT_THEME,
);

// Update data-equality-theme attribute on the root element
$theme.listen((value) => {
  const themeProviderRootElement = document.querySelector(
    "[data-equality-theme]",
  );
  if (themeProviderRootElement) {
    themeProviderRootElement.setAttribute("data-equality-theme", value);
    document.documentElement.style.colorScheme = value;
  }
});
