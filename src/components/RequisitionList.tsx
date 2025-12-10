import type { Requisition } from '../types';
import { VIEW, type ViewValue } from '../types/view';
import { Loading } from './common';
import RequisitionCard from './requisition/RequisitionCard';
import RequisitionListTable from './requisition/RequisitionListTable';

export default function RequisitionList({
  viewType,
  data,
  isLoading
}: {
  viewType: ViewValue;
  data: Partial<Requisition[]>;
  isLoading: boolean
}) {
  if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[45vh] w-[65vw]">
          <p className="text-center text-5xl font-bold text-gray-500 italic">
            No hay requisiciones en este estado
          </p>
        </div>
      );
    }
    if (isLoading) {
      return <Loading />;
    }
  if (viewType === VIEW.LIST) {
    return <RequisitionListTable data={data} />;
  }
  return (
    <>
      <div className="flex flex-wrap gap-4 justify-center">
        {data.map((r, index) => (
          <RequisitionCard
            requisitionId={r?.requisitionId || ''}
            key={r?.requisitionId || index}
          />
        ))}
      </div>
    </>
  );
}
