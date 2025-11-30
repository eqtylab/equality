import { Portal } from './portal';

interface ThemeProviderProps {
  theme?: 'light' | 'dark';
  customVars?: React.CSSProperties & {
    [key: `--${string}`]: string | number | undefined;
  };
  children: React.ReactNode;
}

const ThemeProvider = ({ theme = 'dark', customVars, children }: ThemeProviderProps) => {
  return (
    <div data-equality-theme={theme} style={customVars}>
      {children}
      <Portal />
    </div>
  );
};

export { ThemeProvider };
