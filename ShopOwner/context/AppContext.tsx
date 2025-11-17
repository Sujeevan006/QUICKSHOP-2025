// context/AppContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'si' | 'ta';

export interface AppSettings {
  theme: Theme;
  language: Language;
  notifications: boolean;
}

interface AppContextProps {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'en',
  notifications: true,
};

const AppContext = createContext<AppContextProps>({
  settings: defaultSettings,
  updateSettings: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const SETTINGS_KEY = 'shop_owner_app_settings';

  const loadSettings = async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed: AppSettings = JSON.parse(raw);
        setSettings({ ...defaultSettings, ...parsed }); // merge defaults
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  };

  return (
    <AppContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
