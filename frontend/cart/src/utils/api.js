

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
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
  if (!payload || typeof payload !== 'object') return [];
  const keys = ['products', 'orders', 'users', 'data'];
  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
};

export default api;

// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:4000/api'
//   // Yaha se 'Content-Type' hata de bilkul
// });

// // Token interceptor se add kar
// api.interceptors.request.use((config) => {
//   const user = JSON.parse(localStorage.getItem('user'));
//   if (user?.token) {
//     config.headers.Authorization = `Bearer ${user.token}`;
//   }
//   // FormData ke liye Content-Type mat set kar, axios khud karega
//   return config;
// });

// export default api;