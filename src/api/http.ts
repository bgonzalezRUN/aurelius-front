import axios from 'axios';
import { useAuthStore } from '../store/auth';
const API_BASE = 'http://localhost:3000/';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${useAuthStore.getState().token}`,
  },
});

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const status = error.response ? error.response.status : null;
    if (status === 401 || status === 403) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
