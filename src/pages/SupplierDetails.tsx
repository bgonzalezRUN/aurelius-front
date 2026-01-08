import { useParams } from 'react-router-dom';
import { H1 } from '../components/common/Text';
import { useSupplierById } from '../api/queries/supplierQueries';
import { statusLabelsSupplier } from '../types/supplier';
import clsx from 'clsx';
import { Ban, Check, CirclePause, File, Pencil, Trash } from 'lucide-react';
import { useCallback, useState } from 'react';
import { BaseButton } from '../components/common';
import type { ButtonVariant } from '../components/common/BaseButton';
import ConfirmActions, {
  type typeAction,
} from '../components/suppliers/ConfirmActions';

export type ModalType = typeAction | 'EDIT' | null;

export default function SupplierDetails() {
  const { supplierId } = useParams();
  const { data } = useSupplierById(supplierId || '');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const closeModal = useCallback(() => setActiveModal(null), []);

  const optionsHandler = () => [
    {
      label: 'Activar',
      icon: Check,
      onClick: () => setActiveModal('ACTIVE'),
      hidden: data?.supplierStatus ===  'ACTIVE',
    },
    {
      label: 'Editar',
      icon: Pencil,
      onClick: () => setActiveModal('EDIT'),
      disable: false,    
      hidden: false,
    },
    {
      label: 'Desactivar',
      icon: CirclePause,
      onClick: () => {
        setActiveModal('SUSPENDED');
      },
      disable: false,   
      hidden: data?.supplierStatus === 'SUSPENDED',
    },
     {
      label: 'Bloquear',
      icon: Ban,
      onClick: () => {
        setActiveModal('BLOCKED');
      },
      disable: false,   
      hidden: data?.supplierStatus === 'BLOCKED',
    },
    {
      label: 'Eliminar',
      icon: Trash,
      onClick: () => {
        setActiveModal('DELETE');
      },
      variant: 'red',
    },
  ];

  const generalInformation = [
    { title: 'Razón social', details: data?.companyName },
    {
      title: 'Registro Federal de Contribuyentes (RFC)',
      details: data?.rfc,
    },
    { title: 'Giro', details: data?.businessTransaction },
    { title: 'Dirección de la empresa', details: data?.fiscalAddress },
    { title: 'Categorias', details: 'pendiente' },
  ];

  const contact = [
    { title: 'Teléfono', details: data?.supplierPhone },
    { title: 'Email facturación', details: data?.billingEmail },
    { title: 'Email comercial', details: data?.commercialEmail },
  ];

  const bankInformation = [
    { title: 'Banco', details: data?.bankName },
    { title: 'Clave bancaria', details: data?.bankAccount },
    { title: 'Nombre del titular', details: data?.registeredName },
  ];

  const titleSectionStyles = 'text-primaryDark font-bold text-lg mb-2';

  const type = {
    DELETE: 'DELETE',
    SUSPENDED: 'SUSPENDED',
    ACTIVE: 'ACTIVE',
    BLOCKED: 'BLOCKED',
  };

  return (
    <>
      <div className="flex flex-col h-full max-h-screen gap-y-5">
        <div className="flex justify-between items-center">
          <div>
            <H1>
              {data?.companyName.toLocaleUpperCase()} -{' '}
              {data?.supplierStatus &&
                statusLabelsSupplier[data?.supplierStatus]}
            </H1>
          </div>
        </div>

        <div className="bg-white rounded-lg w-full p-5 flex flex-col gap-y-2 text-grey-primary font-semibold">
          <div className="flex flex-col pb-2 border-b border-b-grey-200">
            <h3 className={titleSectionStyles}>Información general</h3>
            {generalInformation.map(({ title, details }) => (
              <p className="inline-flex gap-x-2">
                <span className="text-primary-primary font-bold">{title}:</span>
                {details}
              </p>
            ))}
          </div>

          <div className="flex flex-col pb-2 border-b border-b-grey-200">
            <h3 className={titleSectionStyles}>Datos de contacto</h3>
            {contact.map(({ title, details }) => (
              <p className="inline-flex gap-x-2">
                <span className="text-primary-primary font-bold">{title}:</span>
                {details}
              </p>
            ))}
          </div>

          <div
            className={clsx('flex flex-col', {
              'pb-2 border-b border-b-grey-200': data?.files.length,
            })}
          >
            <h3 className={titleSectionStyles}>Información bancaria</h3>
            {bankInformation.map(({ title, details }) => (
              <p className="inline-flex gap-x-2">
                <span className="text-primary-primary font-bold">{title}:</span>
                {details}
              </p>
            ))}
          </div>

          {data?.files.length && (
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
          )}
          <div className="mt-6 flex gap-x-4 justify-end">
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
                  variant={option.variant as ButtonVariant}
                  onclick={option.onClick}
                  disabled={option.disable}
                />
              );
            })}
          </div>
        </div>
      </div>
      {activeModal !== 'EDIT' && activeModal && (
        <ConfirmActions
          isPopupOpen={true}
          closePopup={closeModal}
          supplierId={supplierId || ''}
          typeAction={type[activeModal] as typeAction}
        />
      )}
      {/* {activeModal === 'EDIT' && (
        <CreationForm isOpen={true} onClose={closeModal} ccId={id} />
      )} */}
    </>
  );
}
