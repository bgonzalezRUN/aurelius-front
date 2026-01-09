import { useParams } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { H1 } from '../components/common/Text';
import { useSupplierById } from '../api/queries/supplierQueries';
import { statusLabelsSupplier, type SupplierDTO } from '../types/supplier';
import { Ban, Check, CirclePause, Pencil, Trash } from 'lucide-react';
import { useCallback, useEffect, useState, type ComponentType } from 'react';
import { BaseButton } from '../components/common';
import type {
  ButtonTypes,
  ButtonVariant,
} from '../components/common/BaseButton';
import ConfirmActions, {
  type typeAction,
} from '../components/suppliers/ConfirmActions';
import { GeneralInformationForm } from '../components/suppliers/GeneralInformationForm';
import { ContactForm } from '../components/suppliers/ContactForm';
import { BankInformation } from '../components/suppliers/BankInformation';
import { PaymentTermsForm } from '../components/suppliers/PaymentTermsForm';
import { useSupplierMutations } from '../api/queries/supplierMutations';
import { usePopupStore } from '../store/popup';
import { omitFields } from '../utils/omitFields';

export type ModalType = typeAction | null;

export default function SupplierDetails() {
  const { supplierId } = useParams();
  const { data } = useSupplierById(supplierId || '');
  const { updateSupplier } = useSupplierMutations();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [edit, setEdit] = useState<boolean>(false);
  const { openPopup: openPopupValidate } = usePopupStore();
  const closeModal = useCallback(() => setActiveModal(null), []);

  const methods = useForm<SupplierDTO>({
    mode: 'onChange',
    values: data,
  });

  useEffect(() => {
    if (updateSupplier.isSuccess) setEdit(prev => !prev);
  }, [updateSupplier.isSuccess]);

  const submitHandler = () => {
    openPopupValidate({
      title: 'Editar proveedor',
      message: `¿Estas seguro de editar la información del proveedor ${data?.companyName}?`,
      onConfirm: () => {
        const currentData = methods.getValues();
        const cleanData = omitFields(currentData, [
          'supplierId',
          'supplierStatus',
          'createdAt',
          'files',
          'categories',
          'updatedAt',
          'paymentTerms.paymentTermId',
          'paymentTerms.createdAt',
          'paymentTerms.updatedAt',
        ]) as SupplierDTO;

        const finalData = {
          ...cleanData,
          paymentTerms: cleanData.paymentTerms.map(term => ({
            ...term,
            creditDays: term.creditDays ? Number(term.creditDays) : 0,
          })),
        };
        updateSupplier.mutate({
          supplierId: currentData.supplierId,
          data: finalData,
        });
      },
    });
  };

  type Option = {
    label: string;
    icon: ComponentType<{ size: number }>;
    onClick: () => void;
    hidden?: boolean;
    variant?: ButtonVariant;
    disable?: boolean;
    type?: ButtonTypes;
  };

  const optionsHandler: () => Array<Option> = () => [
    {
      label: 'Activar',
      icon: Check,
      onClick: () => setActiveModal('ACTIVE'),
      hidden: data?.supplierStatus === 'ACTIVE' || edit,
    },
    {
      label: 'Cancelar',
      icon: Ban,
      onClick: () => {
        methods.reset();
        setEdit(prev => !prev);
      },
      disable: false,
      hidden: !edit,
      variant: 'secondary',
    },
    {
      label: `${edit ? 'Guardar' : 'Editar'}`,
      icon: edit ? Check : Pencil,
      onClick: edit ? submitHandler : () => setEdit(prev => !prev),
      disable: edit ? !methods.formState.isValid : false,
      hidden: false,
      type: 'button',
    },
    {
      label: 'Desactivar',
      icon: CirclePause,
      onClick: () => {
        setActiveModal('SUSPENDED');
      },
      disable: false,
      hidden: data?.supplierStatus === 'SUSPENDED' || edit,
    },
    {
      label: 'Bloquear',
      icon: Ban,
      onClick: () => {
        setActiveModal('BLOCKED');
      },
      disable: false,
      hidden: data?.supplierStatus === 'BLOCKED' || edit,
    },
    {
      label: 'Eliminar',
      icon: Trash,
      onClick: () => {
        setActiveModal('DELETE');
      },
      variant: 'red',
      hidden: edit,
    },
  ];

  const titleSectionStyles = 'text-primaryDark font-bold text-lg mb-1';

  const type = {
    DELETE: 'DELETE',
    SUSPENDED: 'SUSPENDED',
    ACTIVE: 'ACTIVE',
    BLOCKED: 'BLOCKED',
  };

  return (
    <>
      <div className="flex flex-col gap-y-3">
        <div className="flex justify-between items-center">
          <div>
            <H1>
              {data?.companyName.toLocaleUpperCase()} -{' '}
              {data?.supplierStatus &&
                statusLabelsSupplier[data?.supplierStatus]}
            </H1>
          </div>
        </div>

        <div className="bg-white rounded-lg w-full p-5 pr-3 flex flex-col gap-y-1 text-grey-primary font-semibold h-full max-h-[calc(100vh-6.25rem)]">
          <div className="flex flex-col overflow-y-auto flex-1">
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit(submitHandler)}
                className="flex flex-col gap-y-2 overflow-y-auto flex-1 pr-2"
              >
                <h3 className={titleSectionStyles}>Información general</h3>
                <GeneralInformationForm isDisabled={!edit} />
                <h3 className={titleSectionStyles}>Datos de contacto</h3>
                <ContactForm isDisabled={!edit} hiddenInput />
                <h3 className={titleSectionStyles}>Información bancaria</h3>
                <BankInformation isDisabled={!edit} />
                <PaymentTermsForm isDisabled={!edit} custom />
              </form>
            </FormProvider>
          </div>

          {/* {data?.files.length && (
            <div className="flex flex-col">
              <h3 className={titleSectionStyles}>Documentos</h3>
              {data?.files.map(({ url, fileName }) => (
                <div className="flex w-full" key={url}>
                  <p className="inline-flex items-center gap-x-1">
                    <span className="text-primary-primary font-bold inline-flex items-center gap-x-1">
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <File size={15} />
                      </a>
                      {fileName}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )} */}
          <div className="mt-6 flex gap-4 justify-end flex-none flex-wrap ">
            {optionsHandler().map((option, index) => {
              if (option.hidden) return null;
              return (
                <BaseButton
                  key={index}
                  label={
                    <>
                      {option.icon && <option.icon size={18} />}
                      {option.label}
                    </>
                  }
                  size="md"
                  variant={option.variant}
                  onclick={option.onClick}
                  disabled={option.disable}
                  type={option.type && option.type}
                />
              );
            })}
          </div>
        </div>
      </div>
      {activeModal && (
        <ConfirmActions
          isPopupOpen={true}
          closePopup={closeModal}
          supplierId={supplierId || ''}
          typeAction={type[activeModal] as typeAction}
        />
      )}
    </>
  );
}
