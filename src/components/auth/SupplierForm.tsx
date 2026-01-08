import {
  Fragment,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Controller, useFieldArray, useForm, type Path } from 'react-hook-form';
import {
  FileInput,
  Input,
  MultiSelect,
  Select,
  type FileSelection,
} from '../form';
import { emailRegex, onlyNumberRegex } from '../../types/regex';
import { NumericFormat } from 'react-number-format';
import ErrorMessage from '../common/ErrorMessage';
import { BaseButton, OptionButton } from '../common';
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
import { PAYMENT_TERMS_TYPE_ITEM } from '../../types/paymentTerms';

interface SupplierDTOProps extends SupplierDTO {
  confirmPassword: string;
}

type idSteps =
  | 'general_information'
  | 'contact'
  | 'bank_information'
  | 'documents'
  | 'payment_terms';

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
  {
    id: 'documents',
    label: 'Documentos',
    description:
      'Acta constitutiva, Constancia situación fiscal, Poderes legales, Reformas estatutarias, Opinion cumplimiento SAT, Contrato',
  },
  {
    id: 'payment_terms',
    label: 'Condiciones de pago',
    description: 'Condiciones de pago',
  },
];

const TERM_CONFIG = {
  ADVANCE_PAYMENT: {
    adv: 100,
    credit: 0,
    balance: 0,
    days: 0,
    disableAdv: true,
  },
  OUTSTANDING_BALANCE: {
    adv: 100,
    credit: 0,
    balance: 0,
    days: 0,
    disableAdv: true,
  },
  CREDIT: { adv: 0, balance: 0, disableAdv: true },
  ADVANCE_PAYMENT_OUTSTANDING_BALANCE: {
    credit: 0,
    days: 0,
    disableAdv: false,
  },
  ADVANCE_PAYMENT_CREDIT: { adv: 0, balance: 0, disableAdv: false },
};

