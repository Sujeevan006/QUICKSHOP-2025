// contexts/ThemeContext.tsx
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

type Mode = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  error: string;
  icon: string;
};

type ThemeContextType = {
  theme: ThemeColors;
  mode: Mode;
  setColorScheme?: (m: Mode) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: {
    background: '#ffffff',
    surface: '#ffffff',
    text: '#ffffffff',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#004f2d',
    error: '#ef4444',
    icon: '#ffee00ff',
  },
  mode: 'light',
});

const BRAND_PRIMARY = '#004f2d';

const lightTheme = (brand: string): ThemeColors => ({
  background: '#F9FAFB', // gray-50
  surface: '#FFFFFF', // white
  text: '#111827', // gray-900
  textSecondary: '#6B7280', // gray-500
  border: '#E5E7EB', // gray-200
  primary: brand,
  error: '#ef4444',
  icon: '#004f2d',
});

const darkTheme = (brand: string): ThemeColors => ({
  background: '#0B0F12', // near black
  surface: '#151A1E', // dark surface
  text: '#E5E7EB', // gray-200
  textSecondary: '#9CA3AF', // gray-400
  border: '#1F2937', // gray-800
  primary: brand,
  error: '#ef4444',
  icon: '#2c8620ff',
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const system = useColorScheme() as ColorSchemeName;
  const [mode, setMode] = useState<Mode>(system === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    // If you want to follow system automatically, uncomment next line:
    // setMode(system === 'dark' ? 'dark' : 'light');
  }, [system]);

  const theme = useMemo(
    () =>
      mode === 'dark' ? darkTheme(BRAND_PRIMARY) : lightTheme(BRAND_PRIMARY),
    [mode]
  );

  const ctxValue: ThemeContextType = useMemo(
    () => ({
      theme,
      mode,
      setColorScheme: (m: Mode) => setMode(m),
    }),
    [theme, mode]
  );

  return (
    <ThemeContext.Provider value={ctxValue}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
