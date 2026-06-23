import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const KEY = 'emprendeflow-theme';

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem(KEY);
    // Solo acepta 'dark' o 'light'; cualquier otro valor → dark por defecto
    const dark = stored === 'light' ? false : true;
    // Aplicar inmediatamente al DOM antes del primer render
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    return dark;
  });

  useEffect(() => {
    // Sincroniza DOM y localStorage cada vez que cambia el estado
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
