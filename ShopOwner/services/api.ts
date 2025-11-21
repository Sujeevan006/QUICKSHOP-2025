// services/api.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const BASE_URL = 'http://10.207.31.200:5000/api'; // Your current backend IP

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// ✅ 1. Attach token to all requests using request interceptor
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ 2. Response error interceptor
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response) {
      console.log('Backend error:', error.response.data);

      // Optional auto-logout on 401
      if (error.response.status === 401) {
        // You could trigger logout if needed
        console.warn('Unauthorized request. Token invalid or expired.');
        // await AsyncStorage.removeItem('token');
        // await AsyncStorage.removeItem('user');
        // Consider triggering a navigation event to login screen here
      }
    } else {
      console.log('Network error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
