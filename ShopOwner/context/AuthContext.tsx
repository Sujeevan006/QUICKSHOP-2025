// E:\Axivers\NearBuy Project\shop-owner\context\AuthContext.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  shop?: any;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (err) {
        await AsyncStorage.multiRemove(['user', 'token']);
      } finally {
        setLoading(false);
      }
    };
    loadStorage();
  }, []);

  const login = async (jwtToken: string, userData: User) => {
    await AsyncStorage.setItem('token', jwtToken);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
