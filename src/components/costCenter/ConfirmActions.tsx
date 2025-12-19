import DialogPrimary from '../common/DialogPrimary';
import { BaseButton } from '../common';
import { useCostCenterMutations } from '../../api/queries/costCenterMutation';

export type typeAction = 'DELETE' | 'CLOSE' | 'FROZEN';

export default function ConfirmActions({
  isPopupOpen,
  closePopup,
  ccId,
  typeAction,
}: {
  isPopupOpen: boolean;
  closePopup: () => void;
  ccId: string;
  typeAction: typeAction;
}) {
  const { deleteCostCenter, changeStatusCC } = useCostCenterMutations();

  const onSubmit = () => {
    const actions = {
      DELETE: () => deleteCostCenter.mutate(ccId),
      CLOSE: () => changeStatusCC.mutate({ ccId, status: 'close' }),
      FROZEN: () => changeStatusCC.mutate({ ccId, status: 'frozen' }),
      OPEN: () => changeStatusCC.mutate({ ccId, status: 'open' }),
    };
    const currentAction = actions[typeAction];
    if (currentAction) {
      currentAction();
    }
    closePopup();
  };

  const typeMessage = {
    DELETE: {
      title: 'Eliminar Centro de Costo',
      message: '¿Seguro que quieres eliminar este centro de costo?',
      actionLabel: 'Eliminar',
    },
    CLOSE: {
      title: 'Cerrar Centro de Costo',
      message: '¿Seguro que quieres cerrar este centro de costo?',
      actionLabel: 'Cerrar',
    },
    FROZEN: {
      title: 'Congelar Centro de Costo',
      message: '¿Seguro que quieres congelar este centro de costo?',
      actionLabel: 'Congelar',
    },
    OPEN:{
      title: 'Descongelar Centro de Costo',
      message: '¿Seguro que quieres descongelar este centro de costo?',
      actionLabel: 'Descongelar',
    }
  };
  const { title, message, actionLabel } = typeMessage[typeAction];

  return (
    <DialogPrimary isOpen={isPopupOpen} onClose={closePopup} title={title}>
      <p className="text-grey-100 text-base font-semibold">{message}</p>
      <div className="mt-4 flex justify-end gap-x-4">
        <BaseButton
          label="Cancelar"
          onclick={closePopup}
          size="md"
          variant="secondary"
        />
        <BaseButton label={actionLabel} onclick={() => onSubmit()} size="md" />
      </div>
    </DialogPrimary>
  );
}
