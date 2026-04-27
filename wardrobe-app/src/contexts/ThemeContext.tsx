import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: 'light', toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('wardrobe-theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('wardrobe-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.style.background = theme === 'dark' ? '#0f0f0f' : '#ffffff';
    document.body.style.color = theme === 'dark' ? '#f3f4f6' : '#111827';
  }, [theme]);

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
