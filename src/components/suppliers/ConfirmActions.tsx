import DialogPrimary from '../common/DialogPrimary';
import { BaseButton } from '../common';
import { useSupplierMutations } from '../../api/queries/supplierMutations';

export type typeAction = 'DELETE' | 'SUSPENDED' | 'ACTIVE' | 'BLOCKED';

export default function ConfirmActions({
  isPopupOpen,
  closePopup,
  supplierId,
  typeAction,
}: {
  isPopupOpen: boolean;
  closePopup: () => void;
  supplierId: string;
  typeAction: typeAction;
}) {
  const { deleteSupplier, changeStatusSupplier } = useSupplierMutations();

  const onSubmit = () => {
    const actions = {
      DELETE: () => deleteSupplier.mutate(supplierId),
      SUSPENDED: () =>
        changeStatusSupplier.mutate({ supplierId, status: 'suspend' }),
      ACTIVE: () =>
        changeStatusSupplier.mutate({ supplierId, status: 'active' }),
      BLOCKED: () =>
        changeStatusSupplier.mutate({ supplierId, status: 'block' }),
    };
    const currentAction = actions[typeAction];
    if (currentAction) {
      currentAction();
    }
    closePopup();
  };

  const typeMessage = {
    ACTIVE: {
      title: 'Activar proveedor',
      message: '¿Seguro que quieres activar este proveedor?',
      actionLabel: 'Activar',
    },
    DELETE: {
      title: 'Eliminar proveedor',
      message: '¿Seguro que quieres eliminar este proveedor?',
      actionLabel: 'Eliminar',
    },
    SUSPENDED: {
      title: 'Desactivar proveedor',
      message: '¿Seguro que quieres desactivar este proveedor?',
      actionLabel: 'Desactivar',
    },
    BLOCKED: {
      title: 'Bloquear proveedor',
      message: '¿Seguro que quieres bloquear este proveedor?',
      actionLabel: 'Desactivar',
    },
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