export default function SupplierForm({ goBack }: { goBack: () => void }) {
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SupplierDTOProps>({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      paymentTerms: [{ paymentTermType: undefined }],
    },
  });
  const { fields } = useFieldArray({
    control,
    name: 'paymentTerms',
  });
  const { data: banks } = useGetBanks();
  const { createSupplier } = useSupplierMutations();
  const { data: categoriesData } = useCategories();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const { supplierPassword, categories, bankName, paymentTerms } = watch();

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

  const errorsValidations: Record<idSteps, Path<SupplierDTOProps>[]> = {
    general_information: [
      'companyName',
      'rfc',
      'categories',
      'businessTransaction',
      'fiscalAddress',
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
    payment_terms: ['paymentTerms'],
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
          options={
            banks?.map(({ code, name }) => ({
              value: code,
              label: name.toUpperCase(),
            })) ?? []
          }
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
    payment_terms: (
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-x-2 md:gap-y-0"
        key="step-5"
      >
        {fields.map((field, index) => {
          const currentType = paymentTerms[index].paymentTermType;
          return (
            <Fragment key={field.id}>
              <Select
                name={`paymentTerms.${index}.paymentTermType`}
                label="Tipo de condición"
                registration={register(
                  `paymentTerms.${index}.paymentTermType`,
                  {
                    required: 'Selecciona un tipo de condición',
                  }
                )}
                errorMessage={
                  errors?.paymentTerms?.[index]?.paymentTermType?.message
                }
                options={
                  Object.entries(PAYMENT_TERMS_TYPE_ITEM).map(
                    ([key, value]) => ({
                      value: key,
                      label: value,
                    })
                  ) ?? []
                }
                setValue={setValue}
                currentValue={currentType}
                onChange={() => {
                  const config =
                    TERM_CONFIG[
                      paymentTerms[index]
                        .paymentTermType as keyof typeof TERM_CONFIG
                    ];

                  if (config) {
                    if ('adv' in config)
                      setValue(
                        `paymentTerms.${index}.advancePercentage`,
                        config.adv
                      );
                    if ('days' in config)
                      setValue(`paymentTerms.${index}.creditDays`, config.days);
                    if ('balance' in config)
                      setValue(
                        `paymentTerms.${index}.balancePercentage`,
                        config.balance
                      );
                    if ('credit' in config)
                      setValue(
                        `paymentTerms.${index}.creditPercentage`,
                        config.credit
                      );
                  }
                }}
              />
              <Controller
                control={control}
                name={`paymentTerms.${index}.advancePercentage`}
                rules={{
                  validate: val => {
                    if (
                      (currentType === 'ADVANCE_PAYMENT' ||
                        currentType === 'ADVANCE_PAYMENT_CREDIT' ||
                        currentType === 'OUTSTANDING_BALANCE') &&
                      (!val || val <= 0)
                    ) {
                      return 'El porcentaje anticipado no puede ser 0';
                    }
                    return true;
                  },

                  max: { value: 100, message: 'Máximo 100' },
                }}
                render={({ field: { onChange, value, ref, name } }) => (
                  <NumericFormat
                    name={name}
                    value={value}
                    onValueChange={vals => {
                      const val = vals.floatValue ?? 0;
                      onChange(val);
                      if (
                        currentType === 'ADVANCE_PAYMENT' ||
                        currentType === 'ADVANCE_PAYMENT_OUTSTANDING_BALANCE'
                      ) {
                        setValue(
                          `paymentTerms.${index}.balancePercentage`,
                          Math.max(0, 100 - val)
                        );
                      }
                      if (currentType === 'ADVANCE_PAYMENT_CREDIT') {
                        setValue(
                          `paymentTerms.${index}.creditPercentage`,
                          Math.max(0, 100 - val)
                        );
                        setValue(
                          `paymentTerms.${index}.balancePercentage`,
                          Math.max(0, 100 - val)
                        );
                      }
                    }}
                    getInputRef={ref}
                    customInput={Input}
                    suffix="%"
                    label={
                      currentType === 'ADVANCE_PAYMENT' ||
                      currentType === 'ADVANCE_PAYMENT_OUTSTANDING_BALANCE' || currentType === 'ADVANCE_PAYMENT_CREDIT'
                        ? 'Pago anticipado'
                        : 'Pago despues de entrega'
                    }
                    disabled={TERM_CONFIG[currentType]?.disableAdv}
                    errorMessage={
                      errors?.paymentTerms?.[index]?.advancePercentage?.message
                    }
                  />
                )}
              />

              <Controller
                control={control}
                name={`paymentTerms.${index}.balancePercentage`}
                render={({ field: { onChange, name, value, ref } }) => (
                  <NumericFormat
                    name={name}
                    value={value}
                    onValueChange={vals => onChange(vals.floatValue)}
                    getInputRef={ref}
                    customInput={Input}
                    suffix="%"
                    decimalScale={2}
                    allowNegative={false}
                    label="Porcentaje pendiente"
                    errorMessage={
                      errors?.paymentTerms?.[index]?.balancePercentage?.message
                    }
                    disabled
                  />
                )}
              />

              <Controller
                control={control}
                name={`paymentTerms.${index}.creditPercentage`}
                rules={{
                  validate: val => {
                    if (
                      (currentType === 'CREDIT' ||
                        currentType === 'ADVANCE_PAYMENT_CREDIT') &&
                      (!val || val <= 0)
                    ) {
                      return 'El porcentaje de crédito debe ser mayor que 0';
                    }
                    return true;
                  },

                  max: { value: 100, message: 'Máximo 100' },
                }}
                render={({ field: { onChange, name, value, ref } }) => (
                  <NumericFormat
                    name={name}
                    value={value}
                    onValueChange={vals => onChange(vals.floatValue)}
                    getInputRef={ref}
                    customInput={Input}
                    suffix="%"
                    decimalScale={2}
                    allowNegative={false}
                    label="Porcentaje de crédito"
                    errorMessage={
                      errors?.paymentTerms?.[index]?.creditPercentage?.message
                    }
                    disabled={currentType !== 'CREDIT'}
                  />
                )}
              />

              <Controller
                control={control}
                name={`paymentTerms.${index}.creditDays`}
                rules={{
                  validate: val => {
                    if (
                      (currentType === 'CREDIT' ||
                        currentType === 'ADVANCE_PAYMENT_CREDIT') &&
                      (!val || val <= 0)
                    ) {
                      return 'En crédito los días deben ser mayores a 0';
                    }
                    return true;
                  },
                }}
                render={({ field: { onChange, name, value, ref } }) => (
                  <NumericFormat
                    name={name}
                    value={value}
                    onValueChange={vals => onChange(vals.floatValue)}
                    getInputRef={ref}
                    customInput={Input}
                    decimalScale={0}
                    allowNegative={false}
                    label="Días de crédito"
                    errorMessage={
                      errors?.paymentTerms?.[index]?.creditDays?.message
                    }
                    disabled={
                      currentType === 'ADVANCE_PAYMENT_OUTSTANDING_BALANCE' ||
                      currentType === 'OUTSTANDING_BALANCE' ||
                      currentType === 'ADVANCE_PAYMENT'
                    }
                  />
                )}
              />
            </Fragment>
          );
        })}
      </div>
    ),
  };

  const isLastStep = currentStep === steps.length - 1;
  const isCurrentStepInvalid = () => {
    const fieldsInStep = errorsValidations[steps[currentStep].id];
    return fieldsInStep?.some(field => !!errors[field as keyof typeof errors]);
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
