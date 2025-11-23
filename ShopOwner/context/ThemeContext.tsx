import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ColorValue, useColorScheme } from 'react-native';

export const themes = {
  light: {
    theme: 'light',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#212529',
    textSecondary: '#6C757D',
    border: '#E9ECEF',
    primary: '#0A84FF',
  },
  dark: {
    theme: 'dark',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#EFEFEF',
    textSecondary: '#A9A9A9',
    border: '#2F2F2F',
    primary: '#0A84FF',
  },
};

// Define the shape of the context value
interface ThemeContextType {
  theme: string;
  surface: ColorValue | undefined;
  border: ColorValue | undefined;
  text: ColorValue | undefined;
  textSecondary: ColorValue | undefined;
  background: ColorValue | undefined;
  primary: ColorValue | undefined;
  colors: typeof themes.light; // This will hold the color object
  themeName: 'light' | 'dark'; // This will hold the name of the theme
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  isThemeLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = useColorScheme() || 'light';
  const [themeName, setThemeName] = useState<'light' | 'dark'>(systemTheme);
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('app-theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeName(savedTheme);
        } else {
          setThemeName(systemTheme);
        }
      } catch (error) {
        console.error('Failed to load theme from storage', error);
        setThemeName(systemTheme);
      } finally {
        setIsThemeLoading(false);
      }
    };
    loadTheme();
  }, [systemTheme]);

  const toggleTheme = async () => {
    const newThemeName = themeName === 'light' ? 'dark' : 'light';
    setThemeName(newThemeName);
    await AsyncStorage.setItem('app-theme', newThemeName);
  };

  const setTheme = async (newTheme: 'light' | 'dark') => {
    setThemeName(newTheme);
    await AsyncStorage.setItem('app-theme', newTheme);
  };

  const colors = themes[themeName];

  if (isThemeLoading) {
    return null; // Or a loading screen
  }

  return (
    <ThemeContext.Provider
      value={{
        colors,
        theme: colors.theme,
        themeName,
        toggleTheme,
        setTheme,
        isThemeLoading,
        surface: colors.surface,
        border: colors.border,
        text: colors.text,
        textSecondary: colors.textSecondary,
        background: colors.background,
        primary: colors.primary,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
