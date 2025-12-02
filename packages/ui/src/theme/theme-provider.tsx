import { Portal } from './portal';

import './theme.css';

interface ThemeProviderProps {
  customVars?: React.CSSProperties & {
    [key: `--${string}`]: string | number | undefined;
  };
  children: React.ReactNode;
}

const ThemeProvider = ({ customVars, children }: ThemeProviderProps) => {
  return (
    <div className="equality-theme-provider" style={customVars}>
      {children}
      <Portal />
    </div>
  );
};

export { ThemeProvider };
