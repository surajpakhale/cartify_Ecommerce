import axios from 'axios';

console.log('BUILD TIME API URL:', import.meta.env.VITE_API_URL); 

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Ye change kiya
  withCredentials: true,
  headers: {
    Accept: 'application/json'
  }
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData && config.headers) {
    delete config.headers['Content-Type'];
  }
  return config;
});

export const normalizeArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload!== 'object') return [];
  const keys = ['products', 'orders', 'users', 'data'];
  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
};

export default api;