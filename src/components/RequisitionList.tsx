import type { Requisition } from '../types';
import { VIEW, type ViewValue } from '../types/view';
import { Loading } from './common';
import WithoutData from './common/WithoutData';
import RequisitionCard from './requisition/RequisitionCard';
import RequisitionListTable from './requisition/RequisitionListTable';

export default function RequisitionList({
  viewType,
  data,
  isLoading,
}: {
  viewType: ViewValue;
  data: Partial<Requisition[]>;
  isLoading: boolean;
}) {
  if (!data || data.length === 0) {
    return (
      <WithoutData message="No hay requisiciones en este estado" />
    );
  }
  if (isLoading) {
    return <Loading />;
  }
  if (viewType === VIEW.LIST) {
    return <RequisitionListTable data={data} />;
  }
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {data.map((r, index) => (
        <RequisitionCard
          requisitionId={r?.requisitionId || ''}
          key={r?.requisitionId || index}
        />
      ))}
    </div>
  );
}
