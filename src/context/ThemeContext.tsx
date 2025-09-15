import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';

interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textLight: string;
  white: string;
  border: string;
  shadow: string;
}

const dayTheme: Theme = {
  primary: '#00515f',
  secondary: '#368a95',
  accent: '#e74c3c',
  background: '#eaf6fb',
  text: '#2c3e50',
  textLight: '#7f8c8d',
  white: '#ffffff',
  border: '#e0e0e0',
  shadow: '#000000',
};

const nightTheme: Theme = {
  primary: '#18181c',
  secondary: '#222f3e',
  accent: '#f7e8a4',
  background: '#18181c',
  text: '#eaf6fb',
  textLight: '#8395a7',
  white: '#222f3e',
  border: '#222f3e',
  shadow: '#000000',
};

interface ThemeContextType {
  theme: Theme;
  mode: 'auto' | 'day' | 'night';
  setMode: (mode: 'auto' | 'day' | 'night') => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: dayTheme,
  mode: 'auto',
  setMode: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'auto' | 'day' | 'night'>('auto');
  const [theme, setTheme] = useState<Theme>(dayTheme);

  useEffect(() => {
    const updateTheme = () => {
      if (mode === 'auto') {
        const colorScheme = Appearance.getColorScheme();
        setTheme(colorScheme === 'dark' ? nightTheme : dayTheme);
      } else if (mode === 'night') {
        setTheme(nightTheme);
      } else {
        setTheme(dayTheme);
      }
    };
    updateTheme();
    let subscription: any;
    if (mode === 'auto') {
      subscription = Appearance.addChangeListener(updateTheme);
    }
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
