import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../paths';
import { login as loginService, register as registerService } from '../services/authService';
import type { Auth, LoginResponse, UserRegister } from '../../types/auth';
import type { ApiError } from '../http';
import { usePopupStore } from '../../store/popup';

export function useAuthMutations() {
  const { login: loginStatus } = useAuthStore();
  const navigate = useNavigate();
  const { openPopup: openPopupValidate } = usePopupStore();

  const login = useMutation<LoginResponse, ApiError, Auth>({
    mutationFn: loginService,
    onSuccess: data => {
      loginStatus(data.token);
      navigate(paths.REQUISITIONS);
    },
  });

  const register = useMutation<void, ApiError, UserRegister>({
    mutationFn: registerService,
    onSuccess: () => {
      openPopupValidate({
        title: 'Usuario creado',
        message:
          'Su usuario se ha creado correctamente, te invitamos a iniciar sesión.',
        confirmButtonText: 'Ir a iniciar sesión',
        onConfirm: ()=>{navigate(paths.LOGIN)}
      });
      
    },
  });

  return {
    login,
    register
  };
}
