import { useFormContext } from 'react-hook-form';
import { Input, Select } from '../form';
import { onlyNumberRegex } from '../../types/regex';
import type { SupplierDTOProps } from '../auth/SupplierForm';
import { useGetBanks } from '../../api/queries/banksQueries';

export function BankInformation({ isDisabled }: { isDisabled?: boolean }) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<SupplierDTOProps>();
  const { data: banks } = useGetBanks();
  const { bankName } = watch();

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-x-2 md:gap-y-0"
      key="step-3"
    >
      <Select
        name="bankName"
        label="Banco"
        registration={register('bankName', {
          required: 'Selecciona el banco',
        })}
        errorMessage={errors.bankName?.message}
        options={
          banks?.map(({ code, name }) => ({
            value: code,
            label: name.toUpperCase(),
          })) ?? []
        }
        setValue={setValue}
        disabled={isDisabled}
        currentValue={bankName}
      />
      <Input
        label="CLABE Interbancaria"
        registration={register('bankAccount', {
          required: 'Escribe la CLABE Interbancaria',
          pattern: {
            value: onlyNumberRegex,
            message: 'Solo números permitidos',
          },
            minLength: {
            value: 18,
            message: 'La CLABE debe tener 18 dígitos',
            },
            maxLength: {
            value: 18,
            message: 'La CLABE debe tener 18 dígitos',
            },
        })}
        errorMessage={errors.bankAccount?.message}
        name="bankAccount"
        disabled={isDisabled}
      />
      <Input
        label="Nombre del titular"
        registration={register('registeredName', {
          required: 'Escribe el nombre del titular',
        })}
        errorMessage={errors.registeredName?.message}
        name="registeredName"
        disabled={isDisabled}
      />
    </div>
  );
}
