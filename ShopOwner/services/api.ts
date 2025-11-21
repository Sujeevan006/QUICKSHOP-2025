// E:\Axivers\NearBuy Project\shop-owner\services\api.ts

import axios from 'axios';

export const BASE_URL = 'http://192.168.90.200:5000/api'; // ← your backend IP
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      console.log('Backend error:', error.response.data);
    } else {
      console.log('Network error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
