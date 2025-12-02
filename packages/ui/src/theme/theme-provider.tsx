import { Portal } from './portal';
import styles from './theme.module.css';

console.log('styles', styles);

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
      <Portal />
    </div>
  );
};

export { ThemeProvider };
