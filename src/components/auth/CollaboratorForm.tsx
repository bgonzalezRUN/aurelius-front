import { useForm } from 'react-hook-form';
import type { UserRegister } from '../../types/auth';
import { Input } from '../form';
import { useAuthMutations } from '../../api/queries/authMutations';
import { emailRegex } from '../../types/regex';
import ErrorMessage from '../common/ErrorMessage';
import { BaseButton, OptionButton } from '../common';
import { useEffect } from 'react';
import { trimValue } from '../../utils/string';
import { ArrowLeft } from 'lucide-react';

interface UserRegisterProps extends UserRegister {
  confirmPassword: string;
}

export default function CollaboratorForm({ goBack }: { goBack: () => void }) {
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
    if (userRegister.isSuccess) {
      reset();
    }
  }, [reset, userRegister.isSuccess]);

  const passwordValue = watch('userPassword');

  return (
    <>
      <div className="flex items-center gap-x-2 mb-4 text-primaryDark">
        <OptionButton buttonHandler={() => goBack()} title="Volver">
          <ArrowLeft size={20} />
        </OptionButton>

        <h2 className="text-xl font-bold">Crear cuenta como colaborador</h2>
      </div>

      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-between h-full items-center [&>*:nth-last-child(1)]:mt-auto [&>*:nth-last-child(1)]:w-80">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-x-2 md:gap-y-0 w-full">
          <Input
            label="Nombre"
            registration={register('userName', {
              required: 'Escribe tu nombre',
              setValueAs: trimValue,
            })}
            errorMessage={errors.userName?.message}
            name="userName"
          />
          <Input
            label="Apellido"
            registration={register('userLastName', {
              required: 'Escribe tu apellido',
              setValueAs: trimValue,
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
              setValueAs: trimValue,
              minLength: {
                value: 8,
                message: 'La contraseña debe contener al menos 8 caracteres',
              },
            })}
            errorMessage={errors.userPassword?.message}
            name="userPassword"
            type="password"
          />
          <Input
            label="Confirmar contraseña"
            registration={register('confirmPassword', {
              required: 'Escribe tu contraseña',
              setValueAs: trimValue,
              validate: value =>
                value === passwordValue || 'Las contraseñas no coinciden',
            })}
            errorMessage={errors.confirmPassword?.message}
            name="confirmPassword"
            type="password"
            min={8}
          />
        </div>

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
