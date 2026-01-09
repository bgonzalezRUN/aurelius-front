import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { FormProvider, useForm, type Path } from 'react-hook-form';
import { FileInput, type FileSelection } from '../form';
import ErrorMessage from '../common/ErrorMessage';
import { BaseButton, OptionButton } from '../common';
import { ArrowLeft } from 'lucide-react';
import { useSupplierMutations } from '../../api/queries/supplierMutations';
import type { SupplierDTO } from '../../types/supplier';
import { Stepper } from '../common/Stepper';
import { validateFileSize } from '../../utils/validateFileSize';
import { GeneralInformationForm } from '../suppliers/GeneralInformationForm';
import { ContactForm } from '../suppliers/ContactForm';
import { BankInformation } from '../suppliers/BankInformation';
import { PaymentTermsForm } from '../suppliers/PaymentTermsForm';

export interface SupplierDTOProps extends SupplierDTO {
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

export default function SupplierForm({ goBack }: { goBack: () => void }) {
  const methods = useForm<SupplierDTOProps>({
    mode: 'onChange',
    defaultValues: {
      paymentTerms: [{ paymentTermType: undefined }],
    },
  });

  const { createSupplier } = useSupplierMutations();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const { supplierFile } = methods.watch();

  useEffect(() => {
    if (createSupplier.isSuccess) {
      methods.reset();
      setCurrentStep(0);
    }
  }, [createSupplier.isSuccess, goBack, methods]);

  const onSubmit = async (data: SupplierDTOProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...supplierData } = data;

    const finalData = {
      ...supplierData,
      paymentTerms: supplierData.paymentTerms.map(term => ({
        ...term,
        creditDays: term.creditDays ? Number(term.creditDays) : 0,
      })),
    };

    createSupplier.mutate(finalData);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const isStepValid = await methods.trigger(fieldsToValidate);

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
        methods.setValue('supplierFile', valueToSet, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    },
    [methods]
  );
  const stepByStepForm: Record<idSteps, ReactNode> = {
    general_information: <GeneralInformationForm />,
    contact: <ContactForm />,
    bank_information: <BankInformation />,
    documents: (
      <>
        <FileInput
          label="Documentos"
          name="supplierFile"
          accept="application/pdf"
          onFilesSelected={handleFilesSelected}
          errorMessage={methods.formState.errors.supplierFile?.message}
          multiple
          currentFiles={supplierFile}
        />
      </>
    ),
    payment_terms: <PaymentTermsForm />,
  };

  const isLastStep = currentStep === steps.length - 1;

  const isCurrentStepInvalid = useMemo(() => {
    const currentStepId = steps[currentStep].id;
    const fieldsInStep = errorsValidations[currentStepId];

    const hasErrors = fieldsInStep?.some(
      field =>
        !!methods.formState.errors[
          field as keyof typeof methods.formState.errors
        ]
    );
    const values = methods.watch(fieldsInStep as (keyof SupplierDTOProps)[]);
    const hasEmptyFields = values.some((value, index) => {
      const fieldName = fieldsInStep[index];
      if (fieldName === 'paymentTerms') {
        const terms = value as SupplierDTOProps['paymentTerms'];
        if (!terms || terms.length === 0) return true;
        return terms.some((_, idx) => {
          const hasType = !!terms[idx]?.paymentTermType;
          const hasErrorInTerm = !!methods.formState.errors.paymentTerms?.[idx];
          return !hasType || hasErrorInTerm;
        });
      }
      if (Array.isArray(value)) return value.length === 0;
      return value === undefined || value === null || value === '';
    });

    return hasErrors || hasEmptyFields;
  }, [currentStep, errorsValidations, methods]);

  return (
    <>
      <div className="flex items-center gap-x-2 text-primaryDark ">
        <OptionButton buttonHandler={goBack} title="Volver">
          <ArrowLeft size={20} />
        </OptionButton>
        <h2 className="text-xl font-bold">Crear cuenta como proveedor</h2>
      </div>

      <Stepper steps={steps} currentStep={currentStep} className="mb-3" />
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          autoComplete="off"
          className="flex flex-col gap-y-2 flex-1 min-h-0"
        >
          <input
            type="hidden"
            {...methods.register('supplierFile', {
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
              isLoading={
                createSupplier.isPending || methods.formState.isSubmitting
              }
              onclick={isLastStep ? undefined : handleNext}
              disabled={isCurrentStepInvalid || createSupplier.isPending}
            />
          </div>
        </form>
      </FormProvider>
    </>
  );
}
