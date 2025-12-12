import type { Auth, LoginResponse, UserRegister } from '../../types/auth';
import api from '../http';

export const login = async (data: Auth): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const register = (data: UserRegister): Promise<void> => {
  return api.post('/user', data);
};
