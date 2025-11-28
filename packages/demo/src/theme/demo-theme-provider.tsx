import { usePersistentStore } from "@demo/hooks/use-persistent-store";
import { getInitialTheme } from "@demo/lib/utils";
import { $theme } from "@demo/stores/theme-store";
import { ThemeProvider } from "@eqtylab/equality";
import { useEffect } from "react";

export const DemoThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const initialTheme = getInitialTheme();
  const theme = usePersistentStore($theme, initialTheme);

  // TODO - @kate-gladeye - Figure out a better way to do this

  useEffect(() => {
    const themeProviderRootElement = document.querySelector(
      "[data-equality-theme]",
    );
    if (themeProviderRootElement) {
      themeProviderRootElement.setAttribute("data-equality-theme", theme);
      document.documentElement.style.colorScheme = theme;
    }
  }, [theme]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
