// contexts/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// 👇 Update this to your backend base URL!
const API_URL = 'http://192.168.90.200:5000/api/auth';

interface AuthContextType {
  user: any;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: 'CUSTOMER' | 'SHOP_OWNER',
    shopName?: string,
    shopAddress?: string,
    shopCategory?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: any) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  // Restore from storage on app start
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          axios.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${storedToken}`;
        }
      } catch (err) {
        console.error('Auth restore error:', err);
      }
    };
    restoreAuth();
  }, []);

  // -------------------------
  // SIGNUP
  // -------------------------
  const signup = async (
    name: string,
    email: string,
    password: string,
    role: 'CUSTOMER' | 'SHOP_OWNER',
    shopName?: string,
    shopAddress?: string,
    shopCategory?: string
  ) => {
    try {
      const res = await axios.post(`${API_URL}/signup`, {
        name,
        email,
        password,
        role,
        shop_name: shopName || null,
        shop_address: shopAddress || null,
        shop_category: shopCategory || null,
      });

      setToken(res.data.token);
      setUser(res.data.user);

      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));

      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${res.data.token}`;
    } catch (err: any) {
      console.error('Signup error:', err.response?.data || err.message);
      throw err;
    }
  };

  // -------------------------
  // LOGIN
  // -------------------------
  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });

      setToken(res.data.token);
      setUser(res.data.user);

      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));

      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${res.data.token}`;
    } catch (err: any) {
      console.error('Login error:', err.response?.data || err.message);
      throw err;
    }
  };

  // -------------------------
  // LOGOUT
  // -------------------------
  const logout = async () => {
    try {
      setToken(null);
      setUser(null);

      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');

      delete axios.defaults.headers.common['Authorization'];
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, signup, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
