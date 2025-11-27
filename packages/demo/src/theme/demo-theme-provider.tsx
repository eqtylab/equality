import { theme } from "@/stores/themeStore";
import { ThemeProvider } from "@eqtylab/equality";
import { useStore } from "@nanostores/react";

export const DemoThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const $theme = useStore(theme);

  return <ThemeProvider theme={$theme}>{children}</ThemeProvider>;
};
