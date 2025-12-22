import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/auth';
import { DEFAULT_ERROR_MESSAGE, ERROR_MESSAGES } from '../types/errorMessages';
// import { useParams } from 'react-router-dom';
const API_BASE = 'http://localhost:3000/';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().getToken();
  // const { costCenterId } = useParams();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // if (costCenterId) {
  //   config.headers['x-cost-center-id'] = costCenterId;
  // }
  return config;
});

export type ApiError = AxiosError & {
  userMessage?: string;
};

api.interceptors.response.use(
  response => response,
  async error => {
    if (error?.response?.data?.message === 'Token not found') {
      useAuthStore.getState().logout();
    }
    const userMessage =
      ERROR_MESSAGES[error?.response?.data?.message] || DEFAULT_ERROR_MESSAGE;

    return Promise.reject({
      ...error,
      userMessage,
    } as ApiError);
  }
);

export default api;
