import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth';
import { useNavigate } from 'react-router-dom';
import { paths, pathsBase } from '../../paths';
import {
  login as loginService,
  register as registerService,
} from '../services/authService';
import type { Auth, LoginResponse, UserRegister } from '../../types/auth';
import type { ApiError } from '../http';
import { usePopupStore } from '../../store/popup';
import { jwtDecode } from 'jwt-decode';
import type { User } from '../../types/user';

export function useAuthMutations() {
  const { login: loginStatus } = useAuthStore();
  const navigate = useNavigate();
  const { openPopup: openPopupValidate } = usePopupStore();

  const login = useMutation<LoginResponse, ApiError, Auth>({
    mutationFn: loginService,
    onSuccess: data => {
      loginStatus(data.token);
      const { userType, role } = jwtDecode(data.token) as User;         
      if (userType === 'ADMIN' && role in pathsBase) {
        const path = pathsBase[role as keyof typeof pathsBase]
        navigate(path);
      } else {
        navigate(paths.BASE);
      }
    },
  });

  const register = useMutation<void, ApiError, UserRegister>({
    mutationFn: registerService,
    onSuccess: () => {
      openPopupValidate({
        title: 'Usuario creado',
        message:
          'Su usuario se ha creado correctamente, te enviaremos un correo cuando se te sea asignado a un centro de costos',
        confirmButtonText: 'Entendido',
      });
    },
  });

  return {
    login,
    register,
  };
}
