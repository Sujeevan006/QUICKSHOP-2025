import axios from 'axios';

export const SERVER_URL = 'http://10.207.31.200:5000';
export const BASE_URL = `${SERVER_URL}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export default api;
