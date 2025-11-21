import axios from 'axios';

export const BASE_URL = 'http://192.168.90.200:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export default api;
