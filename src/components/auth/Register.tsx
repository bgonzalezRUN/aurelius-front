import { useForm } from 'react-hook-form';
import type { UserRegister } from '../../types/auth';
import { Input } from '../form';
import { useAuthMutations } from '../../api/queries/authMutations';
import { emailRegex } from '../../types/regex';
import ErrorMessage from '../common/ErrorMessage';
import { BaseButton } from '../common';
import { useEffect } from 'react';

interface UserRegisterProps extends UserRegister {
  confirmPassword: string;
}

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<UserRegisterProps>({ mode: 'onChange' });
  const { register: userRegister } = useAuthMutations();

  const onSubmit = async (data: UserRegisterProps) => {
    const newData = {
      userName: data.userName,
      userLastName: data.userLastName,
      userEmail: data.userEmail,
      userPassword: data.userPassword,
    };
    userRegister.mutate(newData);
  };

  useEffect(() => {
    
  if(userRegister.isSuccess){
    reset()
  }
   
  }, [reset, userRegister.isSuccess])
  
  const passwordValue = watch('userPassword');

  return (
    <>
      <h2 className="text-xl font-semibold text-slate-800">Crear cuenta</h2>
      <p className="text-slate-500 text-sm mb-5">Crea una cuenta de Aurelius</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <Input
          label="Nombre"
          registration={register('userName', {
            required: 'Escribe tu nombre',
          })}
          errorMessage={errors.userName?.message}
          name="userName"
        />
        <Input
          label="Apellido"
          registration={register('userLastName', {
            required: 'Escribe tu nombre',
          })}
          errorMessage={errors.userLastName?.message}
          name="userLastName"
        />
        <Input
          label="Email"
          registration={register('userEmail', {
            required: 'Escribe tu correo electrónico',
            pattern: {
              value: emailRegex,
              message: 'Ingresa un correo válido',
            },
          })}
          errorMessage={errors.userEmail?.message}
          name="userEmail"
          type="email"
        />
        <Input
          label="Contraseña"
          registration={register('userPassword', {
            required: 'Escribe tu contraseña',
          })}
          errorMessage={errors.userPassword?.message}
          name="userPassword"
          type="password"
        />
        <Input
          label="Confirmar contraseña"
          registration={register('confirmPassword', {
            required: 'Escribe tu contraseña',
            validate: value =>
              value === passwordValue || 'Las contraseñas no coinciden',
          })}
          errorMessage={errors.confirmPassword?.message}
          name="confirmPassword"
          type="password"
        />

        <ErrorMessage
          errorMessage={userRegister?.error?.userMessage}
          name="register-form"
        />
        <BaseButton
          label="Registrarme"
          size="md"
          type="submit"
          variant="primaryDark"
          disabled={!isValid}
          isLoading={userRegister.isPending}
        />
      </form>
    </>
  );
}
