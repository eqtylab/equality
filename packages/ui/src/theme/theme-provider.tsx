import styles from './theme.module.css';

interface ThemeProviderProps {
  customVars?: React.CSSProperties & {
    [key: `--${string}`]: string | number | undefined;
  };
  children: React.ReactNode;
}

const ThemeProvider = ({ customVars, children }: ThemeProviderProps) => {
  return (
    <div className={styles.root} style={customVars}>
      {children}
      <div id="equality-theme-provider-root-portal" />
    </div>
  );
};

export { ThemeProvider };
