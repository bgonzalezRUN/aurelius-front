import { useParams } from 'react-router-dom';
import { useRequisitionById } from '../../api/queries/requisitionQueries';
import type { Requisition, SendTo } from '../../types';
import { capitalizeWords } from '../../utils';
import { dateformatter } from '../../utils/dateformatter';
import { fmtTime } from '../../utils/time';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import RequisitionButtons from './RequisitionButtons';
import { useCostCenterById } from '../../api/queries/costCenterQuery';

export default function RequisitionCard({
  requisitionId,
}: {
  requisitionId: string;
}) {
  const { data } = useRequisitionById(requisitionId);
  const { costCenterId } = useParams();
  const { data: datacc } = useCostCenterById(costCenterId || '');
  if (!data) return null;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition flex flex-col w-[300px]">
        {/* Título + Fecha */}
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-base font-semibold text-[#01687d] leading-tight">
            {capitalizeWords(datacc?.costCenterName || '')}
          </h2>
          <span className="text-[12px] text-gray-600 font-semibold">
            {data.requisitionCode}
          </span>
        </div>

        <div className="flex justify-between items-center mb-2">
          <p className="text-[12px] text-gray-600">
            {data.arrivalDate ? dateformatter(data.arrivalDate) : 'N/A'}
          </p>
          {Array.isArray((data as Requisition).arrivalWindows) &&
            (data as Requisition).arrivalWindows.length > 0 && (
              <div className="text-[12px] border border-[#01687d] text-black px-2 py-0.5 rounded-md">
                {fmtTime((data as Requisition).arrivalWindows[0].start)} –{' '}
                {fmtTime((data as Requisition).arrivalWindows[0].end)}
              </div>
            )}
        </div>

        {data.sendTo.length ? (
          <div className="text-xs text-gray-600 mb-2 flex justify-between">
            <span className="font-medium">
              {data.sendTo.length > 1
                ? 'Proveedores sugeridos:'
                : 'Proveedor sugerido:'}
            </span>
            <div className="flex flex-wrap gap-1">
              {data.sendTo?.map((prov: SendTo) => (
                <span className="text-grey-primary text-xs">
                  {capitalizeWords(prov.name)}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Items (Items arriba, número abajo) */}
        <div className="flex justify-between items-center mb-2">
          {/* Prioridad */}
          <PriorityBadge priority={data.requisitionPriority} />

          {/* Items + número juntos */}
          <div className="flex flex-col text-right leading-none">
            <span className="text-[11px] text-[#01687d] font-medium">
              Items
            </span>
            <span className="text-sm text-gray-800 font-semibold">
              {data.items?.length ?? 0}
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
              {data.requisitionComments?.trim()
                ? data.requisitionComments
                : 'No hay comentarios'}
            </p>
          </div>
          <p className="text-xs text-gray-600 mb-2 leading-tight">
            <span className="font-medium">Estado:</span>{' '}
            <StatusBadge status={data.requisitionStatus} />
          </p>
        </div>

        <hr className="my-2" />

        {/* Footer */}
        <RequisitionButtons requisitionId={data.requisitionId} />
      </div>
    </>
  );
}
