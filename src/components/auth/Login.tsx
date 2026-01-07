import { useForm } from 'react-hook-form';
import type { Auth } from '../../types/auth';
import { useAuthMutations } from '../../api/queries/authMutations';
import { Input } from '../form';
import { emailRegex } from '../../types/regex';
import ErrorMessage from '../common/ErrorMessage';
import { BaseButton } from '../common';
import { paths } from '../../paths';

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Auth>({ mode: 'onChange' });
  const { login } = useAuthMutations();

  const onSubmit = async (data: Auth) => {
    login.mutate(data);
  };
  return (
    <>
      <h2 className="text-xl font-semibold text-slate-800">Iniciar Sesión</h2>
      <p className="text-slate-500 text-sm mb-5">
        Accede a tu cuenta de Aurelius
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col [&>*:nth-last-child(1)]:w-80 items-center justify-between h-full"
      >
        <div className="w-full">
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
              required: 'Escribe una contraseña',
            })}
            errorMessage={errors.userPassword?.message}
            name="userPassword"
            type="password"
          />
        </div>

        <ErrorMessage
          errorMessage={login?.error?.userMessage}
          name="login-form"
        />
        <BaseButton
          label="Iniciar sesión"
          size="md"
          type="submit"
          variant="primaryDark"
          disabled={!isValid}
          isLoading={login.isPending}
        />
      </form>

      {/* enlaces auxiliares */}
      <div className="mt-4 text-center text-sm text-slate-500">
        <a
          href={paths.RECOVER_PASSWORD}
          className="hover:text-blue-600 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </>
  );
}
