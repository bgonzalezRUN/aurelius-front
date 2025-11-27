import { Eye, Edit, ThumbsDown, ThumbsUp, type LucideIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useRequisitionById } from '../../api/queries/requisitionQueries';
import { useRequisitionMutations } from '../../api/queries/requisitionMutations';
import { usePermission } from '../../hooks/usePermission';
import OptionButton from '../common/OptionButton';
import { ButtonBase } from '../common';
import RequisitionDetailModal from '../RequisitionDetailModal';
import RequisitionModal from '../RequisitionModal';
import RejectRequisition from './RejectRequisition';
import OrderHistory from './OrderHistory';
import { useAuthStore } from '../../store/auth';
import { usePopupStore } from '../../store/popup';

type ModalType = 'DETAILS' | 'EDIT' | 'REJECT' | 'HISTORY' | null;

interface ActionConfig {
  key: string;
  icon?: LucideIcon;
  label?: string;
  onClick: () => void;
  isVisible: boolean;
  className?: string;
  variant: 'icon' | 'button';
}

interface Actions {
  icons: ActionConfig[];
  buttons: ActionConfig[];
}

export default function RequisitionButtons({
  requisitionId,
}: {
  requisitionId: string;
}) {
  const { data } = useRequisitionById(requisitionId);
  const { submitReq, changeReqState, signReq } = useRequisitionMutations();
  const { user } = useAuthStore();
  const hasPermission = usePermission();
  const { openPopup: openPopupValidate } = usePopupStore();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const closeModal = () => setActiveModal(null);

  const actions: Actions = useMemo((): Actions => {
    if (!data) return { icons: [], buttons: [] };

    const status = data.requisitionStatus;

    const submitHandler = () => {
      openPopupValidate({
        title: 'Enviar a validación',
        message: `¿Estas seguro que quieres enviar a validación la requisición ${data.requisitionCode}?`,
        onConfirm: () => {
          submitReq.mutate(requisitionId);
        },
      });
    };

    const validateHandler = () => {
      openPopupValidate({
        title: 'Validar requisición',
        message: `¿Estas seguro que quieres validar la requisición ${data.requisitionCode}?`,
        onConfirm: () =>
          changeReqState.mutate({ requisitionId, type: 'validate' }),
      });
    };

    const approveHandler = () => {
      openPopupValidate({
        title: 'Validar requisición',
        message: `¿Estas seguro que quieres aprobar la requisición ${data.requisitionCode}?`,
        onConfirm: () =>
          signReq.mutate({
            requisitionId,
            user: `${user?.userName} ${user?.userLastName}`,
          }),
      });
    };

    return {
      icons: [
        {
          key: 'view',
          icon: Eye,
          onClick: () => setActiveModal('DETAILS'),
          isVisible: true,
          variant: 'icon',
          label: 'Ver detalles',
        },
        {
          key: 'edit',
          icon: Edit,
          onClick: () => setActiveModal('EDIT'),
          isVisible:
            status !== 'APPROVED' && hasPermission('update:requisition'),
          variant: 'icon',
          label: 'Editar',
        },

        {
          key: 'validate',
          icon: ThumbsUp,
          onClick: validateHandler,
          isVisible:
            status === 'PENDING' && hasPermission('validate:requisition'),

          className: 'text-green-primary',
          variant: 'icon',
          label: 'Validar',
        },
        {
          key: 'approve',
          icon: ThumbsUp,
          onClick: approveHandler,
          isVisible:
            status === 'VALIDATED' && hasPermission('approve:requisition'),

          className: 'text-green-primary',
          variant: 'icon',
          label: 'Aprobar',
        },
        {
          key: 'reject_validated',
          icon: ThumbsDown,
          onClick: () => setActiveModal('REJECT'),
          isVisible:
            hasPermission('reject:requisition') &&
            status === 'VALIDATED' &&
            user?.role !== 'gerente de obra',

          className: 'text-red-primary',
          variant: 'icon',
          label: 'Rechazar',
        },
        {
          key: 'reject_pending',
          icon: ThumbsDown,
          onClick: () => setActiveModal('REJECT'),
          isVisible:
            hasPermission('reject:requisition') && status === 'PENDING',

          className: 'text-red-primary',
          variant: 'icon',
          label: 'Rechazar',
        },
      ],
      buttons: [
        {
          key: 'submit',
          label: 'Enviar a validación',
          onClick: submitHandler,
          isVisible: status === 'DRAFT' && hasPermission('submit:requisition'),
          variant: 'button',
        },
        {
          key: 'history',
          label: 'Consultar Histórico',
          onClick: () => setActiveModal('HISTORY'),
          isVisible: true,
          variant: 'button',
        },
      ],
    };
  }, [
    changeReqState,
    data,
    hasPermission,
    requisitionId,
    signReq,
    user,
    submitReq,
    openPopupValidate,
  ]);

  if (!data) return null;

  const renderAction = (action: ActionConfig) => {
    if (!action.isVisible) return null;

    if (action.variant === 'button') {
      return (
        <ButtonBase
          key={action.key}
          label={action.label || ''}
          size="sm"
          onclick={action.onClick}
        />
      );
    }

    const Icon = action.icon!;
    return (
      <OptionButton
        key={action.key}
        buttonHandler={action.onClick}
        title={action.label || ''}
      >
        <Icon size={16} className={action.className} />
      </OptionButton>
    );
  };

  return (
    <>
      <div className="flex flex-wrap justify-between items-center text-primaryDark">
        <div className="flex">{actions.icons.map(renderAction)}</div>

        {data.requisitionStatus === 'APPROVED' && (
          <p className="text-xs">Requisición firmada</p>
        )}

        <div className="flex gap-2">{actions.buttons.map(renderAction)}</div>
      </div>

      {activeModal === 'DETAILS' && (
        <RequisitionDetailModal
          open={true}
          requisitionId={requisitionId}
          onClose={closeModal}
        />
      )}

      {activeModal === 'EDIT' && (
        <RequisitionModal
          open={true}
          onClose={closeModal}
          editingRequisition={data}
        />
      )}

      {activeModal === 'REJECT' && (
        <RejectRequisition
          isPopupOpen={true}
          closePopup={closeModal}
          requisitionId={requisitionId}
        />
      )}

      {activeModal === 'HISTORY' && (
        <OrderHistory
          isPopupOpen={true}
          closePopup={closeModal}
          requisitionId={requisitionId}
        />
      )}
    </>
  );
}
