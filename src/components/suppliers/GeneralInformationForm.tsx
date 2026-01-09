import { useFormContext } from 'react-hook-form';
import type { SupplierDTO } from '../../types/supplier';
import { Input, MultiSelect } from '../form';
import { trimValue } from '../../utils/string';
import { useCategories } from '../../api/queries/requisitionQueries';
import { capitalizeWords } from '../../utils';
import { CATEGORYITEM } from '../../types/category';

export function GeneralInformationForm({
  isDisabled,
}: {
  isDisabled?: boolean;
}) {
  const { data: categoriesData } = useCategories();
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<SupplierDTO>();

  const { categories } = watch();

 
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-x-2 md:gap-y-0"
      key="step-1"
    >
      <Input
        label="Razón social"
        registration={register('companyName', {
          required: 'Escribe la razón social de la empresa',
          setValueAs: trimValue,
        })}
        errorMessage={errors.companyName?.message}
        name="companyName"
        disabled={isDisabled}
      />
      <Input
        label="Registro Federal de Contribuyentes (RFC)"
        registration={register('rfc', {
          required: 'Escribe el RFR de la empresa',
          setValueAs: trimValue,
        })}
        errorMessage={errors.rfc?.message}
        name="rfc"
        disabled={isDisabled}
      />
      <Input
        label="Giro"
        registration={register('businessTransaction', {
          required: 'Escribe el giro de la empresa',
          setValueAs: trimValue,
        })}
        errorMessage={errors.businessTransaction?.message}
        name="businessTransaction"
        disabled={isDisabled}
      />
      <Input
        label="Dirección de la empresa"
        registration={register('fiscalAddress', {
          required: 'Escribe la dirección de la empresa',
          setValueAs: trimValue,
        })}
        errorMessage={errors.fiscalAddress?.message}
        name="fiscalAddress"
        disabled={isDisabled}
      />
      <MultiSelect
        label="Categorias"
        name="categories"
        options={
          categoriesData?.map(({ categoryName, categoryId }) => ({
            value: `${categoryId}`,
            label: capitalizeWords(
              CATEGORYITEM[Number(categoryId)] || categoryName
            ),
          })) ?? []
        }
        setValue={setValue}
        currentValues={categories as string[]}
        registration={register('categories', {
          required: 'Selecciona al menos una categoría',
        })}
        errorMessage={errors.categories?.message}
        disabled={isDisabled}
      />
    </div>
  );
}
