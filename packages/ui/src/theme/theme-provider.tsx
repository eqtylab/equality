import styles from './theme.module.css';

interface ThemeProviderProps {
  theme?: 'light' | 'dark';
  customVars?: React.CSSProperties;
  children: React.ReactNode;
}

const ThemeProvider = ({ theme = 'dark', customVars, children }: ThemeProviderProps) => {
  return (
    <div data-eqty-theme={theme} className={styles.root} style={customVars as React.CSSProperties}>
      {children}
    </div>
  );
};

export { ThemeProvider };
