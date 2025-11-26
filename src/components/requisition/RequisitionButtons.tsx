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

type ModalType = 'DETAILS' | 'EDIT' | 'REJECT' | 'HISTORY' | null;

interface ActionConfig {
  key: string;
  icon?: LucideIcon;
  label?: string;
  onClick: () => void;
  isVisible: boolean;
  variant?: 'icon' | 'button' | 'approve' | 'reject'; 
  className?: string;
}

export default function RequisitionButtons({
  requisitionId,
}: {
  requisitionId: string;
}) {
  const { data } = useRequisitionById(requisitionId);
  const { submitReq } = useRequisitionMutations();
  const hasPermission = usePermission();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const closeModal = () => setActiveModal(null);

  const actions: ActionConfig[] = useMemo(() => {
    if (!data) return [];

    const status = data.requisitionStatus;

    return [
      {
        key: 'view',
        icon: Eye,
        onClick: () => setActiveModal('DETAILS'),
        isVisible: true,
        variant: 'icon',
      },
      {
        key: 'edit',
        icon: Edit,
        onClick: () => setActiveModal('EDIT'),
        isVisible: status === 'DRAFT' && hasPermission('update:requisition'),
        variant: 'icon',
      },
      {
        key: 'submit',
        label: 'Enviar a aprobación',
        onClick: () => submitReq.mutate(requisitionId),
        isVisible: status === 'DRAFT' && hasPermission('submit:requisition'),
        variant: 'button',
      },
      {
        key: 'approve',
        icon: ThumbsUp,
        onClick: () => submitReq.mutate(requisitionId),
        isVisible: status === 'PENDING' && hasPermission('approve:requisition'),
        variant: 'icon',
        className: 'text-green-primary',
      },
      {
        key: 'reject',
        icon: ThumbsDown,
        onClick: () => setActiveModal('REJECT'),
        isVisible: status === 'PENDING' && hasPermission('approve:requisition'),
        variant: 'icon',
        className: 'text-red-primary',
      },
    ];
  }, [data, hasPermission, requisitionId, submitReq]);

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
      <OptionButton key={action.key} buttonHandler={action.onClick}>
        <Icon size={16} className={action.className} />
      </OptionButton>
    );
  };

  return (
    <>
      <div className="flex flex-wrap gap-1 text-[#01687d] items-center">
        {actions.map(renderAction)}

        {data.requisitionStatus === 'APPROVED' && (
          <p className="text-xs text-gray-600">Requisición firmada</p>
        )}

        <ButtonBase
          label="Consultar Histórico"
          onclick={() => setActiveModal('HISTORY')}
        />
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
          requisitionInfo={data}
        />
      )}
    </>
  );
}
