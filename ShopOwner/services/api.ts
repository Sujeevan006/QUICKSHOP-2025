import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';

// IMPORTANT: Update this IP address to match your backend server
// For Android Emulator: use 10.0.2.2 instead of localhost
// For Physical Device: use your computer's local IP (e.g., 192.168.x.x)
export const BASE_URL = 'http://10.207.31.200:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response) {
      // Server responded with error
      console.error(
        'Backend error:',
        error.response.status,
        error.response.data
      );

      // Handle 401 Unauthorized (Token expired or invalid)
      if (error.response.status === 401) {
        try {
          await AsyncStorage.multiRemove(['token', 'user']);
          // Use router.replace to reset navigation stack to login
          router.replace('/auth/login');
        } catch (storageError) {
          console.error('Error clearing storage:', storageError);
        }
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error - No response from server');
      console.error('Check if backend is running at:', BASE_URL);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
