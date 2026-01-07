import { useForm, type Path } from 'react-hook-form';
import { FileInput, Input, MultiSelect, Select, type FileSelection } from '../form';
import { emailRegex, onlyNumberRegex } from '../../types/regex';
import ErrorMessage from '../common/ErrorMessage';
import { BaseButton, OptionButton } from '../common';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { trimValue } from '../../utils/string';
import { ArrowLeft } from 'lucide-react';
import { useSupplierMutations } from '../../api/queries/supplierMutations';
import type { SupplierDTO } from '../../types/supplier';
import { Stepper } from '../common/Stepper';
import { useCategories } from '../../api/queries/requisitionQueries';
import { capitalizeWords } from '../../utils';
import { CATEGORYITEM } from '../../types/category';
import { validateFileSize } from '../../utils/validateFileSize';
import { useGetBanks } from '../../api/queries/banksQueries';

interface SupplierDTOProps extends SupplierDTO {
  confirmPassword: string;
}

type idSteps =
  | 'general_information'
  | 'contact'
  | 'bank_information'
  | 'documents';

const steps: { id: idSteps; label: string; description: string }[] = [
  {
    id: 'general_information',
    label: 'Información general',
    description: 'Datos básicos',
  },
  { id: 'contact', label: 'Contacto', description: 'Información de contacto' },
  {
    id: 'bank_information',
    label: 'Información bancaria',
    description: 'Datos bancarios',
  },
  { id: 'documents', label: 'Documentos', description: 'Acta constitutiva, Constancia situación fiscal, Poderes legales, Reformas estatutarias, Opinion cumplimiento SAT, Contrato' },
];

export default function SupplierForm({ goBack }: { goBack: () => void }) {
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SupplierDTOProps>({ mode: 'onChange', shouldUnregister: false });

  const { data: banks } = useGetBanks();
  const { createSupplier } = useSupplierMutations();
  const { data: categoriesData } = useCategories();
  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    if (createSupplier.isSuccess) {
      reset();
      goBack();
    }
  }, [reset, createSupplier.isSuccess, goBack]);

  const onSubmit = async (data: SupplierDTOProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...supplierData } = data;
    createSupplier.mutate(supplierData);
  };

  const { supplierPassword, categories, bankName } = watch();


  const errorsValidations: Record<idSteps, Path<SupplierDTOProps>[]> = {
    general_information: [
      'companyName',
      'rfc',
      'categories',
      'businessTransaction',
      'fiscalAddress'
    ],
    contact: [
      'supplierPhone',
      'billingEmail',
      'commercialEmail',
      'supplierPassword',
      'confirmPassword',
    ],
    bank_information: ['bankName', 'bankAccount', 'registeredName'],
    documents: ['supplierFile'],
  };

  const handleNext = async () => {
    const fieldsToValidate = errorsValidations[steps[currentStep].id];
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      goBack();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFilesSelected = useCallback(
    (data: FileSelection) => {
      const { inputName, files } = data;
      if (!inputName) return;
      if (files && files.length > 0) {
        const filesArray = Array.from(files);
        const valueToSet =
          filesArray.length === 1 ? [filesArray[0]] : filesArray;
        setValue('supplierFile', valueToSet, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    },
    [setValue]
  );
  const stepByStepForm: Record<idSteps, ReactNode> = {
    general_information: (
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
        />
        <Input
          label="Registro Federal de Contribuyentes (RFC)"
          registration={register('rfc', {
            required: 'Escribe el RFR de la empresa',
            setValueAs: trimValue,
          })}
          errorMessage={errors.rfc?.message}
          name="rfc"
        />
        <Input
          label="Giro"
          registration={register('businessTransaction', {
            required: 'Escribe el giro de la empresa',
            setValueAs: trimValue,
          })}
          errorMessage={errors.businessTransaction?.message}
          name="businessTransaction"
        />
        <Input
          label="Dirección de la empresa"
          registration={register('fiscalAddress', {
            required: 'Escribe la dirección de la empresa',
            setValueAs: trimValue,
          })}
          errorMessage={errors.fiscalAddress?.message}
          name="fiscalAddress"
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
        />
      </div>
    ),
    contact: (
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
        />
        <Input
          label="Contraseña"
          registration={register('supplierPassword', {
            required: 'Escribe una contraseña',
            minLength: { value: 8, message: 'Mínimo 8 caracteres' },
          })}
          errorMessage={errors.supplierPassword?.message}
          name="supplierPassword"
          type="password"
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
        />
      </div>
    ),
    bank_information: (
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
          options={banks?.map(({ code, name }) => ({
            value: code,
            label: name.toUpperCase(),
          })) ?? []}
          setValue={setValue}
          currentValue={bankName}
        />

        <Input
          label="Clave bancaria"
          registration={register('bankAccount', {
            required: 'Escribe la clave bancaria',
            pattern: {
              value: onlyNumberRegex,
              message: 'Solo números permitidos',
            },
          })}
          errorMessage={errors.bankAccount?.message}
          name="bankAccount"
        />
        <Input
          label="Nombre del titular"
          registration={register('registeredName', {
            required: 'Escribe el nombre del titular',
          })}
          errorMessage={errors.registeredName?.message}
          name="registeredName"
        />
      </div>
    ),
    documents: (
      <>
        <FileInput
          label="Documentos"
          name="supplierFile"
          accept="application/pdf"
          onFilesSelected={handleFilesSelected}
          errorMessage={errors.supplierFile?.message}
          multiple
        />
      </>
    ),
  };

  const isLastStep = currentStep === steps.length - 1;
  const isCurrentStepInvalid = () => {
    const fieldsInStep = errorsValidations[steps[currentStep].id];
    return fieldsInStep.some(field => !!errors[field as keyof typeof errors]);
  };

  return (
    <>
      <div className="flex items-center gap-x-2 text-primaryDark ">
        <OptionButton buttonHandler={goBack} title="Volver">
          <ArrowLeft size={20} />
        </OptionButton>
        <h2 className="text-xl font-bold">Crear cuenta como proveedor</h2>
      </div>

      <Stepper steps={steps} currentStep={currentStep} className="mb-3" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
        className="flex flex-col gap-y-2 flex-1 min-h-0"
      >
        <input
          type="hidden"
          {...register('supplierFile', {
            validate: value => validateFileSize(value as File[]),
            required: 'Debes subir al menos un archivo',
          })}
        />
        <div className="flex-1 overflow-y-auto pr-1 overflow-x-hidden mb-4 ">
          {stepByStepForm[steps[currentStep].id]}
        </div>

        {createSupplier.isError && (
          <ErrorMessage
            errorMessage={
              createSupplier.error?.userMessage ||
              'Ocurrió un error al procesar la solicitud'
            }
            name="register-supplier-form"
          />
        )}

        <div className="flex justify-end w-full gap-5 flex-shrink-0">
          <BaseButton
            label={currentStep === 0 ? 'Cancelar' : 'Anterior'}
            type="button"
            size="md"
            variant="secondary"
            onclick={handleBack}
            disabled={createSupplier.isPending}
          />

          <BaseButton
            label={isLastStep ? 'Finalizar y Crear' : 'Siguiente'}
            type={isLastStep ? 'submit' : 'button'}
            size="md"
            variant="primaryDark"
            isLoading={createSupplier.isPending || isSubmitting}
            onclick={isLastStep ? undefined : handleNext}
            disabled={isCurrentStepInvalid() || createSupplier.isPending}
          />
        </div>
      </form>
    </>
  );
}
