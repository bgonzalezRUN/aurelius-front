import {
  ArchiveRestore,
  Check,
  CircleAlert,
  CirclePause,
  File,
  Pencil,
  Trash,
} from 'lucide-react';
import { useCostCenterById } from '../../api/queries/costCenterQuery';
import clsx from 'clsx';
import { BaseButton } from '../common';
import type { ButtonVariant } from '../common/BaseButton';
import { Fragment, useCallback, useMemo, useState } from 'react';
import ConfirmActions, { type typeAction } from './ConfirmActions';
import CreationForm from './CreationForm';
import { groupBy } from '../../utils/files';
import { StatusBadge } from './Status';

export type ModalType = typeAction | 'EDIT' | null;

export default function About({ id }: { id: string }) {
  const { data } = useCostCenterById(id);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const closeModal = useCallback(() => setActiveModal(null), []);

  const groupedByType = useMemo(() => {
    if (!data?.files) return [];
    const grouped = groupBy(data?.files, 'fileType');
    const { calendar, budget, rules } = grouped;
    return [
      {
        name: 'Calendario operativo:',
        details: calendar || [],
        disable: !calendar?.length,
      },
      {
        name: 'Presupuesto base:',
        details: budget || [],
        disable: !budget?.length,
      },
      {
        name: 'Reglas fiscales:',
        details: rules || [],
        disable: !rules?.length,
      },
    ];
  }, [data?.files]);

  const optionsHandler = () => [
    {
      label: 'Activar',
      icon: Check,
      onClick: () => setActiveModal('OPEN'),
      hidden: data?.costCenterStatus !== 'DRAFT',
    },
    {
      label: 'Editar',
      icon: Pencil,
      onClick: () => setActiveModal('EDIT'),
      // disable: data?.costCenterStatus === 'FROZEN',
      disable: true,
      hidden: data?.costCenterStatus === 'DRAFT'|| data?.costCenterStatus === 'CLOSED',
    },
    {
      label: 'Cerrar',
      icon: ArchiveRestore,
      onClick: () => {
        setActiveModal('CLOSE');
      },
      hidden:
        data?.costCenterStatus === 'CLOSED' ||
        data?.costCenterStatus === 'DRAFT',
    },
    {
      label: data?.costCenterStatus === 'FROZEN' ? 'Descongelar' : 'Congelar',
      icon: CirclePause,
      onClick: () => {
        setActiveModal(data?.costCenterStatus === 'FROZEN' ? 'DEFROST' : 'FROZEN');
      },
      disable: data?.costCenterStatus === 'CLOSED',
      hidden: data?.costCenterStatus === 'DRAFT' || data?.costCenterStatus === 'CLOSED',
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
    DEFROST: 'DEFROST',
  };

  if (!data) return null;

  return (
    <>
      <div className="bg-white rounded-lg w-full p-5 flex flex-col gap-y-2 text-grey-primary font-semibold">
        <div className="flex justify-between">
          <p className="inline-flex items-center gap-x-1 text-secondary font-bold">
            <CircleAlert size={15} /> {data.costCenterName}
          </p>
          <p className="inline-flex items-center gap-x-3  font-bold">
            <span className="text-secondary">Código:</span>{' '}
            {data.costCenterCode}
          </p>
        </div>
        <div className="flex items-center gap-x-2">
          <span className="text-secondary font-bold">Estado: </span>
          <StatusBadge status={data.costCenterStatus} />
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

        {groupedByType.map(({ name, details, disable }) => (
          <div className={clsx('flex w-full', { hidden: disable })} key={name}>
            <p className="text-secondary font-bold w-1/6">{name}</p>
            <p className="inline-flex items-center gap-x-1">
              {details.map(item => (
                <Fragment key={item.fileName}>
                  <span className="text-secondary font-bold inline-flex items-center gap-x-1">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <File size={15} />
                    </a>
                    {item.fileName}
                  </span>
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
