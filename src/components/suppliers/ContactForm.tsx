import { useFormContext } from 'react-hook-form';
import { Input } from '../form';
import { emailRegex, onlyNumberRegex } from '../../types/regex';
import type { SupplierDTOProps } from '../auth/SupplierForm';

export function ContactForm({
  isDisabled,
  hiddenInput,
}: {
  isDisabled?: boolean;
  hiddenInput?: boolean;
}) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<SupplierDTOProps>();

  const { supplierPassword } = watch();

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-x-2 md:gap-y-0"
      key="step-2"
    >
      <Input
        label="Teléfono"
        registration={register('supplierPhone', {
          required: 'Escribe un teléfono de contacto',
          pattern: {
            value: onlyNumberRegex,
            message: 'Ingresa un número válido',
          },
        })}
        errorMessage={errors.supplierPhone?.message}
        name="supplierPhone"
        disabled={isDisabled}
      />
      <Input
        label="Email facturación"
        registration={register('billingEmail', {
          required: 'Escribe el correo de facturación',
          pattern: { value: emailRegex, message: 'Ingresa un correo válido' },
        })}
        errorMessage={errors.billingEmail?.message}
        name="billingEmail"
        type="email"
        disabled={isDisabled}
      />
      <Input
        label="Email comercial"
        registration={register('commercialEmail', {
          required: 'Escribe el correo comercial',
          pattern: { value: emailRegex, message: 'Ingresa un correo válido' },
        })}
        errorMessage={errors.commercialEmail?.message}
        name="commercialEmail"
        type="email"
        disabled={isDisabled}
      />
      {!hiddenInput && (
        <>
          <Input
            label="Contraseña"
            registration={register('supplierPassword', {
              required: 'Escribe una contraseña',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            })}
            errorMessage={errors.supplierPassword?.message}
            name="supplierPassword"
            type="password"
            disabled={isDisabled}
          />
          <Input
            label="Confirmar contraseña"
            registration={register('confirmPassword', {
              required: 'Confirma tu contraseña',
              validate: val =>
                val === supplierPassword || 'Las contraseñas no coinciden',
            })}
            errorMessage={errors.confirmPassword?.message}
            name="confirmPassword"
            type="password"
            disabled={isDisabled}
          />
        </>
      )}
    </div>
  );
}
