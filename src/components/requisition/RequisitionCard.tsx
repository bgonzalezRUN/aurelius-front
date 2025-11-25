import { useState } from 'react';
import type { Requisition } from '../../types';
import { fmtTime } from '../../utils/time';
import OptionButton from '../common/OptionButton';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { Eye, Edit } from 'lucide-react';
import RequisitionModal from '../../components/RequisitionModal';
import RequisitionDetailModal from '../../components/RequisitionDetailModal';

export default function RequisitionCard({ r }: { r: Requisition }) {
  const [showModal, setShowModal] = useState({
    requisitionDetails: false,
    editRequisition: false,
  });

  const showModalHandler = (
    modalType: 'requisitionDetails' | 'editRequisition',
    value: boolean
  ) => {
    setShowModal(prev => ({ ...prev, [modalType]: value }));
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition flex flex-col">
        {/* Título + Fecha */}
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-base font-semibold text-[#01687d] leading-tight">
            {r.project}
          </h2>
          <span className="text-[12px] text-gray-600">
            {fmtTime(r.arrivalDate)}
          </span>
        </div>

        {/* Proveedor */}

        {/* Prioridad + Ventana */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-600 mb-2 leading-tight">
            <span className="font-medium">Proveedor:</span>{' '}
            <div className="flex flex-wrap gap-1 mt-1">
              {r.sendTo?.map(prov => (
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">
                  {prov.name}
                </span>
              ))}
            </div>
          </p>

          {/* {Array.isArray((r as Requisition).arrivalWindows) &&
            (r as Requisition).arrivalWindows.length > 0 && (
              <div className="text-[12px] border border-[#01687d] text-black px-2 py-0.5 rounded-md">
                {fmtTime((r as Requisition).arrivalWindows[0].start)} –{' '}
                {fmtTime((r as Requisition).arrivalWindows[0].end)}
              </div>
            )} */}
        </div>

        {/* Items (Items arriba, número abajo) */}
        <div className="flex justify-between items-center mb-2">
          {/* Prioridad */}
          <p className="text-xs text-gray-600 mb-2 leading-tight">
            <span className="font-medium">Prioridad:</span>{' '}
            <PriorityBadge priority={r.requisitionPriority} />
          </p>

          {/* Items + número juntos */}
          <div className="flex flex-col text-right leading-none">
            <span className="text-[11px] text-[#01687d] font-medium">
              Items
            </span>
            <span className="text-sm text-gray-800 font-semibold">
              {r.items?.length ?? 0}
            </span>
          </div>
        </div>

        {/* Comentarios */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <p className="text-xs text-gray-700 mb-0 leading-none font-medium">
              Comentarios:
            </p>
            <p className="text-xs text-gray-600 mb-2 leading-snug">
              {r.requisitionComments?.trim()
                ? r.requisitionComments
                : 'No hay comentarios'}
            </p>
          </div>
          <p className="text-xs text-gray-600 mb-2 leading-tight">
            <span className="font-medium">Estado:</span>{' '}
            <StatusBadge status={r.requisitionStatus} />
          </p>
        </div>

        <hr className="my-2" />

        {/* Footer */}
        <div className="flex justify-between items-center mt-1">
          <div className="flex gap-1 text-[#01687d]">
            {/* VER */}
            <OptionButton
              buttonHandler={() => showModalHandler('requisitionDetails', true)}
            >
              <Eye size={16} />
            </OptionButton>

            {r.requisitionStatus === 'APPROVED' ? null : (
              <OptionButton
                buttonHandler={() => showModalHandler('editRequisition', true)}
              >
                <Edit size={16} />
              </OptionButton>
            )}
          </div>
        </div>
      </div>

      {showModal.requisitionDetails && (
        <RequisitionDetailModal
          open={showModal.requisitionDetails}
          requisitionId={r.requisitionId}
          onClose={() => showModalHandler('requisitionDetails', false)}
        />
      )}

      {showModal.editRequisition && (
        <RequisitionModal
          open={showModal.editRequisition}
          onClose={() => showModalHandler('requisitionDetails', false)}
          requisitionId={r.requisitionId}
        />
      )}
    </>
  );
}
