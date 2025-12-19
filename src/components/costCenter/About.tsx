import {
  ArchiveRestore,
  CircleAlert,
  CirclePause,
  File,
  Pencil,
  Trash,
} from 'lucide-react';
import { useCostCenterById } from '../../api/queries/costCenterQuery';
import { getFileDetails } from '../../utils/getDetailsOfTheCCFile';
import clsx from 'clsx';
import { BaseButton } from '../common';
import type { ButtonVariant } from '../common/BaseButton';
import { Fragment, useCallback, useState } from 'react';
import ConfirmActions, { type typeAction } from './ConfirmActions';
import CreationForm from './CreationForm';

type ModalType = 'EDIT' | 'DELETE' | 'CLOSE' | 'FROZEN' | 'OPEN' | null;

export default function About({ id }: { id: string }) {
  const { data } = useCostCenterById(id);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const closeModal = useCallback(() => setActiveModal(null), []);

  const documents = [
    {
      name: 'Calendario operativo:',
      details: getFileDetails(data?.costCenterCalender as string),
      disable: !data?.costCenterCalender,
    },
    {
      name: 'Presupuesto base:',
      details: getFileDetails(data?.costCenterBudget as string[]),
      disable: !data?.costCenterBudget.length,
    },
    {
      name: 'Reglas fiscales:',
      details: getFileDetails(data?.costCenterRules as string[]),
      disable: !data?.costCenterRules.length,
    },
  ];

  const optionsHandler = () => [
    {
      label: 'Editar',
      icon: Pencil,
      onClick: () => setActiveModal('EDIT'),
      disable: data?.costCenterStatus !== 'OPEN',
    },
    {
      label: 'Cerrar',
      icon: ArchiveRestore,
      onClick: () => {
        setActiveModal('CLOSE');
      },
      hidden: data?.costCenterStatus === 'CLOSED',
    },
    {
      label: data?.costCenterStatus === 'FROZEN' ? 'Descongelar' : 'Congelar',
      icon: CirclePause,
      onClick: () => {
        setActiveModal(data?.costCenterStatus === 'FROZEN' ? 'OPEN' : 'FROZEN');
      },
      disable: data?.costCenterStatus === 'CLOSED',
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

  const type = {
    CLOSE: 'CLOSE',
    FROZEN: 'FROZEN',
    DELETE: 'DELETE',
    OPEN: 'OPEN',
  };

  if (!data) return null;

  return (
    <>
      <div className="bg-white rounded-lg max-h-[22rem] w-full p-5 flex flex-col gap-y-2 text-grey-primary font-semibold">
        <div className="flex justify-between">
          <p className="inline-flex items-center gap-x-1 text-secondary font-bold">
            <CircleAlert size={15} /> {data.costCenterName}
          </p>
          <p className="inline-flex items-center gap-x-3  font-bold">
            <span className="text-secondary">Código:</span>{' '}
            {data.costCenterCode}
          </p>
        </div>
        <p>
          <span className="text-secondary font-bold">Ubicación: </span>
          {data.costCenterAddress}
        </p>
        {data.costCenterDescription && (
          <p>
            <span className="text-secondary font-bold">Descripción: </span>
            {data.costCenterDescription}
          </p>
        )}

        {documents.map(({ name, details, disable }) => (
          <div className={clsx('flex w-full', { hidden: disable })} key={name}>
            <p className="text-secondary font-bold w-1/6">{name}</p>
            <p className="inline-flex items-center gap-x-1">
              {details.map(item => (
                <Fragment key={item.name}>
                  <span className="text-secondary font-bold inline-flex items-center gap-x-1">
                    <File size={15} /> {item.name}
                  </span>
                  (<span>{item.type}</span>)
                </Fragment>
              ))}
            </p>
          </div>
        ))}
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
      {activeModal !== 'EDIT' && activeModal && (
        <ConfirmActions
          isPopupOpen={true}
          closePopup={closeModal}
          ccId={id}
          typeAction={type[activeModal] as typeAction}
        />
      )}
      {activeModal === 'EDIT' && (
        <CreationForm isOpen={true} onClose={closeModal} />
      )}
    </>
  );
}
